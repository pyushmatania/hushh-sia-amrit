import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CreditCard, Wallet, Receipt, Check, ChevronRight, Shield, Trash2, Star, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SectionHeader } from "./SettingRow";

export default function PaymentSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"methods" | "history">("methods");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const savedCards = [
    { id: "1", type: "visa", last4: "4242", expiry: "12/27", isDefault: true, bank: "HDFC Bank" },
    { id: "2", type: "mastercard", last4: "8888", expiry: "03/26", isDefault: false, bank: "ICICI Bank" },
    { id: "3", type: "rupay", last4: "1234", expiry: "09/28", isDefault: false, bank: "SBI" },
  ];

  const savedUPI = [
    { id: "u1", vpa: "user@paytm", isDefault: true, app: "Paytm" },
    { id: "u2", vpa: "user@ybl", isDefault: false, app: "PhonePe" },
  ];

  const transactions = [
    { id: "t1", label: "Bonfire Night Booking", amount: 3500, date: "Dec 15, 2025", status: "completed" as const, type: "debit" as const, property: "Sunset Villa" },
    { id: "t2", label: "Tribal Thali Experience", amount: 1200, date: "Dec 10, 2025", status: "completed" as const, type: "debit" as const, property: "Koraput Café" },
    { id: "t3", label: "Refund — Rain cancellation", amount: 2000, date: "Dec 5, 2025", status: "refunded" as const, type: "credit" as const, property: "Rooftop Lounge" },
    { id: "t4", label: "Movie Night Package", amount: 800, date: "Nov 28, 2025", status: "completed" as const, type: "debit" as const, property: "Cinema Pod" },
    { id: "t5", label: "Loyalty Points Redemption", amount: 500, date: "Nov 20, 2025", status: "completed" as const, type: "credit" as const, property: "—" },
    { id: "t6", label: "Farmhouse Dinner", amount: 4500, date: "Nov 15, 2025", status: "completed" as const, type: "debit" as const, property: "Green Farm" },
  ];

  const cardGradients: Record<string, string> = {
    visa: "linear-gradient(135deg, hsl(220 90% 55%), hsl(250 80% 60%))",
    mastercard: "linear-gradient(135deg, hsl(0 85% 55%), hsl(35 90% 55%))",
    rupay: "linear-gradient(135deg, hsl(200 80% 50%), hsl(170 70% 45%))",
  };

  const tabs = [
    { id: "methods" as const, label: "Payment Methods" },
    { id: "history" as const, label: "Transaction History" },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border/60">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "methods" ? (
          <motion.div key="methods" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <SectionHeader title="Cards" />
            <div className="space-y-3">
              {savedCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
                  className="rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ border: "1px solid hsl(var(--border))" }}
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-12 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: cardGradients[card.type] }}>
                      <span className="text-white uppercase text-[10px] font-extrabold">{card.type.slice(0, 4)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">•••• •••• •••• {card.last4}</p>
                        {card.isDefault && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">DEFAULT</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{card.bank} · Exp {card.expiry}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>

                  <AnimatePresence>
                    {selectedCard === card.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="flex gap-2 p-3">
                          {!card.isDefault && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toast({ title: "Set as default ✅" }); }}
                              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary"
                            >
                              <Star size={12} className="inline mr-1" /> Set Default
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); toast({ title: "Card removed" }); }}
                            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive"
                          >
                            <Trash2 size={12} className="inline mr-1" /> Remove
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <SectionHeader title="UPI Accounts" />
            <div className="space-y-2">
              {savedUPI.map((upi, i) => (
                <motion.div
                  key={upi.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl"
                  style={{ border: "1px solid hsl(var(--border))" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(150 70% 45%), hsl(180 60% 40%))" }}>
                    <Wallet size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{upi.vpa}</p>
                    <p className="text-xs text-muted-foreground">{upi.app}</p>
                  </div>
                  {upi.isDefault && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">DEFAULT</span>}
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toast({ title: "Coming soon", description: "Payment method management will be available with Razorpay integration" })}
              className="w-full mt-4 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-primary"
              style={{ border: "1px dashed hsl(var(--primary) / 0.3)", background: "hsl(var(--primary) / 0.04)" }}
            >
              <Plus size={16} /> Add payment method
            </motion.button>

            {/* Security note */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="rounded-xl p-3 mt-4 flex items-start gap-2"
              style={{ background: "hsl(var(--muted) / 0.5)", border: "1px solid hsl(var(--border))" }}
            >
              <Shield size={14} className="text-primary mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Your payment information is encrypted and stored securely. We never share your financial data with third parties.
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Summary card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 mb-4"
              style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.04))", border: "1px solid hsl(var(--primary) / 0.15)" }}
            >
              <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">₹10,500</p>
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-muted-foreground">6 transactions</span>
                <span className="text-xs text-green-500">₹2,500 refunded</span>
              </div>
            </motion.div>

            <div className="space-y-1">
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 py-3.5 border-b border-border last:border-0"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === "credit" ? "bg-green-500/10" : "bg-muted"}`}>
                    {tx.type === "credit" ? <ArrowDownLeft size={16} className="text-green-500" /> : <ArrowUpRight size={16} className="text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tx.label}</p>
                    <p className="text-[11px] text-muted-foreground">{tx.date} · {tx.property}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${tx.type === "credit" ? "text-green-500" : "text-foreground"}`}>
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                    </p>
                    <p className={`text-[10px] font-medium ${tx.status === "refunded" ? "text-green-500" : "text-muted-foreground"}`}>
                      {tx.status === "refunded" ? "Refunded" : "Paid"}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toast({ title: "Downloading statement..." })}
              className="w-full mt-4 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-primary"
              style={{ border: "1px solid hsl(var(--primary) / 0.2)", background: "hsl(var(--primary) / 0.04)" }}
            >
              <Receipt size={14} /> Download Statement (PDF)
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
