import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentPreview } from "@/components/DocumentPreview";
import {
  HardHat, Plus, Trash2, ChevronDown, ChevronRight, Upload,
  CheckCircle2, Circle, FileText, Building2, Loader2, Pencil, X, Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCommessa } from "@/contexts/CommessaContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Standard CSE checklist for subcontractors
const DEFAULT_CSE_CHECKLIST = [
  "Autorizzazione al subappalto",
  "Contratto di subappalto",
  "Iscrizione CCIAA (visura camerale)",
  "DURC in corso di validità",
  "Attestazione SOA (se richiesta)",
  "DVR (Documento di Valutazione dei Rischi)",
  "POS (Piano Operativo di Sicurezza)",
  "Nomina RSPP",
  "Nomina RLS",
  "Nomina Medico Competente",
  "Nomina Preposto/i",
  "Idoneità sanitaria lavoratori",
  "Formazione sicurezza lavoratori (art. 37)",
  "Formazione specifica mansioni",
  "Patentini e abilitazioni attrezzature",
  "Libretti d'uso e manutenzione attrezzature",
  "Verifiche periodiche attrezzature",
  "Dichiarazione conformità impianti elettrici",
  "Assicurazione RCT/RCO",
  "Polizza infortuni",
  "DUVRI o sezione specifica PSC",
  "Elenco lavoratori impiegati",
  "Tessere di riconoscimento",
  "Certificazioni tecniche del personale",
  "Documentazione tecnica attrezzature",
];

interface Subappaltatore {
  id: string;
  commessa_id: string;
  nome: string;
  partita_iva?: string;
  codice_fiscale?: string;
  indirizzo?: string;
  telefono?: string;
  email?: string;
  pec?: string;
  lavorazioni?: string;
  note?: string;
  created_at: string;
}

interface ChecklistItem {
  id: string;
  subappaltatore_id: string;
  voce: string;
  completato: boolean;
  document_id?: string;
  note?: string;
  sort_order: number;
}

