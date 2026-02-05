"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, PlusCircle } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useIoTSimulator } from "@/hooks/useIoTSimulator";
import { rowsToCsv, downloadTextFile } from "@/lib/csv";
import { IncomingMessageLog } from "@/components/devices/IncomingMessageLog";
import { Toast } from "@/components/ui/Toast";
import { DeviceTypeBadge, StatusBadge } from "@/components/devices/DeviceBadges";

const VOLTAGE_ALERT_THRESHOLD = 240;

function formatTimeLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function DeviceDetailClient({ id }: { id: string }) {
  const serial = String(id ?? "").trim();
  const { devices, telemetryByDevice } = useIoTSimulator();

  const device = useMemo(
    () => devices.find((d) => String(d.serialNumber) === serial),
    [devices, serial]
  );

  const telemetry = telemetryByDevice[serial] ?? [];
  const latest = telemetry[0];

  const chartData = useMemo(() => {
    const window = telemetry.slice(0, 25).reverse();
    return window.map((t) => ({
      timestamp: t.timestamp,
      time: formatTimeLabel(t.timestamp),
      voltage: t.voltage,
      current: t.current,
    }));
  }, [telemetry]);

  const isBreached = Boolean(latest && latest.voltage > VOLTAGE_ALERT_THRESHOLD);

  const [toastOpen, setToastOpen] = useState(false);
  const breachSeenRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!latest) return;
    const breachedNow = latest.voltage > VOLTAGE_ALERT_THRESHOLD;
    const breachedBefore = breachSeenRef.current;

    if (breachedNow && !breachedBefore) {
      breachSeenRef.current = true;
      setToastOpen(true);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => setToastOpen(false), 4500);
    }

    if (!breachedNow) breachSeenRef.current = false;
  }, [latest?.timestamp]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  function exportCsv() {
    const rows = telemetry
      .slice()
      .reverse()
      .map((t) => ({
        device_id: t.device_id,
        timestamp: t.timestamp,
        temperature: t.temperature,
        voltage: t.voltage,
        current: t.current,
        power: t.power,
      }));

    const csv = rowsToCsv(rows);
    downloadTextFile({
      filename: `telemetry-${serial}.csv`,
      mime: "text/csv;charset=utf-8",
      content: csv,
    });
  }

  // Because devices are global in the simulator, this should usually be false,
  // but keep a professional loading shell to avoid blank screens.
  const isLoading = devices.length === 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Loading device…
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-4 w-56 rounded bg-slate-100" />
          <div className="mt-3 h-3 w-80 rounded bg-slate-100" />
          <div className="mt-6 h-[320px] w-full rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link
            href="/devices"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Devices
          </Link>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="text-sm font-semibold text-slate-900">Device Not Registered</div>
          <div className="mt-1 text-sm text-slate-700">
            No device matches serial number <span className="font-mono">{serial}</span>.
          </div>
          <div className="mt-4">
            <Link
              href="/devices"
              className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white"
            >
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Add Device
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toastOpen ? (
        <Toast
          title="Threshold Breached"
          message={`Voltage exceeded ${VOLTAGE_ALERT_THRESHOLD}V for device ${serial}.`}
          onClose={() => setToastOpen(false)}
        />
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/devices"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Devices
            </Link>
            <h1 className="text-xl font-semibold text-slate-900">{device.name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="font-mono">{device.serialNumber}</span>
            <DeviceTypeBadge type={device.type} />
            <StatusBadge status={device.status} />
            <span className="font-mono text-xs text-slate-500">{device.macAddress}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export to CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-semibold text-slate-900">Live Analytics</div>
          <div className="text-xs text-slate-500">Voltage 210–250V · Current 0–10A</div>
        </div>

        <div className="p-4">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 18, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  domain={[210, 250]}
                  tick={{ fontSize: 12 }}
                  label={{ value: "Voltage (V)", angle: -90, position: "insideLeft" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 10]}
                  tick={{ fontSize: 12 }}
                  label={{ value: "Current (A)", angle: 90, position: "insideRight" }}
                />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="voltage"
                  name="Voltage (V)"
                  stroke={isBreached ? "#dc2626" : "#1d4ed8"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="current"
                  name="Current (A)"
                  stroke="#0f766e"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Showing last {Math.min(25, telemetry.length)} points.
          </div>
        </div>
      </div>

      <IncomingMessageLog messages={telemetry.slice(0, 30)} />
    </div>
  );
}
