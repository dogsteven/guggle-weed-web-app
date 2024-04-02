"use server";

import { z } from "zod";
import configuration from "./configuration";
import { cookies } from "next/headers";
import { encrypt } from "@/lib/jwt";
import withPostgresClient from "../../lib/database";

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

type SigninActionState = {
  errors: {
    username?: string[],
    password?: string[],
    authentication?: string[],
    other?: string
  }
}

export default async function signin(prevState: any, formData: FormData): Promise<SigninActionState> {
  return await withPostgresClient(async (client) => {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const validatedFields = authenticationSchema.safeParse({ username, password });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors
      };
    }

    try {
      const queryResult = await client.query(`SELECT * FROM users WHERE username = $1::text`, [username]);

      if (queryResult.rowCount === 0) {
        return {
          errors: {
            authentication: ["Invalid credentials"]
          }
        };
      }

      const row = queryResult.rows[0]

      if (password !== row.password) {
        return {
          errors: {
            authentication: ["Invalid credentials"]
          }
        };
      }

      const jwt = await encrypt({ username });

      cookies().set(configuration.COOKIE_USER_KEY, jwt);

      return {
        errors: {}
      }
    } catch {
      return {
        errors: {
          other: "An unexpected error occurred"
        }
      };
    }
  });
}