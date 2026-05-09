"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string>("user");
  const [userName, setUserName] = useState<string>("Usuario");
  const [userEmail, setUserEmail] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Obtenemos datos simulados de la sesión local
    const email = localStorage.getItem("ergoai_user_email") || "";
    const savedRole = localStorage.getItem("ergoai_user_role") || "user";
    
    setUserEmail(email);
    setRole(savedRole);
    if(email) setUserName(email.split('@')[0]);

    // Polling a la base de datos para detectar cambios de rol en vivo
    const fetchRole = async () => {
      try {
        const res = await fetch(`/api/auth/role?email=${email}`);
        if (res.ok) {
          const data = await res.json();
          if (data.role && data.role !== role) {
            setRole(data.role);
            localStorage.setItem("ergoai_user_role", data.role);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    if (email) {
      const interval = setInterval(fetchRole, 5000);
      return () => clearInterval(interval);
    }
  }, [role]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem("ergoai_user_email");
    localStorage.removeItem("ergoai_user_role");
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar - Deep Blue Medical Theme */}
      <aside className="w-64 bg-[#0B1B3D] text-white border-r border-slate-800 flex flex-col shadow-2xl z-10">
        <div className="h-20 flex items-center px-6 border-b border-[#1C305C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
              E
            </div>
            <span className="font-bold text-lg tracking-tight">ErgoAI</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          <div className="text-xs font-semibold text-blue-300/50 uppercase tracking-wider mb-4 px-3">Menú Principal</div>
          
          {/* Vista de Usuario Normal */}
          {(role === "user" || role === "admin" || role === "specialist") && (
            <>
              <Link href="/dashboard" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-[#1C305C] transition-colors group">
                <svg className="w-5 h-5 mr-3 text-blue-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Cockpit Preventivo
              </Link>
            </>
          )}

          {/* Vista de Especialista */}
          {(role === "specialist" || role === "admin") && (
            <>
              <div className="text-xs font-semibold text-blue-300/50 uppercase tracking-wider mt-8 mb-4 px-3">Médico / Especialista</div>
              <Link href="/dashboard/reports" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-[#1C305C] transition-colors group">
                <svg className="w-5 h-5 mr-3 text-blue-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Hub Organizacional
              </Link>
            </>
          )}

          {/* Vista de Administrador */}
          {role === "admin" && (
            <>
              <div className="text-xs font-semibold text-blue-300/50 uppercase tracking-wider mt-8 mb-4 px-3">IT / Sistemas</div>
              <Link href="/dashboard/admin" className="flex items-center px-3 py-2.5 rounded-lg hover:bg-[#1C305C] transition-colors group">
                <svg className="w-5 h-5 mr-3 text-blue-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Gestión de Plataforma
              </Link>
            </>
          )}
        </nav>
        
        <div className="p-4 bg-[#08132B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1C305C] border border-[#2A4480] flex items-center justify-center shadow-inner">
              <span className="text-sm font-medium text-blue-200">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-white capitalize">{userName}</p>
              <p className="text-xs text-blue-300/70 truncate">{userEmail}</p>
            </div>
          </div>
          <div className="mt-3 flex justify-between items-center bg-[#0B1B3D] p-2 rounded border border-[#1C305C]">
            <span className="text-xs text-blue-300/70">Rol:</span>
            <span className="text-xs font-bold text-emerald-400 uppercase">{role}</span>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="w-full mt-3 text-xs h-8 text-blue-300/70 hover:text-white hover:bg-[#1C305C]">
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
        <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-slate-200 shadow-sm z-0">
          <h2 className="text-xl font-semibold text-[#0B1B3D]">ErgoAI Workspace</h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              Sistema Protegido JWT
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
