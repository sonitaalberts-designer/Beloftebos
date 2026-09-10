import { cookies } from "next/headers";
import { config, get, list, put, remove } from "@/db/repository";
export async function hash(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(bytes)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
export async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return [...new Uint8Array(bits)]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
export async function admin() {
  const token = (await cookies()).get("bb_session")?.value;
  if (!token) return null;
  const digest = await hash(token);
  const session = (await list("sessions")).find(
    (s) =>
      s.token_hash === digest &&
      String(s.expires_at) > new Date().toISOString(),
  );
  if (!session) return null;
  const user = await get("users", String(session.user_id));
  return user && user.disabled !== true ? user : null;
}
export async function requireAdmin() {
  const user = await admin();
  if (!user) throw new Error("Sign in required");
  return user;
}
export async function login(email: string, password: string) {
  const user = (await list("users")).find(
    (u) => String(u.email).toLowerCase() === email.toLowerCase(),
  );
  if (
    !user ||
    user.disabled === true ||
    (await passwordHash(password, String(user.salt))) !== user.password_hash
  )
    throw new Error("Email or password is incorrect");
  const token = crypto.randomUUID() + crypto.randomUUID();
  await put("sessions", {
    id: crypto.randomUUID(),
    user_id: user.id,
    token_hash: await hash(token),
    expires_at: new Date(Date.now() + 8 * 3600000).toISOString(),
  });
  (await cookies()).set("bb_session", token, {
    httpOnly: true,
    secure: config("NODE_ENV") === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 3600,
  });
  return { name: user.name };
}
export async function logout() {
  const token = (await cookies()).get("bb_session")?.value;
  if (token) {
    const digest = await hash(token);
    for (const s of await list("sessions"))
      if (s.token_hash === digest) await remove("sessions", s.id);
  }
  (await cookies()).delete("bb_session");
}
