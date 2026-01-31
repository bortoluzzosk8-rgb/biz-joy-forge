import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialSummary } from "@/components/financial/FinancialSummary";
import { RevenueList } from "@/components/financial/RevenueList";
import { ExpenseList } from "@/components/financial/ExpenseList";
import { LoanList } from "@/components/financial/LoanList";
import { ExpenseCategoryManager } from "@/components/financial/ExpenseCategoryManager";
import { CreditCardManager } from "@/components/financial/CreditCardManager";
import { ExpenseCategorySummary } from "@/components/financial/ExpenseCategorySummary";

export default function Financial() {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">💰 Financeiro</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7 max-w-4xl">
          <TabsTrigger value="summary">📊 Resumo</TabsTrigger>
          <TabsTrigger value="revenue">📈 Receitas</TabsTrigger>
          <TabsTrigger value="expenses">📉 Despesas</TabsTrigger>
          <TabsTrigger value="loans">🏦 Empréstimos</TabsTrigger>
          <TabsTrigger value="cards">💳 Cartões</TabsTrigger>
          <TabsTrigger value="categories">📂 Categorias</TabsTrigger>
          <TabsTrigger value="category-summary">📊 Por Categoria</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <FinancialSummary />
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <RevenueList />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <ExpenseList />
        </TabsContent>

        <TabsContent value="loans" className="mt-6">
          <LoanList />
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          <CreditCardManager />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <ExpenseCategoryManager />
        </TabsContent>

        <TabsContent value="category-summary" className="mt-6">
          <ExpenseCategorySummary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
