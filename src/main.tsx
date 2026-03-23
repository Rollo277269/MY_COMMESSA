import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { supabase } from "@/integrations/supabase/client";

async function bootstrapFromUrl(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const accessToken  = params.get("sb_access_token");
  const refreshToken = params.get("sb_refresh_token");

  if (!accessToken || !refreshToken) return;

  // Pulisci l'URL PRIMA di setSession: i token non devono comparire nella history
  window.history.replaceState({}, "", window.location.pathname);

  const { error } = await supabase.auth.setSession({
    access_token:  accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    // Fallback silenzioso: l'app mostrerà la pagina "Sessione non attiva"
    console.warn("[cross-cassetto] setSession fallita:", error.message);
  }
}

bootstrapFromUrl().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
