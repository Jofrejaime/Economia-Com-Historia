// KPI card with 5 variants matching the Figma design

interface TrendVariant {
  type: "trend";
  badge: string;        // e.g. "+12%"
  badgeLabel: string;   // e.g. "vs. mês passado"
  positive: boolean;
}

interface AlertVariant {
  type: "alert";
  badge: string;        // e.g. "PENDENTES"
}

interface ProgressVariant {
  type: "progress";
  subValue: string;     // e.g. "/ 158 em revisão"
  progress: number;     // 0–100
}

interface AvatarVariant {
  type: "avatar";
  avatarColors: string[];
}

interface SimpleVariant {
  type: "simple";
  subtext: string;      // e.g. "hoje"
}

type KpiVariant = TrendVariant | AlertVariant | ProgressVariant | AvatarVariant | SimpleVariant;

interface KpiCardProps {
  label: string;
  value: string;
  valueColor?: string;
  leftBorderColor?: string;
  variant: KpiVariant;
}

export function KpiCard({ label, value, valueColor, leftBorderColor, variant }: KpiCardProps) {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-lg relative overflow-hidden flex flex-col justify-between p-6">
      {/* Left accent border */}
      {leftBorderColor && (
        <div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{ borderLeft: `4px solid ${leftBorderColor}` }}
        />
      )}

      {/* Top: label + value */}
      <div className={leftBorderColor ? "pl-1" : ""}>
        <p
          className="text-[#94a3b8] uppercase tracking-[1px]"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px", lineHeight: "15px" }}
        >
          {label}
        </p>

        {/* Value */}
        {variant.type === "progress" ? (
          <div className="relative h-[62px] mt-1">
            <p
              className="text-[#121c2a] tracking-[-0.48px]"
              style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "24px", lineHeight: "32px" }}
            >
              {value}
            </p>
            <p
              className="absolute text-[#94a3b8] top-3.5 ml-[70px]"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", lineHeight: "16px" }}
            >
              {variant.subValue}
            </p>
          </div>
        ) : (
          <p
            className="mt-1 tracking-[-0.48px]"
            style={{
              fontFamily: "Newsreader, serif",
              fontWeight: 700,
              fontSize: "24px",
              lineHeight: "32px",
              color: valueColor || "#121c2a",
            }}
          >
            {value}
          </p>
        )}
      </div>

      {/* Bottom variant content */}
      <div className="mt-4">
        {variant.type === "trend" && (
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-[2px]"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "10px",
                background: variant.positive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                color: variant.positive ? "#22c55e" : "#ef4444",
              }}
            >
              {variant.badge}
            </span>
            <span
              className="text-[#94a3b8]"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "10px" }}
            >
              {variant.badgeLabel}
            </span>
          </div>
        )}

        {variant.type === "alert" && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
            <span
              className="text-[#ba1a1a] uppercase"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
            >
              {variant.badge}
            </span>
          </div>
        )}

        {variant.type === "progress" && (
          <div className="h-[6px] bg-[#f1f5f9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#22c55e] rounded-full"
              style={{ width: `${variant.progress}%` }}
            />
          </div>
        )}

        {variant.type === "avatar" && (
          <div className="flex items-center">
            {variant.avatarColors.map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{
                  background: color,
                  marginLeft: i > 0 ? "-8px" : "0",
                }}
              />
            ))}
          </div>
        )}

        {variant.type === "simple" && (
          <p
            className="text-[#64748b]"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px" }}
          >
            {variant.subtext}
          </p>
        )}
      </div>
    </div>
  );
}
