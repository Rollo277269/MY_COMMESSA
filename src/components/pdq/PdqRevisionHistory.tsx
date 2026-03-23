import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { History, Eye, GitCompare, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PdqData, PdqSection } from "@/lib/generatePdqPdf";

interface RevisionRecord {
  id: string;
  revision: number;
  created_at: string;
  sections: PdqSection[];
}

interface Props {
  commessaId: string;
  currentRevision: number;
  onLoadRevision?: (data: PdqData, revision: number) => void;
}

export function PdqRevisionHistory({ commessaId, currentRevision, onLoadRevision }: Props) {
  const [revisions, setRevisions] = useState<RevisionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [compareA, setCompareA] = useState<RevisionRecord | null>(null);
  const [compareB, setCompareB] = useState<RevisionRecord | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const loadRevisions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("cm_pdq_documents")
      .select("id, revision, created_at, sections")
      .eq("cm_commessa_id", commessaId)
      .order("revision", { ascending: false });
    if (data) {
      setRevisions(data.map(r => ({
        ...r,
        sections: (r.sections as any) || [],
      })));
    }
    setLoading(false);
  };

  return (
    <Sheet onOpenChange={(open) => { if (open) loadRevisions(); }}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary-foreground hover:bg-white/20">
          <History className="w-3.5 h-3.5" /> Storico
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5" /> Storico Revisioni
          </SheetTitle>
        </SheetHeader>

        {showCompare && compareA && compareB ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Rev. {String(compareA.revision).padStart(2, "0")} vs Rev. {String(compareB.revision).padStart(2, "0")}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowCompare(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-160px)]">
              <CompareView a={compareA} b={compareB} />
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
            <div className="space-y-2 pr-4">
              {loading && <p className="text-sm text-muted-foreground py-4 text-center">Caricamento...</p>}
              {!loading && revisions.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Nessuna revisione disponibile</p>
              )}
              {revisions.map((rev) => (
                <div
                  key={rev.id}
                  className={`border rounded-lg p-3 flex items-center justify-between ${
                    rev.revision === currentRevision ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rev.revision === currentRevision ? "default" : "outline"} className="text-xs font-mono">
                        Rev. {String(rev.revision).padStart(2, "0")}
                      </Badge>
                      {rev.revision === currentRevision && (
                        <span className="text-[10px] text-primary font-medium">ATTUALE</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(rev.created_at).toLocaleDateString("it-IT", {
                        day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                      {" · "}{rev.sections.length} sezioni
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {rev.revision !== currentRevision && onLoadRevision && (
                      <Button
                        variant="ghost" size="sm" className="h-7 text-xs gap-1"
                        onClick={() => onLoadRevision({ sections: rev.sections }, rev.revision)}
                      >
                        <Eye className="w-3 h-3" /> Carica
                      </Button>
                    )}
                    <Button
                      variant={compareA?.id === rev.id || compareB?.id === rev.id ? "secondary" : "ghost"}
                      size="sm" className="h-7 text-xs gap-1"
                      onClick={() => {
                        if (!compareA || compareA.id === rev.id) {
                          setCompareA(compareA?.id === rev.id ? null : rev);
                        } else {
                          setCompareB(rev);
                          setShowCompare(true);
                        }
                      }}
                    >
                      <GitCompare className="w-3 h-3" />
                      {compareA && compareA.id !== rev.id ? "Confronta" : compareA?.id === rev.id ? "Deseleziona" : "Seleziona"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CompareView({ a, b }: { a: RevisionRecord; b: RevisionRecord }) {
  // Align sections by number
  const allNumbers = new Set([...a.sections.map(s => s.number), ...b.sections.map(s => s.number)]);
  const sorted = Array.from(allNumbers).sort((x, y) => parseFloat(x) - parseFloat(y));

  return (
    <div className="space-y-3">
      {sorted.map((num) => {
        const secA = a.sections.find(s => s.number === num);
        const secB = b.sections.find(s => s.number === num);
        const changed = secA?.content !== secB?.content ||
          JSON.stringify(secA?.tables) !== JSON.stringify(secB?.tables);

        return (
          <CompareSection
            key={num}
            number={num}
            title={secA?.title || secB?.title || ""}
            contentA={secA?.content || ""}
            contentB={secB?.content || ""}
            changed={changed}
            revA={a.revision}
            revB={b.revision}
          />
        );
      })}
    </div>
  );
}

function CompareSection({ number, title, contentA, contentB, changed, revA, revB }: {
  number: string; title: string; contentA: string; contentB: string;
  changed: boolean; revA: number; revB: number;
}) {
  const [open, setOpen] = useState(changed);

  return (
    <div className={`border rounded-lg overflow-hidden ${changed ? "border-amber-400/50" : "border-border"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/30"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <span className="text-xs font-semibold">{number}. {title}</span>
        {changed && <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600 ml-auto">Modificata</Badge>}
        {!changed && <span className="text-[10px] text-muted-foreground ml-auto">Invariata</span>}
      </button>
      {open && changed && (
        <div className="grid grid-cols-2 gap-0 border-t border-border">
          <div className="p-3 border-r border-border bg-red-50/30 dark:bg-red-950/10">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">Rev. {String(revA).padStart(2, "0")}</p>
            <p className="text-xs whitespace-pre-line leading-relaxed">{contentA || <em className="text-muted-foreground">Vuoto</em>}</p>
          </div>
          <div className="p-3 bg-green-50/30 dark:bg-green-950/10">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">Rev. {String(revB).padStart(2, "0")}</p>
            <p className="text-xs whitespace-pre-line leading-relaxed">{contentB || <em className="text-muted-foreground">Vuoto</em>}</p>
          </div>
        </div>
      )}
    </div>
  );
}
