import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Bot, Settings, MessageSquare, Send, Bell, RefreshCw,
  CheckCircle, XCircle, Clock, ArrowUpRight, Trash2
} from "lucide-react";

interface BotState {
  admin_chat_id: string;
  group_chat_id: string;
  bot_username: string;
  notifications_enabled: boolean;
  booking_alerts: boolean;
  order_alerts: boolean;
  daily_summary: boolean;
  auto_reply_enabled: boolean;
  auto_reply_message: string;
}

interface TelegramMessage {
  id: string;
  update_id: number;
  chat_id: number;
  from_username: string;
  from_first_name: string;
  message_text: string;
  message_type: string;
  is_command: boolean;
  replied: boolean;
  reply_text: string;
  created_at: string;
}

interface SentLog {
  id: string;
  chat_id: string;
  message_type: string;
  message_text: string;
  status: string;
  error: string | null;
  created_at: string;
}

export default function AdminTelegram() {
  const [config, setConfig] = useState<BotState | null>(null);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [sentLogs, setSentLogs] = useState<SentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    loadAll();

    // Realtime subscription for incoming messages
    const channel = supabase
      .channel("telegram-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "telegram_messages" }, (payload) => {
        setMessages((prev) => [payload.new as TelegramMessage, ...prev]);
        toast.info(`📩 New Telegram message from ${(payload.new as any).from_first_name || "Unknown"}`);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [configRes, msgsRes, logsRes] = await Promise.all([
      supabase.from("telegram_bot_state").select("*").eq("id", 1).single(),
      supabase.from("telegram_messages").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("telegram_sent_log").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    if (configRes.data) setConfig(configRes.data as unknown as BotState);
    if (msgsRes.data) setMessages(msgsRes.data as unknown as TelegramMessage[]);
    if (logsRes.data) setSentLogs(logsRes.data as unknown as SentLog[]);
    setLoading(false);
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    const { error } = await supabase
      .from("telegram_bot_state")
      .update({
        admin_chat_id: config.admin_chat_id,
        group_chat_id: config.group_chat_id,
        bot_username: config.bot_username,
        notifications_enabled: config.notifications_enabled,
        booking_alerts: config.booking_alerts,
        order_alerts: config.order_alerts,
        daily_summary: config.daily_summary,
        auto_reply_enabled: config.auto_reply_enabled,
        auto_reply_message: config.auto_reply_message,
      })
      .eq("id", 1);

    if (error) toast.error("Failed to save config");
    else toast.success("Telegram config saved!");
    setSaving(false);
  };

  const sendTestMessage = async () => {
    if (!testMessage.trim()) return;
    setSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke("telegram-send", {
        body: { text: testMessage, use_admin_chat: true, type: "test" },
      });
      if (error) throw error;
      toast.success("Test message sent!");
      setTestMessage("");
      loadAll();
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    }
    setSendingTest(false);
  };

  const triggerPoll = async () => {
    setPolling(true);
    try {
      const { error } = await supabase.functions.invoke("telegram-poll");
      if (error) throw error;
      toast.success("Poll triggered! Check messages.");
      loadAll();
    } catch (e: any) {
      toast.error(`Poll failed: ${e.message}`);
    }
    setPolling(false);
  };

  const sendNotifyTest = async (eventType: string) => {
    try {
      let eventData: any = {};
      if (eventType === "new_booking") {
        eventData = { booking_id: "TEST-001", guests: 4, date: new Date().toISOString().split("T")[0], slot: "Morning", total: 5000, status: "confirmed" };
      } else if (eventType === "new_order") {
        eventData = { id: "test-order-id-123", total: 1200, property_id: "test", status: "pending" };
      } else if (eventType === "custom") {
        eventData = { text: "🧪 This is a test notification from Hushh Jeypore Admin!" };
      }

      const { error } = await supabase.functions.invoke("telegram-notify", {
        body: { event_type: eventType, data: eventData },
      });
      if (error) throw error;
      toast.success(`${eventType} notification sent!`);
      loadAll();
    } catch (e: any) {
      toast.error(`Notification failed: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Bot size={22} className="text-blue-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Telegram Bot</h1>
          <p className="text-sm text-muted-foreground">
            Manage your HushhJeyporeBot — notifications, commands & messages
          </p>
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="config" className="gap-1.5">
            <Settings size={14} /> Config
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5">
            <MessageSquare size={14} /> Inbox
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-1.5">
            <Send size={14} /> Sent
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-1.5">
            <Bell size={14} /> Test
          </TabsTrigger>
        </TabsList>

        {/* CONFIG TAB */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bot Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Bot Username</label>
                  <Input
                    value={config?.bot_username || ""}
                    onChange={(e) => setConfig((c) => c ? { ...c, bot_username: e.target.value } : c)}
                    placeholder="@HushhJeyporeBot"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Admin Chat ID</label>
                  <Input
                    value={config?.admin_chat_id || ""}
                    onChange={(e) => setConfig((c) => c ? { ...c, admin_chat_id: e.target.value } : c)}
                    placeholder="Send /mychatid to bot to get this"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Send <code>/mychatid</code> to your bot to get this
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Group Chat ID</label>
                  <Input
                    value={config?.group_chat_id || ""}
                    onChange={(e) => setConfig((c) => c ? { ...c, group_chat_id: e.target.value } : c)}
                    placeholder="Add bot to group, then send /mychatid"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "notifications_enabled" as const, label: "Master Switch", desc: "Enable/disable all Telegram notifications" },
                { key: "booking_alerts" as const, label: "Booking Alerts", desc: "New bookings & cancellations" },
                { key: "order_alerts" as const, label: "Order Alerts", desc: "New orders & status updates" },
                { key: "daily_summary" as const, label: "Daily Summary", desc: "Daily business digest" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={config?.[key] ?? false}
                    onCheckedChange={(v) => setConfig((c) => c ? { ...c, [key]: v } : c)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Auto-Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Enable auto-reply</span>
                <Switch
                  checked={config?.auto_reply_enabled ?? false}
                  onCheckedChange={(v) => setConfig((c) => c ? { ...c, auto_reply_enabled: v } : c)}
                />
              </div>
              <Textarea
                value={config?.auto_reply_message || ""}
                onChange={(e) => setConfig((c) => c ? { ...c, auto_reply_message: e.target.value } : c)}
                placeholder="Auto-reply message..."
                rows={3}
              />
            </CardContent>
          </Card>

          <Button onClick={saveConfig} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </TabsContent>

        {/* INBOX TAB */}
        <TabsContent value="messages" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Incoming Messages ({messages.length})
            </h3>
            <Button size="sm" variant="outline" onClick={triggerPoll} disabled={polling}>
              <RefreshCw size={14} className={polling ? "animate-spin" : ""} />
              {polling ? "Polling..." : "Poll Now"}
            </Button>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No messages yet. Send /start to your bot!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-lg border border-border bg-card space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {msg.from_first_name || "Unknown"}
                      </span>
                      {msg.from_username && (
                        <span className="text-xs text-muted-foreground">@{msg.from_username}</span>
                      )}
                      {msg.is_command && (
                        <Badge variant="secondary" className="text-[10px]">CMD</Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{msg.message_text}</p>
                  {msg.replied && (
                    <div className="pl-3 border-l-2 border-primary/30 mt-1">
                      <p className="text-xs text-muted-foreground">
                        Bot replied: {msg.reply_text?.slice(0, 100)}...
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">
                      Chat: {msg.chat_id}
                    </Badge>
                    {msg.replied ? (
                      <CheckCircle size={12} className="text-green-500" />
                    ) : (
                      <Clock size={12} className="text-amber-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* SENT LOG TAB */}
        <TabsContent value="sent" className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            Sent Messages ({sentLogs.length})
          </h3>

          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {sentLogs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Send size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No messages sent yet</p>
                </div>
              )}
              {sentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border border-border bg-card space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={log.status === "sent" ? "default" : "destructive"}
                        className="text-[10px]"
                      >
                        {log.status === "sent" ? (
                          <><CheckCircle size={10} className="mr-1" /> Sent</>
                        ) : (
                          <><XCircle size={10} className="mr-1" /> Failed</>
                        )}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {log.message_type}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </span>
                  </div>
                  <p className="text-xs text-foreground line-clamp-2">
                    {log.message_text.replace(/<[^>]*>/g, "")}
                  </p>
                  {log.error && (
                    <p className="text-xs text-destructive">{log.error}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* TEST TAB */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Send Test Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Type a test message to send to admin chat..."
                rows={3}
              />
              <Button
                onClick={sendTestMessage}
                disabled={sendingTest || !testMessage.trim()}
                className="w-full"
              >
                <Send size={14} className="mr-2" />
                {sendingTest ? "Sending..." : "Send to Admin Chat"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Test Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Send test notifications to verify each alert type works
              </p>
              {[
                { type: "new_booking", label: "🎫 Test Booking Alert", desc: "Simulates a new booking notification" },
                { type: "new_order", label: "🛒 Test Order Alert", desc: "Simulates a new order notification" },
                { type: "custom", label: "📢 Test Custom Message", desc: "Sends a generic test notification" },
              ].map(({ type, label, desc }) => (
                <Button
                  key={type}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => sendNotifyTest(type)}
                >
                  <div className="text-left">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <ArrowUpRight size={14} />
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bot Commands Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {[
                  { cmd: "/start", desc: "Welcome message + setup info" },
                  { cmd: "/bookings", desc: "Today's bookings summary" },
                  { cmd: "/revenue", desc: "Revenue stats for today" },
                  { cmd: "/availability", desc: "Active property listings" },
                  { cmd: "/menu", desc: "Current menu items & prices" },
                  { cmd: "/status", desc: "System status overview" },
                  { cmd: "/mychatid", desc: "Get your chat ID for config" },
                  { cmd: "/help", desc: "List all commands" },
                ].map(({ cmd, desc }) => (
                  <div key={cmd} className="flex items-center gap-3 p-2 rounded bg-secondary/30">
                    <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {cmd}
                    </code>
                    <span className="text-xs text-muted-foreground">{desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
