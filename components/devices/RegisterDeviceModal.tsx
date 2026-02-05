"use client";

import { useEffect, useMemo, useState } from "react";
import type { CommunicationProtocol, Device, DeviceStatus, DeviceType } from "@/lib/mock-data";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initial?: Device;
  existingSerials: Set<string>;
  onClose: () => void;
  onSubmit: (device: Device) => void;
};

const DEVICE_TYPES: DeviceType[] = ["Smart Meter", "Gateway", "HVAC"];
const STATUSES: DeviceStatus[] = ["online", "warning", "offline"];
const PROTOCOLS: CommunicationProtocol[] = ["MQTT", "DLMS", "DNP3"];

function normalizeMac(input: string) {
  return input.trim().toUpperCase();
}

function isValidSerial(serial: string) {
  return /^\d{10}$/.test(serial);
}

function isValidMac(mac: string) {
  return /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(mac);
}

export function RegisterDeviceModal({
  open,
  mode,
  initial,
  existingSerials,
  onClose,
  onSubmit,
}: Props) {
  const [serialNumber, setSerialNumber] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<DeviceType>("Smart Meter");
  const [macAddress, setMacAddress] = useState("");
  const [firmwareVersion, setFirmwareVersion] = useState("v1.0.0");
  const [protocol, setProtocol] = useState<CommunicationProtocol>("MQTT");
  const [status, setStatus] = useState<DeviceStatus>("online");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const title = mode === "create" ? "Register New Device" : "Edit Device";
  const primaryLabel = mode === "create" ? "Register" : "Save";

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (mode === "edit" && initial) {
      setSerialNumber(initial.serialNumber);
      setName(initial.name);
      setType(initial.type);
      setMacAddress(initial.macAddress);
      setFirmwareVersion(initial.firmwareVersion);
      setProtocol(initial.protocol);
      setStatus(initial.status);
      setLocation(initial.location);
      return;
    }

    setSerialNumber("");
    setName("");
    setType("Smart Meter");
    setMacAddress("");
    setFirmwareVersion("v1.0.0");
    setProtocol("MQTT");
    setStatus("online");
    setLocation("");
  }, [open, mode, initial]);

  const serialDisabled = mode === "edit";

  const canSubmit = useMemo(() => {
    if (!isValidSerial(serialNumber)) return false;
    if (!name.trim()) return false;
    if (!isValidMac(normalizeMac(macAddress))) return false;
    if (!/^v\d+\.\d+\.\d+$/.test(firmwareVersion.trim())) return false;
    return true;
  }, [serialNumber, name, macAddress, firmwareVersion]);

  if (!open) return null;

  function handleSubmit() {
    setError(null);

    const serial = serialNumber.trim();
    if (!isValidSerial(serial)) {
      setError("Serial Number must be exactly 10 digits.");
      return;
    }

    if (mode === "create" && existingSerials.has(serial)) {
      setError("A device with this Serial Number already exists.");
      return;
    }

    const mac = normalizeMac(macAddress);
    if (!isValidMac(mac)) {
      setError("MAC Address must be in format XX:XX:XX:XX:XX:XX.");
      return;
    }

    const fw = firmwareVersion.trim();
    if (!/^v\d+\.\d+\.\d+$/.test(fw)) {
      setError("Firmware Version must look like v1.2.0.");
      return;
    }

    const device: Device = {
      serialNumber: serial,
      name: name.trim(),
      type,
      location: location.trim() || "—",
      macAddress: mac,
      firmwareVersion: fw,
      protocol,
      status,
    };

    onSubmit(device);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">DRD Onboarding (3.2)</div>
        </div>

        <div className="space-y-3 p-4">
          {error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <div className="text-xs font-medium text-slate-700">Serial Number</div>
              <input
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="1029384756"
                disabled={serialDisabled}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 disabled:bg-slate-50"
              />
              <div className="mt-1 text-xs text-slate-500">Must be exactly 10 digits (DRD 3.1)</div>
            </label>

            <label className="block">
              <div className="text-xs font-medium text-slate-700">Device Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Smart Meter A1"
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <div className="text-xs font-medium text-slate-700">Device Type</div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DeviceType)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {DEVICE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <div className="text-xs font-medium text-slate-700">Communication Protocol</div>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as CommunicationProtocol)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {PROTOCOLS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <div className="text-xs font-medium text-slate-700">MAC Address</div>
              <input
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                placeholder="AA:BB:CC:DD:EE:FF"
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="block">
              <div className="text-xs font-medium text-slate-700">Firmware Version</div>
              <input
                value={firmwareVersion}
                onChange={(e) => setFirmwareVersion(e.target.value)}
                placeholder="v1.2.0"
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <div className="text-xs font-medium text-slate-700">Status</div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DeviceStatus)}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <div className="text-xs font-medium text-slate-700">Location</div>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Plant 1 · Bay A"
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
