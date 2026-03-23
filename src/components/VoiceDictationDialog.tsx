import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VoiceDictationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: string;
  onComplete: () => void;
}

const FIELD_REMINDERS = [
  "📅 Data",
  "🌤️ Condizioni climatiche",
  "👷 Operai presenti",
  "🔧 Lavorazioni svolte",
  "📦 Acquisti effettuati e ricezione materiali (riferimento DDT fornitore)",
  "📄 Altri documenti acquisiti",
  "📝 Note sull'andamento dei lavori",
];

export function VoiceDictationDialog({ open, onOpenChange, section, onComplete }: VoiceDictationDialogProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [saving, setSaving] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "it-IT";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = transcript;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        toast({ title: "Errore riconoscimento vocale", description: event.error, variant: "destructive" });
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [transcript, toast]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const handleSave = async () => {
    if (!transcript.trim()) {
      toast({ title: "Nessun testo da salvare", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const fileName = `Dettatura_${new Date().toISOString().slice(0, 10)}_${Date.now()}.txt`;
      const blob = new Blob([transcript], { type: "text/plain" });
      const filePath = `${section}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("cm_documents")
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from("cm_documents")
        .insert({
          file_name: fileName,
          file_path: filePath,
          file_type: "text/plain",
          file_size: blob.size,
          section,
          ai_status: "completed",
          ai_summary: "Rapporto giornaliero da dettatura vocale",
          ai_extracted_data: { testo_dettato: transcript },
        });

      if (insertError) throw insertError;

      toast({ title: "Rapporto salvato con successo" });
      setTranscript("");
      onOpenChange(false);
      onComplete();
    } catch (err: any) {
      console.error("Save error:", err);
      toast({ title: "Errore salvataggio", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (value: boolean) => {
    if (isRecording) stopRecording();
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            Dettatura Rapporto Giornaliero
          </DialogTitle>
          <DialogDescription>
            Dettare il rapporto giornaliero. Ricordati di menzionare:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="space-y-1 text-sm">
                {FIELD_REMINDERS.map((field, i) => (
                  <li key={i}>{field}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          {!supported ? (
            <Alert variant="destructive">
              <AlertDescription>
                Il riconoscimento vocale non è supportato in questo browser. Usa Chrome o Edge.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                className="gap-2"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Ferma registrazione
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    {transcript ? "Riprendi registrazione" : "Inizia registrazione"}
                  </>
                )}
              </Button>
            </div>
          )}

          {isRecording && (
            <p className="text-center text-sm text-primary animate-pulse font-medium">
              🔴 Registrazione in corso...
            </p>
          )}

          <Textarea
            placeholder="Il testo dettato apparirà qui. Puoi anche modificarlo manualmente."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={8}
            className="text-sm"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={saving}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={saving || !transcript.trim()} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Salvataggio..." : "Salva rapporto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
