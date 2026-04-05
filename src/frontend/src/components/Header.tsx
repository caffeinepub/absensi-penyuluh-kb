import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, ChevronDown, Menu } from "lucide-react";
import type { Employee } from "../types";

interface HeaderProps {
  pageTitle: string;
  user: Employee;
  onMenuClick?: () => void;
}

function getInitials(nama: string): string {
  return nama
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default function Header({ pageTitle, user, onMenuClick }: HeaderProps) {
  return (
    <header
      className="no-print flex items-center justify-between px-4 py-3 flex-shrink-0 border-b"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        borderColor: "#B8C8D8",
      }}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Hamburger button - mobile only */}
        <button
          type="button"
          data-ocid="header.menu.button"
          className="md:hidden flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={onMenuClick}
          aria-label="Buka menu"
        >
          <Menu size={20} className="text-gray-600" />
        </button>

        <h1 className="text-sm font-semibold text-gray-700 truncate">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <button
          type="button"
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell size={18} className="text-gray-500" />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: "#D84A4A" }}
          />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar className="w-8 h-8">
            <AvatarFallback
              className="text-white text-xs font-bold"
              style={{ background: "#2F6FB0" }}
            >
              {getInitials(user.nama)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-gray-700 leading-tight">
              {user.nama}
            </div>
            <Badge
              className="text-[10px] px-1.5 py-0 h-4 mt-0.5"
              style={{
                background: user.role === "admin" ? "#D84A4A" : "#2F6FB0",
                color: "white",
                border: "none",
              }}
            >
              {user.role === "admin" ? "Admin" : "Pegawai"}
            </Badge>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden md:block" />
        </div>
      </div>
    </header>
  );
}
