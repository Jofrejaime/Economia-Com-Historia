import { Outlet, useLocation, useNavigate } from "react-router";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const routeIdMap: Record<string, string> = {
  "/": "overview",
  "/requests": "requests",
  "/users": "users",
  "/categories": "categories",
  "/contents": "contents",
  "/community": "community",
  "/settings": "settings",
};

const idRouteMap: Record<string, string> = {
  overview: "/",
  requests: "/requests",
  users: "/users",
  categories: "/categories",
  contents: "/contents",
  community: "/community",
  settings: "/settings",
};

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeItem = routeIdMap[location.pathname] || "overview";

  const handleItemClick = (id: string) => {
    const route = idRouteMap[id];
    if (route) {
      navigate(route);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#f1f5f9] px-4 py-3 flex items-center justify-between">
        <p
          className="text-[#6f0008] tracking-[-0.5px] leading-[1.15] uppercase"
          style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "18px" }}
        >
          ECONOMIA<br />COM HISTÓRIA
        </p>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-[#475569] p-2"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-[73px] left-0 bottom-0 w-[280px] bg-white z-20 transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-[2px]">
          {Object.entries(idRouteMap).map(([id, route]) => {
            const isActive = activeItem === id;
            const label = id === "overview" ? "Visão Geral" :
                         id === "requests" ? "Pedidos de Acesso" :
                         id === "users" ? "Utilizadores" :
                         id === "categories" ? "Categorias" :
                         id === "contents" ? "Conteúdos" :
                         id === "community" ? "Comunidade" : "Configurações";
            return (
              <button
                key={id}
                onClick={() => handleItemClick(id)}
                className={`w-full text-left px-4 py-3 rounded-[4px] transition-all ${
                  isActive
                    ? "bg-[#6b0119] text-white"
                    : "text-[#475569] hover:bg-[#f8fafc]"
                }`}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "14px",
                }}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 overflow-auto md:mt-0 mt-[73px]">
        <Outlet />
      </main>
    </div>
  );
}
