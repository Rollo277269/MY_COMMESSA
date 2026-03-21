import { useEffect, useState, useCallback, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithRetry } from "@/lib/invokeWithRetry";
import { useCommessa } from "@/contexts/CommessaContext";
import {
  FileBarChart, Building2, FileText, Users, Calendar, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, Euro, ArrowUpRight, ArrowDownRight,
  Shield, Leaf, Printer, BarChart3, Download, ClipboardCheck, XCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { generateReportCommessaPdf } from "@/lib/generateReportPdf";
import agisLogo from "@/assets/agis-logo.png";

/* ─── helpers ─── */
function parseLocalDate(str: string | null): Date | null {
  if (!str) return null;
  const parts = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (parts) return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
  const iso = new Date(str);
  return isNaN(iso.getTime()) ? null : iso;
}

function fmtDate(str: string | null): string {
  const d = parseLocalDate(str);
  if (!d) return "—";
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function fmtCurrency(val: string | null | number): string {
  if (val === null || val === undefined || val === "") return "€ 0,00";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^\d.,-]/g, "").replace(",", "."));
  if (isNaN(num)) return "€ 0,00";
  const abs = Math.abs(num);
  const formatted = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" as any }).format(abs);
  return num < 0 ? `- ${formatted}` : formatted;
}

function pct(a: number, b: number): string {
  if (!b) return "0%";
  return `${((a / b) * 100).toFixed(1)}%`;
}

/* ─── types ─── */
interface CommessaData {
  id: string;
  committente: string | null;
  oggetto_lavori: string | null;
  importo_contrattuale: string | null;
  importo_base_gara: string | null;
  ribasso: string | null;
  oneri_sicurezza: string | null;
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
  aggio_consorzio: number | null;
  quota_servizi_tecnici: number | null;
  riferimenti_pnrr: string | null;
}

/* ─── KPI card ─── */
function KpiCard({ label, value, icon, color = "text-primary" }: { label: string; value: string | number; icon: React.ReactNode; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-card flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50", color)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
        <p className="text-lg font-bold text-foreground font-display">{value}</p>
      </div>
    </div>
  );
}

