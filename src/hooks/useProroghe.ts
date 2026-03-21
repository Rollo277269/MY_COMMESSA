import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCommessa } from "@/contexts/CommessaContext";

export interface Proroga {
  id: string;
  motivo: string;
  giorni: number;
  data_concessione: string;
  nuova_data_fine: string;
  note: string | null;
}

export function useProroghe() {
  const qc = useQueryClient();
  const { commessaId } = useCommessa();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["proroghe", commessaId] });

  const query = useQuery({
    queryKey: ["proroghe", commessaId],
    enabled: !!commessaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proroghe")
        .select("*")
        .eq("commessa_id", commessaId!)
        .order("data_concessione", { ascending: true });
      if (error) throw error;
      return data as Proroga[];
    },
  });

  const addProroga = useMutation({
    mutationFn: async (p: Omit<Proroga, "id">) => {
      const { error } = await supabase.from("proroghe").insert({ ...p, commessa_id: commessaId } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Proroga aggiunta" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile aggiungere la proroga", variant: "destructive" });
    },
  });

  const deleteProroga = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("proroghe").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Proroga eliminata" });
    },
    onError: () => {
      toast({ title: "Errore", description: "Impossibile eliminare la proroga", variant: "destructive" });
    },
  });

  return {
    proroghe: query.data ?? [],
    isLoading: query.isLoading,
    addProroga,
    deleteProroga,
  };
}
