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
      description: "Move an item to a specific position (sort_order) in a table.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", enum: ["inventory", "curations", "experience_packages", "host_listings"] },
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
      description: "Update a field on an item. Use for changing prices, toggling availability, updating stock, renaming, changing categories, status, ratings, etc.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", enum: ["inventory", "curations", "experience_packages", "host_listings", "campaigns", "coupons", "staff_tasks", "bookings"] },
          item_name: { type: "string", description: "Name of the item to update (partial match)" },
          field: { type: "string", description: "Column name to update" },
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
      description: "Delete an item from a table.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", enum: ["inventory", "curations", "experience_packages", "host_listings", "campaigns", "coupons"] },
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
      description: "Run a read-only query to get specific data. Use when you need fresh/detailed data to answer a question. Supports all major tables.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", enum: ["inventory", "curations", "experience_packages", "host_listings", "bookings", "orders", "order_items", "profiles", "campaigns", "coupons", "reviews", "review_responses", "staff_tasks", "notifications", "loyalty_transactions", "wishlists", "referral_codes", "referral_uses", "spin_history", "audit_logs", "identity_verifications"] },
          select: { type: "string", description: "Columns to select (comma-separated, or * for all)" },
          filters: { type: "object", description: "Key-value filters to apply (column: value)" },
          ilike_filters: { type: "object", description: "Key-value ilike filters for partial text matching (column: pattern)" },
          order_by: { type: "string", description: "Column to order by" },
          ascending: { type: "boolean", description: "Sort ascending (true) or descending (false)" },
          limit: { type: "integer", description: "Max rows to return (default 50, max 200)" },
        },
        required: ["table"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "aggregate_query",
      description: "Get counts, sums, averages from tables. Use for analytics questions like 'how many bookings this week', 'total revenue by property', etc.",
      parameters: {
        type: "object",
        properties: {
          table: { type: "string", enum: ["bookings", "orders", "order_items", "reviews", "profiles", "inventory", "loyalty_transactions", "wishlists", "spin_history", "staff_tasks"] },
          operation: { type: "string", enum: ["count", "sum", "avg", "min", "max"], description: "Aggregation operation" },
          column: { type: "string", description: "Column to aggregate (for sum/avg/min/max)" },
          group_by: { type: "string", description: "Column to group results by" },
          filters: { type: "object", description: "Key-value filters" },
          date_from: { type: "string", description: "Filter records created after this date (ISO format)" },
          date_to: { type: "string", description: "Filter records created before this date (ISO format)" },
        },
        required: ["table", "operation"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_campaign",
      description: "Create a new marketing campaign.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          type: { type: "string", enum: ["flash_sale", "seasonal", "loyalty", "referral", "custom"] },
          discount_type: { type: "string", enum: ["percent", "flat"] },
          discount_value: { type: "number" },
          start_date: { type: "string" },
          end_date: { type: "string" },
        },
        required: ["title", "discount_type", "discount_value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_coupon",
      description: "Create a new coupon code.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string" },
          description: { type: "string" },
          discount_type: { type: "string", enum: ["percent", "flat"] },
          discount_value: { type: "number" },
          min_order: { type: "number" },
          max_uses: { type: "integer" },
          expires_at: { type: "string" },
        },
        required: ["code", "discount_type", "discount_value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_staff_task",
      description: "Create a new staff task.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
          due_date: { type: "string" },
          property_id: { type: "string" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_across_tables",
      description: "Search for a term across multiple tables at once. Great for finding a guest, item, property, or booking by name/keyword.",
      parameters: {
        type: "object",
        properties: {
          search_term: { type: "string", description: "Text to search for" },
          tables: { type: "array", items: { type: "string" }, description: "Tables to search in (default: all major tables)" },
        },
        required: ["search_term"],
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

// Name column mapping for different tables
function getNameColumn(table: string): string {
  const map: Record<string, string> = {
    campaigns: "title",
    coupons: "code",
    staff_tasks: "title",
    bookings: "booking_id",
    profiles: "display_name",
    reviews: "content",
  };
  return map[table] || "name";
}

async function executeTool(name: string, args: any): Promise<string> {
  const sb = getSupabaseAdmin();

  if (name === "reorder_item") {
    const { table, item_name, target_position } = args;
    const nameCol = getNameColumn(table);
    const { data: items } = await sb.from(table).select(`id, ${nameCol}, sort_order`).ilike(nameCol, `%${item_name}%`) as any;
    if (!items?.length) return JSON.stringify({ error: `No item matching "${item_name}" found in ${table}` });
    const item = items[0] as any;
    const { data: allItems } = await sb.from(table).select(`id, ${nameCol}, sort_order`).order("sort_order", { ascending: true }) as any;
    if (!allItems) return JSON.stringify({ error: "Failed to fetch items" });
    const filtered = (allItems as any[]).filter((i: any) => i.id !== item.id);
    const pos = Math.max(0, Math.min(target_position, filtered.length));
    filtered.splice(pos, 0, item);
    for (let i = 0; i < filtered.length; i++) {
      await sb.from(table).update({ sort_order: i }).eq("id", (filtered[i] as any).id);
    }
    return JSON.stringify({ success: true, message: `Moved "${(item as any)[nameCol]}" to position ${pos + 1} (of ${filtered.length})` });
  }

  if (name === "update_item_field") {
    const { table, item_name, field, value } = args;
    const nameCol = getNameColumn(table);
    const { data: items } = await sb.from(table).select(`id, ${nameCol}`).ilike(nameCol, `%${item_name}%`) as any;
    if (!items?.length) return JSON.stringify({ error: `No item matching "${item_name}" found in ${table}` });
    let castValue: any = value;
    if (value === "true") castValue = true;
    else if (value === "false") castValue = false;
    else if (!isNaN(Number(value)) && value.trim() !== "") castValue = Number(value);
    const { error } = await sb.from(table).update({ [field]: castValue }).eq("id", (items[0] as any).id);
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, message: `Updated "${(items[0] as any)[nameCol]}" → ${field} = ${castValue}` });
  }

  if (name === "delete_item") {
    const { table, item_name } = args;
    const nameCol = getNameColumn(table);
    const { data: items } = await sb.from(table).select(`id, ${nameCol}`).ilike(nameCol, `%${item_name}%`) as any;
    if (!items?.length) return JSON.stringify({ error: `No item matching "${item_name}" found in ${table}` });
    const { error } = await sb.from(table).delete().eq("id", (items[0] as any).id);
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, message: `Deleted "${(items[0] as any)[nameCol]}" from ${table}` });
  }

  if (name === "add_inventory_item") {
    const { name: itemName, category, emoji, unit_price, stock } = args;
    const { data, error } = await sb.from("inventory").insert({
      name: itemName, category: category || "food", emoji: emoji || "📦",
      unit_price: unit_price || 0, stock: stock ?? 100,
    }).select().single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, message: `Added "${itemName}" to inventory`, item: data });
  }

  if (name === "query_data") {
    const { table, select: sel, filters, ilike_filters, order_by, ascending, limit } = args;
    let query = sb.from(table).select(sel || "*");
    if (filters) { for (const [k, v] of Object.entries(filters)) query = query.eq(k, v); }
    if (ilike_filters) { for (const [k, v] of Object.entries(ilike_filters)) query = query.ilike(k, `%${v}%`); }
    if (order_by) query = query.order(order_by, { ascending: ascending ?? true });
    query = query.limit(Math.min(limit || 50, 200));
    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ data, count: data?.length });
  }

  if (name === "aggregate_query") {
    const { table, operation, column, group_by, filters, date_from, date_to } = args;
    // For aggregation we fetch raw data and compute in JS since Supabase SDK doesn't support SQL aggregates directly
    let query = sb.from(table).select("*");
    if (filters) { for (const [k, v] of Object.entries(filters)) query = query.eq(k, v); }
    if (date_from) query = query.gte("created_at", date_from);
    if (date_to) query = query.lte("created_at", date_to);
    query = query.limit(1000);
    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    if (!data?.length) return JSON.stringify({ result: 0, message: "No matching records" });

    if (group_by) {
      const groups: Record<string, any[]> = {};
      for (const row of data) {
        const key = String((row as any)[group_by] ?? "unknown");
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      }
      const results: Record<string, number> = {};
      for (const [key, rows] of Object.entries(groups)) {
        if (operation === "count") results[key] = rows.length;
        else if (column) {
          const vals = rows.map(r => Number((r as any)[column])).filter(n => !isNaN(n));
          if (operation === "sum") results[key] = vals.reduce((a, b) => a + b, 0);
          else if (operation === "avg") results[key] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
          else if (operation === "min") results[key] = Math.min(...vals);
          else if (operation === "max") results[key] = Math.max(...vals);
        }
      }
      return JSON.stringify({ grouped_results: results, total_records: data.length });
    }

    if (operation === "count") return JSON.stringify({ result: data.length });
    if (column) {
      const vals = data.map(r => Number((r as any)[column])).filter(n => !isNaN(n));
      let result = 0;
      if (operation === "sum") result = vals.reduce((a, b) => a + b, 0);
      else if (operation === "avg") result = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      else if (operation === "min") result = Math.min(...vals);
      else if (operation === "max") result = Math.max(...vals);
      return JSON.stringify({ result, records_analyzed: vals.length });
    }
    return JSON.stringify({ error: "Column required for sum/avg/min/max" });
  }

  if (name === "create_campaign") {
    const { title, description, type, discount_type, discount_value, start_date, end_date } = args;
    const { data, error } = await sb.from("campaigns").insert({
      title, description: description || "", type: type || "custom",
      discount_type, discount_value,
      start_date: start_date || new Date().toISOString().split("T")[0],
      end_date: end_date || null,
    }).select().single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, message: `Created campaign "${title}"`, campaign: data });
  }

  if (name === "create_coupon") {
    const { code, description, discount_type, discount_value, min_order, max_uses, expires_at } = args;
    const { data, error } = await sb.from("coupons").insert({
      code: code.toUpperCase(), description: description || "",
      discount_type, discount_value,
      min_order: min_order || 0, max_uses: max_uses || null,
      expires_at: expires_at || null,
    }).select().single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, message: `Created coupon "${code.toUpperCase()}"`, coupon: data });
  }

  if (name === "create_staff_task") {
    const { title, description, priority, due_date, property_id } = args;
    const { data, error } = await sb.from("staff_tasks").insert({
      title, description: description || "", priority: priority || "medium",
      due_date: due_date || null, property_id: property_id || null,
    }).select().single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, message: `Created task "${title}"`, task: data });
  }

  if (name === "search_across_tables") {
    const { search_term, tables: requestedTables } = args;
    const searchableTables = requestedTables?.length ? requestedTables : ["profiles", "host_listings", "inventory", "curations", "campaigns", "bookings"];
    const results: Record<string, any[]> = {};
    for (const table of searchableTables) {
      const nameCol = getNameColumn(table);
      const { data } = await sb.from(table).select("*").ilike(nameCol, `%${search_term}%`).limit(10);
      if (data?.length) results[table] = data;
    }
    const totalFound = Object.values(results).reduce((s, arr) => s + arr.length, 0);
    return JSON.stringify({ results, total_found: totalFound, tables_searched: searchableTables });
  }

  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are Hushh Admin AI — an intelligent, powerful operations companion for the Hushh private experience marketplace in Jeypore, Odisha, India.

