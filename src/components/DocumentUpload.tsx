import { useState, useCallback, useRef } from "react";
import { Upload, FileText, Loader2, Camera, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { invokeWithRetry } from "@/lib/invokeWithRetry";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DocumentUploadProps {
  section: string;
  commessaId?: string | null;
  onUploadComplete: () => void;
  compact?: boolean;
  subfolder?: string | null;
}

interface DuplicateInfo {
  file: File;
  existingDoc: { id: string; file_path: string; file_name?: string };
  duplicateReason?: string;
}

export function DocumentUpload({ section, commessaId, onUploadComplete, compact = false, subfolder = null }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [duplicate, setDuplicate] = useState<DuplicateInfo | null>(null);
  const pendingFilesRef = useRef<File[]>([]);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      checkAndProcessFiles(files);
    }
  }, [section, commessaId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      checkAndProcessFiles(files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const computeFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const checkAndProcessFiles = async (files: File[]) => {
    if (!commessaId) {
      processFiles(files);
      return;
    }

    const filesToProcess: File[] = [];
    for (const file of files) {
      // Check by name
      const { data: existingByName } = await supabase
        .from('documents')
        .select('id, file_path')
        .eq('commessa_id', commessaId)
        .eq('section', section)
        .eq('file_name', file.name)
        .maybeSingle();

      if (existingByName) {
        pendingFilesRef.current = [...filesToProcess, ...files.slice(files.indexOf(file) + 1)];
        setDuplicate({ file, existingDoc: existingByName });
        if (filesToProcess.length > 0) processFiles(filesToProcess);
        return;
      }

      // Check by content hash
      const hash = await computeFileHash(file);
      (file as any).__hash = hash;
      const { data: existingByHash } = await supabase
        .from('documents')
        .select('id, file_path, file_name')
        .eq('commessa_id', commessaId)
        .eq('section', section)
        .eq('file_hash', hash)
        .maybeSingle();

      if (existingByHash) {
        pendingFilesRef.current = [...filesToProcess, ...files.slice(files.indexOf(file) + 1)];
        setDuplicate({ file, existingDoc: existingByHash, duplicateReason: `contenuto identico a "${existingByHash.file_name}"` });
        if (filesToProcess.length > 0) processFiles(filesToProcess);
        return;
      }

      filesToProcess.push(file);
    }

    processFiles(filesToProcess);
  };

  const handleDuplicateReplace = async () => {
    if (!duplicate) return;
    const { file, existingDoc } = duplicate;
    setDuplicate(null);

    // [L03] Ordine corretto: DB first, poi storage (mai l'inverso)
    // Se il DB delete fallisce possiamo ancora annullare; se lo storage è già cancellato non c'è rollback.
    try {
      // 1. Cancella la fattura collegata (se presente) prima del documento
      if (section === 'economia-cssr') {
        const { error: fatturaErr } = await supabase
          .from('fatture')
          .delete()
          .eq('file_path', existingDoc.file_path);
        if (fatturaErr) {
          console.error('Errore cancellazione fattura collegata:', fatturaErr);
          // Non blocchiamo — la fattura potrebbe non esistere
        }
      }

      // 2. Cancella il record DB documento
      const { error: docErr } = await supabase
        .from('documents')
        .delete()
        .eq('id', existingDoc.id);
      if (docErr) throw docErr; // Blocca qui — non cancellare lo storage se il DB ha fallito

      // 3. Solo ora cancella il file dallo storage
      const { error: storageErr } = await supabase.storage
        .from('documents')
        .remove([existingDoc.file_path]);
      if (storageErr) {
        // File orfano su storage ma DB è coerente — non è critico, logga
        console.warn('File rimosso dal DB ma errore storage:', storageErr);
      }
    } catch (err: any) {
      console.error('Errore sostituzione documento:', err);
      toast({
        title: "Errore sostituzione",
        description: err.message || "Impossibile rimuovere il documento precedente",
        variant: "destructive",
      });
      // Non procedere con l'upload se la rimozione è fallita
      const remaining = pendingFilesRef.current;
      pendingFilesRef.current = [];
      if (remaining.length > 0) processFiles(remaining);
      return;
    }

    // Process the replacement file + any remaining pending files
    const remaining = pendingFilesRef.current;
    pendingFilesRef.current = [];
    processFiles([file, ...remaining]);
  };

  const handleDuplicateCancel = () => {
    const remaining = pendingFilesRef.current;
    pendingFilesRef.current = [];
    setDuplicate(null);
    // Continue with remaining files if any
    if (remaining.length > 0) {
      checkAndProcessFiles(remaining);
    }
  };

  const uploadAndAnalyze = async (file: File) => {
    // Upload to storage
    const filePath = `${section}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Insert document record
    const fileHash = (file as any).__hash || await computeFileHash(file);
    const { data: docData, error: insertError } = await supabase
      .from('documents')
      .insert({
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        section,
        ai_status: 'processing',
        commessa_id: commessaId || null,
        file_hash: fileHash,
        subfolder: subfolder || null,
      } as any)
      .select()
      .single();

    if (insertError) throw insertError;

    toast({
      title: "File caricato",
      description: `${file.name} caricato con successo. Analisi AI in corso...`,
    });

    // Trigger AI analysis
    setAnalyzing(true);
    try {
      const { data: aiResult, error: aiError } = await invokeWithRetry('analyze-document', {
        body: {
          fileUrl: urlData.publicUrl,
          fileName: file.name,
          fileType: file.type,
          documentId: docData.id,
          section,
          commessaId: commessaId || null,
          filePath,
        },
      });

      if (aiError) throw aiError;

      const result = aiResult as any;
      await supabase
        .from('documents')
        .update({
          ai_extracted_data: result.extracted_data,
          ai_summary: result.summary,
          ai_status: 'completed',
        })
        .eq('id', docData.id);

      toast({
        title: "Analisi completata",
        description: `L'AI ha estratto le informazioni da ${file.name}`,
      });
    } catch (aiErr: any) {
      console.error('AI analysis error:', aiErr);
      await supabase
        .from('documents')
        .update({ ai_status: 'error' })
        .eq('id', docData.id);

      toast({
        title: "Errore analisi AI",
        description: aiErr.message || "Impossibile analizzare il documento",
        variant: "destructive",
      });
    }
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);

    for (const file of files) {
      try {
        await uploadAndAnalyze(file);
      } catch (err: any) {
        console.error('Upload error:', err);
        toast({
          title: "Errore caricamento",
          description: err.message || "Impossibile caricare il file",
          variant: "destructive",
        });
      }
    }

    setUploading(false);
    setAnalyzing(false);
    onUploadComplete();
  };

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          compact
            ? "flex items-center gap-2 rounded-md border border-dashed px-2.5 py-1.5 transition-colors"
            : "border-2 border-dashed rounded-lg p-4 text-center transition-colors bg-primary/80",
          compact && isDragging
            ? "border-accent bg-accent/10"
            : compact ? "border-border hover:border-accent/50" : "",
          !compact && isDragging
            ? "border-primary-foreground/50 bg-primary/90"
            : !compact ? "border-primary-foreground/30 hover:bg-primary/90" : "",
          (uploading || analyzing) && "pointer-events-none opacity-60"
        )}
      >
        {uploading || analyzing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-accent animate-spin" />
            <p className="text-xs font-medium text-foreground">
              {analyzing ? "Analisi AI..." : "Caricamento..."}
            </p>
          </div>
        ) : compact ? (
          <div className="flex items-center gap-2">
            <Upload className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground hidden sm:inline whitespace-nowrap">Trascina qui o</span>
            <label>
              <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.jpg,.jpeg,.png,.webp" />
              <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer h-7 text-xs px-2.5" asChild>
                <span><FileText className="w-3 h-3" /> Carica</span>
              </Button>
            </label>
            <label>
              <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*" capture="environment" />
              <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer h-7 text-xs px-2.5" asChild>
                <span><Camera className="w-3 h-3" /> Foto</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-primary-foreground">Trascina i file qui o clicca per caricare</p>
                <p className="text-xs text-primary-foreground/70">PDF, immagini, documenti di testo • Analisi AI automatica</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <label>
                <input type="file" multiple className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.jpg,.jpeg,.png,.webp" />
                <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer border-white/40 text-primary-foreground hover:bg-white/20" asChild>
                  <span><FileText className="w-4 h-4" /> Sfoglia</span>
                </Button>
              </label>
              <label>
                <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*" capture="environment" />
                <Button size="sm" variant="outline" className="gap-1.5 cursor-pointer border-white/40 text-primary-foreground hover:bg-white/20" asChild>
                  <span><Camera className="w-4 h-4" /> Foto</span>
                </Button>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Duplicate file dialog */}
      <AlertDialog open={!!duplicate} onOpenChange={(open) => { if (!open) handleDuplicateCancel(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Documento già presente
            </AlertDialogTitle>
            <AlertDialogDescription>
              {duplicate?.duplicateReason
                ? <>Il file <strong>"{duplicate?.file.name}"</strong> ha {duplicate.duplicateReason}. Vuoi sostituirlo con la nuova versione?</>
                : <>Il file <strong>"{duplicate?.file.name}"</strong> è già presente in questa sezione. Vuoi sostituirlo con la nuova versione?</>
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDuplicateCancel}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicateReplace}>Sostituisci</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
