import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDb } from "@/lib/db";
import { User } from "@/models/User";
import { signAuthToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

function getIpAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  await connectToDb();
  const user = await User.findOne({ email });
  const ipAddress = getIpAddress(request);

  if (!user) {
    // Avoid user enumeration.
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  user.loginActivity.unshift({
    userId: user._id,
    timestamp: new Date(),
    ipAddress,
    success: ok,
  });
  if (user.loginActivity.length > 50) user.loginActivity.splice(50);
  await user.save();

  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signAuthToken({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    assignedDevices: user.assignedDevices,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
