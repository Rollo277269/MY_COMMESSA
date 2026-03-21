import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

export interface Proroga {
  id: string;
  motivo: string;
  giorni: number;
  data_concessione: string;
  nuova_data_fine: string;
  note: string | null;
}

interface ProrogheDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proroghe: Proroga[];
  dataScadenzaOriginale: Date | null;
  onAdd: (proroga: { motivo: string; giorni: number; data_concessione: string; nuova_data_fine: string; note: string | null }) => void;
  onDelete: (id: string) => void;
}

export function ProrogheDialog({ open, onOpenChange, proroghe, dataScadenzaOriginale, onAdd, onDelete }: ProrogheDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [giorni, setGiorni] = useState("");
  const [note, setNote] = useState("");

  const calcNuovaDataFine = useCallback(() => {
    if (!dataScadenzaOriginale || !giorni) return null;
    // Start from latest proroga end date or original end
    const lastDate = proroghe.length > 0
      ? new Date(proroghe[proroghe.length - 1].nuova_data_fine)
      : dataScadenzaOriginale;
    const nuova = new Date(lastDate);
    nuova.setDate(nuova.getDate() + parseInt(giorni));
    return nuova;
  }, [dataScadenzaOriginale, giorni, proroghe]);

  const handleAdd = () => {
    const nuovaFine = calcNuovaDataFine();
    if (!motivo.trim() || !giorni || !nuovaFine) return;
    onAdd({
      motivo: motivo.trim(),
      giorni: parseInt(giorni),
      data_concessione: format(new Date(), "yyyy-MM-dd"),
      nuova_data_fine: format(nuovaFine, "yyyy-MM-dd"),
      note: note.trim() || null,
    });
    setMotivo("");
    setGiorni("");
    setNote("");
  };

  const nuovaFine = calcNuovaDataFine();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gestione Proroghe</DialogTitle>
        </DialogHeader>

        {/* Existing proroghe */}
        {proroghe.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <p className="text-xs font-medium text-muted-foreground">Proroghe concesse</p>
            {proroghe.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{p.motivo}</p>
                  <p className="text-xs text-muted-foreground">
                    +{p.giorni} giorni → nuova scadenza: {format(new Date(p.nuova_data_fine), "dd/MM/yyyy")}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(p.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new */}
        <div className="space-y-3 border-t pt-3">
          <p className="text-xs font-medium text-muted-foreground">Aggiungi nuova proroga</p>
          <div className="space-y-2">
            <Label className="text-xs">Motivo</Label>
            <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Es: Condizioni meteo avverse" className="h-8 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Giorni di proroga</Label>
            <Input type="number" value={giorni} onChange={(e) => setGiorni(e.target.value)} placeholder="30" className="h-8 text-sm w-32" min="1" />
          </div>
          {nuovaFine && (
            <p className="text-xs text-muted-foreground">
              Nuova data di fine lavori: <span className="font-semibold text-foreground">{format(nuovaFine, "dd/MM/yyyy")}</span>
            </p>
          )}
          <div className="space-y-2">
            <Label className="text-xs">Note (opzionale)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note aggiuntive..." className="text-sm min-h-[60px]" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Chiudi</Button>
          <Button size="sm" onClick={handleAdd} disabled={!motivo.trim() || !giorni}>Aggiungi proroga</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
