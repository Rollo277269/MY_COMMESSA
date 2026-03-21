import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Send, Mic, MicOff, Trash2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ritaAvatar from "@/assets/rita-avatar.png";
import { useCommessa } from "@/contexts/CommessaContext";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

const SECTION_MAP: Record<string, string> = {
  "/": "Dashboard",
  "/documenti": "Documenti",
  "/sicurezza": "Sicurezza",
  "/ambiente": "Ambiente",
  "/foto": "Foto",
  "/progetto": "Progetto",
  "/persone": "Persone",
  "/aziende": "Aziende",
  "/cronoprogramma": "Cronoprogramma",
  "/economia": "Economia Consorziata",
  "/economia-cssr": "Economia CSSR",
  "/rapporti-giornalieri": "Rapporti Giornalieri",
  "/contabilita-lavori": "Contabilità Lavori",
  "/ordini-servizio": "Ordini di Servizio",
  "/ordini": "Ordini di Acquisto",
  "/cme": "CME",
  "/report": "Report Commessa",
  "/scadenzario": "Scadenzario",
  "/impostazioni": "Impostazioni",
  "/congruita-manodopera": "Congruità Manodopera",
  "/commesse": "Selezione Commessa",
};

function speakText(text: string, onEnd?: () => void) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  // Strip markdown for cleaner speech
  const clean = text
    .replace(/[#*_`~>\[\]()!|]/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();
  if (!clean) return;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "it-IT";
  utterance.rate = 1.05;
  utterance.pitch = 1.1;

  // Try to pick a female Italian voice
  const voices = window.speechSynthesis.getVoices();
  const femaleIt = voices.find(
    (v) => v.lang.startsWith("it") && /female|donna|alice|elsa|federica|google.*italiano/i.test(v.name)
  ) || voices.find((v) => v.lang.startsWith("it"));
  if (femaleIt) utterance.voice = femaleIt;

  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const [wakeListening, setWakeListening] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const micEnabledRef = useRef(micEnabled);
  micEnabledRef.current = micEnabled;
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const wakeRecognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSpeechRef = useRef<string>("");
  const location = useLocation();
  const { commessaId } = useCommessa();

  const currentSection = SECTION_MAP[location.pathname] || location.pathname;

  // Load voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Wake word listener - "Hey Rita"
  const shouldWakeListenRef = useRef(false);
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const shouldListen = !!SR && wakeWordActive && hasBeenOpened && !open && micEnabled;
    shouldWakeListenRef.current = shouldListen;

    if (!shouldListen) {
      if (wakeRecognitionRef.current) {
        wakeRecognitionRef.current.abort();
        wakeRecognitionRef.current = null;
        setWakeListening(false);
      }
      return;
    }

    const startWakeListener = () => {
      if (!shouldWakeListenRef.current || wakeRecognitionRef.current) return;
      const recognition = new SR();
      recognition.lang = "it-IT";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          if (
            transcript.includes("hey rita") ||
            transcript.includes("ehi rita") ||
            transcript.includes("ei rita") ||
            transcript.includes("ciao rita")
          ) {
            recognition.abort();
            wakeRecognitionRef.current = null;
            setWakeListening(false);
            setOpen(true);
            if (voiceEnabled) {
              speakText("Ciao! Sono Rita, come posso aiutarti?");
            }
            return;
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === "aborted") return;
        wakeRecognitionRef.current = null;
        setWakeListening(false);
        if (shouldWakeListenRef.current) {
          setTimeout(startWakeListener, 2000);
        }
      };

      recognition.onend = () => {
        wakeRecognitionRef.current = null;
        setWakeListening(false);
        if (shouldWakeListenRef.current) {
          setTimeout(startWakeListener, 500);
        }
      };

      wakeRecognitionRef.current = recognition;
      try {
        recognition.start();
        setWakeListening(true);
      } catch {
        wakeRecognitionRef.current = null;
      }
    };

    startWakeListener();

    return () => {
      shouldWakeListenRef.current = false;
      if (wakeRecognitionRef.current) {
        wakeRecognitionRef.current.abort();
        wakeRecognitionRef.current = null;
        setWakeListening(false);
      }
    };
  }, [wakeWordActive, hasBeenOpened, open, voiceEnabled, micEnabled]);

  // When mic is disabled, stop any active recording
  useEffect(() => {
    if (!micEnabled && isRecording) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsRecording(false);
    }
  }, [micEnabled, isRecording]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = useCallback(async (allMessages: Message[]) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      // Get the user's JWT for auth & audit
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: allMessages, context: currentSection, commessaId }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Errore ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const updateAssistant = (content: string) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: "assistant", content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              updateAssistant(assistantContent);
            }
          } catch { /* partial JSON */ }
        }
      }

      // Speak the full response when done
      if (voiceEnabled && assistantContent) {
        speakText(assistantContent);
      }
    } catch (err: any) {
      const errMsg = `❌ ${err.message || "Errore di connessione"}`;
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSection, voiceEnabled]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    streamChat(newMessages);
  }, [input, isLoading, messages, streamChat]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice dictation for input
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      return;
    }

    // Stop wake word listener to avoid conflicts
    if (wakeRecognitionRef.current) {
      wakeRecognitionRef.current.abort();
      wakeRecognitionRef.current = null;
      setWakeListening(false);
    }
    // Also cancel any ongoing speech synthesis
    window.speechSynthesis?.cancel();

    // Request microphone permission explicitly from user gesture
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately - we just needed the permission
      stream.getTracks().forEach(t => t.stop());
    } catch (err) {
      console.warn("Microphone permission denied:", err);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "it-IT";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          setInput((prev) => (prev ? prev + " " : "") + event.results[i][0].transcript);
        }
      }
    };
    recognition.onerror = (e: any) => {
      if (e.error === "aborted") return; // Ignore aborted errors
      console.warn("Speech recognition error:", e.error);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsRecording(true);
    } catch (e) {
      console.warn("Failed to start speech recognition:", e);
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleOpen = useCallback(() => {
    setHasBeenOpened(true);
    setWakeWordActive(true);
    setOpen(true);
    // Clear any inactivity timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const handleClose = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsRecording(false);
    }
    window.speechSynthesis?.cancel();
    setOpen(false);
    // Start inactivity timer: disable wake word after 3 minutes
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setWakeWordActive(false);
      setHasBeenOpened(false);
    }, 3 * 60 * 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  const hasSpeechRecognition =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return (
    <>
      {/* Floating Rita button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-5 right-5 z-50 h-16 w-16 rounded-full shadow-xl hover:scale-110 transition-transform border-2 border-primary/30 overflow-hidden bg-background group"
          title='Chiedi a Rita (o dì "Hey Rita")'
        >
          <img src={ritaAvatar} alt="Rita" className="h-full w-full object-cover" />
          {!micEnabled && (
            <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-destructive border-2 border-background flex items-center justify-center">
              <MicOff className="h-2.5 w-2.5 text-destructive-foreground" />
            </span>
          )}
          {micEnabled && wakeListening && (
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
          )}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[400px] max-w-[calc(100vw-40px)] h-[560px] max-h-[calc(100vh-100px)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
            <div className="flex items-center gap-2.5">
              <img src={ritaAvatar} alt="Rita" className="h-8 w-8 rounded-full border border-primary/20 object-cover" />
              <div>
                <span className="font-semibold text-sm">Rita</span>
                <span className="text-xs text-muted-foreground ml-1.5">· {currentSection}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? "Disattiva voce" : "Attiva voce"}
              >
                {voiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-7 w-7", !micEnabled && "text-destructive")}
                onClick={() => setMicEnabled(!micEnabled)}
                title={micEnabled ? "Disattiva microfono" : "Attiva microfono"}
              >
                {micEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => { setMessages([]); window.speechSynthesis?.cancel(); }}
                title="Nuova conversazione"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef as any}>
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8 space-y-3">
                <img src={ritaAvatar} alt="Rita" className="h-20 w-20 rounded-full mx-auto border-2 border-primary/20 object-cover" />
                <p className="font-semibold text-foreground">Ciao, sono Rita!</p>
                <p className="text-xs">La tua assistente di cantiere. Scrivi, parla o dì <strong>"Hey Rita"</strong> per attivarmi.</p>
              </div>
            )}
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <img src={ritaAvatar} alt="Rita" className="h-6 w-6 rounded-full flex-shrink-0 mt-1 border border-primary/20 object-cover" />
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2 justify-start">
                  <img src={ritaAvatar} alt="Rita" className="h-6 w-6 rounded-full flex-shrink-0 mt-1 border border-primary/20 object-cover" />
                  <div className="bg-muted rounded-xl px-3 py-2 text-sm text-muted-foreground animate-pulse">
                    Sto pensando...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Scrivi a Rita..."
                rows={1}
                className="min-h-[38px] max-h-[100px] resize-none text-sm"
                disabled={isLoading}
              />
              <div className="flex flex-col gap-1">
                {hasSpeechRecognition && micEnabled && (
                  <Button
                    size="icon"
                    variant={isRecording ? "destructive" : "ghost"}
                    className="h-9 w-9 flex-shrink-0"
                    onClick={toggleRecording}
                    title={isRecording ? "Ferma" : "Dettatura vocale"}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  size="icon"
                  className="h-9 w-9 flex-shrink-0"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {isRecording && (
              <p className="text-xs text-destructive animate-pulse mt-1 text-center">
                🔴 Registrazione in corso...
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
