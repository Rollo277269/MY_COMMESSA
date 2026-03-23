import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { CalendarDays, Plus, Search, Trash2, Pencil, FileText, ArrowUpDown, Filter, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCommessa } from "@/contexts/CommessaContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Evento = {
  id: string;
  cm_commessa_id: string | null;
  data_evento: string;
  titolo: string;
  descrizione: string | null;
  tipo: string;
  protocollo: string | null;
  mittente: string | null;
  destinatario: string | null;
  mezzo: string | null;
  document_id: string | null;
  created_at: string;
  updated_at: string;
};

const TIPI_EVENTO = [
  { value: "evento", label: "Evento" },
  { value: "corrispondenza_in", label: "Corrispondenza in entrata" },
  { value: "corrispondenza_out", label: "Corrispondenza in uscita" },
  { value: "pec_in", label: "PEC in entrata" },
  { value: "pec_out", label: "PEC in uscita" },
  { value: "email_in", label: "Email in entrata" },
  { value: "email_out", label: "Email in uscita" },
  { value: "verbale", label: "Verbale" },
  { value: "determina", label: "Determina" },
  { value: "ordinanza", label: "Ordinanza" },
  { value: "atto", label: "Atto" },
];

const MEZZI = [
  { value: "pec", label: "PEC" },
  { value: "email", label: "Email" },
  { value: "raccomandata", label: "Raccomandata" },
  { value: "consegna_mano", label: "Consegna a mano" },
  { value: "portale", label: "Portale" },
  { value: "altro", label: "Altro" },
];

const tipoLabel = (tipo: string) => TIPI_EVENTO.find(t => t.value === tipo)?.label || tipo;

const tipoBadgeVariant = (tipo: string): "default" | "secondary" | "destructive" | "outline" => {
  if (tipo.includes("pec")) return "destructive";
  if (tipo.includes("email")) return "default";
  if (tipo.includes("corrispondenza")) return "secondary";
  return "outline";
};

const emptyEvento = (): Partial<Evento> => ({
  data_evento: new Date().toISOString().split("T")[0],
  titolo: "",
  descrizione: "",
  tipo: "evento",
  protocollo: "",
  mittente: "",
  destinatario: "",
  mezzo: "",
  document_id: null,
});

type SortKey = "data_evento" | "titolo" | "tipo" | "protocollo";

