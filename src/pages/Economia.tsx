import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { TrendingUp, Euro, Receipt, BarChart3, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EconomiaPage() {
  return (
    <AppLayout>
      <div className="p-3 lg:p-4 max-w-full">
        <PageHeader
          title="Economia Consorziata"
          
          icon={TrendingUp}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Importo Contrattuale"
            value="€ 0,00"
            subtitle="Valore complessivo"
            icon={<Euro className="w-5 h-5 text-accent" />}
          />
          <StatCard
            label="Totale Ricavi"
            value="€ 0,00"
            subtitle="SAL e corrispettivi"
            icon={<ArrowUpRight className="w-5 h-5 text-success" />}
          />
          <StatCard
            label="Totale Costi"
            value="€ 0,00"
            subtitle="Spese sostenute"
            icon={<ArrowDownRight className="w-5 h-5 text-destructive" />}
          />
          <StatCard
            label="Margine"
            value="€ 0,00"
            subtitle="Ricavi - Costi"
            icon={<BarChart3 className="w-5 h-5 text-accent" />}
          />
        </div>

        <Tabs defaultValue="costi" className="animate-fade-in">
          <TabsList className="mb-4">
            <TabsTrigger value="costi" className="gap-1.5">
              <ArrowDownRight className="w-4 h-4" /> Costi
            </TabsTrigger>
            <TabsTrigger value="ricavi" className="gap-1.5">
              <ArrowUpRight className="w-4 h-4" /> Ricavi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="costi">
            <div className="bg-card rounded-lg border border-border p-5 shadow-card">
              <h2 className="font-display font-semibold text-foreground mb-4">Costi</h2>
              <div className="space-y-3">
                {[
                  { label: "Manodopera", value: "€ 0,00" },
                  { label: "Materiali", value: "€ 0,00" },
                  { label: "Noli e trasporti", value: "€ 0,00" },
                  { label: "Subappalti", value: "€ 0,00" },
                  { label: "Spese generali", value: "€ 0,00" },
                  { label: "Oneri sicurezza", value: "€ 0,00" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-card-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-card-foreground">{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 font-semibold">
                  <span className="text-sm text-card-foreground">Totale Costi</span>
                  <span className="text-sm text-destructive">€ 0,00</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ricavi">
            <div className="bg-card rounded-lg border border-border p-5 shadow-card">
              <h2 className="font-display font-semibold text-foreground mb-4">Ricavi</h2>
              <div className="space-y-3">
                {[
                  { label: "SAL n.1", value: "€ 0,00" },
                  { label: "SAL n.2", value: "€ 0,00" },
                  { label: "Varianti", value: "€ 0,00" },
                  { label: "Lavori extra-contratto", value: "€ 0,00" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-card-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-card-foreground">{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 font-semibold">
                  <span className="text-sm text-card-foreground">Totale Ricavi</span>
                  <span className="text-sm text-success">€ 0,00</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
