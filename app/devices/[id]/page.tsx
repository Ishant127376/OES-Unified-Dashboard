import { use } from "react";
import { DeviceDetailClient } from "@/components/devices/DeviceDetailClient";

export default function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <DeviceDetailClient id={id} />;
}
