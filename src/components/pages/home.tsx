import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, ArrowRight, ClipboardList, CheckCircle2, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderResponse } from "@/types/order.types";

export function Home() {
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchRecentOrders = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Sort by date descending
          const sorted = data.sort((a: OrderResponse, b: OrderResponse) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setOrders(sorted);
          setCurrentPage(1);
        } else if (response.status === 401) {
          localStorage.clear();
          navigate("/login", { state: { error: "Sessione scaduta. Effettua nuovamente l'accesso." } });
        }
      } catch (err) {
        console.error("Error fetching recent orders:", err);
      }
    };

    fetchRecentOrders();
  }, [token, navigate, API_BASE_URL]);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start === 1) {
        end = 5;
      } else if (end === totalPages) {
        start = totalPages - 4;
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchCode.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    const targetCode = /^\d+$/.test(trimmed) ? trimmed.padStart(3, '0') : trimmed;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/code/${targetCode}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate("/login", { state: { error: "Sessione scaduta. Effettua nuovamente l'accesso." } });
          return;
        }
        throw new Error("Ordine non trovato. Verifica il codice inserito.");
      }

      // Order found, redirect to details page
      navigate(`/order/${targetCode}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore nella ricerca dell'ordine.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            Da Pagare
          </span>
        );
      case "PREPARING":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            In Prep. (Pagato)
          </span>
        );
      case "READY":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Pronto (Pagato)
          </span>
        );
      case "DELIVERED":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            Consegnato
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            Annullato
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 min-h-0">
      {/* Search Order Section */}
      <section className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col items-center">
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mb-6 text-center">
          Ricerca Codice Ordine
        </h3>
        
        {error && (
          <div className="max-w-xl w-full p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-300 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSearch} className="max-w-xl w-full flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              required
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full h-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 text-slate-800 dark:text-white text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/5 transition-all"
              placeholder="Inserisci codice (es: 001, 002...)"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Verifica Ordine</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </section>

      {/* Recent Orders List */}
      <section className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex-1 flex flex-col min-h-[300px]">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200 flex items-baseline gap-2">
            Lista Ordini Recenti
            <span className="text-sm font-semibold text-slate-400">({orders.length})</span>
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar border border-slate-100 dark:border-slate-800 rounded-2xl min-h-0 bg-slate-50/50 dark:bg-slate-950/20">
          {orders.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/order/${order.code}`)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-base border border-slate-200/50 dark:border-slate-700/50">
                      #{order.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">
                          Ordine {order.orderId}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })} &bull; {order.serviceType} &bull; {order.paymentType === "cash" ? "Contanti" : "Carta"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    {getStatusBadge(order.status)}
                    <span className="font-black text-slate-800 dark:text-white text-base min-w-[70px] text-right">
                      € {order.totalAt.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
              <ClipboardList className="w-12 h-12 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold">Nessun ordine presente nel sistema.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 border-t border-slate-100 dark:border-slate-800/60 pt-4">
            <p className="text-xs font-semibold text-slate-400">
              Mostrati da {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, orders.length)} di {orders.length} ordini
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-bold gap-1"
              >
                <ChevronLeft className="w-4 h-4 text-slate-650 dark:text-slate-350" />
                <span>Precedente</span>
              </Button>
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/15"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 text-xs font-bold gap-1"
              >
                <span>Successiva</span>
                <ChevronRight className="w-4 h-4 text-slate-650 dark:text-slate-350" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
