const goals = [
  { label: "Digitalização 1970–1975", value: 82, color: "#6f0008" },
  { label: "Indexação de Metadados",  value: 64, color: "#6f0008" },
  { label: "Verificação de Qualidade", value: 55, color: "#22c55e" },
];

export function PreservationGoals() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-lg p-5 md:p-6 lg:p-7 flex flex-col">
      <h3
        className="text-[#121c2a] tracking-[-0.3px] mb-5 md:mb-6"
        style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "18px" }}
      >
        Metas de Preservação
      </h3>

      {/* Progress bars */}
      <div className="flex flex-col gap-5 flex-1">
        {goals.map((goal) => (
          <div key={goal.label}>
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[#475569]"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "12px" }}
              >
                {goal.label}
              </span>
              <span
                className="ml-3"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  color: goal.color,
                }}
              >
                {goal.value}%
              </span>
            </div>
            {/* Track */}
            <div className="h-[6px] bg-[#f1f5f9] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${goal.value}%`, background: goal.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Nível Ouro badge */}
      <div className="mt-6 md:mt-8 flex items-center gap-3 p-3.5 md:p-4 rounded-lg bg-[#fffbeb] border border-[#fde68a]">
        <div className="w-9 h-9 rounded-full bg-[#f59e0b] flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 20 26" fill="none">
            <path
              d="M7.09 14.63L8.19 11.06L5.31 8.75H8.88L10 5.25L11.13 8.75H14.69L11.78 11.06L12.88 14.63L10 12.41L7.09 14.63ZM2.5 26.25V16.59C1.71 15.72 1.09 14.72 0.66 13.59C0.22 12.47 0 11.27 0 10C0 7.21 0.97 4.84 2.91 2.91C4.84 0.97 7.21 0 10 0C12.79 0 15.16 0.97 17.09 2.91C19.03 4.84 20 7.21 20 10C20 11.27 19.78 12.47 19.34 13.59C18.91 14.72 18.29 15.72 17.5 16.59V26.25L10 23.75L2.5 26.25Z"
              fill="#92400e"
            />
          </svg>
        </div>
        <div>
          <p
            className="text-[#92400e]"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "12px" }}
          >
            Nível Ouro
          </p>
          <p
            className="text-[#a16207]"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "10px" }}
          >
            Em desenvolvimento.
          </p>
        </div>
      </div>
    </div>
  );
}
