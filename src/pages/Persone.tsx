import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Users, Mail, Phone, Smartphone, Shield, MapPin, Building2, Briefcase, Search, X, Trash2, RefreshCw, ArrowRightLeft, Check, SkipForward } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCommessa } from "@/contexts/CommessaContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { invokeWithRetry } from "@/lib/invokeWithRetry";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface Person {
  id: string;
  nome: string;
  ruolo: string | null;
  azienda: string | null;
  email: string | null;
  telefono: string | null;
  cellulare: string | null;
  pec: string | null;
  indirizzo: string | null;
  note: string | null;
  source_document_ids: string[] | null;
  created_at: string;
}

interface DuplicateContact {
  nome: string;
  ruolo?: string;
  azienda?: string;
  email?: string;
  telefono?: string;
  cellulare?: string;
  pec?: string;
  indirizzo?: string;
  note?: string;
  existing_id?: string;
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

const contactFields: { key: keyof Person; label: string; icon: React.ElementType }[] = [
  { key: "ruolo", label: "Ruolo", icon: Briefcase },
  { key: "azienda", label: "Azienda", icon: Building2 },
  { key: "email", label: "Email", icon: Mail },
  { key: "telefono", label: "Telefono", icon: Phone },
  { key: "cellulare", label: "Cellulare", icon: Smartphone },
  { key: "pec", label: "PEC", icon: Shield },
  { key: "indirizzo", label: "Indirizzo", icon: MapPin },
];

const COMPARE_FIELDS = ["ruolo", "azienda", "email", "telefono", "cellulare", "pec", "indirizzo"] as const;

export default function PersonePage() {
  const { commessaId } = useCommessa();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [scanning, setScanning] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateContact[]>([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<number>>(new Set());
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [updatingDuplicates, setUpdatingDuplicates] = useState(false);
  const { toast } = useToast();

  const handleScanDocuments = async () => {
    if (!commessaId) return;
    setScanning(true);
    try {
      const { data, error } = await invokeWithRetry<{
        found?: number;
        inserted?: number;
        duplicates?: DuplicateContact[];
        message?: string;
        error?: string;
      }>("extract-contacts", { body: { commessa_id: commessaId } });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Show results
      const inserted = data?.inserted || 0;
      if (inserted > 0) {
        toast({ title: `${inserted} nuovi contatti aggiunti` });
      }

      // Handle duplicates
      const dupes = data?.duplicates || [];
      if (dupes.length > 0) {
        setDuplicates(dupes);
        setSelectedDuplicates(new Set(dupes.map((_, i) => i))); // Select all by default
        setShowDuplicateDialog(true);
      } else if (inserted === 0) {
        toast({ title: "Nessun nuovo contatto trovato", description: data?.message });
      }

      fetchPersons();
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
        if (dup[field as keyof DuplicateContact]) {
          updateData[field] = dup[field as keyof DuplicateContact];
        }
      }
      if (dup.note) updateData.note = dup.note;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from("persons")
          .update(updateData)
          .eq("id", dup.existing_id);
        if (!error) updated++;
      }
    }

    toast({
      title: updated > 0 ? `${updated} contatti aggiornati` : "Nessun aggiornamento effettuato",
    });
    setShowDuplicateDialog(false);
    setDuplicates([]);
    setSelectedDuplicates(new Set());
    fetchPersons();
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

  const fetchPersons = useCallback(async () => {
    if (!commessaId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('persons').select('*')
      .eq('commessa_id', commessaId)
      .order('nome', { ascending: true });
    if (!error) setPersons((data as Person[]) || []);
    setLoading(false);
  }, [commessaId]);

  useEffect(() => { fetchPersons(); }, [fetchPersons]);

  const handleDelete = async (id: string) => {
    await supabase.from('persons').delete().eq('id', id);
    if (selectedPerson?.id === id) setSelectedPerson(null);
    toast({ title: "Persona eliminata" });
    fetchPersons();
  };

  const filtered = search.trim()
    ? persons.filter(p =>
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        (p.ruolo || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.azienda || "").toLowerCase().includes(search.toLowerCase())
      )
    : persons;

  // Find existing person data for comparison
  const getExistingPerson = (name: string) =>
    persons.find(p => p.nome.toLowerCase().trim() === name.toLowerCase().trim());

  return (
    <AppLayout>
      <div className="p-3 lg:p-4 max-w-full space-y-4">
        <PageHeader
          title="Persone"
          icon={Users}
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
              placeholder="Cerca per nome, ruolo o azienda..."
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
          <span className="text-sm text-muted-foreground">{filtered.length} persone</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Caricamento...</div>
        ) : persons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nessuna persona trovata. Le persone verranno estratte automaticamente dai documenti caricati.
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Nessun risultato per "{search}"</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((person) => (
              <div
                key={person.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
                onClick={() => setSelectedPerson(person)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {getInitials(person.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-card-foreground truncate">{person.nome}</h3>
                    {person.ruolo && <p className="text-xs text-muted-foreground truncate">{person.ruolo}</p>}
                    {person.azienda && <p className="text-xs text-accent truncate">{person.azienda}</p>}
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {person.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{person.email}</span>
                    </div>
                  )}
                  {person.cellulare && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Smartphone className="w-3 h-3 flex-shrink-0" />
                      <span>{person.cellulare}</span>
                    </div>
                  )}
                  {person.telefono && !person.cellulare && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{person.telefono}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Person detail dialog */}
        <Dialog open={!!selectedPerson} onOpenChange={(open) => !open && setSelectedPerson(null)}>
          {selectedPerson && (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                    {getInitials(selectedPerson.nome)}
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{selectedPerson.nome}</DialogTitle>
                    {selectedPerson.ruolo && (
                      <p className="text-sm text-muted-foreground">{selectedPerson.ruolo}</p>
                    )}
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                {contactFields.map(({ key, label, icon: Icon }) => {
                  const val = selectedPerson[key];
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
                {selectedPerson.note && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Note</p>
                    <p className="text-sm text-card-foreground">{selectedPerson.note}</p>
                  </div>
                )}
                {selectedPerson.source_document_ids && selectedPerson.source_document_ids.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Citata in {selectedPerson.source_document_ids.length} documento/i
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => { handleDelete(selectedPerson.id); }}
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
                Contatti già presenti
              </DialogTitle>
              <DialogDescription>
                {duplicates.length} contatti trovati nei documenti sono già nella rubrica. Seleziona quelli da aggiornare con i nuovi dati.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 py-2">
                {duplicates.map((dup, idx) => {
                  const existing = getExistingPerson(dup.nome);
                  const isSelected = selectedDuplicates.has(idx);
                  const newFields = COMPARE_FIELDS.filter(f => {
                    const newVal = dup[f as keyof DuplicateContact];
                    const oldVal = existing?.[f as keyof Person];
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
                                const label = contactFields.find(c => c.key === field)?.label || field;
                                const oldVal = existing?.[field as keyof Person] as string | null;
                                const newVal = dup[field as keyof DuplicateContact] as string;
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
                {updatingDuplicates
                  ? "Aggiornamento..."
                  : `Aggiorna ${selectedDuplicates.size} selezionati`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
