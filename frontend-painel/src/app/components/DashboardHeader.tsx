import { Calendar } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6 md:mb-8 lg:mb-10">
      {/* Left: title + subtitle */}
      <div>
        <h1
          className="text-[#121c2a] tracking-[-0.72px]"
          style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "28px", lineHeight: "34px" }}
        >
          {title}
        </h1>
        <p
          className="text-[#64748b] mt-1"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "14px", lineHeight: "22px" }}
        >
          {subtitle}
        </p>
      </div>

      {/* Right: date + CTA */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <div className="flex items-center gap-2 bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-[4px] px-4 md:px-5 py-2 md:py-[10px]">
          <Calendar size={12} className="md:w-[13px] md:h-[13px] text-[#334155]" />
          <span
            className="text-[#334155]"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "13px" }}
          >
            {today}
          </span>
        </div>

        <button
          className="relative bg-[#6b0119] text-white px-5 md:px-6 py-2 md:py-[10px] rounded-[4px]"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "13px" }}
        >
          <span className="absolute inset-0 rounded-[4px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
          <span className="relative">Novo Documento</span>
        </button>
      </div>
    </div>
  );
}
