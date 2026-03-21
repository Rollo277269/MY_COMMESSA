import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import {
  Building2, Mail, Phone, MapPin, Globe, Shield, Search, X, Trash2,
  RefreshCw, ArrowRightLeft, Check, SkipForward, FileText, Briefcase
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCommessa } from "@/contexts/CommessaContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { invokeWithRetry } from "@/lib/invokeWithRetry";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface Azienda {
  id: string;
  nome: string;
  tipo: string | null;
  partita_iva: string | null;
  codice_fiscale: string | null;
  indirizzo: string | null;
  citta: string | null;
  provincia: string | null;
  cap: string | null;
  telefono: string | null;
  email: string | null;
  pec: string | null;
  sito_web: string | null;
  note: string | null;
  source_document_ids: string[] | null;
  created_at: string;
}

interface DuplicateCompany {
  nome: string;
  tipo?: string;
  partita_iva?: string;
  codice_fiscale?: string;
  indirizzo?: string;
  citta?: string;
  provincia?: string;
  cap?: string;
  telefono?: string;
  email?: string;
  pec?: string;
  sito_web?: string;
  note?: string;
  existing_id?: string;
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

const TIPO_LABELS: Record<string, string> = {
  committente: "Committente",
  fornitore: "Fornitore",
  subappaltatore: "Subappaltatore",
  impresa: "Impresa",
  consorzio: "Consorzio",
  ente: "Ente",
  professionista: "Professionista",
  altro: "Altro",
};

const companyFields: { key: keyof Azienda; label: string; icon: React.ElementType }[] = [
  { key: "tipo", label: "Tipo", icon: Briefcase },
  { key: "partita_iva", label: "P. IVA", icon: FileText },
  { key: "codice_fiscale", label: "C.F.", icon: FileText },
  { key: "email", label: "Email", icon: Mail },
  { key: "pec", label: "PEC", icon: Shield },
  { key: "telefono", label: "Telefono", icon: Phone },
  { key: "indirizzo", label: "Indirizzo", icon: MapPin },
  { key: "sito_web", label: "Sito Web", icon: Globe },
];

const COMPARE_FIELDS = ["tipo", "partita_iva", "codice_fiscale", "indirizzo", "citta", "provincia", "cap", "telefono", "email", "pec", "sito_web"] as const;

export default function AziendePage() {
  const { commessaId } = useCommessa();
  const [aziende, setAziende] = useState<Azienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);
  const [scanning, setScanning] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateCompany[]>([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<number>>(new Set());
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [updatingDuplicates, setUpdatingDuplicates] = useState(false);
  const { toast } = useToast();

  const fetchAziende = useCallback(async () => {
    if (!commessaId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("aziende")
      .select("*")
      .eq("commessa_id", commessaId)
      .order("nome", { ascending: true });
    if (!error) setAziende((data as Azienda[]) || []);
    setLoading(false);
  }, [commessaId]);

  useEffect(() => { fetchAziende(); }, [fetchAziende]);

  const handleScanDocuments = async () => {
    if (!commessaId) return;
    setScanning(true);
    try {
      const { data, error } = await invokeWithRetry<{
        found?: number;
        inserted?: number;
        duplicates?: DuplicateCompany[];
        message?: string;
        error?: string;
      }>("extract-companies", { body: { commessa_id: commessaId } });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const inserted = data?.inserted || 0;
      if (inserted > 0) {
        toast({ title: `${inserted} nuove aziende aggiunte` });
      }

      const dupes = data?.duplicates || [];
      if (dupes.length > 0) {
        setDuplicates(dupes);
        setSelectedDuplicates(new Set(dupes.map((_, i) => i)));
        setShowDuplicateDialog(true);
      } else if (inserted === 0) {
        toast({ title: "Nessuna nuova azienda trovata", description: data?.message });
      }

      fetchAziende();
    } catch (err: any) {
      toast({ title: "Errore scansione", description: err.message, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  };

  const handleUpdateDuplicates = async () => {
    setUpdatingDuplicates(true);
    let updated = 0;

    for (const idx of selectedDuplicates) {
      const dup = duplicates[idx];
      if (!dup?.existing_id) continue;

      const updateData: Record<string, any> = {};
      for (const field of COMPARE_FIELDS) {
        if (dup[field as keyof DuplicateCompany]) {
          updateData[field] = dup[field as keyof DuplicateCompany];
        }
      }
      if (dup.note) updateData.note = dup.note;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from("aziende")
          .update(updateData)
          .eq("id", dup.existing_id);
        if (!error) updated++;
      }
    }

    toast({
      title: updated > 0 ? `${updated} aziende aggiornate` : "Nessun aggiornamento effettuato",
    });
    setShowDuplicateDialog(false);
    setDuplicates([]);
    setSelectedDuplicates(new Set());
    fetchAziende();
    setUpdatingDuplicates(false);
  };

  const toggleDuplicate = (idx: number) => {
    setSelectedDuplicates(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("aziende").delete().eq("id", id);
    if (selectedAzienda?.id === id) setSelectedAzienda(null);
    toast({ title: "Azienda eliminata" });
    fetchAziende();
  };

  const filtered = search.trim()
    ? aziende.filter(a =>
        a.nome.toLowerCase().includes(search.toLowerCase()) ||
        (a.tipo || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.partita_iva || "").includes(search)
      )
    : aziende;

  const getExistingCompany = (name: string) =>
    aziende.find(a => a.nome.toLowerCase().trim() === name.toLowerCase().trim());

  const formatAddress = (a: Azienda | DuplicateCompany) => {
    const parts = [
      (a as any).indirizzo,
      (a as any).cap,
      (a as any).citta,
      (a as any).provincia ? `(${(a as any).provincia})` : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  return (
    <AppLayout>
      <div className="p-3 lg:p-4 max-w-full space-y-4">
        <PageHeader
          title="Aziende"
          icon={Building2}
          actions={
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={handleScanDocuments}
              disabled={scanning}
            >
              <RefreshCw className={cn("h-4 w-4", scanning && "animate-spin")} />
              {scanning ? "Scansione..." : "Aggiorna da documenti"}
            </Button>
          }
        />

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome, tipo o P.IVA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-sm text-muted-foreground">{filtered.length} aziende</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Caricamento...</div>
        ) : aziende.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nessuna azienda trovata. Clicca "Aggiorna da documenti" per estrarre le aziende dai documenti caricati.
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Nessun risultato per "{search}"</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((azienda) => (
              <div
                key={azienda.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
                onClick={() => setSelectedAzienda(azienda)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {getInitials(azienda.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-card-foreground truncate">{azienda.nome}</h3>
                    {azienda.tipo && (
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {TIPO_LABELS[azienda.tipo] || azienda.tipo}
                      </Badge>
                    )}
                    {azienda.partita_iva && <p className="text-xs text-muted-foreground mt-0.5">P.IVA: {azienda.partita_iva}</p>}
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {azienda.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{azienda.email}</span>
                    </div>
                  )}
                  {azienda.telefono && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{azienda.telefono}</span>
                    </div>
                  )}
                  {(azienda.citta || azienda.indirizzo) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{azienda.citta || azienda.indirizzo}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail dialog */}
        <Dialog open={!!selectedAzienda} onOpenChange={(open) => !open && setSelectedAzienda(null)}>
          {selectedAzienda && (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center text-lg font-bold">
                    {getInitials(selectedAzienda.nome)}
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{selectedAzienda.nome}</DialogTitle>
                    {selectedAzienda.tipo && (
                      <Badge variant="outline" className="text-xs mt-0.5">
                        {TIPO_LABELS[selectedAzienda.tipo] || selectedAzienda.tipo}
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                {companyFields.map(({ key, label, icon: Icon }) => {
                  let val = selectedAzienda[key];
                  if (key === "tipo") val = TIPO_LABELS[val as string] || val;
                  if (key === "indirizzo") {
                    const addr = formatAddress(selectedAzienda);
                    if (!addr) return null;
                    val = addr;
                  }
                  if (!val) return null;
                  return (
                    <div key={key} className="flex items-start gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                        <p className="text-sm text-card-foreground">{String(val)}</p>
                      </div>
                    </div>
                  );
                })}
                {selectedAzienda.codice_fiscale && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Codice Fiscale</p>
                      <p className="text-sm text-card-foreground">{selectedAzienda.codice_fiscale}</p>
                    </div>
                  </div>
                )}
                {selectedAzienda.note && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Note</p>
                    <p className="text-sm text-card-foreground">{selectedAzienda.note}</p>
                  </div>
                )}
                {selectedAzienda.source_document_ids && selectedAzienda.source_document_ids.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Citata in {selectedAzienda.source_document_ids.length} documento/i
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(selectedAzienda.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Elimina
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* Duplicate resolution dialog */}
        <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
          <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                Aziende già presenti
              </DialogTitle>
              <DialogDescription>
                {duplicates.length} aziende trovate nei documenti sono già nell'anagrafica. Seleziona quelle da aggiornare con i nuovi dati.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 py-2">
                {duplicates.map((dup, idx) => {
                  const existing = getExistingCompany(dup.nome);
                  const isSelected = selectedDuplicates.has(idx);
                  const newFields = COMPARE_FIELDS.filter(f => {
                    const newVal = dup[f as keyof DuplicateCompany];
                    const oldVal = existing?.[f as keyof Azienda];
                    return newVal && newVal !== oldVal;
                  });

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "border rounded-lg p-3 transition-colors cursor-pointer",
                        isSelected ? "border-primary bg-primary/5" : "border-border"
                      )}
                      onClick={() => toggleDuplicate(idx)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleDuplicate(idx)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{dup.nome}</span>
                            {newFields.length > 0 ? (
                              <Badge variant="secondary" className="text-xs">
                                {newFields.length} aggiornamenti
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Nessuna novità</Badge>
                            )}
                          </div>

                          {newFields.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              {newFields.map(field => {
                                const label = companyFields.find(c => c.key === field)?.label || field;
                                const oldVal = existing?.[field as keyof Azienda] as string | null;
                                const newVal = dup[field as keyof DuplicateCompany] as string;
                                return (
                                  <div key={field} className="text-xs grid grid-cols-[80px_1fr] gap-1">
                                    <span className="text-muted-foreground font-medium">{label}:</span>
                                    <div>
                                      {oldVal && (
                                        <span className="line-through text-muted-foreground mr-1">{oldVal}</span>
                                      )}
                                      <span className="text-primary font-medium">{newVal}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => { setShowDuplicateDialog(false); setDuplicates([]); }}
                disabled={updatingDuplicates}
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Salta tutti
              </Button>
              <Button
                onClick={handleUpdateDuplicates}
                disabled={selectedDuplicates.size === 0 || updatingDuplicates}
              >
                <Check className="h-4 w-4 mr-1" />
                {updatingDuplicates ? "Aggiornamento..." : `Aggiorna ${selectedDuplicates.size} selezionati`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
