import { ReactNode, useState, useEffect, useRef } from "react";
import { LucideIcon, Moon, Sun, Maximize, Minimize, ArrowLeftRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useCommessa } from "@/contexts/CommessaContext";
import { supabase } from "@/integrations/supabase/client";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  actions?: ReactNode;
}

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const toggle = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {}
  };
  return { isFullscreen, toggle };
}

function useDarkMode() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
  };
  return { dark, toggle };
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  const { dark, toggle: toggleDark } = useDarkMode();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const navigate = useNavigate();
  const { commessaId, setCommessaId } = useCommessa();
  const [commessaInfo, setCommessaInfo] = useState<{commessa_consortile?: string;committente?: string;oggetto_lavori?: string;} | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const main = headerRef.current?.closest("main");
    if (!main) return;
    const handler = () => setScrolled(main.scrollTop > 8);
    main.addEventListener("scroll", handler, { passive: true });
    return () => main.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!commessaId) return;
    supabase.from('commessa_data').select('commessa_consortile, committente, oggetto_lavori').eq('id', commessaId).single().
    then(({ data }) => {if (data) setCommessaInfo(data);});
  }, [commessaId]);

  const handleSwitchCommessa = () => {
    setCommessaId(null);
    navigate("/commesse");
  };

  const handleLogout = async () => {
    setCommessaId(null);
    await supabase.auth.signOut();
  };

  const commessaSubtitle = commessaInfo ?
  [commessaInfo.commessa_consortile, commessaInfo.committente, commessaInfo.oggetto_lavori].filter(Boolean).join(" · ") :
  null;

  return (
    <div ref={headerRef} className={cn("sticky top-0 z-30 bg-background flex items-center justify-between pb-3 mb-3 border-b border-border transition-shadow duration-300", scrolled && "shadow-md")}>

      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground tracking-tight">{title}</h1>
          {commessaSubtitle && <p className="text-muted-foreground mt-0.5 truncate max-w-[500px] text-lg">{commessaSubtitle}</p>}
          {description && <p className="text-muted-foreground mt-0.5 text-lg">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5 bg-primary/80 rounded-lg px-2 py-1.5">
        {actions}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-white/20"
          onClick={toggleDark}
          title={dark ? "Modalità giorno" : "Modalità notte"}>
          
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-white/20"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Esci da schermo intero" : "Schermo intero"}>
          
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
        <div className="w-px h-5 bg-white/30 mx-0.5" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-primary-foreground hover:bg-white/20"
          onClick={handleSwitchCommessa}
          title="Cambia commessa">
          
          <ArrowLeftRight className="w-3.5 h-3.5" /> Commesse
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-white/20"
          onClick={handleLogout}
          title="Esci">
          
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>);

}