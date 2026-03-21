import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface OrderNote {
  id: string;
  order_id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

interface OrderNotesProps {
  orderId: string;
  authorName?: string;
  authorRole?: "staff" | "guest" | "admin";
}

const roleConfig: Record<string, { color: string; bg: string; label: string }> = {
  staff: { color: "text-blue-600", bg: "bg-blue-500/10", label: "Kitchen" },
  guest: { color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Guest" },
  admin: { color: "text-primary", bg: "bg-primary/10", label: "Admin" },
};

export default function OrderNotes({ orderId, authorName = "Staff", authorRole = "staff" }: OrderNotesProps) {
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [sending, setSending] = useState(false);

  const loadNotes = async () => {
    const { data } = await supabase
      .from("order_notes")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    setNotes((data as OrderNote[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
    const ch = supabase
      .channel(`order-notes-${orderId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "order_notes", filter: `order_id=eq.${orderId}` }, () => loadNotes())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [orderId]);

  const sendNote = async () => {
    if (!newNote.trim() || sending) return;
    setSending(true);
    await supabase.from("order_notes").insert({
      order_id: orderId,
      author_name: authorName,
      author_role: authorRole,
      content: newNote.trim(),
    } as any);
    setNewNote("");
    setSending(false);
  };

  const timeAgo = (ts: string) => {
    const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return hrs < 24 ? `${hrs}h` : `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare size={14} className="text-primary" />
        <span className="text-xs font-semibold text-foreground">Kitchen Notes</span>
        {notes.length > 0 && (
          <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{notes.length}</span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-muted-foreground" size={16} /></div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notes.length === 0 && (
            <p className="text-[11px] text-muted-foreground text-center py-3">No notes yet — add one below</p>
          )}
          <AnimatePresence initial={false}>
            {notes.map(note => {
              const rc = roleConfig[note.author_role] || roleConfig.staff;
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className={`text-[8px] font-bold ${rc.bg} ${rc.color}`}>
                        {note.author_name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] font-semibold text-foreground">{note.author_name}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${rc.bg} ${rc.color}`}>{rc.label}</span>
                    <span className="text-[9px] text-muted-foreground ml-auto">{timeAgo(note.created_at)}</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{note.content}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendNote()}
          placeholder="Add a note for kitchen…"
          className="flex-1 text-sm rounded-xl border border-border bg-background px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={sendNote}
          disabled={!newNote.trim() || sending}
          className="px-3 py-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </motion.button>
      </div>
    </div>
  );
}
