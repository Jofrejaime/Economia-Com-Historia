interface FeaturedItem {
  title: string;
  date: string;
  status: "visível" | "arquivado" | "rascunho";
  thumbnail: string;
}

const items: FeaturedItem[] = [
  {
    title: "O Impacto do Plano Marshall",
    date: "Publicado em: 12 Mar 2025",
    status: "visível",
    thumbnail: "https://images.unsplash.com/photo-1728917330549-95adf1ba1fb8?w=80&h=80&fit=crop",
  },
  {
    title: "Comércio Colonial Português",
    date: "Publicado em: 05 Abr 2025",
    status: "arquivado",
    thumbnail: "https://images.unsplash.com/photo-1717700299673-303a66dcd9d3?w=80&h=80&fit=crop",
  },
  {
    title: "Evolução da Moeda Escudo",
    date: "Publicado em: 20 Mai 2025",
    status: "visível",
    thumbnail: "https://images.unsplash.com/photo-1769791367981-8ca8e0d400a8?w=80&h=80&fit=crop",
  },
];

const statusConfig = {
  visível:   { bg: "#f0fdf4", text: "#15803d", label: "VISÍVEL" },
  arquivado: { bg: "#f1f5f9", text: "#64748b", label: "ARQUIVADO" },
  rascunho:  { bg: "#fef9c3", text: "#a16207", label: "RASCUNHO" },
};

export function FeaturedItems() {
  return (
    <div className="bg-white rounded-xl shadow-[0px_1px_3px_rgba(27,28,27,0.06)] p-7 col-span-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <h3
          className="text-[#1b1c1b] tracking-[-0.3px] leading-tight"
          style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "20px" }}
        >
          Destaques<br />no Portal
        </h3>
        <button
          className="text-[#6f0008] text-center"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "11px" }}
        >
          Ver todos
        </button>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-4">
        {items.map((item, i) => {
          const cfg = statusConfig[item.status];
          return (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-md overflow-hidden shrink-0 bg-[#f5f3f1]">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[#1b1c1b] truncate"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "13px" }}
                >
                  {item.title}
                </p>
                <p
                  className="text-[#78716c] mt-0.5"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}
                >
                  {item.date}
                </p>
                <span
                  className="inline-block mt-1.5 px-1.5 py-0.5 rounded uppercase"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "9px",
                    background: cfg.bg,
                    color: cfg.text,
                    letterSpacing: "0.5px",
                  }}
                >
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add button */}
      <button
        className="mt-6 w-full border border-dashed border-[rgba(224,191,187,0.6)] rounded-lg py-3 text-center text-[#a8a29e] hover:border-[#6f0008] hover:text-[#6f0008] transition-colors"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "11px" }}
      >
        + Gerir Carrossel Principal
      </button>
    </div>
  );
}
