import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
    if (!TELEGRAM_API_KEY)
      throw new Error("TELEGRAM_API_KEY is not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const {
      chat_id,
      text,
      parse_mode = "HTML",
      type = "notification",
      use_admin_chat = false,
      use_group_chat = false,
    } = body;

    // Resolve chat_id
    let targetChatId = chat_id;

    if (use_admin_chat || use_group_chat) {
      const { data: state } = await supabase
        .from("telegram_bot_state")
        .select("admin_chat_id, group_chat_id")
        .eq("id", 1)
        .single();

      if (state) {
        targetChatId = use_group_chat
          ? state.group_chat_id
          : state.admin_chat_id;
      }
    }

    // Fallback: use latest incoming chat from telegram_messages
    if (!targetChatId) {
      const { data: latestMessage } = await supabase
        .from("telegram_messages")
        .select("chat_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestMessage?.chat_id) {
        targetChatId = String(latestMessage.chat_id);

        // Persist for future tests
        await supabase
          .from("telegram_bot_state")
          .update({ admin_chat_id: targetChatId })
          .eq("id", 1);
      }
    }

    if (!targetChatId || !text) {
      return new Response(
        JSON.stringify({
          error: "chat_id and text are required",
          hint: "Set admin_chat_id/group_chat_id or send a message to your bot and run Poll once.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send via gateway
    const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: targetChatId, text, parse_mode }),
    });

    const data = await response.json();

    // Log the sent message
    await supabase.from("telegram_sent_log").insert({
      chat_id: String(targetChatId),
      message_type: type,
      message_text: text,
      status: response.ok ? "sent" : "failed",
      error: response.ok ? null : JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `Telegram API failed [${response.status}]: ${JSON.stringify(data)}`
      );
    }

    return new Response(
      JSON.stringify({ success: true, message_id: data.result?.message_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("telegram-send error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
