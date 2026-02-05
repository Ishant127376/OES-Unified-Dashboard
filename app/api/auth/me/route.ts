import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { dbConnect } from "@/lib/mongodb";
import { Device } from "@/lib/models/Device";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });
  try {
    const payload = verifyAuthToken(token);

    const assignedDevices =
      payload.role === "Sub-User"
        ? (await (async () => {
            await dbConnect();
            const rows = await Device.find({ assignedUsers: payload.sub })
              .select({ serialNumber: 1 })
              .lean();
            return rows.map((d) => String(d.serialNumber));
          })())
        : payload.assignedDevices ?? [];

    return NextResponse.json({
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        assignedDevices,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
