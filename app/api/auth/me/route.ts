import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });
  try {
    const payload = verifyAuthToken(token);
    return NextResponse.json({
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        assignedDevices: payload.assignedDevices ?? [],
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
