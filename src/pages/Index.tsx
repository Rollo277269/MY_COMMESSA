import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import {
  FileText, Shield, Leaf, Calendar as CalendarIcon, TrendingUp, Users,
  Building2, CheckCircle2, Clock, Pencil, Save, X, Timer, RefreshCw, Loader2,
  Moon, Sun, Maximize, Minimize, ArrowLeftRight, LogOut, Sparkles, HardHat } from
"lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithRetry } from "@/lib/invokeWithRetry";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommessa } from "@/contexts/CommessaContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { it } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const quickLinksConfig = [
{ label: "Documenti", key: "documenti" as const, icon: FileText, path: "/documenti", color: "text-info" },
{ label: "Sicurezza", key: "sicurezza" as const, icon: Shield, path: "/sicurezza", color: "text-destructive" },
{ label: "Ambiente", key: "ambiente" as const, icon: Leaf, path: "/ambiente", color: "text-success" },
{ label: "Cronoprogramma", key: "cronoprogramma" as const, icon: CalendarIcon, path: "/cronoprogramma", color: "text-primary" }];


const recentActivities = [
{ text: "Commessa creata", time: "Adesso", icon: CheckCircle2 },
{ text: "Pronto per caricare documenti", time: "", icon: Clock }];


interface CommessaData {
  id: string;
  committente: string | null;
  oggetto_lavori: string | null;
  importo_contrattuale: string | null;
  oneri_sicurezza: string | null;
  costo_manodopera: string | null;
  data_contratto: string | null;
  data_consegna_lavori: string | null;
  durata_contrattuale: string | null;
  rup: string | null;
  direttore_lavori: string | null;
  impresa_assegnataria: string | null;
  data_scadenza_contratto: string | null;
  commessa_consortile: string | null;
  cup: string | null;
  cig: string | null;
  cig_derivato: string | null;
  importo_base_gara: string | null;
  ribasso: string | null;
  aggio_consorzio: number | null;
  quota_servizi_tecnici: number | null;
  riferimenti_pnrr: string | null;
}

const dateFields = new Set(["data_contratto", "data_consegna_lavori"]);
const percentFields = new Set(["ribasso", "aggio_consorzio", "quota_servizi_tecnici"]);
const currencyFields = new Set(["importo_contrattuale", "oneri_sicurezza", "importo_base_gara", "costo_manodopera"]);
const computedFields = new Set(["data_scadenza_contratto", "importo_contrattuale"]);
const prorogheComputedFields = new Set(["giorni_proroga", "scadenza_con_proroghe"]);
const documentComputedFields = new Set(["giorni_sospensione"]);

const commessaFields: {key: string;label: string;}[] = [
{ key: "commessa_consortile", label: "Commessa N." },
{ key: "cup", label: "CUP" },
{ key: "cig", label: "CIG" },
{ key: "cig_derivato", label: "CIG Derivato" },
{ key: "committente", label: "Committente" },
{ key: "oggetto_lavori", label: "Oggetto dei lavori" },
{ key: "importo_base_gara", label: "Importo a base di gara" },
{ key: "ribasso", label: "Ribasso" },
{ key: "importo_contrattuale", label: "Importo contrattuale" },
{ key: "oneri_sicurezza", label: "Oneri di sicurezza" },
{ key: "costo_manodopera", label: "Costo della manodopera" },
{ key: "data_contratto", label: "Data del contratto" },
{ key: "data_consegna_lavori", label: "Data consegna lavori" },
{ key: "durata_contrattuale", label: "Durata contrattuale dei lavori" },
{ key: "data_scadenza_contratto", label: "Data scadenza contratto" },
{ key: "giorni_sospensione" as any, label: "Giorni di sospensione" },
{ key: "giorni_proroga" as any, label: "Giorni di proroga" },
{ key: "scadenza_con_proroghe" as any, label: "Scadenza con proroghe" },
{ key: "rup", label: "RUP" },
{ key: "direttore_lavori", label: "Direttore lavori" },
{ key: "impresa_assegnataria", label: "Consorziate assegnatarie" },
{ key: "aggio_consorzio", label: "Quota lavori (consorzio)" },
{ key: "quota_servizi_tecnici", label: "Quota servizi tecnici" },
{ key: "riferimenti_pnrr", label: "Riferimenti fondi PNRR" }];

