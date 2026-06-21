import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Store, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const userName = localStorage.getItem("userName") || "Cassiere";
  const userSurname = localStorage.getItem("userSurname") || "";
  const locationName = localStorage.getItem("locationName") || "Punto Vendita";
  const locationCity = localStorage.getItem("locationCity") || "";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Logo brand styling */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
            C
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight text-blue-600 dark:text-blue-400">
              Blue Crystal
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Cassa Cashier
            </p>
          </div>
        </div>

        {/* Center/Info Panel */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200/50 dark:border-slate-700/50">
            <Store className="w-4 h-4 text-blue-500" />
            <span>{locationName} {locationCity && `(${locationCity})`}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200/50 dark:border-slate-700/50">
            <User className="w-4 h-4 text-cyan-500" />
            <span>{userName} {userSurname}</span>
          </div>
        </div>

        {/* Actions Panel */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850"
            title="Cambia tema"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </Button>

          {/* Logout Button */}
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="h-10 px-4 rounded-xl gap-2 font-bold shadow-md shadow-red-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Esci</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col min-h-0">
        {children}
      </main>
    </div>
  );
}
