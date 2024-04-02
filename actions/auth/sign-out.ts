"use server";

import { cookies } from "next/headers";
import configuration from "./configuration";

export default async function signout() {
  cookies().delete(configuration.COOKIE_USER_KEY);
}