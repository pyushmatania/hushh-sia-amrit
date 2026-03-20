import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tools = [
  {
    type: "function",
    function: {
      name: "reorder_item",
      description: "Move an item to a specific position (sort_order) in a table. Use this when the user asks to move an item to the top, bottom, or a specific position in inventory, curations, experience_packages, or host_listings.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", enum: ["inventory", "curations", "experience_packages", "host_listings"], description: "Which table to reorder in" },
          item_name: { type: "string", description: "Name of the item to move (partial match OK)" },
          target_position: { type: "integer", description: "Target sort_order position (0 = top)" },
        },
        required: ["table", "item_name", "target_position"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_item_field",
      description: "Update a field on an item. Use for changing prices, toggling availability, updating stock, renaming items, changing categories, etc.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", enum: ["inventory", "curations", "experience_packages", "host_listings", "campaigns", "coupons"], description: "Which table" },
          item_name: { type: "string", description: "Name of the item to update (partial match)" },
          field: { type: "string", description: "Column name to update (e.g. unit_price, stock, available, base_price, status, active, name, category)" },
          value: { type: "string", description: "New value (will be cast to appropriate type)" },
        },
        required: ["table", "item_name", "field", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_item",
      description: "Delete an item from a table. Use when user asks to remove/delete an item.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", enum: ["inventory", "curations", "experience_packages", "host_listings"], description: "Which table" },
          item_name: { type: "string", description: "Name of the item to delete (partial match)" },
        },
        required: ["table", "item_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_inventory_item",
      description: "Add a new item to the inventory table.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { type: "string", enum: ["food", "drinks", "decor", "activities", "supplies"] },
          emoji: { type: "string" },
          unit_price: { type: "number" },
          stock: { type: "integer" },
        },
        required: ["name", "category", "unit_price"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_data",
      description: "Run a read-only query to get specific data. Use when you need fresh data to answer a question.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", enum: ["inventory", "curations", "experience_packages", "host_listings", "bookings", "orders", "profiles", "campaigns", "coupons"] },
          select: { type: "string", description: "Columns to select (comma-separated, or * for all)" },
          filters: { type: "object", description: "Key-value filters to apply (column: value)" },
          order_by: { type: "string", description: "Column to order by" },
          ascending: { type: "boolean", description: "Sort ascending (true) or descending (false)" },
          limit: { type: "integer", description: "Max rows to return" },
        },
        required: ["table"],
      },
    },
  },
];

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function executeTool(name: string, args: any): Promise<string> {
  const sb = getSupabaseAdmin();

  if (name === "reorder_item") {
    const { table, item_name, target_position } = args;
    // Find the item by name (case-insensitive partial match)
    const { data: items } = await sb.from(table).select("id, name, sort_order").ilike("name", `%${item_name}%`);
    if (!items?.length) return JSON.stringify({ error: `No item matching "${item_name}" found in ${table}` });
    const item = items[0];

    // Get all items ordered by sort_order
    const { data: allItems } = await sb.from(table).select("id, name, sort_order").order("sort_order", { ascending: true });
    if (!allItems) return JSON.stringify({ error: "Failed to fetch items" });

    // Remove the item from its current position and insert at target
    const filtered = allItems.filter(i => i.id !== item.id);
    const pos = Math.max(0, Math.min(target_position, filtered.length));
    filtered.splice(pos, 0, item);

    // Update all sort_orders
    for (let i = 0; i < filtered.length; i++) {
      await sb.from(table).update({ sort_order: i }).eq("id", filtered[i].id);
    }

    return JSON.stringify({ success: true, message: `Moved "${item.name}" to position ${pos + 1} (of ${filtered.length})` });
  }

  if (name === "update_item_field") {
    const { table, item_name, field, value } = args;
    const { data: items } = await sb.from(table).select("id, name").ilike("name", `%${item_name}%`);
    if (!items?.length) return JSON.stringify({ error: `No item matching "${item_name}" found in ${table}` });

    // Cast value to appropriate type
    let castValue: any = value;
    if (value === "true") castValue = true;
    else if (value === "false") castValue = false;
    else if (!isNaN(Number(value)) && value.trim() !== "") castValue = Number(value);

    const { error } = await sb.from(table).update({ [field]: castValue }).eq("id", items[0].id);
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, message: `Updated "${items[0].name}" → ${field} = ${castValue}` });
  }

  if (name === "delete_item") {
    const { table, item_name } = args;
    const { data: items } = await sb.from(table).select("id, name").ilike("name", `%${item_name}%`);
    if (!items?.length) return JSON.stringify({ error: `No item matching "${item_name}" found in ${table}` });
    const { error } = await sb.from(table).delete().eq("id", items[0].id);
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, message: `Deleted "${items[0].name}" from ${table}` });
  }

  if (name === "add_inventory_item") {
    const { name: itemName, category, emoji, unit_price, stock } = args;
    const { data, error } = await sb.from("inventory").insert({
      name: itemName,
      category: category || "food",
      emoji: emoji || "📦",
      unit_price: unit_price || 0,
      stock: stock ?? 100,
    }).select().single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, message: `Added "${itemName}" to inventory`, item: data });
  }

  if (name === "query_data") {
    const { table, select: sel, filters, order_by, ascending, limit } = args;
    let query = sb.from(table).select(sel || "*");
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        query = query.eq(k, v);
      }
    }
    if (order_by) query = query.order(order_by, { ascending: ascending ?? true });
    if (limit) query = query.limit(limit);
    else query = query.limit(50);
    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ data, count: data?.length });
  }

  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Hushh Admin AI Assistant — an intelligent operations companion for the Hushh private experience marketplace.