export default function SubappaltiPage() {
  const { commessaId } = useCommessa();
  const { toast } = useToast();
  const [subappaltatori, setSubappaltatori] = useState<Subappaltatore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Subappaltatore | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [deleteSub, setDeleteSub] = useState<Subappaltatore | null>(null);
  const [editingSub, setEditingSub] = useState<Subappaltatore | null>(null);
  const [newForm, setNewForm] = useState({ nome: "", partita_iva: "", lavorazioni: "", email: "", pec: "", telefono: "" });
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const fetchSubappaltatori = useCallback(async () => {
    if (!commessaId) return;
    setLoading(true);
    const { data } = await supabase
      .from("subappaltatori")
      .select("*")
      .eq("commessa_id", commessaId)
      .order("created_at", { ascending: true });
    setSubappaltatori((data as any[]) || []);
    setLoading(false);
  }, [commessaId]);

  useEffect(() => { fetchSubappaltatori(); }, [fetchSubappaltatori]);

  const fetchChecklist = useCallback(async (subId: string) => {
    setChecklistLoading(true);
    const { data } = await supabase
      .from("subappaltatore_checklist")
      .select("*")
      .eq("subappaltatore_id", subId)
      .order("sort_order", { ascending: true });
    setChecklist((data as any[]) || []);
    setChecklistLoading(false);
  }, []);

  const fetchDocuments = useCallback(async () => {
    if (!commessaId || !selectedSub) return;
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("commessa_id", commessaId)
      .eq("section", "subappalti")
      .eq("subfolder", selectedSub.id)
      .order("created_at", { ascending: false });
    setDocuments(data || []);
  }, [commessaId, selectedSub]);

  useEffect(() => {
    if (selectedSub) {
      fetchChecklist(selectedSub.id);
      fetchDocuments();
    } else {
      setChecklist([]);
      setDocuments([]);
    }
  }, [selectedSub, fetchChecklist, fetchDocuments]);

  const handleCreateSub = async () => {
    if (!commessaId || !newForm.nome.trim()) return;
    const { data: sub, error } = await supabase
      .from("subappaltatori")
      .insert({
        commessa_id: commessaId,
        nome: newForm.nome.trim(),
        partita_iva: newForm.partita_iva || null,
        lavorazioni: newForm.lavorazioni || null,
        email: newForm.email || null,
        pec: newForm.pec || null,
        telefono: newForm.telefono || null,
      } as any)
      .select()
      .single();

    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
      return;
    }

    // Create default checklist
    const items = DEFAULT_CSE_CHECKLIST.map((voce, i) => ({
      subappaltatore_id: (sub as any).id,
      voce,
      sort_order: i,
    }));
    await supabase.from("subappaltatore_checklist").insert(items as any);

    toast({ title: "Subappaltatore aggiunto" });
    setShowNewDialog(false);
    setNewForm({ nome: "", partita_iva: "", lavorazioni: "", email: "", pec: "", telefono: "" });
    fetchSubappaltatori();
    setSelectedSub(sub as any);
  };

  const handleDeleteSub = async () => {
    if (!deleteSub) return;
    // Delete associated documents from storage
    const { data: docs } = await supabase
      .from("documents")
      .select("file_path")
      .eq("section", "subappalti")
      .eq("subfolder", deleteSub.id);
    if (docs?.length) {
      await supabase.storage.from("documents").remove(docs.map(d => d.file_path));
    }
    await supabase.from("documents").delete().eq("section", "subappalti").eq("subfolder", deleteSub.id);
    await supabase.from("subappaltatori").delete().eq("id", deleteSub.id);
    if (selectedSub?.id === deleteSub.id) setSelectedSub(null);
    setDeleteSub(null);
    toast({ title: "Subappaltatore eliminato" });
    fetchSubappaltatori();
  };

  const toggleChecklistItem = async (item: ChecklistItem) => {
    const newVal = !item.completato;
    await supabase
      .from("subappaltatore_checklist")
      .update({ completato: newVal } as any)
      .eq("id", item.id);
    setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, completato: newVal } : c));
  };

  const linkDocumentToChecklist = async (checklistItemId: string, documentId: string | null) => {
    await supabase
      .from("subappaltatore_checklist")
      .update({ document_id: documentId, completato: !!documentId } as any)
      .eq("id", checklistItemId);
    setChecklist(prev =>
      prev.map(c => c.id === checklistItemId ? { ...c, document_id: documentId || undefined, completato: !!documentId } : c)
    );
  };

  const handleUpdateSub = async () => {
    if (!editingSub) return;
    const { error } = await supabase
      .from("subappaltatori")
      .update({
        nome: editingSub.nome,
        partita_iva: editingSub.partita_iva,
        lavorazioni: editingSub.lavorazioni,
        email: editingSub.email,
        pec: editingSub.pec,
        telefono: editingSub.telefono,
        note: editingSub.note,
      } as any)
      .eq("id", editingSub.id);
    if (!error) {
      toast({ title: "Dati aggiornati" });
      fetchSubappaltatori();
      if (selectedSub?.id === editingSub.id) setSelectedSub(editingSub);
    }
    setEditingSub(null);
  };

  const completedCount = checklist.filter(c => c.completato).length;
  const totalCount = checklist.length;

  const handleDeleteDoc = async (id: string, filePath: string) => {
    await supabase.storage.from("documents").remove([filePath]);
    await supabase.from("documents").delete().eq("id", id);
    // Unlink from checklist
    const linked = checklist.filter(c => c.document_id === id);
    for (const item of linked) {
      await linkDocumentToChecklist(item.id, null);
    }
    if (selectedDoc?.id === id) setSelectedDoc(null);
    toast({ title: "Documento eliminato" });
    fetchDocuments();
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh)] overflow-hidden">
        {/* Left panel - subcontractors list */}
        <div className="w-[320px] border-r border-border flex flex-col flex-shrink-0 bg-muted/30">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HardHat className="w-4 h-4 text-primary" />
              Subappaltatori
            </h2>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowNewDialog(true)}>
              <Plus className="w-3 h-3" /> Nuovo
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground text-xs">Caricamento...</div>
            ) : subappaltatori.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Nessun subappaltatore.
                <br />Clicca "Nuovo" per aggiungerne uno.
              </div>
            ) : (
              subappaltatori.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSub(sub)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors text-sm",
                    selectedSub?.id === sub.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted border border-transparent"
                  )}
                >
                  <div className="font-medium text-foreground truncate">{sub.nome}</div>
                  {sub.lavorazioni && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{sub.lavorazioni}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel - checklist & documents */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedSub ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <HardHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                Seleziona un subappaltatore per visualizzare<br />la checklist CSE e i documenti
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-3 lg:p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{selectedSub.nome}</h2>
                    {selectedSub.lavorazioni && (
                      <p className="text-sm text-muted-foreground">{selectedSub.lavorazioni}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={completedCount === totalCount && totalCount > 0 ? "default" : "secondary"} className="text-xs">
                      {completedCount}/{totalCount} completati
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setEditingSub({ ...selectedSub })}>
                      <Pencil className="w-3 h-3" /> Modifica
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => setDeleteSub(selectedSub)}>
                      <Trash2 className="w-3 h-3" /> Elimina
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-4">
                {/* Upload area */}
                <DocumentUpload
                  section="subappalti"
                  commessaId={commessaId}
                  onUploadComplete={fetchDocuments}
                  compact
                  subfolder={selectedSub.id}
                />

                {/* Checklist CSE */}
                <Accordion type="single" defaultValue="checklist" collapsible>
                  <AccordionItem value="checklist" className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">Checklist CSE</span>
                        <Badge variant="outline" className="text-xs ml-2">
                          {completedCount}/{totalCount}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-4 pb-3 space-y-1">
                        {checklistLoading ? (
                          <div className="text-center py-4 text-muted-foreground text-xs">
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          </div>
                        ) : (
                          checklist.map(item => (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-center gap-3 py-2 px-2 rounded-md transition-colors group",
                                item.completato ? "bg-primary/5" : "hover:bg-muted/50"
                              )}
                            >
                              <Checkbox
                                checked={item.completato}
                                onCheckedChange={() => toggleChecklistItem(item)}
                              />
                              <span className={cn(
                                "flex-1 text-sm",
                                item.completato && "text-muted-foreground line-through"
                              )}>
                                {item.voce}
                              </span>
                              {item.document_id ? (
                                <Badge variant="outline" className="text-xs gap-1 cursor-pointer" onClick={() => {
                                  const doc = documents.find(d => d.id === item.document_id);
                                  if (doc) setSelectedDoc(doc);
                                }}>
                                  <FileText className="w-3 h-3" /> Allegato
                                </Badge>
                              ) : (
                                <select
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs border rounded px-1.5 py-0.5 bg-background"
                                  value=""
                                  onChange={(e) => {
                                    if (e.target.value) linkDocumentToChecklist(item.id, e.target.value);
                                  }}
                                >
                                  <option value="">Collega doc...</option>
                                  {documents.map(d => (
                                    <option key={d.id} value={d.id}>{d.file_name}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Documents list */}
                {documents.length > 0 && (
                  <div className="border rounded-lg">
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Documenti caricati ({documents.length})
                      </h3>
                    </div>
                    <div className="divide-y divide-border">
                      {documents.map(doc => (
                        <div
                          key={doc.id}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors",
                            selectedDoc?.id === doc.id && "bg-primary/5"
                          )}
                          onClick={() => setSelectedDoc(doc)}
                        >
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{doc.file_name}</div>
                            {doc.ai_summary && (
                              <div className="text-xs text-muted-foreground truncate">{doc.ai_summary}</div>
                            )}
                          </div>
                          <Badge variant={doc.ai_status === "completed" ? "default" : "secondary"} className="text-[10px] flex-shrink-0">
                            {doc.ai_status === "completed" ? "Analizzato" : doc.ai_status === "processing" ? "In analisi..." : "Errore"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id, doc.file_path); }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document preview */}
                {selectedDoc && (
                  <div className="border rounded-lg overflow-hidden">
                    <DocumentPreview document={selectedDoc} onClose={() => setSelectedDoc(null)} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* New subcontractor dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Subappaltatore</DialogTitle>
            <DialogDescription>Inserisci i dati del subappaltatore. La checklist CSE verrà creata automaticamente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Ragione sociale *" value={newForm.nome} onChange={e => setNewForm(p => ({ ...p, nome: e.target.value }))} />
            <Input placeholder="P. IVA" value={newForm.partita_iva} onChange={e => setNewForm(p => ({ ...p, partita_iva: e.target.value }))} />
            <Input placeholder="Lavorazioni affidate" value={newForm.lavorazioni} onChange={e => setNewForm(p => ({ ...p, lavorazioni: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Email" value={newForm.email} onChange={e => setNewForm(p => ({ ...p, email: e.target.value }))} />
              <Input placeholder="PEC" value={newForm.pec} onChange={e => setNewForm(p => ({ ...p, pec: e.target.value }))} />
            </div>
            <Input placeholder="Telefono" value={newForm.telefono} onChange={e => setNewForm(p => ({ ...p, telefono: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Annulla</Button>
            <Button onClick={handleCreateSub} disabled={!newForm.nome.trim()}>Crea</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingSub} onOpenChange={(open) => { if (!open) setEditingSub(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Subappaltatore</DialogTitle>
          </DialogHeader>
          {editingSub && (
            <div className="space-y-3">
              <Input placeholder="Ragione sociale *" value={editingSub.nome} onChange={e => setEditingSub(p => p ? { ...p, nome: e.target.value } : null)} />
              <Input placeholder="P. IVA" value={editingSub.partita_iva || ""} onChange={e => setEditingSub(p => p ? { ...p, partita_iva: e.target.value } : null)} />
              <Input placeholder="Lavorazioni affidate" value={editingSub.lavorazioni || ""} onChange={e => setEditingSub(p => p ? { ...p, lavorazioni: e.target.value } : null)} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Email" value={editingSub.email || ""} onChange={e => setEditingSub(p => p ? { ...p, email: e.target.value } : null)} />
                <Input placeholder="PEC" value={editingSub.pec || ""} onChange={e => setEditingSub(p => p ? { ...p, pec: e.target.value } : null)} />
              </div>
              <Input placeholder="Telefono" value={editingSub.telefono || ""} onChange={e => setEditingSub(p => p ? { ...p, telefono: e.target.value } : null)} />
              <Textarea placeholder="Note" value={editingSub.note || ""} onChange={e => setEditingSub(p => p ? { ...p, note: e.target.value } : null)} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSub(null)}>Annulla</Button>
            <Button onClick={handleUpdateSub}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteSub} onOpenChange={(open) => { if (!open) setDeleteSub(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare {deleteSub?.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              Verranno eliminati anche tutti i documenti e la checklist associati. Questa azione è irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSub} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