## YOUR DATA CONTEXT (live from database):
${JSON.stringify(context, null, 2)}

## YOUR CAPABILITIES:
1. **Deep Analytics** — Revenue trends, booking patterns, guest behavior, property performance, staff productivity, loyalty/referral metrics
2. **CRUD Operations** — Create, update, delete items across all tables (inventory, curations, campaigns, coupons, tasks, listings)
3. **Cross-Table Analysis** — Correlate bookings with reviews, orders with inventory, guests with loyalty tiers
4. **Aggregations** — Count, sum, avg, min, max with date ranges and grouping
5. **Global Search** — Find anything across all tables by name/keyword
6. **Campaign & Coupon Management** — Create promotions, discount codes
7. **Task Management** — Create and update staff tasks
8. **Inventory Intelligence** — Stock levels, low-stock alerts, pricing optimization

## RULES:
- When asked to DO something (move, reorder, update, change, add, delete, create), USE THE TOOLS immediately. Don't just describe.
- When asked analytical questions, use query_data or aggregate_query tools to get FRESH data — don't rely only on context.
- For "who" / "which" / "top" / "best" / "worst" questions, query the relevant table and analyze.
- When reordering to "top", use target_position 0. For "bottom", use 999.
- After executing a tool, confirm what you did with specifics.
- Use ₹ (Indian Rupee) for all monetary values.
- Use markdown with tables, bullet points, bold for structured responses.
- Include relevant emojis for visual clarity.
- Be proactive: suggest follow-up actions after analysis.
- For date-based questions, the current date is ${new Date().toISOString().split("T")[0]}.
- When data is insufficient, say so clearly and suggest what data would help.`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

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
    const maxIterations = 8; // Allow more tool iterations for complex multi-step analysis

    while (assistantMsg?.tool_calls?.length && iterations < maxIterations) {
      iterations++;
      const toolResults = [];

      for (const tc of assistantMsg.tool_calls) {
        console.log(`Executing tool: ${tc.function.name}`, tc.function.arguments);
        let args;
        try { args = JSON.parse(tc.function.arguments); } catch { args = tc.function.arguments; }
        const toolResult = await executeTool(tc.function.name, args);
        console.log(`Tool result:`, toolResult);
        toolResults.push({ role: "tool", tool_call_id: tc.id, content: toolResult });
      }

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
