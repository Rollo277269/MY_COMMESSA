import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommessa } from "@/contexts/CommessaContext";
import { useToast } from "@/hooks/use-toast";
import { sortDocumentsByDate } from "@/lib/sortDocumentsByDate";

export type DocumentSection =
  | "documenti"
  | "sicurezza"
  | "ambiente"
  | "contabilita-lavori"
  | "foto"
  | "progetto"
  | "rapporti-giornalieri";

export function useDocumentPage(section: DocumentSection) {
  const { commessaId } = useCommessa();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["documents", section, commessaId];

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey }),
    [queryClient, section, commessaId]
  );

  const { data: documents = [], isLoading: loading, isError: hasError, refetch: fetchDocuments } = useQuery({
    queryKey,
    enabled: !!commessaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("section", section)
        .eq("commessa_id", commessaId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return sortDocumentsByDate(data || []);
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, filePath }: { id: string; filePath: string }) => {
      const { error: docErr } = await supabase.from("documents").delete().eq("id", id);
      if (docErr) throw docErr;
      await supabase.storage.from("documents").remove([filePath]);
    },
    onSuccess: () => {
      toast({ title: "Documento eliminato" });
      invalidate();
    },
    onError: (err: Error) => {
      toast({ title: "Errore eliminazione", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, aiData, fileName }: { id: string; aiData: any; fileName?: string }) => {
      const payload: any = { ai_extracted_data: aiData };
      if (fileName) payload.file_name = fileName;
      const { error } = await supabase.from("documents").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Documento aggiornato" });
      invalidate();
    },
    onError: (err: Error) => {
      toast({ title: "Errore aggiornamento", description: err.message, variant: "destructive" });
    },
  });

  const handleDelete = useCallback(
    (id: string, filePath: string) => deleteMutation.mutate({ id, filePath }),
    [deleteMutation]
  );

  const handleUpdate = useCallback(
    (id: string, aiData: any, fileName?: string) => updateMutation.mutate({ id, aiData, fileName }),
    [updateMutation]
  );

  return {
    documents,
    loading,
    hasError,
    fetchDocuments,
    handleDelete,
    handleUpdate,
  };
}