function parseLocalDate(str: string): Date | undefined {
  if (!str) return undefined;
  // Try dd/mm/yyyy or dd.mm.yyyy or dd-mm-yyyy
  const parts = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (parts) return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
  const iso = new Date(str);
  return isNaN(iso.getTime()) ? undefined : iso;
}

function formatDateIt(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function formatCurrency(val: string | null): string {
  if (!val) return "";
  const num = parseFloat(val.replace(/[^\d.,-]/g, '').replace(',', '.'));
  if (isNaN(num)) return val;
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" as any }).format(num);
}

function CurrencyInput({ value, onChange }: {value: string;onChange: (v: string) => void;}) {
  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm pl-7"
        placeholder="0,00"
        inputMode="decimal" />
      
    </div>);

}

function DateFieldInput({ value, onChange }: {value: string;onChange: (v: string) => void;}) {
  const [open, setOpen] = useState(false);
  const selected = parseLocalDate(value);

  return (
    <div className="flex gap-1.5 items-center">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm flex-1"
        placeholder="gg.mm.aaaa" />
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 flex-shrink-0">
            <CalendarIcon className="w-3.5 h-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => {
              if (d) {onChange(formatDateIt(d));}
              setOpen(false);
            }}
            locale={it}
            initialFocus
            className="p-3 pointer-events-auto" />
          
        </PopoverContent>
      </Popover>
    </div>);

}


function parseDateString(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  // Try dd/mm/yyyy
  const parts = dateStr.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (parts) {
    return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
  }
  // Try yyyy-mm-dd
  const iso = new Date(dateStr);
  if (!isNaN(iso.getTime())) return iso;
  return null;
}

function ContractCountdown({ scadenza, scadenzaConProroghe }: {scadenza: string | null;scadenzaConProroghe: Date | null;}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Use scadenza con proroghe if available, otherwise original
  const targetDate = scadenzaConProroghe ?? parseDateString(scadenza);

  if (!targetDate) {
    return (
      <div className="bg-muted/50 border border-border rounded-lg p-5 flex items-center gap-4 animate-fade-in h-full">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Timer className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Scadenza contratto</p>
          <p className="text-xs text-muted-foreground">Inserisci la data di scadenza nei dati della commessa</p>
        </div>
      </div>);
  }

  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = diffDays < 0;
  const isUrgent = diffDays >= 0 && diffDays <= 30;
  const hasProroghe = scadenzaConProroghe !== null;

  return (
    <div className={cn(
      "border rounded-lg p-5 flex items-center gap-5 animate-fade-in h-full",
      isExpired ? "bg-destructive/10 border-destructive/30" :
      isUrgent ? "bg-warning/10 border-warning/30" :
      "bg-success/10 border-success/30"
    )}>
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0",
        isExpired ? "bg-destructive/20" : isUrgent ? "bg-warning/20" : "bg-success/20"
      )}>
        <Timer className={cn(
          "w-7 h-7",
          isExpired ? "text-destructive" : isUrgent ? "text-warning" : "text-success"
        )} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {isExpired ? "CONTRATTO SCADUTO" : "TIMER"}
        </p>
        <p className={cn("font-bold font-display text-xl",

        isExpired ? "text-destructive" : isUrgent ? "text-warning" : "text-success"
        )}>
          {isExpired ? `Scaduto da ${Math.abs(diffDays)} giorni` : diffDays}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Scadenza{hasProroghe ? " (con proroghe)" : ""}: {`${String(targetDate.getDate()).padStart(2, '0')}.${String(targetDate.getMonth() + 1).padStart(2, '0')}.${targetDate.getFullYear()}`}
        </p>
      </div>
    </div>);
}

