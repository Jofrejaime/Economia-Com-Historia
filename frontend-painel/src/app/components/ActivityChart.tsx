import { useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { mes: "Jan", colonial: 120, posIndep: 80  },
  { mes: "Fev", colonial: 145, posIndep: 110 },
  { mes: "Mar", colonial: 130, posIndep: 95  },
  { mes: "Abr", colonial: 180, posIndep: 140 },
  { mes: "Mai", colonial: 165, posIndep: 160 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#e2e8f0] rounded-lg p-3 shadow-lg">
        <p
          className="text-[#121c2a] mb-1.5"
          style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "13px" }}
        >
          {label}
        </p>
        {payload.map((entry: any) => (
          <p
            key={entry.dataKey}
            style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: entry.color }}
          >
            {entry.name}:{" "}
            <span style={{ fontWeight: 600 }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ActivityChart() {
  const chartId = useId();
  const colonialGradId = `colonialGrad-${chartId}`;
  const posIndepGradId = `posIndepGrad-${chartId}`;

  return (
    <div
      className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-lg p-5 md:p-6 lg:p-7 lg:col-span-2"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 md:mb-6">
        <h3
          className="text-[#121c2a] tracking-[-0.3px]"
          style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "18px" }}
        >
          Acesso por Categoria
        </h3>
        <div className="flex items-center gap-4 md:gap-5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#6f0008]" />
            <span
              className="text-[#475569] uppercase tracking-[1px]"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
            >
              Economia Colonial
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
            <span
              className="text-[#475569] uppercase tracking-[1px]"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
            >
              Pós-Independência
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200} className="md:!h-[220px]">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={colonialGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6f0008" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#6f0008" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id={posIndepGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#d97706" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#d97706" stopOpacity={0}    />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="mes"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "Inter, sans-serif", fontWeight: 600 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "Inter, sans-serif" }}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(107,1,25,0.08)", strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="colonial"
            name="Economia Colonial"
            stroke="#6f0008"
            strokeWidth={2}
            fill={`url(#${colonialGradId})`}
            dot={(props: any) => {
              const { cx, cy, index } = props;
              return (
                <circle
                  key={`colonial-dot-${index}`}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill="#6f0008"
                  strokeWidth={0}
                />
              );
            }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="posIndep"
            name="Pós-Independência"
            stroke="#d97706"
            strokeWidth={2}
            fill={`url(#${posIndepGradId})`}
            dot={(props: any) => {
              const { cx, cy, index } = props;
              return (
                <circle
                  key={`posIndep-dot-${index}`}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill="#d97706"
                  strokeWidth={0}
                />
              );
            }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
