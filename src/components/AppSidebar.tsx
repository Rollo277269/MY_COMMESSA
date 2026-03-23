import { useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FileText, Shield, Leaf, Compass, Users, Building2, Calendar,
  TrendingUp, Calculator, ShoppingCart, HardHat,
  ClipboardList, BookOpen, FileCheck, ArrowLeftRight, LogOut, Camera,
  FileBarChart, Receipt, Settings2, CalendarClock, PinOff, Pin, GripVertical, Scale, HardHat as HardHatIcon,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommessa } from "@/contexts/CommessaContext";
import { supabase } from "@/integrations/supabase/client";

type NavItem = { label: string; description: string; icon: any; path: string };
type NavSection = { label: string; items: NavItem[] };

const defaultNavSections: NavSection[] = [
  {
    label: "Principale",
    items: [
      { label: "Dashboard", description: "Panoramica commessa", icon: HardHat, path: "/" },
      { label: "Report", description: "Report riepilogativo", icon: FileBarChart, path: "/report" },
      { label: "Documenti", description: "Gestione documentale", icon: FileText, path: "/documenti" },
      { label: "Cronologia", description: "Cronologia eventi e corrispondenza", icon: CalendarDays, path: "/eventi" },
      { label: "Progetto", description: "Informazioni progetto", icon: Compass, path: "/progetto" },
    ],
  },
  {
    label: "Gestione",
    items: [
      { label: "Rapporti Giornalieri", description: "Report attività", icon: ClipboardList, path: "/rapporti-giornalieri" },
      { label: "SAL", description: "SAL e contabilità", icon: BookOpen, path: "/contabilita-lavori" },
      { label: "Ordini di Servizio", description: "Ordini e disposizioni", icon: FileCheck, path: "/ordini-servizio" },
      { label: "Cronoprogramma", description: "Pianificazione temporale", icon: Calendar, path: "/cronoprogramma" },
      { label: "Scadenzario", description: "Scadenze polizze e documenti", icon: CalendarClock, path: "/scadenzario" },
      { label: "Foto", description: "Galleria fotografica", icon: Camera, path: "/foto" },
    ],
  },
  {
    label: "Economia",
    items: [
      { label: "Economia CSSR", description: "Fatture e centri imputazione", icon: Receipt, path: "/economia-cssr" },
      { label: "Economia Consorziata", description: "Analisi economica", icon: TrendingUp, path: "/economia" },
      { label: "CME", description: "Computo metrico", icon: Calculator, path: "/cme" },
      { label: "Acquisti", description: "Forniture e acquisti", icon: ShoppingCart, path: "/ordini" },
    ],
  },
  {
    label: "Conformità",
    items: [
      { label: "Qualità", description: "PdQ e certificazioni ISO", icon: ClipboardList, path: "/piano-qualita" },
      { label: "Sicurezza", description: "Piano di sicurezza", icon: Shield, path: "/sicurezza" },
      { label: "Ambiente", description: "Gestione ambientale", icon: Leaf, path: "/ambiente" },
      { label: "Subappalti", description: "Qualificazione subappaltatori", icon: HardHatIcon, path: "/subappalti" },
      { label: "Congruità MO", description: "Verifica congruità manodopera", icon: Scale, path: "/congruita-manodopera" },
    ],
  },
  {
    label: "Anagrafica",
    items: [
      { label: "Persone", description: "Dipendenti e collaboratori", icon: Users, path: "/persone" },
      { label: "Aziende", description: "Fornitori e clienti", icon: Building2, path: "/aziende" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Impostazioni", description: "Centri di imputazione e regole", icon: Settings2, path: "/impostazioni" },
    ],
  },
];

// Icon lookup map for restoring from localStorage
const iconMap: Record<string, any> = {
  "/": HardHat, "/report": FileBarChart, "/documenti": FileText, "/progetto": Compass,
  "/eventi": CalendarDays,
  "/rapporti-giornalieri": ClipboardList, "/contabilita-lavori": BookOpen,
  "/ordini-servizio": FileCheck, "/cronoprogramma": Calendar, "/scadenzario": CalendarClock,
  "/foto": Camera, "/economia-cssr": Receipt, "/economia": TrendingUp,
  "/cme": Calculator, "/ordini": ShoppingCart, "/sicurezza": Shield, "/ambiente": Leaf,
  "/persone": Users, "/aziende": Building2, "/impostazioni": Settings2, "/congruita-manodopera": Scale,
  "/piano-qualita": ClipboardList, "/subappalti": HardHatIcon,
};

function loadSavedOrder(): NavSection[] | null {
  try {
    const raw = localStorage.getItem("sidebar-order");
    if (!raw) return null;
    const saved: { label: string; paths: string[] }[] = JSON.parse(raw);
    // Rebuild with icons from defaults
    const allItems = defaultNavSections.flatMap(s => s.items);
    const itemMap = new Map(allItems.map(i => [i.path, i]));
    return saved.map(s => ({
      label: s.label,
      items: s.paths.map(p => itemMap.get(p)).filter(Boolean) as NavItem[],
    }));
  } catch { return null; }
}

function saveOrder(sections: NavSection[]) {
  try {
    const data = sections.map(s => ({ label: s.label, paths: s.items.map(i => i.path) }));
    localStorage.setItem("sidebar-order", JSON.stringify(data));
  } catch {}
}

export function AppSidebar() {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(() => {
    try { return localStorage.getItem("sidebar-pinned") === "true"; } catch { return false; }
  });
  const [sections, setSections] = useState<NavSection[]>(() => loadSavedOrder() || defaultNavSections);
  const [editMode, setEditMode] = useState(false);

  // Drag state
  const dragRef = useRef<{ sectionIdx: number; itemIdx: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ sectionIdx: number; itemIdx: number } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { setCommessaId } = useCommessa();

  const expanded = pinned || hovered;

  const togglePin = () => {
    const next = !pinned;
    setPinned(next);
    try {
      localStorage.setItem("sidebar-pinned", String(next));
      window.dispatchEvent(new Event("sidebar-pin-changed"));
    } catch {}
  };

  const handleDragStart = (sectionIdx: number, itemIdx: number) => {
    dragRef.current = { sectionIdx, itemIdx };
  };

  const handleDragOver = (e: React.DragEvent, sectionIdx: number, itemIdx: number) => {
    e.preventDefault();
    setDragOver({ sectionIdx, itemIdx });
  };

  const handleDrop = useCallback((targetSectionIdx: number, targetItemIdx: number) => {
    const source = dragRef.current;
    if (!source) return;
    if (source.sectionIdx === targetSectionIdx && source.itemIdx === targetItemIdx) {
      dragRef.current = null;
      setDragOver(null);
      return;
    }

    setSections(prev => {
      const next = prev.map(s => ({ ...s, items: [...s.items] }));
      const [removed] = next[source.sectionIdx].items.splice(source.itemIdx, 1);
      next[targetSectionIdx].items.splice(targetItemIdx, 0, removed);
      saveOrder(next);
      return next;
    });

    dragRef.current = null;
    setDragOver(null);
  }, []);

  const handleResetOrder = () => {
    setSections(defaultNavSections);
    try { localStorage.removeItem("sidebar-order"); } catch {}
  };

  return (
    <aside
      onMouseEnter={() => !pinned && setHovered(true)}
      onMouseLeave={() => !pinned && setHovered(false)}
      className={cn(
        "h-screen fixed top-0 left-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 select-none",
        expanded ? "w-[280px] shadow-elevated" : "w-[68px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 h-[64px] border-b border-sidebar-border">
        <button
          onClick={() => navigate("/commesse")}
          title="Torna alla selezione commessa"
          className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <HardHat className="w-[18px] h-[18px] text-primary-foreground" />
        </button>
        {expanded && (
          <button
            onClick={() => navigate("/commesse")}
            className="font-display font-bold text-sidebar-primary-foreground text-[18px] tracking-tight truncate flex-1 text-left hover:opacity-80 transition-opacity"
          >
            Commesse
          </button>
        )}
        {expanded && (
          <button
            onClick={togglePin}
            title={pinned ? "Sblocca sidebar" : "Blocca sidebar"}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
              pinned
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-foreground"
            )}
          >
            {pinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-5">
        {sections.map((section, sIdx) => (
          <div key={section.label}>
            {expanded && (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-sidebar-foreground/50">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item, iIdx) => {
                const active = location.pathname === item.path;
                const isDragTarget = dragOver?.sectionIdx === sIdx && dragOver?.itemIdx === iIdx;

                return (
                  <div
                    key={item.path}
                    draggable={editMode && expanded}
                    onDragStart={() => handleDragStart(sIdx, iIdx)}
                    onDragOver={(e) => handleDragOver(e, sIdx, iIdx)}
                    onDrop={() => handleDrop(sIdx, iIdx)}
                    onDragEnd={() => setDragOver(null)}
                    className={cn(
                      "rounded-lg transition-all duration-150",
                      editMode && isDragTarget && "ring-2 ring-primary/40 bg-primary/5"
                    )}
                  >
                    <Link
                      to={editMode ? "#" : item.path}
                      onClick={editMode ? (e) => e.preventDefault() : undefined}
                      title={!expanded ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150",
                        active && !editMode
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                        editMode && "cursor-grab active:cursor-grabbing"
                      )}
                    >
                      {editMode && expanded && (
                        <GripVertical className="w-4 h-4 text-sidebar-foreground/40 flex-shrink-0" />
                      )}
                      <item.icon className={cn(
                        "w-[20px] h-[20px] flex-shrink-0",
                        active && !editMode ? "text-primary" : "text-sidebar-foreground"
                      )} />
                      {expanded && (
                        <span className="block truncate">{item.label}</span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-3 space-y-2">
        {expanded && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className={cn(
                "flex-1 text-[12px] font-medium py-1.5 px-3 rounded-lg transition-colors",
                editMode
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-foreground"
              )}
            >
              {editMode ? "✓ Fine riordino" : "Riordina menu"}
            </button>
            {editMode && (
              <button
                onClick={handleResetOrder}
                className="text-[12px] font-medium py-1.5 px-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        )}
        <div className={cn("flex gap-2", expanded ? "items-center" : "flex-col items-center")}>
          <button
            onClick={() => navigate("/commesse")}
            title="Cambia Commessa"
            className={cn(
              "flex items-center gap-2 py-1.5 rounded-lg text-[12px] font-medium transition-colors text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-foreground",
              expanded ? "flex-1 px-3" : "w-full justify-center px-0"
            )}
          >
            <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
            {expanded && <span>Cambia Commessa</span>}
          </button>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate("/commesse"); }}
            title="Esci"
            className={cn(
              "flex items-center gap-2 py-1.5 rounded-lg text-[12px] font-medium transition-colors text-destructive/70 hover:bg-destructive/10 hover:text-destructive",
              expanded ? "px-3" : "w-full justify-center px-0"
            )}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {expanded && <span>Esci</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
