import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CmeRow {
  id: string;
  numero: string | null;
  codice: string | null;
  descrizione: string;
}

interface CmeLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phaseId: string;
  phaseName: string;
  linkedCmeIds: string[];
  onSave: (phaseId: string, cmeRowIds: string[]) => void;
}

export function CmeLinkDialog({ open, onOpenChange, phaseId, phaseName, linkedCmeIds, onSave }: CmeLinkDialogProps) {
  const [cmeRows, setCmeRows] = useState<CmeRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(linkedCmeIds));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setSelected(new Set(linkedCmeIds));
    setSearch("");
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("cm_cme_rows").select("id, numero, codice, descrizione").order("sort_order");
      setCmeRows(data || []);
      setLoading(false);
    })();
  }, [open, linkedCmeIds]);

  const filtered = cmeRows.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.descrizione.toLowerCase().includes(q) || r.codice?.toLowerCase().includes(q) || r.numero?.includes(q);
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm">Collega lavorazioni CME</DialogTitle>
          <DialogDescription className="text-xs">
            Fase: <strong>{phaseName}</strong> — seleziona le voci CME correlate
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Cerca per descrizione, codice o numero..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs"
        />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="flex-1 max-h-[400px]">
            <div className="space-y-0.5 pr-2">
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nessuna voce CME trovata</p>
              )}
              {filtered.map((row) => (
                <label
                  key={row.id}
                  className="flex items-start gap-2 p-1.5 rounded hover:bg-muted/30 cursor-pointer"
                >
                  <Checkbox
                    checked={selected.has(row.id)}
                    onCheckedChange={() => toggle(row.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {row.numero && <span className="text-[10px] text-muted-foreground font-mono">{row.numero}</span>}
                      {row.codice && <span className="text-[10px] text-muted-foreground">[{row.codice}]</span>}
                    </div>
                    <p className="text-xs truncate">{row.descrizione}</p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button size="sm" onClick={() => { onSave(phaseId, Array.from(selected)); onOpenChange(false); }}>
            Salva ({selected.size} collegate)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
