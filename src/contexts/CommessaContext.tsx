import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CommessaContextType {
  commessaId: string | null;
  setCommessaId: (id: string | null) => void;
}

const CommessaContext = createContext<CommessaContextType>({ commessaId: null, setCommessaId: () => {} });

export function CommessaProvider({ children }: { children: ReactNode }) {
  const [commessaId, setCommessaIdState] = useState<string | null>(() => {
    return localStorage.getItem("selectedCommessaId");
  });

  const setCommessaId = (id: string | null) => {
    setCommessaIdState(id);
    if (id) localStorage.setItem("selectedCommessaId", id);
    else localStorage.removeItem("selectedCommessaId");
  };

  // [U03] Sincronizza commessaId tra tab: se l'utente cambia commessa in un'altra tab,
  // questa tab si aggiorna immediatamente evitando scritture sulla commessa sbagliata.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedCommessaId") {
        setCommessaIdState(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <CommessaContext.Provider value={{ commessaId, setCommessaId }}>
      {children}
    </CommessaContext.Provider>
  );
}

export function useCommessa() {
  return useContext(CommessaContext);
}
