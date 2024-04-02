"use server";

import { SignJWT, jwtVerify } from "jose";

const ISSUER = "guggle-weed.authentication";
const AUDIENCE = "guggle-weed";

const key = new TextEncoder().encode("guggle-weed.secret-key");

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime("3 hours from now")
    .sign(key);
}

export async function decrypt(jwt: string) {
  try {
    const { payload } = await jwtVerify(jwt, key, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE
    });

    return payload as any;
  } catch {
    return null;
  }
}