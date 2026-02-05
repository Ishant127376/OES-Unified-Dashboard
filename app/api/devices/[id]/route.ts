import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { dbConnect } from "@/lib/mongodb";
import { Device } from "@/lib/models/Device";

type AuthPayload = ReturnType<typeof verifyAuthToken>;

async function getAuth(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}

function toClientDevice(doc: any) {
  return {
    id: String(doc._id),
    serialNumber: String(doc.serialNumber),
    name: String(doc.name ?? ""),
    type: String(doc.type ?? ""),
    macAddress: String(doc.macAddress ?? ""),
    firmwareVersion: String(doc.firmwareVersion ?? ""),
    status: doc.status,
    location: doc.location ?? "—",
    protocol: doc.protocol ?? "MQTT",
  };
}

function normalizeStatus(input: unknown) {
  const raw = String(input ?? "").trim().toLowerCase();
  if (raw === "online") return "Online";
  if (raw === "offline") return "Offline";
  if (raw === "warning") return "Warning";
  return String(input ?? "Offline").trim();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await dbConnect();

  const query =
    auth.role === "Admin"
      ? { _id: id }
      : { _id: id, assignedUsers: new mongoose.Types.ObjectId(auth.sub) };

  const device = await Device.findOne(query).lean();
  if (!device) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ device: toClientDevice(device) });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as any;
  const update: Record<string, unknown> = {};
  if (typeof body?.name === "string") update.name = body.name.trim();
  if (typeof body?.type === "string") update.type = body.type.trim();
  if (typeof body?.macAddress === "string") update.macAddress = body.macAddress.trim();
  if (typeof body?.firmwareVersion === "string") update.firmwareVersion = body.firmwareVersion.trim();
  if (typeof body?.status === "string") update.status = normalizeStatus(body.status);
  if (Array.isArray(body?.assignedUsers)) update.assignedUsers = body.assignedUsers;
  if (typeof body?.location === "string") update.location = body.location;
  if (typeof body?.protocol === "string") update.protocol = body.protocol;

  await dbConnect();
  const device = await Device.findOneAndUpdate({ _id: id }, { $set: update }, { new: true }).lean();
  if (!device) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ device: toClientDevice(device) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (auth.role !== "Admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await dbConnect();
  const res = await Device.deleteOne({ _id: id });
  if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
