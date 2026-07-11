"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Prediction } from "../data/mockEvents";

const SEAT_GREEN = "#00AA6C";
const SCANNER_AMBER = "#F5A623";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
      <div className="text-xs font-medium text-gray-400">{label}</div>
      <div className="text-sm font-bold text-midnight">${payload[0].value}</div>
    </div>
  );
}

function PriceChart({
  data,
  color,
}: {
  data: Prediction["priceHistory"];
  color: string;
}) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
          <CartesianGrid vertical={false} stroke="#EEF1F4" strokeDasharray="4 4" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={{ stroke: "#E5E9EE" }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={["dataMin - 8", "dataMax + 8"]}
            tickFormatter={(v: number) => `$${v}`}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#CBD5E1", strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: color }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-extrabold tracking-tight text-midnight">
        Should you buy now?
      </h2>
      <div className="rounded-3xl border border-gray-200 bg-white px-8 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {children}
      </div>
    </section>
  );
}

export function PricePrediction({ prediction }: { prediction: Prediction }) {
  const { recommendation, confidence, reasoning, priceHistory } = prediction;

  // Insufficient data — honest, low-key state with no confident verdict.
  if (recommendation === "insufficient") {
    return (
      <SectionShell>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="1" fill="currentColor" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold tracking-tight text-midnight">
              Not enough data yet
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{reasoning}</p>
            {priceHistory.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                <span className="font-semibold uppercase tracking-wide text-gray-400">
                  Limited history
                </span>
                {priceHistory.map((p) => (
                  <span key={p.date}>
                    {p.date} <span className="font-medium text-gray-500">${p.price}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionShell>
    );
  }

  const isBuy = recommendation === "buy";
  const accent = isBuy ? SEAT_GREEN : SCANNER_AMBER;
  const verdictText = isBuy ? "text-white" : "text-midnight";

  return (
    <SectionShell>
      {/* Verdict + confidence */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center rounded-xl px-5 py-2.5 text-lg font-extrabold uppercase tracking-wide ${verdictText}`}
          style={{ backgroundColor: accent }}
        >
          {isBuy ? "Buy now" : "Wait"}
        </span>
        {confidence && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            {confidence} confidence
          </span>
        )}
      </div>

      {/* Reasoning */}
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
        {reasoning}
      </p>

      {/* Price history graph */}
      <div className="mt-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Cheapest price over time
        </div>
        <PriceChart data={priceHistory} color={accent} />
      </div>
    </SectionShell>
  );
}
