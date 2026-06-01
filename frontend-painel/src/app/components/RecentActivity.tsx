import { FileText, CheckCircle, MessageSquare, UserPlus } from "lucide-react";

interface ActivityItem {
  id: number;
  iconType: "file" | "check" | "forum" | "user";
  title: string;
  description: string;
  time: string;
  action:
    | { kind: "button"; label: string; variant: "primary" | "outline" }
    | { kind: "badge";  label: string; color: string };
}

const activities: ActivityItem[] = [
  {
    id: 1,
    iconType: "file",
    title: "Novo pedido de acesso de investigador",
    description: "Dr. Amadeu Belo (Univ. Namibe) solicitou acesso ao Acervo Colonial.",
    time: "Há 5 min",
    action: { kind: "button", label: "Analisar", variant: "primary" },
  },
  {
    id: 2,
    iconType: "check",
    title: "Documento Publicado",
    description: '"Relatório de Exportação (Namyang, 1968)" aprovado e disponível no portal.',
    time: "Há 22 min",
    action: { kind: "badge", label: "SUCESSO", color: "#16a34a" },
  },
  {
    id: 3,
    iconType: "forum",
    title: 'Novo tópico no fórum',
    description: 'Discussão criada sobre "Papel da moeda Kwanza na transição (1976)"',
    time: "Há 2 horas",
    action: { kind: "button", label: "Ver Discussão", variant: "outline" },
  },
  {
    id: 4,
    iconType: "user",
    title: "Novo utilizador registado",
    description: "Maria João submeteu registo como Estudante de Graduação.",
    time: "Há 3 horas",
    action: { kind: "badge", label: "PROCESSADO", color: "#64748b" },
  },
];

const iconConfig = {
  file:  { Icon: FileText,     bg: "#fef2f2",  color: "#6f0008",  round: "rounded-md"   },
  check: { Icon: CheckCircle,  bg: "#f0fdf4",  color: "#16a34a",  round: "rounded-full" },
  forum: { Icon: MessageSquare,bg: "#fff7ed",  color: "#ea580c",  round: "rounded-md"   },
  user:  { Icon: UserPlus,     bg: "#eff6ff",  color: "#3b82f6",  round: "rounded-full" },
};

export function RecentActivity() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 md:px-6 lg:px-8 py-5 md:py-6 border-b border-[#f1f5f9]">
        <h3
          className="text-[#121c2a] tracking-[-0.3px]"
          style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "18px" }}
        >
          Atividade Recente
        </h3>
        <button
          className="text-[#6f0008] hover:opacity-75 transition-opacity self-start sm:self-auto"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "13px" }}
        >
          Filtrar Atividade
        </button>
      </div>

      {/* Items */}
      <div className="divide-y divide-[#f8fafc]">
        {activities.map((item) => {
          const cfg = iconConfig[item.iconType];
          const Icon = cfg.Icon;
          return (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 px-5 md:px-6 lg:px-8 py-4 md:py-5 hover:bg-[#fafafa] transition-colors"
            >
              {/* Left: icon + text */}
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div
                  className={`w-9 h-9 md:w-10 md:h-10 ${cfg.round} flex items-center justify-center shrink-0`}
                  style={{ background: cfg.bg }}
                >
                  <Icon size={16} className="md:w-[17px] md:h-[17px]" style={{ color: cfg.color }} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[#121c2a]"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "13px" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-[#64748b] mt-0.5 line-clamp-2 sm:truncate"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "11px" }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Right: time + action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 shrink-0 sm:ml-8 pl-12 sm:pl-0">
                <span
                  className="text-[#94a3b8] whitespace-nowrap"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}
                >
                  {item.time}
                </span>

                {item.action.kind === "button" && item.action.variant === "primary" && (
                  <button
                    className="bg-[#6b0119] text-white px-4 py-1.5 rounded-[4px] whitespace-nowrap"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "12px" }}
                  >
                    {item.action.label}
                  </button>
                )}

                {item.action.kind === "button" && item.action.variant === "outline" && (
                  <button
                    className="border border-[#6b0119] text-[#6b0119] px-4 py-1.5 rounded-[4px] whitespace-nowrap hover:bg-[#fef2f2] transition-colors"
                    style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "12px" }}
                  >
                    {item.action.label}
                  </button>
                )}

                {item.action.kind === "badge" && (
                  <span
                    className="uppercase whitespace-nowrap"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: "11px",
                      color: item.action.color,
                    }}
                  >
                    {item.action.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more */}
      <div className="px-5 md:px-6 lg:px-8 py-4 md:py-5 text-center border-t border-[#f1f5f9]">
        <button
          className="text-[#475569] hover:text-[#6f0008] transition-colors uppercase tracking-[1px]"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "11px" }}
        >
          Carregar Atividade Mais Antiga
        </button>
      </div>
    </div>
  );
}
