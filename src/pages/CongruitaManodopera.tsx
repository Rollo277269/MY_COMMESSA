import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { useCommessa } from "@/contexts/CommessaContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { HardHat, AlertTriangle, CheckCircle2, Calculator, ExternalLink, Info, Euro, Percent, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Soglie minime di incidenza manodopera per categoria (DM 143/2021)
const SOGLIE_CONGRUITA: Record<string, { label: string; percentuale: number }> = {
  OG1: { label: "OG1 – Edifici civili e industriali", percentuale: 14.28 },
  OG2: { label: "OG2 – Restauro e manutenzione beni tutelati", percentuale: 14.28 },
  OG3: { label: "OG3 – Strade, autostrade, ponti", percentuale: 14.28 },
  OG4: { label: "OG4 – Opere d'arte nel sottosuolo", percentuale: 10.82 },
  OG5: { label: "OG5 – Dighe", percentuale: 10.82 },
  OG6: { label: "OG6 – Acquedotti, fognature, depurazione", percentuale: 14.28 },
  OG7: { label: "OG7 – Opere marittime e lavori di dragaggio", percentuale: 10.82 },
  OG8: { label: "OG8 – Opere fluviali, difesa ambientale", percentuale: 14.28 },
  OG9: { label: "OG9 – Impianti per la produzione di energia", percentuale: 10.82 },
  OG10: { label: "OG10 – Impianti per telecomunicazioni", percentuale: 7.48 },
  OG11: { label: "OG11 – Impianti tecnologici", percentuale: 10.82 },
  OG12: { label: "OG12 – Opere e impianti di bonifica", percentuale: 14.28 },
  OG13: { label: "OG13 – Opere di ingegneria naturalistica", percentuale: 14.28 },
  OS1: { label: "OS1 – Lavori in terra", percentuale: 14.28 },
  OS2A: { label: "OS2-A – Superfici decorate", percentuale: 14.28 },
  OS2B: { label: "OS2-B – Beni culturali mobili", percentuale: 14.28 },
  OS3: { label: "OS3 – Impianti idrico-sanitario", percentuale: 10.82 },
  OS4: { label: "OS4 – Impianti elettromeccanici trasportatori", percentuale: 10.82 },
  OS5: { label: "OS5 – Impianti pneumatici e antintrusione", percentuale: 10.82 },
  OS6: { label: "OS6 – Finiture di opere generali", percentuale: 14.28 },
  OS7: { label: "OS7 – Finiture di opere generali in materiali", percentuale: 14.28 },
  OS8: { label: "OS8 – Opere di impermeabilizzazione", percentuale: 14.28 },
  OS9: { label: "OS9 – Impianti per la segnaletica", percentuale: 7.48 },
  OS10: { label: "OS10 – Segnaletica stradale non luminosa", percentuale: 7.48 },
  OS11: { label: "OS11 – Apparecchiature strutturali speciali", percentuale: 7.48 },
  OS12A: { label: "OS12-A – Barriere stradali di sicurezza", percentuale: 10.82 },
  OS12B: { label: "OS12-B – Barriere paramassi e simili", percentuale: 10.82 },
  OS13: { label: "OS13 – Strutture prefabbricate in c.a.", percentuale: 10.82 },
  OS14: { label: "OS14 – Impianti di smaltimento rifiuti", percentuale: 10.82 },
  OS15: { label: "OS15 – Pulizia di acque marine e lacustri", percentuale: 10.82 },
  OS16: { label: "OS16 – Impianti per centrali di produzione", percentuale: 7.48 },
  OS17: { label: "OS17 – Linee telefoniche e fibre ottiche", percentuale: 7.48 },
  OS18A: { label: "OS18-A – Componenti strutturali in acciaio", percentuale: 10.82 },
  OS18B: { label: "OS18-B – Componenti per facciate continue", percentuale: 10.82 },
  OS19: { label: "OS19 – Impianti di reti di telecomunicazione", percentuale: 7.48 },
  OS20A: { label: "OS20-A – Rilevamenti topografici", percentuale: 14.28 },
  OS20B: { label: "OS20-B – Indagini geognostiche", percentuale: 14.28 },
  OS21: { label: "OS21 – Opere strutturali speciali", percentuale: 14.28 },
  OS22: { label: "OS22 – Impianti di potabilizzazione", percentuale: 10.82 },
  OS23: { label: "OS23 – Demolizione di opere", percentuale: 14.28 },
  OS24: { label: "OS24 – Verde e arredo urbano", percentuale: 14.28 },
  OS25: { label: "OS25 – Scavi archeologici", percentuale: 14.28 },
  OS26: { label: "OS26 – Pavimentazioni e sovrastrutture speciali", percentuale: 14.28 },
  OS27: { label: "OS27 – Impianti per la trazione elettrica", percentuale: 7.48 },
  OS28: { label: "OS28 – Impianti termici e di condizionamento", percentuale: 10.82 },
  OS29: { label: "OS29 – Armamento ferroviario", percentuale: 10.82 },
  OS30: { label: "OS30 – Impianti interni elettrici", percentuale: 10.82 },
  OS31: { label: "OS31 – Impianti per la mobilità sospesa", percentuale: 10.82 },
  OS32: { label: "OS32 – Strutture in legno", percentuale: 14.28 },
  OS33: { label: "OS33 – Coperture speciali", percentuale: 14.28 },
  OS34: { label: "OS34 – Sistemi antirumore per infrastrutture", percentuale: 10.82 },
  OS35: { label: "OS35 – Interventi a basso impatto ambientale", percentuale: 14.28 },
};

