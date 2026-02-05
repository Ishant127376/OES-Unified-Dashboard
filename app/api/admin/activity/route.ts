import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  await connectToDb();

  const users = await User.find({}, { email: 1, role: 1, loginActivity: 1 })
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  const rows = users.flatMap((u) =>
    (u.loginActivity ?? []).slice(0, 10).map((a) => ({
      email: u.email,
      role: u.role,
      timestamp: a.timestamp,
      ipAddress: a.ipAddress,
      success: a.success,
    }))
  );

  rows.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return NextResponse.json({ rows: rows.slice(0, 50) });
}