/* ─── Alert card ─── */
function AlertCard({ level, title, desc }: { level: "critical" | "warning" | "ok"; title: string; desc: string }) {
  const cfg = {
    critical: { bg: "bg-destructive/10 border-destructive/30", icon: <AlertTriangle className="w-4 h-4 text-destructive" />, text: "text-destructive" },
    warning: { bg: "bg-warning/10 border-warning/30", icon: <Clock className="w-4 h-4 text-warning" />, text: "text-warning" },
    ok: { bg: "bg-success/10 border-success/30", icon: <CheckCircle2 className="w-4 h-4 text-success" />, text: "text-success" },
  }[level];
  return (
    <div className={cn("border rounded-lg p-3 flex items-start gap-3", cfg.bg)}>
      <div className="mt-0.5">{cfg.icon}</div>
      <div>
        <p className={cn("text-sm font-semibold", cfg.text)}>{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

/* ─── section wrapper ─── */
function Section({ title, icon, children, className }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card border border-border rounded-lg shadow-card animate-fade-in", className)}>
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        {icon}
        <h2 className="font-display font-semibold text-foreground text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ─── economic row ─── */
function EcoRow({ label, value, bold, negative }: { label: string; value: string; bold?: boolean; negative?: boolean }) {
  return (
    <div className={cn("flex justify-between py-1.5 border-b border-border last:border-0", bold && "font-semibold")}>
      <span className="text-sm text-card-foreground">{label}</span>
      <span className={cn("text-sm", negative ? "text-destructive" : "text-card-foreground")}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════ MAIN ═══════════════════════════ */
export default function ReportCommessa() {
  const { commessaId } = useCommessa();
  const [commessa, setCommessa] = useState<CommessaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ documents: 0, persons: 0, companies: 0, phases: 0, avgProgress: 0, cmeRows: 0, sicurezza: 0, ambiente: 0 });
  const [phaseData, setPhaseData] = useState<{ name: string; progress: number }[]>([]);
  const [proroghe, setProroghe] = useState<{ giorni: number; motivo: string; nuova_data_fine: string }[]>([]);
  const [checklistVerifica, setChecklistVerifica] = useState<{ nome: string; presente: boolean; matchedDocument: string | null; confidence: number }[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchAll = useCallback(async () => {
    if (!commessaId) return;
    setLoading(true);

    const [commRes, docsRes, persRes, phasesRes, cmeRes, proRes, checklistRes] = await Promise.all([
      supabase.from("commessa_data").select("*").eq("id", commessaId).maybeSingle(),
      supabase.from("documents").select("id, section, file_name").eq("commessa_id", commessaId),
      supabase.from("persons").select("id, azienda").eq("commessa_id", commessaId),
      supabase.from("cronoprogramma_phases").select("id, parent_id, progress, name, sort_order").eq("commessa_id", commessaId),
      supabase.from("cme_rows").select("id, importo").eq("commessa_id", commessaId),
      supabase.from("proroghe").select("giorni, motivo, nuova_data_fine").eq("commessa_id", commessaId).order("nuova_data_fine"),
      supabase.from("checklist_documenti").select("nome, indispensabile").eq("commessa_id", commessaId).eq("indispensabile", true).order("sort_order"),
    ]);

    if (commRes.data) setCommessa(commRes.data as CommessaData);

    const docs = docsRes.data || [];
    const persons = persRes.data || [];
    const phases = phasesRes.data || [];
    const cme = cmeRes.data || [];
    const pro = proRes.data || [];

    const parentPhases = phases.filter((p) => !p.parent_id).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const avgProg = parentPhases.length ? Math.round(parentPhases.reduce((s, p) => s + (p.progress || 0), 0) / parentPhases.length) : 0;
    const uniqueCompanies = new Set(persons.map((p) => p.azienda).filter(Boolean));

    setCounts({
      documents: docs.length,
      persons: persons.length,
      companies: uniqueCompanies.size,
      phases: parentPhases.length,
      avgProgress: avgProg,
      cmeRows: cme.length,
      sicurezza: docs.filter((d) => d.section === "sicurezza").length,
      ambiente: docs.filter((d) => d.section === "ambiente").length,
    });

    setPhaseData(parentPhases.map((p: any) => ({ name: p.name, progress: p.progress ?? 0 })));
    setProroghe(pro);

    // Verify checklist against uploaded documents using AI semantic matching
    const checklistItems = (checklistRes.data || []) as { nome: string; indispensabile: boolean }[];
    const docNames = docs.map((d: any) => d.file_name as string);

    if (checklistItems.length > 0 && docNames.length > 0) {
      setChecklistLoading(true);
      try {
        const { data: matchResult, error: matchError } = await invokeWithRetry<any>("match-checklist", {
          body: {
            checklistItems: checklistItems.map(i => i.nome),
            documentNames: docNames,
          },
        });
        if (!matchError && matchResult?.matches) {
          setChecklistVerifica(matchResult.matches.map((m: any) => ({
            nome: m.checklistItem,
            presente: m.matched,
            matchedDocument: m.matchedDocument,
            confidence: m.confidence,
          })));
        } else {
          // Fallback to naive matching
          setChecklistVerifica(checklistItems.map((item) => ({
            nome: item.nome,
            presente: false,
            matchedDocument: null,
            confidence: 0,
          })));
        }
      } catch {
        setChecklistVerifica(checklistItems.map((item) => ({
          nome: item.nome, presente: false, matchedDocument: null, confidence: 0,
        })));
      }
      setChecklistLoading(false);
    } else if (checklistItems.length > 0) {
      setChecklistVerifica(checklistItems.map((item) => ({
        nome: item.nome, presente: false, matchedDocument: null, confidence: 0,
      })));
    }

    setLoading(false);
  }, [commessaId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-4 flex items-center justify-center min-h-[60vh] text-muted-foreground">Caricamento report...</div>
      </AppLayout>
    );
  }

  /* ─── derived values ─── */
  const importoBase = parseFloat(commessa?.importo_base_gara?.replace(/[^\d.,-]/g, "").replace(",", ".") || "0");
  const ribasso = parseFloat(commessa?.ribasso?.replace(/[^\d.,-]/g, "").replace(",", ".") || "0");
  const importoContrattuale = importoBase * (1 - ribasso / 100);
  const oneriSicurezza = parseFloat(commessa?.oneri_sicurezza?.replace(/[^\d.,-]/g, "").replace(",", ".") || "0");

  // Consorzio economics
  const aggioPct = commessa?.aggio_consorzio ?? 3;
  const quotaLavoriPct = aggioPct;
  const quotaServiziPct = commessa?.quota_servizi_tecnici ?? 0;
  const quotaLavori = importoContrattuale * quotaLavoriPct / 100;
  const quotaServizi = importoContrattuale * quotaServiziPct / 100;
  const totaleTrattenute = quotaLavori + quotaServizi;
  const importoConsorziata = importoContrattuale - totaleTrattenute;

  // Timeline
  const consegna = parseLocalDate(commessa?.data_consegna_lavori || null);
  const scadenza = parseLocalDate(commessa?.data_scadenza_contratto || null);
  const now = new Date();
  const daysLeft = scadenza ? Math.ceil((scadenza.getTime() - now.getTime()) / 86400000) : null;
  const totalProrogheDays = proroghe.reduce((s, p) => s + p.giorni, 0);

  // Alerts
  const alerts: { level: "critical" | "warning" | "ok"; title: string; desc: string }[] = [];

  if (daysLeft !== null && daysLeft < 0) alerts.push({ level: "critical", title: "Contratto scaduto", desc: `Scaduto da ${Math.abs(daysLeft)} giorni` });
  else if (daysLeft !== null && daysLeft <= 30) alerts.push({ level: "warning", title: "Scadenza imminente", desc: `Mancano ${daysLeft} giorni alla scadenza` });
  else if (daysLeft !== null) alerts.push({ level: "ok", title: "Tempistiche regolari", desc: `${daysLeft} giorni alla scadenza` });

  if (counts.avgProgress < 30 && daysLeft !== null && daysLeft < 90) alerts.push({ level: "warning", title: "Avanzamento in ritardo", desc: `Avanzamento medio al ${counts.avgProgress}% con meno di 90gg alla scadenza` });

  if (counts.sicurezza === 0) alerts.push({ level: "warning", title: "Documenti sicurezza mancanti", desc: "Nessun documento caricato nella sezione Sicurezza" });
  if (counts.ambiente === 0) alerts.push({ level: "warning", title: "Documenti ambiente mancanti", desc: "Nessun documento caricato nella sezione Ambiente" });
  if (counts.cmeRows === 0) alerts.push({ level: "warning", title: "CME vuoto", desc: "Il computo metrico non contiene voci" });

  if (alerts.length === 0) alerts.push({ level: "ok", title: "Nessuna criticità rilevata", desc: "Tutti gli indicatori sono nella norma" });

  const handlePrint = () => window.print();

  /* ─── data summary rows ─── */
  const dataRows: { label: string; value: string }[] = [
    { label: "Commessa N.", value: commessa?.commessa_consortile || "—" },
    { label: "CUP", value: commessa?.cup || "—" },
    { label: "CIG", value: commessa?.cig || "—" },
    { label: "CIG Derivato", value: commessa?.cig_derivato || "—" },
    { label: "Committente", value: commessa?.committente || "—" },
    { label: "Oggetto dei lavori", value: commessa?.oggetto_lavori || "—" },
    { label: "Importo a base di gara", value: fmtCurrency(commessa?.importo_base_gara) },
    { label: "Ribasso %", value: commessa?.ribasso ? `${commessa.ribasso}%` : "—" },
    { label: "Importo contrattuale", value: fmtCurrency(importoContrattuale) },
    { label: "Oneri di sicurezza", value: fmtCurrency(commessa?.oneri_sicurezza) },
    { label: "Data del contratto", value: fmtDate(commessa?.data_contratto) },
    { label: "Data consegna lavori", value: fmtDate(commessa?.data_consegna_lavori) },
    { label: "Durata contrattuale", value: commessa?.durata_contrattuale ? `${commessa.durata_contrattuale} giorni` : "—" },
    { label: "Data scadenza contratto", value: fmtDate(commessa?.data_scadenza_contratto) },
    { label: "RUP", value: commessa?.rup || "—" },
    { label: "Direttore lavori", value: commessa?.direttore_lavori || "—" },
    { label: "Impresa consorziata", value: commessa?.impresa_assegnataria || "—" },
    { label: "Riferimenti fondi PNRR", value: commessa?.riferimenti_pnrr || "—" },
  ];

  if (totalProrogheDays > 0) {
    dataRows.push({ label: "Proroghe concesse", value: `${proroghe.length} (totale ${totalProrogheDays} giorni)` });
    const last = proroghe[proroghe.length - 1];
    if (last) dataRows.push({ label: "Nuova data fine (proroga)", value: fmtDate(last.nuova_data_fine) });
  }

  const handleExportPdf = async () => {
    const blob = await generateReportCommessaPdf({
      commessa,
      dataRows,
      counts,
      alerts,
      phaseData,
      economia: { importoBase, ribasso, importoContrattuale, oneriSicurezza, aggioPct, quotaConsorzio: quotaLavori, importoConsorziata, quotaServiziPct, quotaServizi },
    }, agisLogo);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Report_Commessa_${commessa?.commessa_consortile || "export"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <AppLayout>
      <div className="p-3 lg:p-4 max-w-full print:max-w-none print:p-0" ref={printRef}>
        <PageHeader
          title="Report di Commessa"
          description={commessa?.oggetto_lavori || "Riepilogo completo della commessa"}
          icon={FileBarChart}
          actions={
            <>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary-foreground hover:bg-white/20 print:hidden" onClick={handleExportPdf}>
                <Download className="w-3.5 h-3.5" /> Esporta PDF
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary-foreground hover:bg-white/20 print:hidden" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5" /> Stampa
              </Button>
            </>
          }
        />

        {/* ─── KPI ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          <KpiCard label="Avanzamento" value={`${counts.avgProgress}%`} icon={<TrendingUp className="w-5 h-5" />} color="text-accent" />
          <KpiCard label="Fasi" value={counts.phases} icon={<Calendar className="w-5 h-5" />} color="text-primary" />
          <KpiCard label="Documenti" value={counts.documents} icon={<FileText className="w-5 h-5" />} color="text-info" />
          <KpiCard label="Persone" value={counts.persons} icon={<Users className="w-5 h-5" />} color="text-primary" />
          <KpiCard label="Aziende" value={counts.companies} icon={<Building2 className="w-5 h-5" />} color="text-accent" />
          <KpiCard label="Voci CME" value={counts.cmeRows} icon={<BarChart3 className="w-5 h-5" />} color="text-info" />
        </div>

        {/* ─── Alerts ─── */}
        <Section title="Criticità e Alert" icon={<AlertTriangle className="w-4 h-4 text-warning" />} className="mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {alerts.map((a, i) => <AlertCard key={i} {...a} />)}
          </div>
        </Section>

        {/* ─── Dati commessa ─── */}
        <Section title="Dati della Commessa" icon={<Building2 className="w-4 h-4 text-primary" />} className="mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
            {dataRows.map((r) => (
              <div key={r.label} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{r.label}</span>
                <span className="text-sm font-medium text-foreground text-right">{r.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Progress chart ─── */}
        {phaseData.length > 0 && (
          <Section title="Avanzamento Lavori" icon={<TrendingUp className="w-4 h-4 text-accent" />} className="mb-5">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={phaseData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} fontSize={11} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="name" width={130} fontSize={10} stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: string) => v.length > 20 ? v.slice(0, 18) + "…" : v} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Avanzamento"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: "0.75rem" }} />
                  <Bar dataKey="progress" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {phaseData.map((e, i) => (
                      <Cell key={i} fill={e.progress >= 100 ? "hsl(var(--success))" : e.progress > 0 ? "hsl(var(--accent))" : "hsl(var(--muted))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}

        {/* ─── Economia ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Vista Consorzio */}
          <Section title="Economia — Vista Consorzio" icon={<Euro className="w-4 h-4 text-accent" />}>
            <div className="space-y-0">
              <EcoRow label="Importo a base di gara" value={fmtCurrency(importoBase)} />
              <EcoRow label={`Ribasso (${ribasso}%)`} value={fmtCurrency(-(importoBase * ribasso / 100))} negative />
              <EcoRow label="Importo contrattuale" value={fmtCurrency(importoContrattuale)} bold />
              <EcoRow label="Oneri di sicurezza" value={fmtCurrency(oneriSicurezza)} />
              <div className="border-t-2 border-border my-2" />
              <EcoRow label={`Quota lavori consorzio (${quotaLavoriPct}%)`} value={fmtCurrency(quotaLavori)} bold />
              {quotaServiziPct > 0 && (
                <EcoRow label={`Quota servizi tecnici (${quotaServiziPct}%)`} value={fmtCurrency(quotaServizi)} bold />
              )}
              <EcoRow label="Totale trattenute consorzio" value={fmtCurrency(totaleTrattenute)} negative={totaleTrattenute > 0} />
              <EcoRow label="Importo alla consorziata" value={fmtCurrency(importoConsorziata)} bold />
              <div className="border-t-2 border-border my-2" />
              <EcoRow label="Totale complessivo (contratto + oneri)" value={fmtCurrency(importoContrattuale + oneriSicurezza)} bold />
            </div>
          </Section>

          {/* Vista Consorziata / Esecutore */}
          <Section title="Economia — Vista Consorziata (Esecutore)" icon={<ArrowDownRight className="w-4 h-4 text-info" />}>
            <div className="space-y-0">
              <EcoRow label="Importo ricevuto dal consorzio" value={fmtCurrency(importoConsorziata)} />
              <EcoRow label="Oneri di sicurezza" value={fmtCurrency(oneriSicurezza)} />
              <div className="border-t-2 border-border my-2" />
              <p className="text-xs text-muted-foreground mb-2 italic">Costi stimati (da compilare nella sezione Economia)</p>
              <EcoRow label="Manodopera" value={fmtCurrency(0)} />
              <EcoRow label="Materiali" value={fmtCurrency(0)} />
              <EcoRow label="Noli e trasporti" value={fmtCurrency(0)} />
              <EcoRow label="Subappalti" value={fmtCurrency(0)} />
              <EcoRow label="Spese generali" value={fmtCurrency(0)} />
              <div className="border-t-2 border-border my-2" />
              <EcoRow label="Margine stimato" value={fmtCurrency(importoConsorziata)} bold />
            </div>
          </Section>
        </div>

        {/* ─── Verifica Documenti Indispensabili ─── */}
        {(checklistVerifica.length > 0 || checklistLoading) && (
          <Section title="Verifica Documenti Indispensabili (AI)" icon={<ClipboardCheck className="w-4 h-4 text-primary" />} className="mb-5">
            {checklistLoading ? (
              <div className="flex items-center gap-3 py-6 justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Analisi semantica dei documenti in corso...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {checklistVerifica.map((item) => (
                    <div key={item.nome} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                      {item.presente ? (
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <span className={cn("text-sm block", item.presente ? "text-foreground" : "text-destructive font-medium")}>
                          {item.nome}
                        </span>
                        {item.presente && item.matchedDocument && (
                          <span className="text-[11px] text-muted-foreground truncate block">
                            → {item.matchedDocument}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                  <Badge variant={checklistVerifica.every(i => i.presente) ? "default" : "destructive"} className="text-xs">
                    {checklistVerifica.filter(i => i.presente).length}/{checklistVerifica.length} presenti
                  </Badge>
                  {!checklistVerifica.every(i => i.presente) && (
                    <span className="text-xs text-destructive">
                      Mancano {checklistVerifica.filter(i => !i.presente).length} documenti indispensabili
                    </span>
                  )}
                </div>
              </>
            )}
          </Section>
        )}

        {/* ─── Conformità ─── */}
        <Section title="Stato Conformità" icon={<Shield className="w-4 h-4 text-destructive" />} className="mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Shield className={cn("w-5 h-5", counts.sicurezza > 0 ? "text-success" : "text-destructive")} />
              <div>
                <p className="text-sm font-medium text-foreground">Sicurezza</p>
                <p className="text-xs text-muted-foreground">{counts.sicurezza > 0 ? `${counts.sicurezza} documenti caricati` : "Nessun documento caricato"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Leaf className={cn("w-5 h-5", counts.ambiente > 0 ? "text-success" : "text-destructive")} />
              <div>
                <p className="text-sm font-medium text-foreground">Ambiente</p>
                <p className="text-xs text-muted-foreground">{counts.ambiente > 0 ? `${counts.ambiente} documenti caricati` : "Nessun documento caricato"}</p>
              </div>
            </div>
          </div>
        </Section>

        <p className="text-[10px] text-muted-foreground text-center py-4 print:py-2">
          Report generato il {new Date().toLocaleDateString("it-IT")} — Commessa {commessa?.commessa_consortile || commessa?.id}
        </p>
      </div>
    </AppLayout>
  );
}