function parseEuro(val: string | null | undefined): number {
  if (!val) return 0;
  const n = parseFloat(val.replace(/[^\d.,-]/g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

function formatEuro(n: number): string {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
}

export default function CongruitaManodopera() {
  const { commessaId } = useCommessa();

  const { data: commessa } = useQuery({
    queryKey: ["commessa-congruita", commessaId],
    queryFn: async () => {
      const { data } = await supabase
        .from("cm_commessa_data")
        .select("importo_contrattuale, costo_manodopera, importo_base_gara, oggetto_lavori")
        .eq("id", commessaId!)
        .single();
      return data;
    },
    enabled: !!commessaId,
  });

  const [categoria, setCategoria] = useState<string>("");
  const [importoManuale, setImportoManuale] = useState<string>("");
  const [costoMOManuale, setCostoMOManuale] = useState<string>("");
  const [oreEdilconnect, setOreEdilconnect] = useState<string>("");
  const [costoOrario, setCostoOrario] = useState<string>("28.00");

  // Dati dalla commessa
  const importoCommessa = parseEuro(commessa?.importo_contrattuale) || parseEuro(commessa?.importo_base_gara);
  const costoMOCommessa = parseEuro(commessa?.costo_manodopera);

  // Usa dati manuali se inseriti, altrimenti da commessa
  const importoEffettivo = importoManuale ? parseFloat(importoManuale) : importoCommessa;
  const costoMOEffettivo = costoMOManuale
    ? parseFloat(costoMOManuale)
    : oreEdilconnect && costoOrario
    ? parseFloat(oreEdilconnect) * parseFloat(costoOrario)
    : costoMOCommessa;

  const sogliaSelezionata = categoria ? SOGLIE_CONGRUITA[categoria] : null;
  const sogliaMinima = sogliaSelezionata ? sogliaSelezionata.percentuale : 0;
  const incidenzaCalcolata = importoEffettivo > 0 ? (costoMOEffettivo / importoEffettivo) * 100 : 0;
  const isCongruo = incidenzaCalcolata >= sogliaMinima;
  const differenza = costoMOEffettivo - (importoEffettivo * sogliaMinima / 100);

  return (
    <AppLayout>
      <div className="p-3 lg:p-4 max-w-full">
        <PageHeader title="Congruità Manodopera" icon={HardHat} />

        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4 mb-6">
          <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div className="text-sm text-foreground/80">
            <p className="font-medium mb-1">Simulatore di congruità – DM 143/2021</p>
            <p>
              Questo strumento replica il calcolo di congruità della manodopera basato sulle soglie minime per categoria di opera.
              Inserisci i dati dal portale{" "}
              <a
                href="https://www.congruitanazionale.it/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline inline-flex items-center gap-1"
              >
                CNCE EdilConnect <ExternalLink className="w-3 h-3" />
              </a>{" "}
              per confrontarli con i dati della commessa.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Importo Lavori"
            value={importoEffettivo > 0 ? formatEuro(importoEffettivo) : "—"}
            subtitle={importoManuale ? "Inserito manualmente" : "Da dati commessa"}
            icon={<Euro className="w-5 h-5 text-accent" />}
          />
          <StatCard
            label="Costo Manodopera"
            value={costoMOEffettivo > 0 ? formatEuro(costoMOEffettivo) : "—"}
            subtitle={costoMOManuale || oreEdilconnect ? "Inserito manualmente" : "Da dati commessa"}
            icon={<Users className="w-5 h-5 text-primary" />}
          />
          <StatCard
            label="Incidenza Calcolata"
            value={importoEffettivo > 0 ? `${incidenzaCalcolata.toFixed(2)}%` : "—"}
            subtitle={sogliaSelezionata ? `Soglia minima: ${sogliaMinima}%` : "Seleziona categoria"}
            icon={<Percent className="w-5 h-5 text-accent" />}
          />
          <StatCard
            label="Esito Verifica"
            value={
              !categoria
                ? "—"
                : importoEffettivo <= 0
                ? "Dati mancanti"
                : isCongruo
                ? "CONGRUO"
                : "NON CONGRUO"
            }
            subtitle={
              categoria && importoEffettivo > 0
                ? isCongruo
                  ? `Eccedenza: ${formatEuro(Math.abs(differenza))}`
                  : `Deficit: ${formatEuro(Math.abs(differenza))}`
                : undefined
            }
            icon={
              !categoria || importoEffettivo <= 0 ? (
                <Calculator className="w-5 h-5 text-muted-foreground" />
              ) : isCongruo ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              )
            }
            className={cn(
              categoria && importoEffettivo > 0 && (isCongruo ? "border-green-500/30" : "border-destructive/30")
            )}
          />
        </div>

        <Tabs defaultValue="simulatore" className="animate-fade-in">
          <TabsList className="mb-4">
            <TabsTrigger value="simulatore" className="gap-1.5">
              <Calculator className="w-4 h-4" /> Simulatore
            </TabsTrigger>
            <TabsTrigger value="soglie" className="gap-1.5">
              <Info className="w-4 h-4" /> Tabella Soglie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulatore">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonna sinistra: Input */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-5">
                <h2 className="font-display font-semibold text-foreground">Dati di Input</h2>

                <div className="space-y-3">
                  <Label>Categoria prevalente (SOA)</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria opera..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(SOGLIE_CONGRUITA).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          {val.label} — {val.percentuale}%
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>
                    Importo lavori (€)
                    {importoCommessa > 0 && !importoManuale && (
                      <span className="text-xs text-muted-foreground ml-2">
                        — da commessa: {formatEuro(importoCommessa)}
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={importoCommessa > 0 ? formatEuro(importoCommessa) : "Importo complessivo dei lavori"}
                    value={importoManuale}
                    onChange={(e) => setImportoManuale(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>
                    Costo manodopera totale (€)
                    {costoMOCommessa > 0 && !costoMOManuale && (
                      <span className="text-xs text-muted-foreground ml-2">
                        — da commessa: {formatEuro(costoMOCommessa)}
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={costoMOCommessa > 0 ? formatEuro(costoMOCommessa) : "Costo complessivo manodopera"}
                    value={costoMOManuale}
                    onChange={(e) => setCostoMOManuale(e.target.value)}
                  />
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Oppure calcola da ore EdilConnect
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Ore totali dichiarate</Label>
                      <Input
                        type="number"
                        placeholder="es. 1200"
                        value={oreEdilconnect}
                        onChange={(e) => setOreEdilconnect(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Costo orario medio (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={costoOrario}
                        onChange={(e) => setCostoOrario(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonna destra: Risultato */}
              <div className="bg-card rounded-xl border border-border p-5 shadow-card space-y-5">
                <h2 className="font-display font-semibold text-foreground">Risultato Simulazione</h2>

                {!categoria ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Calculator className="w-12 h-12 mb-3 opacity-40" />
                    <p className="text-sm">Seleziona una categoria SOA per avviare la simulazione</p>
                  </div>
                ) : importoEffettivo <= 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Euro className="w-12 h-12 mb-3 opacity-40" />
                    <p className="text-sm">Inserisci l'importo dei lavori</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Categoria</span>
                        <Badge variant="outline">{categoria}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Soglia minima</span>
                        <span className="font-semibold">{sogliaMinima}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Importo minimo MO richiesto</span>
                        <span className="font-semibold">{formatEuro(importoEffettivo * sogliaMinima / 100)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Costo MO dichiarato</span>
                        <span className="font-semibold">{formatEuro(costoMOEffettivo)}</span>
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Incidenza</span>
                          <span className={cn("text-lg font-bold", isCongruo ? "text-green-600" : "text-destructive")}>
                            {incidenzaCalcolata.toFixed(2)}%
                          </span>
                        </div>
                        <div className="relative">
                          <Progress
                            value={Math.min(incidenzaCalcolata, sogliaMinima * 2)}
                            max={sogliaMinima * 2}
                            className="h-3"
                          />
                          <div
                            className="absolute top-0 h-3 w-0.5 bg-destructive"
                            style={{ left: `50%` }}
                            title={`Soglia: ${sogliaMinima}%`}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                          <span>0%</span>
                          <span className="text-destructive font-medium">Soglia {sogliaMinima}%</span>
                          <span>{(sogliaMinima * 2).toFixed(1)}%</span>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "rounded-xl p-4 text-center",
                          isCongruo
                            ? "bg-green-500/10 border border-green-500/30"
                            : "bg-destructive/10 border border-destructive/30"
                        )}
                      >
                        <div className="flex items-center justify-center gap-2 mb-1">
                          {isCongruo ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          )}
                          <span className={cn("font-bold text-lg", isCongruo ? "text-green-700" : "text-destructive")}>
                            {isCongruo ? "CONGRUO" : "NON CONGRUO"}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/70">
                          {isCongruo
                            ? `La manodopera supera la soglia minima di ${formatEuro(Math.abs(differenza))}`
                            : `Mancano ${formatEuro(Math.abs(differenza))} per raggiungere la soglia minima`}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="soglie">
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Categoria SOA</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Descrizione</th>
                      <th className="text-right px-4 py-3 font-semibold text-foreground">Soglia minima %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(SOGLIE_CONGRUITA).map(([key, val]) => (
                      <tr
                        key={key}
                        className={cn(
                          "border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer",
                          categoria === key && "bg-primary/5"
                        )}
                        onClick={() => setCategoria(key)}
                      >
                        <td className="px-4 py-2.5 font-medium">{key}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{val.label.split("–")[1]?.trim()}</td>
                        <td className="px-4 py-2.5 text-right font-semibold">{val.percentuale}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