export default function EventiPage() {
  const { commessaId } = useCommessa();
  const { toast } = useToast();
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [documents, setDocuments] = useState<{ id: string; file_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("data_evento");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editEvento, setEditEvento] = useState<Partial<Evento>>(emptyEvento());
  const [saving, setSaving] = useState(false);

  const fetchEventi = useCallback(async () => {
    if (!commessaId) return;
    setLoading(true);
    const { data } = await supabase
      .from("cm_eventi_commessa")
      .select("*")
      .eq("cm_commessa_id", commessaId)
      .order("data_evento", { ascending: false });
    setEventi((data as Evento[]) || []);
    setLoading(false);
  }, [commessaId]);

  const fetchDocuments = useCallback(async () => {
    if (!commessaId) return;
    const { data } = await supabase
      .from("cm_documents")
      .select("id, file_name")
      .eq("cm_commessa_id", commessaId)
      .order("file_name");
    setDocuments(data || []);
  }, [commessaId]);

  useEffect(() => { fetchEventi(); fetchDocuments(); }, [fetchEventi, fetchDocuments]);

  const handleSave = async () => {
    if (!editEvento.titolo?.trim() || !commessaId) return;
    setSaving(true);
    const payload = {
      cm_commessa_id: commessaId,
      data_evento: editEvento.data_evento,
      titolo: editEvento.titolo!.trim(),
      descrizione: editEvento.descrizione || null,
      tipo: editEvento.tipo || "evento",
      protocollo: editEvento.protocollo || null,
      mittente: editEvento.mittente || null,
      destinatario: editEvento.destinatario || null,
      mezzo: editEvento.mezzo || null,
      document_id: editEvento.document_id || null,
    };

    if (editEvento.id) {
      await supabase.from("cm_eventi_commessa").update(payload).eq("id", editEvento.id);
      toast({ title: "Evento aggiornato" });
    } else {
      await supabase.from("cm_eventi_commessa").insert(payload);
      toast({ title: "Evento creato" });
    }
    setSaving(false);
    setSheetOpen(false);
    setEditEvento(emptyEvento());
    fetchEventi();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("cm_eventi_commessa").delete().eq("id", id);
    toast({ title: "Evento eliminato" });
    fetchEventi();
  };

  const openEdit = (evento: Evento) => {
    setEditEvento({ ...evento });
    setSheetOpen(true);
  };

  const openNew = () => {
    setEditEvento(emptyEvento());
    setSheetOpen(true);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  // Filter & sort
  let filtered = eventi;
  if (filterTipo !== "all") filtered = filtered.filter(e => e.tipo === filterTipo);
  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(e =>
      e.titolo.toLowerCase().includes(s) ||
      (e.descrizione || "").toLowerCase().includes(s) ||
      (e.protocollo || "").toLowerCase().includes(s) ||
      (e.mittente || "").toLowerCase().includes(s) ||
      (e.destinatario || "").toLowerCase().includes(s)
    );
  }
  filtered = [...filtered].sort((a, b) => {
    const va = (a as any)[sortKey] || "";
    const vb = (b as any)[sortKey] || "";
    return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const docName = (docId: string | null) => {
    if (!docId) return null;
    return documents.find(d => d.id === docId)?.file_name || null;
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh)] overflow-hidden">
        <div className="p-3 lg:p-4 max-w-full space-y-2 flex-shrink-0">
          <PageHeader
            title="Cronologia Eventi"
            icon={CalendarDays}
            actions={
              <Button size="sm" onClick={openNew}>
                <Plus className="w-4 h-4 mr-1" /> Nuovo Evento
              </Button>
            }
          />
        </div>

        <div className="flex-1 overflow-hidden px-3 lg:px-4 pb-3">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cerca eventi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[200px] h-9">
                <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Filtra per tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                {TIPI_EVENTO.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground ml-auto">
              {filtered.length} evento{filtered.length !== 1 ? "i" : ""}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Caricamento...</div>
          ) : eventi.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Nessun evento registrato. Crea il primo evento per iniziare la cronologia.
            </div>
          ) : (
            <div className="overflow-auto h-[calc(100%-44px)] rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("data_evento")}>
                      <span className="flex items-center gap-1">Data <ArrowUpDown className="w-3 h-3" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("tipo")}>
                      <span className="flex items-center gap-1">Tipo <ArrowUpDown className="w-3 h-3" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("protocollo")}>
                      <span className="flex items-center gap-1">Protocollo <ArrowUpDown className="w-3 h-3" /></span>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("titolo")}>
                      <span className="flex items-center gap-1">Titolo <ArrowUpDown className="w-3 h-3" /></span>
                    </TableHead>
                    <TableHead>Mittente</TableHead>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Mezzo</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(ev => (
                    <TableRow key={ev.id} className="group">
                      <TableCell className="whitespace-nowrap font-medium text-xs">
                        {new Date(ev.data_evento).toLocaleDateString("it-IT")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tipoBadgeVariant(ev.tipo)} className="text-[10px] whitespace-nowrap">
                          {tipoLabel(ev.tipo)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ev.protocollo || "—"}</TableCell>
                      <TableCell className="max-w-[250px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm truncate block">{ev.titolo}</span>
                          </TooltipTrigger>
                          {ev.descrizione && <TooltipContent className="max-w-xs">{ev.descrizione}</TooltipContent>}
                        </Tooltip>
                      </TableCell>
                      <TableCell className="text-xs">{ev.mittente || "—"}</TableCell>
                      <TableCell className="text-xs">{ev.destinatario || "—"}</TableCell>
                      <TableCell className="text-xs">{ev.mezzo || "—"}</TableCell>
                      <TableCell>
                        {docName(ev.document_id) ? (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <FileText className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{docName(ev.document_id)}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(ev)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(ev.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Sheet per creazione/modifica */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editEvento.id ? "Modifica Evento" : "Nuovo Evento"}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data evento</Label>
                <Input type="date" value={editEvento.data_evento || ""} onChange={e => setEditEvento(p => ({ ...p, data_evento: e.target.value }))} />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={editEvento.tipo || "evento"} onValueChange={v => setEditEvento(p => ({ ...p, tipo: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPI_EVENTO.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Titolo *</Label>
              <Input value={editEvento.titolo || ""} onChange={e => setEditEvento(p => ({ ...p, titolo: e.target.value }))} placeholder="Oggetto dell'evento" />
            </div>
            <div>
              <Label>Descrizione</Label>
              <Textarea value={editEvento.descrizione || ""} onChange={e => setEditEvento(p => ({ ...p, descrizione: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Protocollo</Label>
                <Input value={editEvento.protocollo || ""} onChange={e => setEditEvento(p => ({ ...p, protocollo: e.target.value }))} placeholder="N. prot." />
              </div>
              <div>
                <Label>Mezzo</Label>
                <Select value={editEvento.mezzo || ""} onValueChange={v => setEditEvento(p => ({ ...p, mezzo: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                  <SelectContent>
                    {MEZZI.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Mittente</Label>
                <Input value={editEvento.mittente || ""} onChange={e => setEditEvento(p => ({ ...p, mittente: e.target.value }))} />
              </div>
              <div>
                <Label>Destinatario</Label>
                <Input value={editEvento.destinatario || ""} onChange={e => setEditEvento(p => ({ ...p, destinatario: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Documento collegato</Label>
              <Select value={editEvento.document_id || "none"} onValueChange={v => setEditEvento(p => ({ ...p, document_id: v === "none" ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Nessun documento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessun documento</SelectItem>
                  {documents.map(d => <SelectItem key={d.id} value={d.id}>{d.file_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving || !editEvento.titolo?.trim()}>
              {saving ? "Salvataggio..." : editEvento.id ? "Aggiorna" : "Crea Evento"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
