import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "ADMIN" | "DIREZIONE" | "UFFICIO_AMMINISTRATIVO" | "UFFICIO_GARE" | "SOCIO";

interface UserProfile {
  id: string;
  email: string | null;
  nome: string | null;
  cognome: string | null;
  ruolo: UserRole;
  socio_id: string | null;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  canViewAllCommesse: boolean;
  refetch: () => void;
}

const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  loading: true,
  isAdmin: false,
  canViewAllCommesse: false,
  refetch: () => {},
});

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, email, nome, cognome, ruolo, socio_id")
      .eq("id", user.id)
      .single();
    setProfile(data as UserProfile | null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isAdmin = profile?.ruolo === "ADMIN";
  const canViewAllCommesse = profile !== null && profile.ruolo !== "SOCIO";

  return (
    <UserProfileContext.Provider value={{ profile, loading, isAdmin, canViewAllCommesse, refetch: fetchProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
