"use server";

import { cookies } from "next/headers";
import configuration from "./configuration";
import { decrypt } from "@/lib/jwt";

export default async function getUsername(): Promise<string | null> {
  try {
    const jwt = cookies().get(configuration.COOKIE_USER_KEY);

    if (!jwt || !jwt.value) {
      return null;
    }

    const { username } = await decrypt(jwt.value);

    return username;
  } catch {
    return null;
  }
}