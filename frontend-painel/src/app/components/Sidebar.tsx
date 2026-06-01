import { useState } from "react";
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  FolderOpen,
  BookOpen,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Visão Geral",       id: "overview",   badge: null },
  { icon: ShieldAlert,     label: "Pedidos de Acesso", id: "requests",   badge: 12   },
  { icon: Users,           label: "Utilizadores",      id: "users",      badge: null },
  { icon: FolderOpen,      label: "Categorias",        id: "categories", badge: null },
  { icon: BookOpen,        label: "Conteúdos",         id: "contents",   badge: null },
  { icon: MessageSquare,   label: "Comunidade",        id: "community",  badge: null },
  { icon: Settings,        label: "Configurações",     id: "settings",   badge: null },
];

interface SidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
}

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-white flex flex-col h-screen sticky top-0 border-r border-[#f1f5f9] transition-all duration-300 z-20 shrink-0 ${
        collapsed ? "w-[72px]" : "w-[288px]"
      } max-md:hidden`}
    >
      {/* Logo */}
      <div className="px-8 pt-10 pb-8 flex items-start justify-between gap-2">
        {!collapsed && (
          <div>
            <p
              className="text-[#6f0008] tracking-[-0.5px] leading-[1.15] uppercase"
              style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "22px" }}
            >
              ECONOMIA<br />COM HISTÓRIA
            </p>
            <p
              className="text-[#94a3b8] uppercase tracking-[2px] mt-2"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "9px" }}
            >
              PAINEL DE GESTÃO
            </p>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-[#6f0008] rounded-lg flex items-center justify-center">
            <span
              className="text-white"
              style={{ fontFamily: "Newsreader, serif", fontWeight: 700, fontSize: "14px" }}
            >
              E
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#94a3b8] hover:text-[#6f0008] transition-colors p-1 rounded ml-auto shrink-0 mt-0.5"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-[2px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-[4px] transition-all duration-150 text-left ${
                isActive
                  ? "bg-[#6b0119] text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
                  : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#6f0008]"
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && (
                <span
                  className="flex-1"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "14px",
                  }}
                >
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge !== null && (
                <span
                  className="bg-[#6b0119] text-white rounded-[12px] px-2 py-0.5 leading-none"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "10px",
                    background: isActive ? "rgba(255,255,255,0.25)" : "#6b0119",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-6 pb-6">
        <div
          className={`flex items-center gap-3 bg-[#eff4ff] rounded-lg p-4 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-10 h-10 bg-[#6b0119] rounded-[12px] flex items-center justify-center shrink-0">
            <span
              className="text-white"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "11px" }}
            >
              MC
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p
                className="text-[#121c2a] truncate"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "12px" }}
              >
                Dr. Manuel Costa
              </p>
              <p
                className="text-[#64748b]"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "10px" }}
              >
                Curador Chefe
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
