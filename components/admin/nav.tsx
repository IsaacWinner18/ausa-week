"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, FolderTree, Users, ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";

type NavItem = {
  label: string;
  href: string;
  icon: any;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Participants", href: "/admin/participants", icon: Users },
  { label: "Admins", href: "/admin/admins", icon: ShieldCheck },
];

export function AdminSidebar({ user, className = "" }: { user: any; className?: string }) {
  return (
    <aside className={`flex flex-col h-full bg-sidebar-bg text-sidebar-foreground ${className}`}>
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xs">AU</span>
          </div>
          Admin Panel
        </h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 py-4">
        {navItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition group"
          >
            <item.icon className="w-5 h-5 opacity-70 group-hover:opacity-100 transition" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold shrink-0">
            {user.name?.[0] || user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || "Admin"}</p>
            <p className="text-xs opacity-50 truncate">{user.email}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}

export function MobileNav({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40 px-4 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xs text-white">AU</span>
          </div>
          Admin
        </h2>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="relative h-full">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-[-3rem] p-2 text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
          <AdminSidebar user={user} className="w-full" />
        </div>
      </div>
      
      {/* Spacer for fixed header */}
      <div className="h-16" />
    </div>
  );
}
