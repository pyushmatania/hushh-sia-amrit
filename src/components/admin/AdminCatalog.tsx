import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Sparkles, UtensilsCrossed, Wrench, Package } from "lucide-react";
import AdminProperties from "./AdminProperties";
import AdminCurations from "./AdminCurations";
import AdminInventory from "./AdminInventory";

const tabs = [
  { id: "properties", label: "Properties", icon: Building2, description: "Villas, spaces & venues" },
  { id: "curations", label: "Curated Packs", icon: Sparkles, description: "Bundled experiences" },
  { id: "food", label: "Food & Drinks", icon: UtensilsCrossed, description: "Menu & beverages" },
  { id: "addons", label: "Add-ons & Services", icon: Wrench, description: "Extras & equipment" },
] as const;

type TabId = typeof tabs[number]["id"];

export default function AdminCatalog() {
  const [activeTab, setActiveTab] = useState<TabId>("properties");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Package size={18} className="text-primary" />
          </div>
          Catalog Manager
        </h1>
        <p className="text-sm text-muted-foreground mt-1 ml-[46px]">
          Manage all listings, packs, menu items, and services in one place
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        <TabsList className="w-full h-auto flex bg-card border border-border rounded-xl p-1 gap-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex-1 flex items-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition-all data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <tab.icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="properties" className="mt-5">
          <AdminProperties />
        </TabsContent>

        <TabsContent value="curations" className="mt-5">
          <AdminCurations />
        </TabsContent>

        <TabsContent value="food" className="mt-5">
          <AdminInventory filterCategory="food-drinks" />
        </TabsContent>

        <TabsContent value="addons" className="mt-5">
          <AdminInventory filterCategory="addons" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
