import { DashboardHeader }   from "../components/DashboardHeader";
import { KpiCard }           from "../components/KpiCard";
import { ActivityChart }     from "../components/ActivityChart";
import { PreservationGoals } from "../components/PreservationGoals";
import { RecentActivity }    from "../components/RecentActivity";

export function DashboardPage() {
  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 lg:py-10 max-w-[1100px]">
      <DashboardHeader
        title="Visão Geral"
        subtitle="Painel de monitorização administrativa e preservação histórica."
      />

      {/* ── KPI Row (5 cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 mb-6">
        <KpiCard
          label="TOTAL UTILIZADORES"
          value="2,842"
          variant={{
            type: "trend",
            badge: "+12%",
            badgeLabel: "vs. mês passado",
            positive: true,
          }}
        />
        <KpiCard
          label="PEDIDOS DE ACESSO"
          value="12"
          leftBorderColor="#ba1a1a"
          variant={{ type: "alert", badge: "PENDENTES" }}
        />
        <KpiCard
          label={"CONTEÚDO PUBLICADO"}
          value="12,4k"
          variant={{
            type: "progress",
            subValue: "/ 158 em revisão",
            progress: 88,
          }}
        />
        <KpiCard
          label={"TÓPICOS ATIVOS (48H)"}
          value="42"
          valueColor="#fbbf24"
          variant={{
            type: "avatar",
            avatarColors: ["#cbd5e1", "#94a3b8", "#6b0119"],
          }}
        />
        <KpiCard
          label="NOVOS MEMBROS"
          value="18"
          variant={{ type: "simple", subtext: "hoje" }}
        />
      </div>

      {/* ── Chart + Goals row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-6">
        <ActivityChart />
        <PreservationGoals />
      </div>

      {/* ── Recent Activity ── */}
      <RecentActivity />

      {/* ── Footer ── */}
      <footer className="mt-8 md:mt-12 pt-8 md:pt-10 border-t border-[#e2e8f0]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pb-8 md:pb-10">
          {/* Brand column */}
          <div>
            <p
              className="text-[#121c2a] leading-snug uppercase"
              style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "16px" }}
            >
              Economia<br />com História
            </p>
            <p
              className="text-[#64748b] mt-3"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", lineHeight: "1.6" }}
            >
              Plataforma institucional dedicada à
              excelência académica e à preservação
              histórica do património económico.
            </p>
          </div>

          {/* Administração */}
          <div>
            <p
              className="text-[#121c2a] uppercase tracking-[1.5px] mb-4"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
            >
              Administração
            </p>
            {["Manual do Curador", "Auditoria de Acessos", "Protocolos de Segurança"].map((link) => (
              <button
                key={link}
                className="block text-left text-[#475569] hover:text-[#6f0008] transition-colors mb-2"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "13px" }}
              >
                {link}
              </button>
            ))}
          </div>

          {/* Institucional */}
          <div>
            <p
              className="text-[#121c2a] uppercase tracking-[1.5px] mb-4"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
            >
              Institucional
            </p>
            {["Repositório Central", "Parcerias Académicas", "Publicações"].map((link) => (
              <button
                key={link}
                className="block text-left text-[#475569] hover:text-[#6f0008] transition-colors mb-2"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "13px" }}
              >
                {link}
              </button>
            ))}
          </div>

          {/* Legal */}
          <div>
            <p
              className="text-[#121c2a] uppercase tracking-[1.5px] mb-4"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
            >
              Legal
            </p>
            {["Política de Privacidade", "Termos de Utilização", "Direitos de Propriedade"].map((link) => (
              <button
                key={link}
                className="block text-left text-[#475569] hover:text-[#6f0008] transition-colors mb-2"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "13px" }}
              >
                {link}
              </button>
            ))}
          </div>
        </div>

        {/* Copyright bar */}
        <div className="pt-6 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-[#94a3b8] text-center sm:text-left"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "11px" }}
          >
            © 2026 Economia com História. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 shrink-0">
            {/* Globe */}
            <button className="text-[#94a3b8] hover:text-[#6f0008] transition-colors">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L7 13v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H6V8h2c.55 0 1-.45 1-1V5h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
              </svg>
            </button>
            {/* Mail */}
            <button className="text-[#94a3b8] hover:text-[#6f0008] transition-colors">
              <svg width="15" height="15" viewBox="0 0 20 16" fill="none">
                <path d="M18 0H2C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V2l8 5 8-5v2z" fill="currentColor"/>
              </svg>
            </button>
            {/* Share */}
            <button className="text-[#94a3b8] hover:text-[#6f0008] transition-colors">
              <svg width="15" height="15" viewBox="0 0 18 20" fill="none">
                <path d="M15 14.08c-.76 0-1.44.3-1.96.77L5.91 10.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L4.04 7.81C3.5 7.31 2.79 7 2 7c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
