import { useState, useEffect } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { generateRapportoPdf, type RapportoData } from "@/lib/generateRapportoPdf";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { VoiceFieldButton } from "./VoiceFieldButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, Plus, Trash2, Save, FileText, Loader2, Link2,
} from "lucide-react";

interface Operaio {
  nome: string;
  qualifica: string;
  ore: string;
}

interface Materiale {
  fornitore: string;
  descrizione: string;
  ddt: string;
  quantita: string;
}

interface CmeRow {
  id: string;
  numero: string | null;
  codice: string | null;
  descrizione: string;
}

interface CronoPhase {
  id: string;
  name: string;
}

interface RapportoFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: string;
  onComplete: () => void;
}

const CONDIZIONI_METEO = [
  "Sereno", "Parzialmente nuvoloso", "Nuvoloso", "Pioggia leggera",
  "Pioggia forte", "Neve", "Nebbia", "Vento forte", "Temporale",
];

export function RapportoFormSheet({ open, onOpenChange, section, onComplete }: RapportoFormSheetProps) {
  const [data, setData] = useState<Date>(new Date());
  const [meteo, setMeteo] = useState("");
  const [temperatura, setTemperatura] = useState("");
  const [operai, setOperai] = useState<Operaio[]>([{ nome: "", qualifica: "", ore: "8" }]);
  const [lavorazioni, setLavorazioni] = useState("");
  const [materiali, setMateriali] = useState<Materiale[]>([{ fornitore: "", descrizione: "", ddt: "", quantita: "" }]);
  const [altriDocumenti, setAltriDocumenti] = useState("");
  const [note, setNote] = useState("");

  // CME & Crono linking
  const [cmeRows, setCmeRows] = useState<CmeRow[]>([]);
  const [cronoPhases, setCronoPhases] = useState<CronoPhase[]>([]);
  const [selectedCme, setSelectedCme] = useState<Set<string>>(new Set());
  const [selectedCrono, setSelectedCrono] = useState<Set<string>>(new Set());
  const [cmeSearch, setCmeSearch] = useState("");
  const [cronoSearch, setCronoSearch] = useState("");

  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    (async () => {
      const [cmeRes, cronoRes] = await Promise.all([
        supabase.from("cm_cme_rows").select("id, numero, codice, descrizione").order("sort_order"),
        supabase.from("cm_cronoprogramma_phases").select("id, name").order("sort_order"),
      ]);
      setCmeRows(cmeRes.data || []);
      setCronoPhases(cronoRes.data || []);
    })();
  }, [open]);

  const addOperaio = () => setOperai((p) => [...p, { nome: "", qualifica: "", ore: "8" }]);
  const removeOperaio = (i: number) => setOperai((p) => p.filter((_, idx) => idx !== i));
  const updateOperaio = (i: number, field: keyof Operaio, val: string) =>
    setOperai((p) => p.map((o, idx) => (idx === i ? { ...o, [field]: val } : o)));

  const addMateriale = () => setMateriali((p) => [...p, { fornitore: "", descrizione: "", ddt: "", quantita: "" }]);
  const removeMateriale = (i: number) => setMateriali((p) => p.filter((_, idx) => idx !== i));
  const updateMateriale = (i: number, field: keyof Materiale, val: string) =>
    setMateriali((p) => p.map((m, idx) => (idx === i ? { ...m, [field]: val } : m)));

  const appendToField = (setter: React.Dispatch<React.SetStateAction<string>>) => (text: string) => {
    setter((prev) => (prev ? prev + " " + text : text));
  };

  const buildFormData = (): RapportoData => ({
    data: format(data, "yyyy-MM-dd"),
    data_display: format(data, "dd/MM/yyyy"),
    condizioni_meteo: meteo,
    temperatura,
    operai: operai.filter((o) => o.nome.trim()),
    lavorazioni,
    materiali: materiali.filter((m) => m.descrizione.trim() || m.fornitore.trim()),
    altri_documenti: altriDocumenti,
    note,
    cme_ids: Array.from(selectedCme),
    crono_ids: Array.from(selectedCrono),
    cme_descrizioni: cmeRows.filter((r) => selectedCme.has(r.id)).map((r) => r.descrizione),
    crono_nomi: cronoPhases.filter((p) => selectedCrono.has(p.id)).map((p) => p.name),
  });

  const handleSave = async () => {
    if (!meteo && !lavorazioni) {
      toast({ title: "Compila almeno le condizioni meteo o le lavorazioni svolte", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const formData = buildFormData();
      const pdfBlob = await generateRapportoPdf(formData);
      const fileName = `Rapporto_${formData.data}_${Date.now()}.pdf`;
      const filePath = `${section}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("cm_documents")
        .upload(filePath, pdfBlob, { contentType: "application/pdf" });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("cm_documents").insert([{
        file_name: fileName,
        file_path: filePath,
        file_type: "application/pdf",
        file_size: pdfBlob.size,
        section,
        ai_status: "completed",
        ai_summary: `Rapporto giornaliero del ${formData.data_display}`,
        ai_extracted_data: formData as any,
      }]);
      if (insertError) throw insertError;

      toast({ title: "Rapporto salvato e PDF generato" });
      onOpenChange(false);
      onComplete();
    } catch (err: any) {
      console.error("Save error:", err);
      toast({ title: "Errore salvataggio", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filteredCme = cmeRows.filter((r) => {
    const q = cmeSearch.toLowerCase();
    return !q || r.descrizione.toLowerCase().includes(q) || r.codice?.toLowerCase().includes(q);
  });

  const filteredCrono = cronoPhases.filter((p) => {
    const q = cronoSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q);
  });

  const toggleCme = (id: string) => setSelectedCme((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleCrono = (id: string) => setSelectedCrono((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Nuovo Rapporto Giornaliero
          </SheetTitle>
          <SheetDescription>Compila i campi del rapporto. Usa il microfono per dettare.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-5 pb-4">
            {/* Data e Meteo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left text-xs h-9", !data && "text-muted-foreground")}>
                      <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                      {format(data, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={data} onSelect={(d) => d && setData(d)} locale={it} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Condizioni Meteo</Label>
                <Select value={meteo} onValueChange={setMeteo}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                  <SelectContent>
                    {CONDIZIONI_METEO.map((c) => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Temperatura (°C)</Label>
                <Input value={temperatura} onChange={(e) => setTemperatura(e.target.value)} placeholder="es. 22" className="h-9 text-xs" />
              </div>
            </div>

            <Separator />

            {/* Operai */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Operai Presenti</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addOperaio} className="h-7 text-xs gap-1">
                  <Plus className="w-3 h-3" /> Aggiungi
                </Button>
              </div>
              {operai.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 flex-1">
                    <Input placeholder="Nome" value={o.nome} onChange={(e) => updateOperaio(i, "nome", e.target.value)} className="h-8 text-xs" />
                    <VoiceFieldButton onTranscript={(t) => updateOperaio(i, "nome", o.nome ? o.nome + " " + t : t)} />
                  </div>
                  <Input placeholder="Qualifica" value={o.qualifica} onChange={(e) => updateOperaio(i, "qualifica", e.target.value)} className="h-8 text-xs w-28" />
                  <Input placeholder="Ore" value={o.ore} onChange={(e) => updateOperaio(i, "ore", e.target.value)} className="h-8 text-xs w-14" type="number" />
                  {operai.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeOperaio(i)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Lavorazioni */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Lavorazioni Svolte</Label>
                <VoiceFieldButton onTranscript={appendToField(setLavorazioni)} />
              </div>
              <Textarea value={lavorazioni} onChange={(e) => setLavorazioni(e.target.value)} placeholder="Descrivi le lavorazioni eseguite oggi..." rows={4} className="text-xs" />
            </div>

            <Separator />

            {/* Materiali */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Acquisti / Ricezione Materiali</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addMateriale} className="h-7 text-xs gap-1">
                  <Plus className="w-3 h-3" /> Aggiungi
                </Button>
              </div>
              {materiali.map((m, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-center">
                  <Input placeholder="Fornitore" value={m.fornitore} onChange={(e) => updateMateriale(i, "fornitore", e.target.value)} className="h-8 text-xs" />
                  <div className="flex items-center gap-1">
                    <Input placeholder="Descrizione materiale" value={m.descrizione} onChange={(e) => updateMateriale(i, "descrizione", e.target.value)} className="h-8 text-xs" />
                    <VoiceFieldButton onTranscript={(t) => updateMateriale(i, "descrizione", m.descrizione ? m.descrizione + " " + t : t)} />
                  </div>
                  <Input placeholder="DDT" value={m.ddt} onChange={(e) => updateMateriale(i, "ddt", e.target.value)} className="h-8 text-xs w-20" />
                  <Input placeholder="Qtà" value={m.quantita} onChange={(e) => updateMateriale(i, "quantita", e.target.value)} className="h-8 text-xs w-16" />
                  {materiali.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeMateriale(i)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Altri documenti */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Altri Documenti Acquisiti</Label>
                <VoiceFieldButton onTranscript={appendToField(setAltriDocumenti)} />
              </div>
              <Textarea value={altriDocumenti} onChange={(e) => setAltriDocumenti(e.target.value)} placeholder="Elenco altri documenti ricevuti o prodotti..." rows={2} className="text-xs" />
            </div>

            <Separator />

            {/* Note */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Note sull'Andamento dei Lavori</Label>
                <VoiceFieldButton onTranscript={appendToField(setNote)} />
              </div>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Osservazioni generali, problemi riscontrati, sospensioni..." rows={3} className="text-xs" />
            </div>

            <Separator />

            {/* CME Link */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Collega Voci CME
              </Label>
              <Input placeholder="Cerca per descrizione o codice..." value={cmeSearch} onChange={(e) => setCmeSearch(e.target.value)} className="h-8 text-xs" />
              <div className="max-h-36 overflow-y-auto border rounded-md p-1.5 space-y-0.5">
                {filteredCme.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Nessuna voce CME</p>
                ) : filteredCme.map((row) => (
                  <label key={row.id} className="flex items-start gap-2 p-1 rounded hover:bg-muted/30 cursor-pointer">
                    <Checkbox checked={selectedCme.has(row.id)} onCheckedChange={() => toggleCme(row.id)} className="mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        {row.numero && <span className="text-[10px] text-muted-foreground font-mono">{row.numero}</span>}
                        {row.codice && <span className="text-[10px] text-muted-foreground">[{row.codice}]</span>}
                      </div>
                      <p className="text-xs truncate">{row.descrizione}</p>
                    </div>
                  </label>
                ))}
              </div>
              {selectedCme.size > 0 && <p className="text-xs text-muted-foreground">{selectedCme.size} voci collegate</p>}
            </div>

            <Separator />

            {/* Cronoprogramma Link */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Collega Fasi Cronoprogramma
              </Label>
              <Input placeholder="Cerca fase..." value={cronoSearch} onChange={(e) => setCronoSearch(e.target.value)} className="h-8 text-xs" />
              <div className="max-h-36 overflow-y-auto border rounded-md p-1.5 space-y-0.5">
                {filteredCrono.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Nessuna fase</p>
                ) : filteredCrono.map((phase) => (
                  <label key={phase.id} className="flex items-center gap-2 p-1 rounded hover:bg-muted/30 cursor-pointer">
                    <Checkbox checked={selectedCrono.has(phase.id)} onCheckedChange={() => toggleCrono(phase.id)} />
                    <span className="text-xs">{phase.name}</span>
                  </label>
                ))}
              </div>
              {selectedCrono.size > 0 && <p className="text-xs text-muted-foreground">{selectedCrono.size} fasi collegate</p>}
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-2 w-full justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Annulla</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Salvataggio..." : "Salva e genera PDF"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
