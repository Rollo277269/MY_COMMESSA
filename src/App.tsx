import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CommessaProvider, useCommessa } from "@/contexts/CommessaContext";
import type { Session } from "@supabase/supabase-js";

import Auth from "./pages/Auth";
import SelezionaCommessa from "./pages/SelezionaCommessa";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Documenti from "./pages/Documenti";
import Sicurezza from "./pages/Sicurezza";
import Ambiente from "./pages/Ambiente";
import Progetto from "./pages/Progetto";
import Persone from "./pages/Persone";
import Aziende from "./pages/Aziende";
import Cronoprogramma from "./pages/Cronoprogramma";
import Economia from "./pages/Economia";
import EconomiaCSSR from "./pages/EconomiaCSSR";
import CME from "./pages/CME";
import Ordini from "./pages/Ordini";
import RapportiGiornalieri from "./pages/RapportiGiornalieri";
import ContabilitaLavori from "./pages/ContabilitaLavori";
import OrdiniServizio from "./pages/OrdiniServizio";
import Foto from "./pages/Foto";
import ReportCommessa from "./pages/ReportCommessa";
import Impostazioni from "./pages/Impostazioni";
import Scadenzario from "./pages/Scadenzario";
import CongruitaManodopera from "./pages/CongruitaManodopera";
import PianoQualita from "./pages/PianoQualita";
import Subappalti from "./pages/Subappalti";
import Eventi from "./pages/Eventi";

const queryClient = new QueryClient();

function RequireCommessa({ children }: { children: React.ReactNode }) {
  const { commessaId } = useCommessa();
  const location = useLocation();
  if (!commessaId) {
    sessionStorage.setItem("postCommessaRedirect", location.pathname + location.search);
    return <Navigate to="/commesse" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Caricamento...</div>;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Auth />} />
      </Routes>
    );
  }

  return (
    <CommessaProvider>
      <Routes>
        <Route path="/commesse" element={<SelezionaCommessa />} />
        <Route path="/" element={<RequireCommessa><Index /></RequireCommessa>} />
        <Route path="/documenti" element={<RequireCommessa><Documenti /></RequireCommessa>} />
        <Route path="/sicurezza" element={<RequireCommessa><Sicurezza /></RequireCommessa>} />
        <Route path="/ambiente" element={<RequireCommessa><Ambiente /></RequireCommessa>} />
        <Route path="/progetto" element={<RequireCommessa><Progetto /></RequireCommessa>} />
        <Route path="/persone" element={<RequireCommessa><Persone /></RequireCommessa>} />
        <Route path="/aziende" element={<RequireCommessa><Aziende /></RequireCommessa>} />
        <Route path="/cronoprogramma" element={<RequireCommessa><Cronoprogramma /></RequireCommessa>} />
        <Route path="/economia" element={<RequireCommessa><Economia /></RequireCommessa>} />
        <Route path="/economia-cssr" element={<RequireCommessa><EconomiaCSSR /></RequireCommessa>} />
        <Route path="/cme" element={<RequireCommessa><CME /></RequireCommessa>} />
        <Route path="/ordini" element={<RequireCommessa><Ordini /></RequireCommessa>} />
        <Route path="/rapporti-giornalieri" element={<RequireCommessa><RapportiGiornalieri /></RequireCommessa>} />
        <Route path="/contabilita-lavori" element={<RequireCommessa><ContabilitaLavori /></RequireCommessa>} />
        <Route path="/ordini-servizio" element={<RequireCommessa><OrdiniServizio /></RequireCommessa>} />
        <Route path="/foto" element={<RequireCommessa><Foto /></RequireCommessa>} />
        <Route path="/report" element={<RequireCommessa><ReportCommessa /></RequireCommessa>} />
        <Route path="/impostazioni" element={<RequireCommessa><Impostazioni /></RequireCommessa>} />
        <Route path="/scadenzario" element={<RequireCommessa><Scadenzario /></RequireCommessa>} />
        <Route path="/congruita-manodopera" element={<RequireCommessa><CongruitaManodopera /></RequireCommessa>} />
        <Route path="/piano-qualita" element={<RequireCommessa><PianoQualita /></RequireCommessa>} />
        <Route path="/subappalti" element={<RequireCommessa><Subappalti /></RequireCommessa>} />
        <Route path="/eventi" element={<RequireCommessa><Eventi /></RequireCommessa>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CommessaProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
