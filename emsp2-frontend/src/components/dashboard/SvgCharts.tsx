import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface LinePoint {
  label: string;
  value: number;
}

interface SegmentPoint {
  label: string;
  value: number;
}

const CHART_PRIMARY = "#22C55E";
const CHART_PRIMARY_SOFT = "rgba(34, 197, 94, 0.15)";
const CHART_DANGER = "#EF4444";
const CHART_GRID = "#E2E8F0";
const CHART_AXIS = "#64748B";
const CHART_TOOLTIP_STYLE = {
  backgroundColor: "rgba(255,255,255,0.97)",
  border: "1px solid #E2E8F0",
  borderRadius: "12px",
  boxShadow: "0 14px 36px -18px rgba(15,23,42,0.35)",
  fontSize: "12px",
  padding: "10px 14px",
} as const;

const defaultPalette = ["#22C55E", "#FACC15", "#4F46E5", "#94A3B8", "#0F766E", "#3B82F6"];

export const MiniLineChart = ({
  data,
  stroke = CHART_PRIMARY,
  fill = CHART_PRIMARY_SOFT,
}: {
  data: LinePoint[];
  stroke?: string;
  fill?: string;
}) => {
  const gradientId = useId().replace(/:/g, "");

  if (!data.length) {
    return <div className="chart-container-maxton flex h-52 items-center justify-center text-sm text-slate-400">Aucune donnee</div>;
  }

  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  return (
    <div className="chart-container-maxton w-full animate-fadeIn">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={`miniLineFill-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.38} />
              <stop offset="100%" stopColor={fill || stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            formatter={(value: number) => [value.toFixed(2), "Valeur"]}
            labelFormatter={(label) => String(label)}
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2.5}
            fill={`url(#miniLineFill-${gradientId})`}
            activeDot={{ r: 5, strokeWidth: 0, fill: stroke }}
            animationDuration={850}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 md:grid-cols-4">
        {data.map((item) => (
          <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100/80">
            <p className="truncate">{item.label}</p>
            <p className="mt-1 font-semibold text-dark">{item.value.toFixed(1)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HorizontalBars = ({
  data,
  color = CHART_PRIMARY,
}: {
  data: SegmentPoint[];
  color?: string;
}) => {
  const max = Math.max(...data.map((item) => item.value), 1);
  const chartData = data.map((item) => ({
    label: item.label.length > 24 ? `${item.label.slice(0, 22)}…` : item.label,
    fullLabel: item.label,
    value: item.value,
    pct: Math.round((item.value / max) * 100),
  }));

  return (
    <div className="chart-container-maxton w-full animate-fadeIn">
      <ResponsiveContainer width="100%" height={Math.min(400, 40 + data.length * 34)}>
        <BarChart layout="vertical" data={chartData} margin={{ top: 6, right: 24, left: 4, bottom: 6 }} barCategoryGap={8}>
          <CartesianGrid strokeDasharray="3 6" stroke={CHART_GRID} horizontal={false} />
          <XAxis type="number" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={112}
            tick={{ fill: CHART_AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number, _name, item) => {
              const pct =
                item && "payload" in item && item.payload && typeof item.payload === "object" && "pct" in item.payload
                  ? Number((item.payload as { pct?: number }).pct)
                  : 0;
              return [`${value} (${pct}% vs max)`, "Effectif"];
            }}
            labelFormatter={(_, payload) => (payload?.[0]?.payload as { fullLabel?: string } | undefined)?.fullLabel || ""}
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={750}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={color} fillOpacity={0.88 - (i % 4) * 0.05} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DonutBreakdown = ({
  data,
  colors,
}: {
  data: SegmentPoint[];
  colors?: string[];
}) => {
  const palette = colors || defaultPalette;
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
  }));

  return (
    <div className="flex animate-fadeIn flex-col gap-6 md:flex-row md:items-center">
      <div className="relative mx-auto w-full max-w-[280px] md:mx-0">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={96}
              paddingAngle={2}
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
              animationDuration={850}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, "Part"]}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Total</p>
          <p className="font-display text-2xl font-bold text-dark">{total}</p>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: palette[index % palette.length] }} />
            <span className="min-w-0 flex-1 font-medium text-dark">{item.label}</span>
            <span className="shrink-0 tabular-nums text-slate-500">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AreaComparisonChart = ({
  data,
}: {
  data: Array<{ label: string; paid: number; due: number }>;
}) => {
  const compId = useId().replace(/:/g, "");

  if (!data.length) {
    return <div className="chart-container-maxton flex h-52 items-center justify-center text-sm text-slate-400">Aucune donnee</div>;
  }

  return (
    <div className="chart-container-maxton w-full animate-fadeIn">
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={`fillPaid-${compId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.38} />
              <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`fillDue-${compId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_DANGER} stopOpacity={0.32} />
              <stop offset="95%" stopColor={CHART_DANGER} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke={CHART_GRID} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: CHART_AXIS, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            formatter={(value: number, name: string) => [
              typeof value === "number" ? value.toLocaleString("fr-FR") : value,
              name === "paid" ? "Encaisse" : "Impaye",
            ]}
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <Legend
            verticalAlign="top"
            height={28}
            formatter={(value) => (value === "paid" ? "Encaisse" : "Impayes")}
            wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }}
          />
          <Area type="monotone" dataKey="paid" name="paid" stroke={CHART_PRIMARY} strokeWidth={2.5} fill={`url(#fillPaid-${compId})`} animationDuration={850} />
          <Area type="monotone" dataKey="due" name="due" stroke={CHART_DANGER} strokeWidth={2.5} fill={`url(#fillDue-${compId})`} animationDuration={850} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
          Encaisse
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Impayes
        </span>
      </div>
    </div>
  );
};

/** Demi-anneau 0–20 : moyenne etudiant (style widgets Maxton). */
export const GradeRadialGauge = ({
  average,
  max = 20,
}: {
  average: number;
  max?: number;
}) => {
  const clamped = Math.min(Math.max(average, 0), max);
  const rest = Math.max(0.001, max - clamped);
  const fill = clamped >= max * 0.5 ? CHART_PRIMARY : CHART_DANGER;

  return (
    <div className="relative mx-auto w-full max-w-[240px] animate-fadeIn">
      <div className="relative h-[150px] w-full">
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={[{ value: clamped }, { value: rest }]}
              cx="50%"
              cy="92%"
              startAngle={180}
              endAngle={0}
              innerRadius={72}
              outerRadius={102}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              animationDuration={800}
            >
              <Cell fill={fill} />
              <Cell fill="#E2E8F0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute left-1/2 top-[58%] w-full -translate-x-1/2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Moyenne</p>
          <p className="font-display text-3xl font-bold leading-tight text-dark">{clamped.toFixed(2)}</p>
          <p className="text-xs text-slate-500">/ {max}</p>
        </div>
      </div>
    </div>
  );
};
