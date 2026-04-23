interface LinePoint {
  label: string;
  value: number;
}

interface SegmentPoint {
  label: string;
  value: number;
}

const normalizePoints = (items: LinePoint[]) => {
  const max = Math.max(...items.map((item) => item.value), 1);
  const min = Math.min(...items.map((item) => item.value), 0);
  const range = max - min || 1;

  return items.map((item, index) => {
    const x = items.length === 1 ? 50 : (index / (items.length - 1)) * 100;
    const y = 100 - ((item.value - min) / range) * 100;
    return { ...item, x, y };
  });
};

export const MiniLineChart = ({
  data,
  stroke = "#22C55E",
  fill = "rgba(34,197,94,0.12)",
}: {
  data: LinePoint[];
  stroke?: string;
  fill?: string;
}) => {
  if (!data.length) {
    return <div className="flex h-40 items-center justify-center text-sm text-slate-400">Aucune donnee</div>;
  }

  const points = normalizePoints(data);
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `0,100 ${line} 100,100`;

  return (
    <div>
      <svg viewBox="0 0 100 100" className="h-40 w-full overflow-visible">
        <polyline points={area} fill={fill} stroke="none" />
        <polyline points={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="2.8" fill={stroke} />
        ))}
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500 md:grid-cols-4">
        {data.map((item) => (
          <div key={item.label} className="rounded-2xl bg-slate-50 px-3 py-2">
            <p>{item.label}</p>
            <p className="mt-1 font-semibold text-dark">{item.value.toFixed(1)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HorizontalBars = ({
  data,
  color = "#22C55E",
}: {
  data: SegmentPoint[];
  color?: string;
}) => {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-dark">{item.label}</span>
            <span className="text-slate-500">{item.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
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
  const palette = colors || ["#22C55E", "#FACC15", "#1E293B", "#94A3B8", "#0F766E"];
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let offset = 0;

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-center">
      <svg viewBox="0 0 42 42" className="h-44 w-44 shrink-0">
        <circle cx="21" cy="21" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="6" />
        {data.map((item, index) => {
          const value = (item.value / total) * 100;
          const dash = `${value} ${100 - value}`;
          const segment = (
            <circle
              key={item.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="none"
              stroke={palette[index % palette.length]}
              strokeWidth="6"
              strokeDasharray={dash}
              strokeDashoffset={25 - offset}
            />
          );
          offset += value;
          return segment;
        })}
        <text x="21" y="19" textAnchor="middle" className="fill-slate-400 text-[4px] font-semibold uppercase">
          Total
        </text>
        <text x="21" y="24" textAnchor="middle" className="fill-slate-900 text-[5px] font-bold">
          {total}
        </text>
      </svg>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center gap-3 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
            <span className="font-medium text-dark">{item.label}</span>
            <span className="text-slate-500">{item.value}</span>
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
  const pointsPaid = normalizePoints(data.map((item) => ({ label: item.label, value: item.paid })));
  const pointsDue = normalizePoints(data.map((item) => ({ label: item.label, value: item.due })));

  return (
    <div>
      <svg viewBox="0 0 100 100" className="h-44 w-full overflow-visible">
        <polyline points={`0,100 ${pointsDue.map((point) => `${point.x},${point.y}`).join(" ")} 100,100`} fill="rgba(239,68,68,0.12)" stroke="none" />
        <polyline points={`0,100 ${pointsPaid.map((point) => `${point.x},${point.y}`).join(" ")} 100,100`} fill="rgba(34,197,94,0.18)" stroke="none" />
        <polyline points={pointsDue.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#EF4444" strokeWidth="2.4" />
        <polyline points={pointsPaid.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#22C55E" strokeWidth="2.4" />
        <line x1="0" y1="45" x2="100" y2="45" stroke="#FACC15" strokeDasharray="3 3" strokeWidth="1.5" />
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-secondary" />Paye</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500" />Impayes</span>
        <span className="inline-flex items-center gap-2"><span className="h-0.5 w-5 bg-primary" />Objectif</span>
      </div>
    </div>
  );
};
