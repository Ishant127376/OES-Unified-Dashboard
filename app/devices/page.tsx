"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RegisterDeviceModal } from "@/components/devices/RegisterDeviceModal";
import { DeviceTypeBadge, StatusBadge } from "@/components/devices/DeviceBadges";
import { useIoTSimulator } from "@/hooks/useIoTSimulator";
import { useAuth } from "@/components/auth/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";
import type { Device } from "@/lib/mock-data";

type StatusFilter = "all" | "connected" | "disconnected";

export default function DevicesPage() {
  const { devices, setDevices } = useIoTSimulator();
  const { role, assignedDeviceIds, isAdmin } = useAuth();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Device | null>(null);

  const existingSerials = useMemo(
    () => new Set(devices.map((d) => d.serialNumber)),
    [devices]
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    const allowed = role === "Sub-User" ? new Set(assignedDeviceIds.map(String)) : null;

    return devices.filter((d) => {
      if (allowed && !allowed.has(String(d.serialNumber))) return false;
      const matchesSerial = q ? d.serialNumber.includes(q) : true;
      const connected = d.status !== "offline";
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "connected"
            ? connected
            : !connected;

      return matchesSerial && matchesStatus;
    });
  }, [assignedDeviceIds, devices, query, role, statusFilter]);

  function openCreate() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(device: Device) {
    setEditTarget(device);
    setModalOpen(true);
  }

  function handleSubmit(device: Device) {
    setDevices((prev) => {
      const existingIdx = prev.findIndex((d) => d.serialNumber === device.serialNumber);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = device;
        return next;
      }
      return [device, ...prev];
    });
  }

  function handleDelete(serialNumber: string) {
    setDevices((prev) => prev.filter((d) => d.serialNumber !== serialNumber));
  }

  const mode = editTarget ? "edit" : "create";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Devices</h1>
          <p className="text-sm text-slate-600">
            Register, search, and manage devices.
            {!isAdmin ? " (View Only)" : ""}
          </p>
        </div>
        <RoleGuard role="Admin">
          <button
            type="button"
            onClick={openCreate}
            className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white"
          >
            Register New Device
          </button>
        </RoleGuard>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Serial Number"
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-slate-500">Status</div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="all">All</option>
            <option value="connected">Connected</option>
            <option value="disconnected">Disconnected</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-semibold text-slate-900">Registered Devices</div>
          <div className="text-xs text-slate-500">{filtered.length} shown</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Serial No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Device Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Device Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">MAC Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Firmware Version</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                <RoleGuard role="Admin">
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Actions</th>
                </RoleGuard>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.serialNumber} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    <Link
                      href={`/devices/${d.serialNumber}`}
                      className="font-mono text-slate-900 hover:underline"
                    >
                      {d.serialNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">{d.name}</td>
                  <td className="px-4 py-3">
                    <DeviceTypeBadge type={d.type} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{d.macAddress}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{d.firmwareVersion}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <RoleGuard role="Admin">
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(d)}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.serialNumber)}
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </RoleGuard>
                </tr>
              ))}

              {filtered.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-500"
                    colSpan={isAdmin ? 7 : 6}
                  >
                    No devices match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <RegisterDeviceModal
        open={modalOpen}
        mode={mode}
        initial={editTarget ?? undefined}
        existingSerials={existingSerials}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

