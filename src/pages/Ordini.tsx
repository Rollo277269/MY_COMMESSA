import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { ShoppingCart, Plus, Trash2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCommessa } from "@/contexts/CommessaContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { it } from "date-fns/locale";

type OrdineAcquisto = {
  id: string;
  numero: string;
  data: string;
  fornitore: string;
  descrizione: string | null;
  importo: number;
  stato: string;
  data_consegna_prevista: string | null;
  data_consegna_effettiva: string | null;
  note: string | null;
  cm_commessa_id: string | null;
  created_at: string;
};

const STATI: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  in_attesa: { label: "In attesa", variant: "secondary" },
  confermato: { label: "Confermato", variant: "default" },
  consegnato: { label: "Consegnato", variant: "outline" },
  annullato: { label: "Annullato", variant: "destructive" },
};

const emptyForm = {
  numero: "",
  data: new Date().toISOString().slice(0, 10),
  fornitore: "",
  descrizione: "",
  importo: 0,
  stato: "in_attesa",
  data_consegna_prevista: "",
  data_consegna_effettiva: "",
  note: "",
};

export default function OrdiniPage() {
  const { commessaId } = useCommessa();
  const { toast } = useToast();
  const [ordini, setOrdini] = useState<OrdineAcquisto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchOrdini = useCallback(async () => {
    if (!commessaId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("cm_ordini_acquisto" as any)
      .select("*")
      .eq("cm_commessa_id", commessaId)
      .order("created_at", { ascending: false });
    if (!error) setOrdini((data as any[]) || []);
    setLoading(false);
  }, [commessaId]);

  useEffect(() => { fetchOrdini(); }, [fetchOrdini]);

  const handleAdd = async () => {
    if (!form.numero.trim() || !form.fornitore.trim()) {
      toast({ title: "Compila numero e fornitore", variant: "destructive" });
      return;
    }
    setSaving(true);
    const insertData: any = {
      ...form,
      cm_commessa_id: commessaId,
      importo: Number(form.importo) || 0,
      data_consegna_prevista: form.data_consegna_prevista || null,
      data_consegna_effettiva: form.data_consegna_effettiva || null,
      note: form.note || null,
      descrizione: form.descrizione || null,
    };
    const { error } = await supabase.from("cm_ordini_acquisto" as any).insert(insertData);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ordine aggiunto" });
      setSheetOpen(false);
      setForm(emptyForm);
      fetchOrdini();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cm_ordini_acquisto" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ordine eliminato" });
      fetchOrdini();
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try { return format(new Date(d), "dd/MM/yyyy", { locale: it }); } catch { return d; }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" as any }).format(v);

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh)] overflow-hidden">
        <div className="p-3 lg:p-4 max-w-full space-y-2 flex-shrink-0">
          <PageHeader
            title="Ordini di Acquisto"
            icon={ShoppingCart}
            actions={
              <Button size="sm" className="gap-1.5" onClick={() => { setForm(emptyForm); setSheetOpen(true); }}>
                <Plus className="h-4 w-4" />
                Nuovo ordine
              </Button>
            }
          />
        </div>

        <div className="flex-1 overflow-auto px-3 lg:px-4 pb-3">
          {loading ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Caricamento...</p>
          ) : ordini.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-3">
              <Package className="h-12 w-12 mx-auto opacity-40" />
              <p className="text-sm">Nessun ordine di acquisto. Crea il primo ordine.</p>
              <Button size="sm" variant="outline" onClick={() => { setForm(emptyForm); setSheetOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Nuovo ordine
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numero</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Fornitore</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead className="text-right">Importo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Consegna prev.</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordini.map((o) => {
                    const stato = STATI[o.stato] || STATI.in_attesa;
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.numero}</TableCell>
                        <TableCell>{formatDate(o.data)}</TableCell>
                        <TableCell>{o.fornitore}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{o.descrizione || "—"}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(o.importo)}</TableCell>
                        <TableCell>
                          <Badge variant={stato.variant}>{stato.label}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(o.data_consegna_prevista)}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Elimina ordine</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Vuoi eliminare l'ordine {o.numero}? L'azione è irreversibile.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(o.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Sheet per aggiungere ordine */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nuovo Ordine di Acquisto</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Numero *</Label>
                <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="ODA-001" />
              </div>
              <div className="space-y-1.5">
                <Label>Data</Label>
                <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Fornitore *</Label>
              <Input value={form.fornitore} onChange={(e) => setForm({ ...form, fornitore: e.target.value })} placeholder="Nome fornitore" />
            </div>
            <div className="space-y-1.5">
              <Label>Descrizione</Label>
              <Textarea value={form.descrizione} onChange={(e) => setForm({ ...form, descrizione: e.target.value })} placeholder="Descrizione materiali/servizi" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Importo (€)</Label>
                <Input type="number" step="0.01" value={form.importo} onChange={(e) => setForm({ ...form, importo: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1.5">
                <Label>Stato</Label>
                <Select value={form.stato} onValueChange={(v) => setForm({ ...form, stato: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATI).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Consegna prevista</Label>
                <Input type="date" value={form.data_consegna_prevista} onChange={(e) => setForm({ ...form, data_consegna_prevista: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Consegna effettiva</Label>
                <Input type="date" value={form.data_consegna_effettiva} onChange={(e) => setForm({ ...form, data_consegna_effettiva: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Note</Label>
              <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} />
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleAdd} disabled={saving} className="w-full">
              {saving ? "Salvataggio..." : "Aggiungi ordine"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
