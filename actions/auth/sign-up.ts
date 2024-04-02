"use server";

import withPostgresClient from "@/lib/database";
import { cookies } from "next/headers";
import { z } from "zod";
import configuration from "./configuration";
import { encrypt } from "@/lib/jwt";

const authenticationSchema = z.object({
  username: z.string()
    .min(6, {
      message: "Username must have at least 6 characters"
    })
    .max(32, {
      message: "Username must not exceed 32 characters"
    }),
  password: z.string()
    .min(8, {
      message: "Password must have at least 8 characters"
    })
    .max(64, {
      message: "Password must not exceed 64 characters"
    }),
});

type SignupActionState = {
  errors: {
    username?: string[],
    password?: string[],
    other?: string
  }
}

export default async function signup(prevState: any, formData: FormData): Promise<SignupActionState> {
  return await withPostgresClient(async (client) => {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const validatedFields = authenticationSchema.safeParse({ username, password });

    if (!validatedFields.success) {
      return {
        errors: {
          ...validatedFields.error.flatten().fieldErrors
        }
      };
    }

    try {
      await client.query("BEGIN");

      const queryResult = await client.query("SELECT 1 FROM users WHERE username = $1::text", [username]);

      if (queryResult.rowCount === 1) {
        await client.query("ROLLBACK");

        return {
          errors: {
            username: [`Username \"${username}\" has already been taken`]
          }
        };
      }

      await client.query("INSERT INTO users(username, password) VALUES($1::text, $2::text)", [username, password]);

      await client.query("COMMIT");

      const jwt = await encrypt({ username });

      cookies().set(configuration.COOKIE_USER_KEY, jwt);

      return {
        errors: {}
      }
    } catch {
      await client.query("ROLLBACK")

      return {
        errors: {
          other: "An unexpected error occurred"
        }
      }
    }
  });
}