import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Flame,
  Lock,
  CheckCheck,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AccessRequest {
  id: number;
  name: string;
  institution: string;
  email: string;
  category: string;
  type: "jindungo" | "restrito";
  date: string;
  timeAgo: string;
  avatarInitials: string;
  avatarColor: string;
}

interface HistoryItem {
  id: number;
  name: string;
  institution: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  category: string;
  type: "jindungo" | "restrito";
  date: string;
  decision: "aprovado" | "rejeitado";
  processedBy: string;
  note?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_PENDING: AccessRequest[] = [
  {
    id: 1,
    name: "Dr. Amadeu Belo",
    institution: "Universidade do Namibe",
    email: "a.belo@unamibe.ao",
    category: "Acervo Colonial Premium",
    type: "jindungo",
    date: "10 Mai 2026",
    timeAgo: "Há 5 min",
    avatarInitials: "AB",
    avatarColor: "#6b0119",
  },
  {
    id: 2,
    name: "Sofia Martins",
    institution: "Universidade Agostinho Neto",
    email: "s.martins@uan.ao",
    category: "Economia Jindungo",
    type: "jindungo",
    date: "09 Mai 2026",
    timeAgo: "Há 1 dia",
    avatarInitials: "SM",
    avatarColor: "#1d4ed8",
  },
  {
    id: 3,
    name: "Carlos Tavares",
    institution: "ISCED Huíla",
    email: "c.tavares@isced.ao",
    category: "Rotas Comerciais Premium",
    type: "jindungo",
    date: "09 Mai 2026",
    timeAgo: "Há 1 dia",
    avatarInitials: "CT",
    avatarColor: "#0891b2",
  },
  {
    id: 4,
    name: "Prof. João Lúcio",
    institution: "ISEG Lisboa",
    email: "j.lucio@iseg.ulisboa.pt",
    category: "Investigação Avançada",
    type: "restrito",
    date: "08 Mai 2026",
    timeAgo: "Há 2 dias",
    avatarInitials: "JL",
    avatarColor: "#7c3aed",
  },
  {
    id: 5,
    name: "Ana Rodrigues",
    institution: "Universidade Católica",
    email: "a.rodrigues@ucp.pt",
    category: "Sistema Monetário",
    type: "restrito",
    date: "07 Mai 2026",
    timeAgo: "Há 3 dias",
    avatarInitials: "AR",
    avatarColor: "#15803d",
  },
  {
    id: 6,
    name: "Rui Campos",
    institution: "FCEE — Univ. Lusíada",
    email: "r.campos@ulusiade.pt",
    category: "Sistema Monetário",
    type: "restrito",
    date: "07 Mai 2026",
    timeAgo: "Há 3 dias",
    avatarInitials: "RC",
    avatarColor: "#b45309",
  },
];

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 101,
    name: "Maria João Ferreira",
    institution: "Univ. de Coimbra",
    email: "mj.ferreira@uc.pt",
    avatarInitials: "MF",
    avatarColor: "#6b0119",
    category: "Economia Colonial",
    type: "jindungo",
    date: "09 Mai 2026",
    decision: "aprovado",
    processedBy: "Dr. Manuel Costa",
  },
  {
    id: 102,
    name: "Pedro Alves Santos",
    institution: "ISCTE — IUL",
    email: "p.santos@iscte.pt",
    avatarInitials: "PA",
    avatarColor: "#1d4ed8",
    category: "Análise de Políticas",
    type: "restrito",
    date: "08 Mai 2026",
    decision: "rejeitado",
    processedBy: "Dr. Manuel Costa",
    note: "Credenciais institucionais insuficientes para nível restrito.",
  },
  {
    id: 103,
    name: "Luísa Carvalho",
    institution: "Faculdade de Letras — UL",
    email: "l.carvalho@letras.ulisboa.pt",
    avatarInitials: "LC",
    avatarColor: "#0891b2",
    category: "História Fiscal",
    type: "jindungo",
    date: "07 Mai 2026",
    decision: "aprovado",
    processedBy: "Dr. Manuel Costa",
  },
  {
    id: 104,
    name: "Tiago Mendes",
    institution: "Univ. do Porto",
    email: "t.mendes@up.pt",
    avatarInitials: "TM",
    avatarColor: "#15803d",
    category: "Rotas Comerciais",
    type: "restrito",
    date: "06 Mai 2026",
    decision: "aprovado",
    processedBy: "Dr. Manuel Costa",
    note: "Projecto de doutoramento validado pelo orientador.",
  },
  {
    id: 105,
    name: "Filipa Costa",
    institution: "Nova School of Business",
    email: "f.costa@novasbe.pt",
    avatarInitials: "FC",
    avatarColor: "#7c3aed",
    category: "Economia Jindungo",
    type: "jindungo",
    date: "05 Mai 2026",
    decision: "aprovado",
    processedBy: "Dr. Manuel Costa",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: "jindungo" | "restrito" }) {
  if (type === "jindungo") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fff7ed] text-[#ea580c]"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
      >
        <Flame size={10} /> Jindungo
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fdf4ff] text-[#9333ea]"
      style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
    >
      <Lock size={10} /> Restrito
    </span>
  );
}

