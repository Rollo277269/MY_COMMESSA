import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight } from "lucide-react";
import { GanttPhase } from "./types";

interface DependencyLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phaseId: string;
  phaseName: string;
  currentDeps: string[];
  allPhases: GanttPhase[];
  onSave: (phaseId: string, dependsOn: string[]) => void;
}

export function DependencyLinkDialog({
  open,
  onOpenChange,
  phaseId,
  phaseName,
  currentDeps,
  allPhases,
  onSave,
}: DependencyLinkDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(currentDeps));

  // Flatten all phases excluding current
  const available = useMemo(() => {
    const list: { id: string; name: string; isSub: boolean; parentName?: string }[] = [];
    for (const p of allPhases) {
      if (p.id !== phaseId) {
        list.push({ id: p.id, name: p.name, isSub: false });
      }
      if (p.subPhases) {
        for (const s of p.subPhases) {
          if (s.id !== phaseId) {
            list.push({ id: s.id, name: s.name, isSub: true, parentName: p.name });
          }
        }
      }
    }
    return list;
  }, [allPhases, phaseId]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    onSave(phaseId, Array.from(selected));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Dipendenze di "{phaseName}"</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground mb-2">
          Seleziona le attività che devono essere completate <strong>prima</strong> di questa fase.
        </p>
        <ScrollArea className="max-h-[320px] pr-2">
          <div className="space-y-1">
            {available.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selected.has(item.id)}
                  onCheckedChange={() => toggle(item.id)}
                />
                <div className="min-w-0 flex-1">
                  <span className={item.isSub ? "text-xs text-muted-foreground" : "text-sm font-medium"}>
                    {item.isSub && <ArrowRight className="w-3 h-3 inline mr-1 text-muted-foreground/50" />}
                    {item.name}
                  </span>
                  {item.isSub && item.parentName && (
                    <span className="text-[10px] text-muted-foreground/60 ml-1">({item.parentName})</span>
                  )}
                </div>
              </label>
            ))}
            {available.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Nessuna altra fase disponibile</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button size="sm" onClick={handleSave}>Salva dipendenze</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