You have access to the following business context data:
${JSON.stringify(context, null, 2)}

Your capabilities:
- Answer questions about revenue, bookings, users, properties, and trends
- **EXECUTE actions**: reorder items, update prices/stock/availability, add/delete items
- Analyze patterns in booking data, peak times, popular experiences
- Suggest pricing optimizations and marketing strategies

IMPORTANT RULES:
- When the user asks to DO something (move, reorder, update, change, add, delete), USE THE TOOLS to execute it. Don't just describe what to do.
- When reordering to "top", use target_position 0. For "bottom", use a large number like 999.
- After executing a tool, confirm what you did with the result.
- Use query_data tool to get fresh data when the context might be stale.
- Use markdown for structured responses. Include relevant emojis.
- When showing numbers, use Indian Rupee (₹) format.
- Stay focused on Hushh business operations.`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // First AI call (may return tool calls)
    let response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result = await response.json();
    let assistantMsg = result.choices?.[0]?.message;
    let iterations = 0;
    const maxIterations = 5;

    // Tool execution loop
    while (assistantMsg?.tool_calls?.length && iterations < maxIterations) {
      iterations++;
      const toolResults = [];

      for (const tc of assistantMsg.tool_calls) {
        console.log(`Executing tool: ${tc.function.name}`, tc.function.arguments);
        let args;
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          args = tc.function.arguments;
        }
        const toolResult = await executeTool(tc.function.name, args);
        console.log(`Tool result:`, toolResult);
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: toolResult,
        });
      }

      // Continue conversation with tool results
      aiMessages.push(assistantMsg);
      aiMessages.push(...toolResults);

      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: aiMessages,
          tools,
          tool_choice: "auto",
        }),
      });

      if (!response.ok) {
        const t = await response.text();
        console.error("AI follow-up error:", response.status, t);
        break;
      }

      result = await response.json();
      assistantMsg = result.choices?.[0]?.message;
    }

    // Extract actions performed for the frontend
    const actionsPerformed = iterations > 0;
    const finalContent = assistantMsg?.content || "Done!";

    return new Response(JSON.stringify({
      content: finalContent,
      actions_performed: actionsPerformed,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
