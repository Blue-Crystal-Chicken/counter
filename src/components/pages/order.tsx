import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Loader2, CheckCircle2, AlertCircle, Trash2, Plus, Minus, 
  Save, Landmark, Ban, Utensils, ShoppingBag, SquarePlay, ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryEmoji } from "@/constants/category";
import { getImageUrl } from "@/constants/img";
import type { OrderResponse, OrderItemRequest } from "@/types/order.types";
import type { ProductResponse } from "@/types/product.types";
import type { CategoryResponse } from "@/types/category.types";

interface LocalItem {
  id: string; // unique local ID (e.g. product-12, offer-5, menu-3)
  type: "PRODUCT" | "OFFER" | "MENU";
  referenceId: number;
  name: string;
  quantity: number;
  price: number; // unit price
  specialNote: string | null;
  ingredientIds: number[] | null;
}

export function Order() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [localItems, setLocalItems] = useState<LocalItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Product Selection States
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  const token = localStorage.getItem("token");

  // Fetch Order
  const fetchOrder = useCallback(async () => {
    setError("");
    try {
      const targetCode = code && /^\d+$/.test(code) ? code.padStart(3, '0') : code;
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
        throw new Error("Impossibile recuperare l'ordine con questo codice.");
      }
      const data: OrderResponse = await response.json();
      setOrder(data);
      
      // Initialize local items from order items
      const items: LocalItem[] = data.items.map((item, index) => {
        const type = item.offerId ? "OFFER" : "PRODUCT";
        const refId = item.offerId || item.productId;
        return {
          id: `${type.toLowerCase()}-${refId}-${index}`,
          type,
          referenceId: refId!,
          name: item.offerName || item.productName || "Prodotto",
          quantity: item.quantity,
          price: item.price,
          specialNote: item.specialNote,
          ingredientIds: null // backend doesn't output ingredient ids directly in order item response
        };
      });
      setLocalItems(items);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Errore nel caricamento dell'ordine.");
    } finally {
      setLoading(false);
    }
  }, [code, token, API_BASE_URL]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrder();
  }, [token, navigate, fetchOrder]);

  // Fetch Categories and Products for Editing
  useEffect(() => {
    if (!isEditing) return;

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          if (data.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(data[0].id);
          }
        }
      } catch (err: unknown) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, [isEditing, API_BASE_URL, selectedCategoryId]);

  useEffect(() => {
    if (!isEditing || !selectedCategoryId) return;

    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/v1/category/id/${selectedCategoryId}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err: unknown) {
        console.error("Error fetching products:", err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategoryId, isEditing, API_BASE_URL]);

  // Total Calculation
  const localTotal = localItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Handlers
  const handleUpdateQuantity = (id: string, delta: number) => {
    setLocalItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setLocalItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddProduct = (prod: ProductResponse) => {
    // Check if product already exists locally
    const existing = localItems.find(item => item.type === "PRODUCT" && item.referenceId === prod.id);
    if (existing) {
      handleUpdateQuantity(existing.id, 1);
    } else {
      const randomSuffix = localItems.length + 1;
      const newItem: LocalItem = {
        id: `product-${prod.id}-${randomSuffix}`,
        type: "PRODUCT",
        referenceId: prod.id,
        name: prod.name,
        quantity: 1,
        price: prod.price,
        specialNote: null,
        ingredientIds: null
      };
      setLocalItems(prev => [...prev, newItem]);
    }
  };

  const handleSaveChanges = async () => {
    if (!order) return;
    setActionLoading(true);
    setError("");
    setSuccessMsg("");

    const reqItems: OrderItemRequest[] = localItems.map(item => ({
      productId: item.type === "PRODUCT" ? item.referenceId : null,
      offerId: item.type === "OFFER" ? item.referenceId : null,
      menuId: item.type === "MENU" ? item.referenceId : null,
      quantity: item.quantity,
      specialNote: item.specialNote,
      ingredientIds: item.ingredientIds
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          items: reqItems
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate("/login", { state: { error: "Sessione scaduta. Effettua nuovamente l'accesso." } });
          return;
        }
        throw new Error("Errore durante il salvataggio delle modifiche all'ordine.");
      }

      setSuccessMsg("Ordine modificato con successo!");
      setIsEditing(false);
      fetchOrder(); // Reload
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore nel salvataggio.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!order) return;
    setActionLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      // Call status update endpoint to set order status to PREPARING
      const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}/status?status=PREPARING`, {
        method: "PUT",
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
        throw new Error("Errore durante la conferma del pagamento.");
      }

      setSuccessMsg("Pagamento registrato con successo! L'ordine è ora in preparazione.");
      fetchOrder(); // Reload
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore nel pagamento.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm("Sei sicuro di voler annullare questo ordine permanentemente?")) return;

    setActionLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}`, {
        method: "DELETE",
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
        throw new Error("Errore durante l'annullamento dell'ordine.");
      }

      alert("Ordine annullato con successo!");
      navigate("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Errore nell'annullamento dell'ordine.");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-base font-bold text-slate-700 dark:text-slate-300">{error}</p>
        <Button onClick={() => navigate("/home")} className="rounded-xl">
          Torna alla Dashboard
        </Button>
      </div>
    );
  }

  const isPaid = order ? order.status !== "PENDING" : false;

  return (
    <div className="flex-1 flex flex-col gap-6 min-h-0">
      {/* Header and Back navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/home")}
          className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </Button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            Dettagli Ordine #{order?.code}
          </h2>
          <p className="text-xs font-semibold text-slate-400">
            ID Ordine: {order?.orderId} &bull; Creato il: {order && new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-start gap-3 text-green-700 dark:text-green-300 text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
          <p>{successMsg}</p>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-600 dark:text-red-400 text-xs font-bold shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      {/* Already Paid Banner (Requisito Fondamentale) */}
      {isPaid && (
        <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-500/20 text-blue-700 dark:text-blue-300 flex flex-col sm:flex-row items-center gap-4 shadow-sm animate-pulse">
          <CheckCircle2 className="w-10 h-10 text-blue-500 shrink-0" />
          <div className="text-center sm:text-left flex-1">
            <h4 className="text-lg font-extrabold uppercase tracking-wide">
              L'ORDINE È GIÀ STATO PAGATO
            </h4>
            <p className="text-sm font-semibold opacity-85 mt-0.5">
              Questo ordine è registrato con lo stato <span className="font-extrabold underline">{order?.status}</span> e non può subire modifiche o ulteriori pagamenti.
            </p>
          </div>
        </div>
      )}

      {/* Double Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Order Items Summary */}
        <div className={`flex flex-col bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-0 ${
          isEditing ? "lg:col-span-6" : "lg:col-span-12"
        }`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              Articoli Ordinati
            </h3>
            
            {!isPaid && !isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="h-9 px-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-extrabold hover:bg-blue-100"
              >
                Modifica Ordine
              </Button>
            )}
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 min-h-[200px] pr-1">
            {localItems.map((item) => (
              <div 
                key={item.id} 
                className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center justify-between gap-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-lg text-slate-500">
                    {getCategoryEmoji(item.type === "PRODUCT" ? "HAMBURGER" : "DESSERT")}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-855 dark:text-slate-100 text-sm">
                      {item.name}
                    </h4>
                    {item.specialNote && (
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        Nota: {item.specialNote}
                      </p>
                    )}
                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                      € {item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity adjustments for edit mode */}
                  {isEditing ? (
                    <div className="flex items-center bg-white dark:bg-slate-850 rounded-xl p-1 shadow-sm border border-slate-250/50 dark:border-slate-800">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-black text-slate-850 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-500 dark:text-slate-400 text-sm">
                      x{item.quantity}
                    </span>
                  )}

                  <span className="font-black text-slate-800 dark:text-white text-sm min-w-[65px] text-right">
                    € {(item.price * item.quantity).toFixed(2)}
                  </span>

                  {isEditing && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-xl transition-colors"
                      title="Rimuovi articolo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing, service info and Actions */}
          <div className="mt-6 border-t border-slate-100 dark:border-slate-850 pt-4 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4 text-sm font-semibold text-slate-500">
              <div className="flex gap-2">
                <span>Servizio:</span>
                <span className="text-slate-800 dark:text-white font-bold flex items-center gap-1">
                  {order?.serviceType === "DINE_IN" ? (
                    <>
                      <Utensils className="w-4 h-4 text-blue-500" />
                      Tavolo {order?.tableNumber || "Takeaway"}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-cyan-500" />
                      Takeaway
                    </>
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                <span>Pagamento:</span>
                <span className="text-slate-800 dark:text-white font-bold uppercase">
                  {order?.paymentType === "cash" ? "Contanti alla Cassa" : "Carta di Credito"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-850/50 pt-4">
              <span className="text-base font-extrabold text-slate-800 dark:text-white">Totale Ordine</span>
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                € {localTotal.toFixed(2)}
              </span>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-wrap gap-3 pt-2">
              {/* Cancel order button */}
              {!isPaid && (
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                  disabled={actionLoading}
                  className="h-12 px-5 rounded-xl font-bold gap-2 shadow-md shadow-red-500/5 active:scale-[0.98] transition-all hover:scale-[1.02] flex items-center justify-center shrink-0"
                >
                  <Ban className="w-4 h-4" />
                  Annulla Ordine
                </Button>
              )}

              {/* Editing controls */}
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={actionLoading || localItems.length === 0}
                    className="h-12 px-6 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white gap-2 shadow-md shadow-green-500/10 transition-all hover:scale-[1.02] flex items-center justify-center flex-1"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Salva Modifiche
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      fetchOrder(); // Reset localItems
                    }}
                    disabled={actionLoading}
                    className="h-12 px-5 rounded-xl font-bold border-slate-200 dark:border-slate-800 dark:text-slate-300"
                  >
                    Annulla Modifiche
                  </Button>
                </>
              ) : (
                /* Payment button for unpaid orders */
                !isPaid && (
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={actionLoading}
                    className="h-14 px-8 rounded-xl font-black text-lg bg-blue-600 hover:bg-blue-500 text-white gap-3 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] flex-1 flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Landmark className="w-5 h-5" />
                        Registra Pagamento
                      </>
                    )}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Menu List (appears ONLY in Edit Mode) */}
        {isEditing && (
          <div className="lg:col-span-6 flex flex-col bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-0">
            <h3 className="font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <SquarePlay className="w-5 h-5 text-blue-500" />
              Aggiungi Prodotti al Menu
            </h3>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-4 border-b border-slate-100 dark:border-slate-850">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${
                    selectedCategoryId === cat.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/15"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-405 hover:bg-slate-200"
                  }`}
                >
                  {getCategoryEmoji(cat.name)} {cat.name}
                </button>
              ))}
            </div>

            {/* Products grid */}
            <div className="flex-1 overflow-y-auto no-scrollbar min-h-[250px]">
              {productsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleAddProduct(prod)}
                      className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 active:scale-95 group"
                    >
                      {/* Product image/placeholder */}
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200/60 overflow-hidden relative shrink-0">
                        {prod.imgPath ? (
                          <img
                            src={getImageUrl(prod.imgPath)}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">
                            {getCategoryEmoji(prod.category.name)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-white leading-tight truncate group-hover:text-blue-500 transition-colors">
                          {prod.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                          € {prod.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  Nessun prodotto disponibile in questa categoria.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
