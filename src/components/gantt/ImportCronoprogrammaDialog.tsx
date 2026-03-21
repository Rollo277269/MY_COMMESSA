import { useState, useCallback, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, FileText, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithRetry } from "@/lib/invokeWithRetry";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface ExtractedPhase {
  name: string;
  start_date: string;
  end_date: string;
  progress?: number;
  sub_phases?: { name: string; start_date: string; end_date: string; progress?: number }[];
  selected?: boolean;
}

interface ImportCronoprogrammaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (phases: ExtractedPhase[]) => void;
  initialFile?: File | null;
}

export function ImportCronoprogrammaDialog({ open, onOpenChange, onConfirm, initialFile }: ImportCronoprogrammaDialogProps) {
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [phases, setPhases] = useState<ExtractedPhase[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const processedFileRef = useRef<File | null>(null);

  const extractPdfText = useCallback(async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const texts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      texts.push(content.items.map((item: any) => item.str).join(" "));
    }
    return texts.join("\n\n");
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setIsExtracting(true);
    try {
      let textContent: string;
      if (file.type === "application/pdf") {
        textContent = await extractPdfText(file);
      } else {
        textContent = await file.text();
      }

      if (!textContent.trim()) {
        toast({ title: "Errore", description: "Il file non contiene testo estraibile", variant: "destructive" });
        return;
      }

      const { data, error } = await invokeWithRetry<any>("parse-cronoprogramma", {
        body: { textContent },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const extracted = (data.phases || []).map((p: any) => ({ ...p, selected: true }));
      if (extracted.length === 0) {
        toast({ title: "Nessuna fase trovata", description: "L'AI non ha trovato fasi nel documento", variant: "destructive" });
        return;
      }

      setPhases(extracted);
      setStep("review");
    } catch (e: any) {
      toast({ title: "Errore", description: e.message || "Errore durante l'estrazione", variant: "destructive" });
    } finally {
      setIsExtracting(false);
    }
  }, [extractPdfText]);

  // Auto-process initialFile when dialog opens
  useEffect(() => {
    if (open && initialFile && initialFile !== processedFileRef.current) {
      processedFileRef.current = initialFile;
      handleFile(initialFile);
    }
    if (!open) {
      processedFileRef.current = null;
    }
  }, [open, initialFile, handleFile]);

  const togglePhase = (idx: number) => {
    setPhases((prev) => prev.map((p, i) => i === idx ? { ...p, selected: !p.selected } : p));
  };

  const handleConfirm = () => {
    const selected = phases.filter((p) => p.selected);
    if (selected.length === 0) {
      toast({ title: "Seleziona almeno una fase" });
      return;
    }
    onConfirm(selected);
    handleClose();
  };

  const handleClose = () => {
    setStep("upload");
    setPhases([]);
    setIsExtracting(false);
    onOpenChange(false);
  };

  const formatDate = (d: string) => {
    try { return format(parseISO(d), "dd/MM/yyyy"); } catch { return d; }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">
            {step === "upload" ? "Importa cronoprogramma da PDF" : "Revisione fasi estratte"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {step === "upload"
              ? "Carica un PDF del cronoprogramma di progetto. L'AI estrarrà automaticamente le fasi e le date."
              : `${phases.filter((p) => p.selected).length} di ${phases.length} fasi selezionate. Deseleziona quelle da escludere.`}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {isExtracting ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Estrazione fasi in corso...</p>
              </div>
            ) : (
              <Button variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
                <Upload className="w-4 h-4" />
                Seleziona file PDF
              </Button>
            )}
          </div>
        )}

        {step === "review" && (
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {phases.map((phase, idx) => (
              <div key={idx} className="border border-border rounded-md p-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={phase.selected}
                    onCheckedChange={() => togglePhase(idx)}
                  />
                  <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium flex-1 truncate">{phase.name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {formatDate(phase.start_date)} — {formatDate(phase.end_date)}
                  </Badge>
                </div>
                {phase.sub_phases && phase.sub_phases.length > 0 && (
                  <div className="ml-8 mt-1 space-y-0.5">
                    {phase.sub_phases.map((sub, si) => (
                      <div key={si} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ChevronRight className="w-3 h-3" />
                        <span className="flex-1 truncate">{sub.name}</span>
                        <span className="text-[10px]">{formatDate(sub.start_date)} — {formatDate(sub.end_date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          {step === "review" && (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setStep("upload"); setPhases([]); }}>
                Indietro
              </Button>
              <Button size="sm" onClick={handleConfirm}>
                Importa {phases.filter((p) => p.selected).length} fasi
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
