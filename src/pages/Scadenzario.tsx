import { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { CalendarClock, AlertTriangle, CheckCircle2, Clock, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCommessa } from "@/contexts/CommessaContext";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, parseISO, isBefore } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Scadenza {
  id: string;
  titolo: string;
  numero: string | null;
  descrizione: string | null;
  tipo: string;
  data_scadenza: string;
  data_emissione: string | null;
  importo_garantito: number | null;
  costo: number | null;
  compagnia: string | null;
  tipo_polizza: string | null;
  document_id: string | null;
  notificato_30g: boolean;
  created_at: string;
}

function getScadenzaStatus(dataScadenza: string) {
  const today = new Date();
  const scad = parseISO(dataScadenza);
  const diff = differenceInDays(scad, today);
  if (diff < 0) return { label: "Scaduta", color: "destructive" as const, icon: AlertTriangle, urgency: 3 };
  if (diff <= 30) return { label: `${diff}g rimasti`, color: "default" as const, icon: Clock, urgency: 2 };
  return { label: "In regola", color: "secondary" as const, icon: CheckCircle2, urgency: 1 };
}

const fmtCurrency = (v: number | null) => v != null ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" as any }).format(v) : "—";

export default function ScadenzarioPage() {
  const { commessaId } = useCommessa();
  const [scadenze, setScadenze] = useState<Scadenza[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const fetchScadenze = async () => {
    if (!commessaId) return;
    setLoading(true);
    const { data } = await supabase
      .from("scadenze")
      .select("*")
      .eq("commessa_id", commessaId)
      .order("data_scadenza", { ascending: true });
    setScadenze((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchScadenze(); }, [commessaId]);

  const handleDelete = async (id: string) => {
    await supabase.from("scadenze").delete().eq("id", id);
    toast({ title: "Scadenza eliminata" });
    fetchScadenze();
  };

  const scadenzeDates = useMemo(() => {
    const map = new Map<string, { urgency: number }>();
    for (const s of scadenze) {
      const status = getScadenzaStatus(s.data_scadenza);
      const key = s.data_scadenza;
      const existing = map.get(key);
      if (!existing || status.urgency > existing.urgency) {
        map.set(key, { urgency: status.urgency });
      }
    }
    return map;
  }, [scadenze]);

  const filteredScadenze = useMemo(() => {
    if (!selectedDate) return scadenze;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return scadenze.filter(s => s.data_scadenza === dateStr);
  }, [scadenze, selectedDate]);

  const modifiers = useMemo(() => {
    const expired: Date[] = [];
    const warning: Date[] = [];
    const ok: Date[] = [];
    for (const [dateStr, { urgency }] of scadenzeDates) {
      const d = parseISO(dateStr);
      if (urgency === 3) expired.push(d);
      else if (urgency === 2) warning.push(d);
      else ok.push(d);
    }
    return { expired, warning, ok };
  }, [scadenzeDates]);

  const modifiersClassNames = {
    expired: "bg-destructive text-destructive-foreground rounded-full",
    warning: "bg-amber-500 text-white rounded-full",
    ok: "bg-emerald-500/20 text-emerald-700 rounded-full",
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh)] overflow-hidden">
        <div className="p-3 lg:p-4 max-w-full flex-shrink-0">
          <PageHeader title="Scadenzario" icon={CalendarClock} />
        </div>
        <div className="flex-1 overflow-auto px-3 lg:px-4 pb-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Caricamento...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
              {/* Calendar */}
              <div className="border border-border rounded-xl bg-card p-2 self-start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={modifiers}
                  modifiersClassNames={modifiersClassNames}
                  className="pointer-events-auto"
                />
                {selectedDate && (
                  <Button variant="ghost" size="sm" className="w-full mt-1 text-xs" onClick={() => setSelectedDate(undefined)}>
                    Mostra tutte
                  </Button>
                )}
              </div>

              {/* List */}
              <div className="space-y-3">
                {filteredScadenze.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    {selectedDate ? "Nessuna scadenza in questa data." : "Nessuna scadenza registrata. Le polizze caricate nella sezione Documenti appariranno qui automaticamente."}
                  </div>
                ) : (
                  filteredScadenze.map((s) => {
                    const status = getScadenzaStatus(s.data_scadenza);
                    const StatusIcon = status.icon;
                    return (
                      <div key={s.id} className={cn(
                        "border rounded-xl p-4 bg-card space-y-2",
                        status.urgency === 3 && "border-destructive/50 bg-destructive/5",
                        status.urgency === 2 && "border-amber-500/50 bg-amber-500/5",
                      )}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <StatusIcon className={cn(
                              "w-4 h-4 flex-shrink-0",
                              status.urgency === 3 && "text-destructive",
                              status.urgency === 2 && "text-amber-500",
                              status.urgency === 1 && "text-emerald-500",
                            )} />
                            <h3 className="font-semibold text-sm text-card-foreground truncate">{s.titolo}</h3>
                            <Badge variant={status.color} className="text-[10px] flex-shrink-0">{status.label}</Badge>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Elimina scadenza</AlertDialogTitle>
                                <AlertDialogDescription>Vuoi eliminare questa scadenza?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(s.id)}>Elimina</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                          {s.numero && (
                            <div>
                              <span className="font-medium text-card-foreground">Numero:</span>{" "}
                              {s.numero}
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-card-foreground">Scadenza:</span>{" "}
                            {format(parseISO(s.data_scadenza), "dd/MM/yyyy")}
                          </div>
                          {s.tipo_polizza && (
                            <div>
                              <span className="font-medium text-card-foreground">Tipo:</span>{" "}
                              {s.tipo_polizza}
                            </div>
                          )}
                          {s.compagnia && (
                            <div>
                              <span className="font-medium text-card-foreground">Compagnia:</span>{" "}
                              {s.compagnia}
                            </div>
                          )}
                          {s.importo_garantito != null && (
                            <div>
                              <span className="font-medium text-card-foreground">Garantito:</span>{" "}
                              {fmtCurrency(s.importo_garantito)}
                            </div>
                          )}
                          {s.costo != null && (
                            <div>
                              <span className="font-medium text-card-foreground">Premio:</span>{" "}
                              {fmtCurrency(s.costo)}
                            </div>
                          )}
                          {s.data_emissione && (
                            <div>
                              <span className="font-medium text-card-foreground">Validità dal:</span>{" "}
                              {format(parseISO(s.data_emissione), "dd/MM/yyyy")}
                            </div>
                          )}
                        </div>
                        {s.descrizione && (
                          <p className="text-xs text-muted-foreground">{s.descrizione}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
