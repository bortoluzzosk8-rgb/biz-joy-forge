import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetList } from "./AssetList";
import { AssetCategoryManager } from "./AssetCategoryManager";

export function AssetManager() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">📋 Lista de Patrimônios</TabsTrigger>
          <TabsTrigger value="categories">📂 Subcategorias</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <AssetList />
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <AssetCategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
