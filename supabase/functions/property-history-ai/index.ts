import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, context, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompts: Record<string, string> = {
      property: `You are an intelligent property analytics assistant for Hushh, a hospitality platform.
You have access to property booking and ordering data. Answer questions concisely based on the data provided.
When answering: Use specific numbers and dates. Mention guest names when relevant. Include revenue figures with ₹ symbol. Format dates in Indian format (DD Mon YYYY). Be concise but thorough. If the data doesn't contain the answer, say so clearly.`,

      clients: `You are a powerful CRM analytics assistant for Hushh, a hospitality platform in Jeypore, Odisha.
You have detailed client data including booking history, food orders, reviews, loyalty tiers, spending patterns, and verification status.
Answer questions about client behavior, spending analysis, loyalty & engagement, booking patterns, food preferences, retention & churn, and comparisons.
Format: Use specific names/numbers, ₹ for revenue, dates in DD Mon YYYY, bullet points for lists. Be concise but data-rich.`,

      general: `You are the AI command center for Hushh, a hospitality platform managing properties, bookings, food orders, staff, and guests in Jeypore, Odisha.
You have access to ALL operational data: properties, clients, orders, bookings, staff, reviews, inventory, campaigns.
Answer complex cross-domain questions. Give actionable insights. Format with rich detail, numbers, ₹ for money, bullet points. Suggest next steps when appropriate.`,
    };

    const systemPrompt = (systemPrompts[mode || "property"] || systemPrompts.general) +
      `\n\nThe current date is ${new Date().toISOString().split("T")[0]}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the data:\n${context}\n\nQuestion: ${query}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "No response generated.";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("property-history-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