const Index = () => {
  const { commessaId, setCommessaId } = useCommessa();
  const [commessa, setCommessa] = useState<CommessaData | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [counts, setCounts] = useState({ documents: 0, persons: 0, companies: 0, phases: 0, avgProgress: 0 });
  const [subappaltiStats, setSubappaltiStats] = useState({ count: 0, completionPct: 0 });
  const [sectionCounts, setSectionCounts] = useState({ documenti: 0, sicurezza: 0, ambiente: 0, cronoprogramma: 0 });
  const [phaseChartData, setPhaseChartData] = useState<{name: string;progress: number;}[]>([]);
  const [proroghe, setProroghe] = useState<{giorni: number;nuova_data_fine: string;}[]>([]);
  const [giorniSospensione, setGiorniSospensione] = useState<number>(0);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [projectSummary, setProjectSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchCommessa = useCallback(async () => {
    if (!commessaId) return;
    setLoading(true);
    const { data, error } = await supabase.
    from('commessa_data').
    select('*').
    eq('id', commessaId).
    maybeSingle();

    if (!error && data) {
      setCommessa(data as CommessaData);
    }
    setLoading(false);
  }, [commessaId]);

  const fetchCounts = useCallback(async () => {
    if (!commessaId) return;
    const [docsRes, personsRes, phasesRes] = await Promise.all([
    supabase.from('documents').select('id, section').eq('commessa_id', commessaId),
    supabase.from('persons').select('id, azienda').eq('commessa_id', commessaId),
    supabase.from('cronoprogramma_phases').select('id, parent_id, progress, name, sort_order').eq('commessa_id', commessaId)]
    );

    const docs = docsRes.data || [];
    const persons = personsRes.data || [];
    const phases = phasesRes.data || [];

    // Count unique companies from persons
    const uniqueCompanies = new Set(persons.map((p) => p.azienda).filter(Boolean));

    // Average progress of parent phases
    const parentPhases = phases.filter((p) => !p.parent_id).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const avgProgress = parentPhases.length > 0 ?
    Math.round(parentPhases.reduce((sum, p) => sum + (p.progress || 0), 0) / parentPhases.length) :
    0;

    setPhaseChartData(parentPhases.map((p: any) => ({ name: p.name, progress: p.progress ?? 0 })));

    setCounts({
      documents: docs.length,
      persons: persons.length,
      companies: uniqueCompanies.size,
      phases: parentPhases.length,
      avgProgress
    });

    // Section counts
    const secCounts = { documenti: 0, sicurezza: 0, ambiente: 0, cronoprogramma: parentPhases.length };
    docs.forEach((d) => {
      if (d.section === 'sicurezza') secCounts.sicurezza++;else
      if (d.section === 'ambiente') secCounts.ambiente++;else
      secCounts.documenti++;
    });
    setSectionCounts(secCounts);
  }, [commessaId]);

  const fetchProroghe = useCallback(async () => {
    if (!commessaId) return;
    const { data } = await supabase.
    from('proroghe').
    select('giorni, nuova_data_fine').
    eq('commessa_id', commessaId).
    order('data_concessione', { ascending: true });
    setProroghe(data || []);
  }, [commessaId]);

  const fetchGiorniSospensione = useCallback(async () => {
    if (!commessaId) return;
    const { data: docs } = await supabase.
    from('documents').
    select('ai_extracted_data').
    eq('commessa_id', commessaId).
    eq('ai_status', 'completed').
    not('ai_extracted_data', 'is', null);

    if (!docs) return;
    let totalGiorni = 0;
    for (const doc of docs) {
      const ai = doc.ai_extracted_data as any;
      if (!ai || typeof ai !== 'object') continue;
      if (ai.giorni_sospensione) {
        const g = parseInt(String(ai.giorni_sospensione), 10);
        if (!isNaN(g)) totalGiorni += g;
      } else if (ai.periodi_sospensione && Array.isArray(ai.periodi_sospensione)) {
        for (const p of ai.periodi_sospensione) {
          const g = parseInt(String(p.giorni), 10);
          if (!isNaN(g)) totalGiorni += g;
        }
      }
    }
    setGiorniSospensione(totalGiorni);
  }, [commessaId]);

  // Load cached summary from DB
  const loadCachedSummary = useCallback(async () => {
    if (!commessaId) return;
    const { data } = await supabase
      .from("cm_commessa_data")
      .select("project_summary")
      .eq("id", commessaId)
      .maybeSingle();
    if (data?.project_summary) {
      setProjectSummary(data.project_summary);
    }
  }, [commessaId]);

  const fetchProjectSummary = useCallback(async () => {
    if (!commessaId) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const { data, error } = await invokeWithRetry<any>('cm-project-summary', { body: { commessaId } });
      if (error) throw error;
      setProjectSummary(data?.summary || null);
      if (data?.cached) {
        // No new docs, summary was already up to date
      }
      if (!data?.summary && data?.message) setSummaryError(data.message);
    } catch (err: any) {
      setSummaryError("Impossibile generare il riepilogo");
      console.error("Project summary error:", err);
    }
    setSummaryLoading(false);
  }, [commessaId]);

  const fetchSubappaltiStats = useCallback(async () => {
    if (!commessaId) return;
    const { data: subs } = await supabase.
    from('subappaltatori').
    select('id').
    eq('commessa_id', commessaId);
    const subList = subs as any[] || [];
    if (subList.length === 0) {
      setSubappaltiStats({ count: 0, completionPct: 0 });
      return;
    }
    const { data: checklistItems } = await supabase.
    from('subappaltatore_checklist').
    select('completato, subappaltatore_id').
    in('subappaltatore_id', subList.map((s) => s.id));
    const items = checklistItems as any[] || [];
    const total = items.length;
    const completed = items.filter((i) => i.completato).length;
    setSubappaltiStats({
      count: subList.length,
      completionPct: total > 0 ? Math.round(completed / total * 100) : 0
    });
  }, [commessaId]);

  useEffect(() => {fetchCommessa();fetchCounts();fetchProroghe();fetchGiorniSospensione();fetchSubappaltiStats();loadCachedSummary();}, [fetchCommessa, fetchCounts, fetchProroghe, fetchGiorniSospensione, fetchSubappaltiStats, loadCachedSummary]);

  const startEdit = () => {
    if (!commessa) return;
    const f: Record<string, string> = {};
    commessaFields.forEach(({ key }) => {
      f[key] = String(commessa[key] ?? "");
    });
    setForm(f);
    setEditing(true);
  };

  const syncFromDocuments = async () => {
    setSyncing(true);
    try {
      const { data, error } = await invokeWithRetry<any>('cm-extract-commessa', { body: { commessaId } });
      if (error) throw error;
      toast({
        title: "Sincronizzazione completata",
        description: data?.message || "Dati aggiornati dai documenti"
      });
      // Refresh all data after sync
      await Promise.all([fetchCommessa(), fetchGiorniSospensione(), fetchProjectSummary()]);
    } catch (err: any) {
      toast({ title: "Errore", description: err.message || "Impossibile sincronizzare", variant: "destructive" });
    }
    setSyncing(false);
  };

  const saveEdit = async () => {
    if (!commessa) return;
    // Compute importo_contrattuale from base gara - ribasso%
    const formToSave = { ...form };
    const baseRaw = formToSave.importo_base_gara?.replace(/[^\d.,-]/g, '').replace(',', '.') || "";
    const ribassoRaw = formToSave.ribasso?.replace(/[^\d.,-]/g, '').replace(',', '.') || "";
    const baseNum = parseFloat(baseRaw);
    const ribassoNum = parseFloat(ribassoRaw);
    if (!isNaN(baseNum) && !isNaN(ribassoNum)) {
      const importo = baseNum * (1 - ribassoNum / 100);
      formToSave.importo_contrattuale = importo.toFixed(2);
    }

    // Compute data_scadenza_contratto
    const consegna = parseLocalDate(formToSave.data_consegna_lavori || "");
    const durata = parseInt(formToSave.durata_contrattuale || "0", 10);
    if (consegna && durata > 0) {
      const scadenza = new Date(consegna);
      scadenza.setDate(scadenza.getDate() + durata);
      formToSave.data_scadenza_contratto = formatDateIt(scadenza);
    }
    // Se non ci sono dati sufficienti per calcolare la scadenza, non sovrascrivere il campo

    // Remove computed/virtual fields that don't exist in the database
    delete formToSave["giorni_proroga"];
    delete formToSave["scadenza_con_proroghe"];
    delete formToSave["giorni_sospensione"];

    // Convert percentage fields to numbers
    for (const pf of ["aggio_consorzio", "quota_servizi_tecnici"]) {
      if (formToSave[pf] !== undefined) {
        (formToSave as any)[pf] = parseFloat(formToSave[pf]) || null;
      }
    }

    const { error } = await supabase.
    from('commessa_data').
    update(formToSave).
    eq('id', commessa.id);

    if (error) {
      toast({ title: "Errore", description: "Impossibile salvare", variant: "destructive" });
    } else {
      toast({ title: "Dati commessa aggiornati" });
      setEditing(false);
      fetchCommessa();
    }
  };

  return (
    <AppLayout>
      <div className="p-3 lg:p-4 max-w-full">
        {/* Welcome */}
        <div className="mb-6 animate-fade-in flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Cruscotto di Commessa</h1>
            {commessa &&
            <p className="text-muted-foreground mt-1 text-lg truncate max-w-[700px]">
                {[commessa.commessa_consortile, commessa.committente, commessa.oggetto_lavori].filter(Boolean).join(" · ")}
              </p>
            }
          </div>
          <div className="flex items-center gap-1.5 bg-primary/80 rounded-lg px-2 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              onClick={() => {
                const next = !dark;
                document.documentElement.classList.toggle("dark", next);
                setDark(next);
              }}
              title={dark ? "Modalità giorno" : "Modalità notte"}>
              
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              onClick={async () => {
                try {
                  if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                    setIsFullscreen(true);
                  } else {
                    await document.exitFullscreen();
                    setIsFullscreen(false);
                  }
                } catch {}
              }}
              title={isFullscreen ? "Esci da schermo intero" : "Schermo intero"}>
              
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            <div className="w-px h-5 bg-white/30 mx-0.5" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-primary-foreground hover:bg-white/20"
              onClick={() => {setCommessaId(null);navigate("/commesse");}}
              title="Cambia commessa">
              
              <ArrowLeftRight className="w-3.5 h-3.5" /> Commesse
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              onClick={async () => {setCommessaId(null);await supabase.auth.signOut();}}
              title="Esci">
              
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Stats + Countdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <ContractCountdown scadenza={commessa?.data_scadenza_contratto || null} scadenzaConProroghe={proroghe.length > 0 ? new Date(proroghe[proroghe.length - 1].nuova_data_fine) : null} />
          <StatCard
            label="Documenti"
            value={counts.documents}
            subtitle={counts.documents === 1 ? "1 documento caricato" : `${counts.documents} documenti caricati`}
            icon={<FileText className="w-5 h-5 text-primary" />} />
          <StatCard
            label="Persone"
            value={counts.persons}
            subtitle="Dipendenti e collaboratori"
            icon={<Users className="w-5 h-5 text-primary" />} />
          <StatCard
            label="Aziende"
            value={counts.companies}
            subtitle="Fornitori e clienti"
            icon={<Building2 className="w-5 h-5 text-primary" />} />
          <Link to="/subappalti" className="block h-full">
            <StatCard
              label="Subappalti"
              value={subappaltiStats.count}
              subtitle={subappaltiStats.count > 0 ? `${subappaltiStats.completionPct}% documentazione completa` : "Nessun subappaltatore"}
              icon={<HardHat className="w-5 h-5 text-primary" />}
              className="h-full" />
          </Link>
          <StatCard
            label="Avanzamento"
            value={`${counts.avgProgress}%`}
            subtitle={`${counts.phases} fasi nel cronoprogramma`}
            icon={<TrendingUp className="w-5 h-5 text-primary" />} />
        </div>

        {/* AI Project Summary */}
        <div className="bg-card border border-border rounded-lg shadow-card mb-6 animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Riepilogo Progetto AI</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={fetchProjectSummary}
              disabled={summaryLoading}>
              
              {summaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Aggiorna
            </Button>
          </div>
          <div className="p-5">
            {summaryLoading ?
            <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/6" />
              </div> :
            summaryError && !projectSummary ?
            <p className="text-sm text-muted-foreground italic">{summaryError}</p> :
            projectSummary ?
            <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-line [&]:space-y-0" style={{ whiteSpace: 'pre-line', marginBottom: 0 }}>{projectSummary.split('\n\n').join('\n')}</p> :

            <p className="text-sm text-muted-foreground italic">Carica e analizza dei documenti per generare il riepilogo automatico.</p>
            }
          </div>
        </div>

        {/* Progress Chart */}
        {phaseChartData.length > 0












































        }

        {/* Commessa Data Table */}
        <div className="bg-card border border-border rounded-lg shadow-card mb-6 animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">Dati della Commessa</h2>
            {!editing ?
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={syncFromDocuments} disabled={syncing}>
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Aggiorna dai documenti
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={startEdit}>
                  <Pencil className="w-4 h-4" /> Modifica
                </Button>
              </div> :

            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(false)}>
                  <X className="w-4 h-4" /> Annulla
                </Button>
                <Button size="sm" className="gap-1.5" onClick={saveEdit}>
                  <Save className="w-4 h-4" /> Salva
                </Button>
              </div>
            }
          </div>
          {loading ?
          <div className="p-8 text-center text-muted-foreground text-sm">Caricamento...</div> :

          <div className="divide-y divide-border">
              {commessaFields.map(({ key, label }) =>
            <div key={key} className="flex items-center px-4 py-1.5 gap-4">
                  <div className="w-56 flex-shrink-0">
                    <p className="text-base font-medium text-muted-foreground">{label}</p>
                  </div>
                  <div className="flex-1">
                    {documentComputedFields.has(key) ?
                (() => {
                  if (key === "giorni_sospensione") {
                    return (
                      <p className={cn("text-base", giorniSospensione > 0 ? "text-card-foreground font-medium" : "text-muted-foreground italic")}>
                              {giorniSospensione > 0 ? `${giorniSospensione} giorni` : "Nessuna sospensione"} <span className="ml-2 text-xs text-muted-foreground">(dai documenti)</span>
                            </p>);
                  }
                  return null;
                })() :
                prorogheComputedFields.has(key) ?
                (() => {
                  const totGiorni = proroghe.reduce((sum, p) => sum + p.giorni, 0);
                  if (key === "giorni_proroga") {
                    return (
                      <p className={cn("text-base", totGiorni > 0 ? "text-card-foreground font-medium" : "text-muted-foreground italic")}>
                              {totGiorni > 0 ? `${totGiorni} giorni` : "Nessuna proroga"} <span className="ml-2 text-xs text-muted-foreground">(calcolato)</span>
                            </p>);

                  }
                  // scadenza_con_proroghe
                  if (proroghe.length > 0) {
                    const lastDate = new Date(proroghe[proroghe.length - 1].nuova_data_fine);
                    return (
                      <p className="text-base text-card-foreground font-medium">
                              {formatDateIt(lastDate)} <span className="ml-2 text-xs text-muted-foreground">(calcolato)</span>
                            </p>);

                  }
                  return <p className="text-base text-muted-foreground italic">Nessuna proroga</p>;
                })() :
                editing && computedFields.has(key) ?
                (() => {
                  const consegna = parseLocalDate(form.data_consegna_lavori || "");
                  const durata = parseInt(form.durata_contrattuale || "0", 10);
                  let computed = "";
                  if (consegna && durata > 0) {
                    const s = new Date(consegna);
                    s.setDate(s.getDate() + durata);
                    computed = formatDateIt(s);
                  }
                  return (
                    <p className="text-sm text-muted-foreground italic h-8 flex items-center">
                            {computed || "Inserisci data consegna e durata"} <span className="ml-2 text-xs">(calcolato)</span>
                          </p>);

                })() :
                editing ?
                dateFields.has(key) ?
                <DateFieldInput
                  value={form[key] || ""}
                  onChange={(v) => setForm((f) => ({ ...f, [key]: v }))} /> :

                currencyFields.has(key) ?
                <CurrencyInput
                  value={form[key] || ""}
                  onChange={(v) => setForm((f) => ({ ...f, [key]: v }))} /> :

                percentFields.has(key) ?
                <div className="relative">
                          <Input
                    value={form[key] || ""}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="h-8 text-sm pr-7"
                    placeholder="0"
                    inputMode="decimal" />
                  
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                        </div> :
                <Input
                  value={form[key] || ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="h-8 text-sm"
                  placeholder={`Inserisci ${label.toLowerCase()}`} /> :


                <p className="text-base text-card-foreground font-medium">
                            {currencyFields.has(key) ?
                  formatCurrency(String(commessa?.[key] ?? "")) :
                  percentFields.has(key) ?
                  commessa?.[key] != null && commessa?.[key] !== "" ? `${commessa[key]}%` : "" :
                  dateFields.has(key) || computedFields.has(key) ?
                  (() => {
                    const d = parseLocalDate(String(commessa?.[key] ?? ""));
                    return d ? formatDateIt(d) : String(commessa?.[key] || "");
                  })() :
                  String(commessa?.[key] ?? "")}
                          </p>
                }
                  </div>
                </div>
            )}
            </div>
          }
        </div>

        {/* Recent activity */}
        <div className="bg-card rounded-lg border border-border p-5 shadow-card animate-fade-in">
          <h2 className="font-display font-semibold text-foreground mb-4">Attività Recenti</h2>
          <div className="space-y-3">
            {recentActivities.map((a, i) =>
            <div key={i} className="flex items-start gap-3">
                <a.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-card-foreground">{a.text}</p>
                  {a.time && <p className="text-xs text-muted-foreground">{a.time}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>);

};

export default Index;