function DecisionBadge({ decision }: { decision: "aprovado" | "rejeitado" }) {
  if (decision === "aprovado") {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#16a34a]"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "11px" }}
      >
        <CheckCheck size={11} /> Aprovado
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fef2f2] text-[#dc2626]"
      style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "11px" }}
    >
      <X size={11} /> Rejeitado
    </span>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

interface RequestCardProps {
  request: AccessRequest;
  onApprove: (id: number, note?: string) => void;
  onReject: (id: number) => void;
}

function RequestCard({ request, onApprove, onReject }: RequestCardProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [confirmAction, setConfirmAction] = useState<null | "approved" | "rejected">(null);

  const isRestrito = request.type === "restrito";
  const accentColor = isRestrito ? "#7c3aed" : "#ea580c";
  const accentBg    = isRestrito ? "#fdf4ff"  : "#fff7ed";

  const handleApproveClick = () => {
    if (isRestrito && !noteOpen && !note) {
      setNoteOpen(true);
      return;
    }
    setConfirmAction("approved");
    setTimeout(() => onApprove(request.id, note), 900);
  };

  const handleRejectClick = () => {
    setConfirmAction("rejected");
    setTimeout(() => onReject(request.id), 900);
  };

  return (
    <div
      className="bg-white drop-shadow-[0px_1px_2px_rgba(0,0,0,0.07)] rounded-lg overflow-hidden relative"
      style={{ borderLeft: `3px solid ${accentColor}` }}
    >
      {/* Feedback overlay */}
      {confirmAction && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg"
          style={{
            background:
              confirmAction === "approved"
                ? "rgba(240,253,244,0.96)"
                : "rgba(254,242,242,0.96)",
          }}
        >
          <div className="flex flex-col items-center gap-2">
            {confirmAction === "approved" ? (
              <CheckCircle size={32} className="text-[#16a34a]" />
            ) : (
              <XCircle size={32} className="text-[#dc2626]" />
            )}
            <p
              className={confirmAction === "approved" ? "text-[#16a34a]" : "text-[#dc2626]"}
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "13px" }}
            >
              {confirmAction === "approved" ? "Acesso aprovado!" : "Pedido rejeitado"}
            </p>
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
            style={{
              background: request.avatarColor,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "12px",
            }}
          >
            {request.avatarInitials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="text-[#121c2a]"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "14px" }}
                >
                  {request.name}
                </p>
                <p
                  className="text-[#64748b] mt-0.5"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px" }}
                >
                  {request.institution} · {request.email}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <TypeBadge type={request.type} />
                <span
                  className="text-[#94a3b8] flex items-center gap-1"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}
                >
                  <Clock size={10} /> {request.timeAgo}
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className="text-[#475569] uppercase tracking-[0.8px]"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
              >
                Categoria solicitada:
              </span>
              <span
                className="px-2 py-0.5 rounded"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "11px",
                  background: accentBg,
                  color: accentColor,
                }}
              >
                {request.category}
              </span>
            </div>
          </div>
        </div>

        {/* Note field (restricted) */}
        {isRestrito && noteOpen && (
          <div className="mt-4 pl-14">
            <label
              className="block text-[#475569] uppercase tracking-[0.8px] mb-1.5"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
            >
              Nota de justificação (obrigatória para aprovação)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Descreva o motivo da aprovação ou informação adicional..."
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#7c3aed] transition-colors"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#121c2a" }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pl-14 flex items-center gap-3">
          {isRestrito && !noteOpen && (
            <button
              onClick={() => setNoteOpen(true)}
              className="text-[#7c3aed] flex items-center gap-1.5 hover:opacity-75 transition-opacity"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "12px" }}
            >
              <ChevronDown size={13} />
              Adicionar nota
            </button>
          )}
          {isRestrito && noteOpen && (
            <button
              onClick={() => setNoteOpen(false)}
              className="text-[#94a3b8] flex items-center gap-1.5 hover:opacity-75 transition-opacity"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "12px" }}
            >
              <ChevronUp size={13} />
              Fechar nota
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleRejectClick}
              className="border border-[#fca5a5] text-[#dc2626] px-4 py-1.5 rounded-[4px] hover:bg-[#fef2f2] transition-colors"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "12px" }}
            >
              Rejeitar
            </button>
            <button
              onClick={handleApproveClick}
              disabled={isRestrito && noteOpen && !note.trim()}
              className="bg-[#16a34a] text-white px-4 py-1.5 rounded-[4px] hover:bg-[#15803d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "12px" }}
            >
              {isRestrito && noteOpen ? "Confirmar Aprovação" : "Aprovar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── History Table Row ────────────────────────────────────────────────────────

function HistoryRow({ item }: { item: HistoryItem }) {
  const [noteOpen, setNoteOpen] = useState(false);
  return (
    <>
      <tr className="border-b border-[#f1f5f9] hover:bg-[#fafafa] transition-colors">
        {/* Utilizador */}
        <td className="py-4 px-5">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white"
              style={{
                background: item.avatarColor,
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "11px",
              }}
            >
              {item.avatarInitials}
            </div>
            <div>
              <p
                className="text-[#121c2a]"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "13px" }}
              >
                {item.name}
              </p>
              <p
                className="text-[#94a3b8]"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}
              >
                {item.institution}
              </p>
            </div>
          </div>
        </td>
        {/* Tipo */}
        <td className="py-4 px-5">
          <TypeBadge type={item.type} />
        </td>
        {/* Categoria */}
        <td className="py-4 px-5">
          <span
            className="text-[#475569]"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}
          >
            {item.category}
          </span>
        </td>
        {/* Data */}
        <td className="py-4 px-5">
          <span
            className="text-[#64748b]"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}
          >
            {item.date}
          </span>
        </td>
        {/* Decisão */}
        <td className="py-4 px-5">
          <DecisionBadge decision={item.decision} />
        </td>
        {/* Processado por */}
        <td className="py-4 px-5">
          <div className="flex items-center gap-2">
            <span
              className="text-[#64748b]"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}
            >
              {item.processedBy}
            </span>
            {item.note && (
              <button
                onClick={() => setNoteOpen(!noteOpen)}
                className="text-[#94a3b8] hover:text-[#7c3aed] transition-colors"
              >
                <ChevronDown size={13} className={`transition-transform ${noteOpen ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </td>
      </tr>
      {/* Note row */}
      {item.note && noteOpen && (
        <tr className="bg-[#fdf4ff]">
          <td colSpan={6} className="px-5 py-3">
            <p
              className="text-[#7c3aed]"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontStyle: "italic" }}
            >
              <span className="font-semibold not-italic">Nota: </span>
              {item.note}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function RequestsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [pending, setPending]     = useState<AccessRequest[]>(INITIAL_PENDING);
  const [history, setHistory]     = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [search, setSearch]       = useState("");
  const [filterDecision, setFilterDecision] = useState<"todos" | "aprovado" | "rejeitado">("todos");
  const [filterType, setFilterType]         = useState<"todos" | "jindungo" | "restrito">("todos");

  const jindungoPending = pending.filter((r) => r.type === "jindungo");
  const restritoPending = pending.filter((r) => r.type === "restrito");

  const handleApprove = (id: number, note?: string) => {
    const req = pending.find((r) => r.id === id);
    if (!req) return;
    const newHistoryItem: HistoryItem = {
      id: Date.now(),
      name: req.name,
      institution: req.institution,
      email: req.email,
      avatarInitials: req.avatarInitials,
      avatarColor: req.avatarColor,
      category: req.category,
      type: req.type,
      date: new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" }),
      decision: "aprovado",
      processedBy: "Dr. Manuel Costa",
      note: note || undefined,
    };
    setPending((p) => p.filter((r) => r.id !== id));
    setHistory((h) => [newHistoryItem, ...h]);
  };

  const handleReject = (id: number) => {
    const req = pending.find((r) => r.id === id);
    if (!req) return;
    const newHistoryItem: HistoryItem = {
      id: Date.now(),
      name: req.name,
      institution: req.institution,
      email: req.email,
      avatarInitials: req.avatarInitials,
      avatarColor: req.avatarColor,
      category: req.category,
      type: req.type,
      date: new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" }),
      decision: "rejeitado",
      processedBy: "Dr. Manuel Costa",
    };
    setPending((p) => p.filter((r) => r.id !== id));
    setHistory((h) => [newHistoryItem, ...h]);
  };

  const filteredHistory = history.filter((h) => {
    const matchSearch =
      search === "" ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.category.toLowerCase().includes(search.toLowerCase()) ||
      h.institution.toLowerCase().includes(search.toLowerCase());
    const matchDecision = filterDecision === "todos" || h.decision === filterDecision;
    const matchType     = filterType === "todos"     || h.type === filterType;
    return matchSearch && matchDecision && matchType;
  });

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 lg:py-10 max-w-[1100px]">

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1
            className="text-[#121c2a] tracking-[-0.72px]"
            style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "28px", lineHeight: "34px" }}
          >
            Pedidos de Acesso
          </h1>
          <p
            className="text-[#64748b] mt-1"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "14px", lineHeight: "22px" }}
          >
            Aprovação e gestão de acessos a categorias premium e restritas.
          </p>
        </div>
        {pending.length > 0 && (
          <div
            className="flex items-center gap-2 bg-[#fef2f2] border border-[#fca5a5] px-4 py-2 rounded-full"
          >
            <div className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
            <span
              className="text-[#dc2626]"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "13px" }}
            >
              {pending.length} pendente{pending.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── Stats strip ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {[
          {
            label: "TOTAL PENDENTES",
            value: pending.length,
            color: "#dc2626",
            bg: "#fef2f2",
          },
          {
            label: "🔥 JINDUNGO",
            value: jindungoPending.length,
            color: "#ea580c",
            bg: "#fff7ed",
          },
          {
            label: "🔒 RESTRITOS",
            value: restritoPending.length,
            color: "#7c3aed",
            bg: "#fdf4ff",
          },
          {
            label: "PROCESSADOS HOJE",
            value: history.filter(
              (h) =>
                h.date ===
                new Date().toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
            ).length || 5,
            color: "#16a34a",
            bg: "#f0fdf4",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-lg px-5 py-4 flex items-center gap-4"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: stat.bg }}
            >
              <span
                style={{
                  fontFamily: "Newsreader, serif",
                  fontWeight: 700,
                  fontSize: "18px",
                  color: stat.color,
                }}
              >
                {stat.value}
              </span>
            </div>
            <p
              className="text-[#94a3b8] uppercase tracking-[0.8px]"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tab bar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-[#e2e8f0] mb-7">
        {([
          { id: "pending", label: "Pendentes", count: pending.length },
          { id: "history", label: "Historial",  count: history.length },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-[#6b0119] text-[#6b0119]"
                : "border-transparent text-[#64748b] hover:text-[#121c2a]"
            }`}
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px" }}
          >
            {tab.label}
            <span
              className="px-1.5 py-0.5 rounded-full text-white"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "10px",
                background: activeTab === tab.id ? "#6b0119" : "#94a3b8",
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB: PENDENTES
      ═══���══════════════════════════════════════════════════════ */}
      {activeTab === "pending" && (
        <div>
          {pending.length === 0 ? (
            <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-lg p-16 text-center">
              <CheckCircle size={40} className="text-[#16a34a] mx-auto mb-4" />
              <p
                className="text-[#121c2a]"
                style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "22px" }}
              >
                Sem pedidos pendentes
              </p>
              <p
                className="text-[#64748b] mt-2"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
              >
                Todos os pedidos foram processados.
              </p>
            </div>
          ) : (
            <>
              {/* Jindungo section */}
              {jindungoPending.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame size={16} className="text-[#ea580c]" />
                    <h2
                      className="text-[#121c2a]"
                      style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "18px" }}
                    >
                      Pedidos Jindungo
                    </h2>
                    <span
                      className="ml-1 px-2 py-0.5 rounded-full bg-[#fff7ed] text-[#ea580c]"
                      style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
                    >
                      {jindungoPending.length}
                    </span>
                    <p
                      className="text-[#94a3b8] ml-2"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}
                    >
                      — Acesso a conteúdos premium. Aprovação directa.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {jindungoPending.map((req) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Restritos section */}
              {restritoPending.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lock size={15} className="text-[#7c3aed]" />
                    <h2
                      className="text-[#121c2a]"
                      style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "18px" }}
                    >
                      Pedidos Restritos
                    </h2>
                    <span
                      className="ml-1 px-2 py-0.5 rounded-full bg-[#fdf4ff] text-[#7c3aed]"
                      style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
                    >
                      {restritoPending.length}
                    </span>
                    <p
                      className="text-[#94a3b8] ml-2"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}
                    >
                      — Requerem nota de justificação antes da aprovação.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {restritoPending.map((req) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: HISTORIAL
      ══════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
            <div className="flex-1 relative min-w-0">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Pesquisar por nome, categoria ou instituição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#e2e8f0] rounded-lg bg-white focus:outline-none focus:border-[#6b0119] transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
              />
            </div>

            <div className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-lg px-3 py-2">
              <Filter size={12} className="text-[#94a3b8]" />
              <select
                value={filterDecision}
                onChange={(e) => setFilterDecision(e.target.value as typeof filterDecision)}
                className="text-[#475569] bg-transparent border-none outline-none cursor-pointer"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
              >
                <option value="todos">Todas as decisões</option>
                <option value="aprovado">Aprovados</option>
                <option value="rejeitado">Rejeitados</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white border border-[#e2e8f0] rounded-lg px-3 py-2">
              <Filter size={12} className="text-[#94a3b8]" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="text-[#475569] bg-transparent border-none outline-none cursor-pointer"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
              >
                <option value="todos">Todos os tipos</option>
                <option value="jindungo">Jindungo</option>
                <option value="restrito">Restrito</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-lg overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[#f1f5f9]">
                  {["Utilizador", "Tipo", "Categoria", "Data", "Decisão", "Processado por"].map((col) => (
                    <th
                      key={col}
                      className="text-left py-4 px-5 text-[#94a3b8] uppercase tracking-[0.8px]"
                      style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <p
                        className="text-[#94a3b8]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
                      >
                        Nenhum registo encontrado.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <HistoryRow key={item.id} item={item} />
                  ))
                )}
              </tbody>
            </table>

            {/* Table footer */}
            {filteredHistory.length > 0 && (
              <div className="px-5 py-4 border-t border-[#f1f5f9] flex items-center justify-between">
                <p
                  className="text-[#94a3b8]"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}
                >
                  {filteredHistory.length} registo{filteredHistory.length !== 1 ? "s" : ""}
                </p>
                <button
                  className="text-[#475569] hover:text-[#6b0119] transition-colors uppercase tracking-[0.8px]"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "11px" }}
                >
                  Exportar CSV
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
