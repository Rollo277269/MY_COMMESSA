import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { useCommessa } from "@/contexts/CommessaContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings2, Plus, Trash2, Pencil, Check, X, Tag, GripVertical, Users, ShieldCheck, Crown, Eye, ClipboardCheck, Copy, Loader2, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Centro {
  id: string;
  nome: string;
  tipo: "costo" | "ricavo";
  sezione: "cssr" | "consorziata";
  is_default: boolean;
  sort_order: number;
  regola_denominazione: string | null;
}

interface UserWithRole {
  user_id: string;
  email: string;
  nome: string;
  cognome: string | null;
  role: string;
}

const DEFAULT_CENTRI_CSSR = [
  { nome: "Manodopera", tipo: "costo" as const, sezione: "cssr" as const },
  { nome: "Materiali", tipo: "costo" as const, sezione: "cssr" as const },
  { nome: "Noli e trasporti", tipo: "costo" as const, sezione: "cssr" as const },
  { nome: "Subappalti", tipo: "costo" as const, sezione: "cssr" as const },
  { nome: "Spese generali", tipo: "costo" as const, sezione: "cssr" as const },
  { nome: "Oneri sicurezza", tipo: "costo" as const, sezione: "cssr" as const },
  { nome: "SAL", tipo: "ricavo" as const, sezione: "cssr" as const },
  { nome: "Varianti", tipo: "ricavo" as const, sezione: "cssr" as const },
  { nome: "Lavori extra-contratto", tipo: "ricavo" as const, sezione: "cssr" as const },
];

const DEFAULT_CENTRI_CONSORZIATA = [
  { nome: "Manodopera", tipo: "costo" as const, sezione: "consorziata" as const },
  { nome: "Materiali", tipo: "costo" as const, sezione: "consorziata" as const },
  { nome: "Noli e trasporti", tipo: "costo" as const, sezione: "consorziata" as const },
  { nome: "Subappalti", tipo: "costo" as const, sezione: "consorziata" as const },
  { nome: "Spese generali", tipo: "costo" as const, sezione: "consorziata" as const },
  { nome: "Oneri sicurezza", tipo: "costo" as const, sezione: "consorziata" as const },
  { nome: "SAL", tipo: "ricavo" as const, sezione: "consorziata" as const },
  { nome: "Varianti", tipo: "ricavo" as const, sezione: "consorziata" as const },
  { nome: "Lavori extra-contratto", tipo: "ricavo" as const, sezione: "consorziata" as const },
];

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  ADMIN: { label: "Admin", icon: Crown, color: "text-warning", bg: "bg-warning/10 border-warning/30" },
  DIREZIONE: { label: "Direzione", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10 border-primary/30" },
  UFFICIO_AMMINISTRATIVO: { label: "Ufficio Amm.", icon: ClipboardCheck, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  UFFICIO_GARE: { label: "Ufficio Gare", icon: Tag, color: "text-violet-600", bg: "bg-violet-50 border-violet-200" },
  SOCIO: { label: "Socio", icon: Eye, color: "text-muted-foreground", bg: "bg-muted border-border" },
};

/* ═══════════════════════════════════════════════════════════════════
   User Roles Management Section
   ═══════════════════════════════════════════════════════════════════ */
function UserRolesSection() {
  const { profile, isAdmin, refetch } = useUserProfile();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const currentUserId = profile?.id ?? null;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, nome, cognome, ruolo");

    const userList: UserWithRole[] = (profiles || []).map((p: any) => ({
      user_id: p.id,
      email: p.email || "—",
      nome: p.nome || "—",
      cognome: p.cognome || null,
      role: p.ruolo || "SOCIO",
    }));

    const roleOrder: Record<string, number> = { ADMIN: 0, DIREZIONE: 1, UFFICIO_AMMINISTRATIVO: 2, UFFICIO_GARE: 3, SOCIO: 4 };
    setUsers(userList.sort((a, b) => (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9)));
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSaving(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ruolo: newRole as any })
        .eq("id", userId);
      if (error) throw error;
      toast({ title: `Ruolo aggiornato a ${ROLE_CONFIG[newRole]?.label || newRole}` });
      refetch();
      await loadUsers();
    } catch (err: any) {
      toast({ title: `Errore: ${err.message}`, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">Gestione Ruoli Utenti</h3>
          <Badge variant="secondary" className="text-[10px]">{users.length}</Badge>
        </div>
        {!isAdmin && (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            Solo gli admin possono modificare i ruoli
          </Badge>
        )}
      </div>

      <div className="p-4 pb-2">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {(["ADMIN", "DIREZIONE", "UFFICIO_AMMINISTRATIVO", "UFFICIO_GARE", "SOCIO"] as const).map(role => {
            const config = ROLE_CONFIG[role];
            const count = users.filter(u => u.role === role).length;
            return (
              <div key={role} className={cn("rounded-lg border px-3 py-2.5 text-center", config.bg)}>
                <config.icon className={cn("w-5 h-5 mx-auto mb-1", config.color)} />
                <p className="text-xs font-semibold">{config.label}</p>
                <p className="text-lg font-bold font-display">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utente</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-[180px]">Ruolo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                Caricamento...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                Nessun utente trovato
              </TableCell>
            </TableRow>
          ) : (
            users.map(u => {
              const config = ROLE_CONFIG[u.role] || ROLE_CONFIG.SOCIO;
              const isCurrentUser = u.user_id === currentUserId;
              const canEdit = isAdmin && !isCurrentUser;

              return (
                <TableRow key={u.user_id} className={cn(isCurrentUser && "bg-primary/5")}>
                  <TableCell className="font-medium text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center", config.bg)}>
                        <config.icon className={cn("w-3.5 h-3.5", config.color)} />
                      </div>
                      <span>{[u.nome, u.cognome].filter(Boolean).join(" ") || u.email?.split("@")[0] || "—"}</span>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-[9px] ml-1">Tu</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {canEdit ? (
                      <Select
                        value={u.role}
                        onValueChange={(val) => handleRoleChange(u.user_id, val)}
                        disabled={saving === u.user_id}
                      >
                        <SelectTrigger className="h-8 text-xs w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_CONFIG).map(([value, cfg]) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-1.5">
                                <cfg.icon className={cn("w-3.5 h-3.5", cfg.color)} />
                                {cfg.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className={cn("text-[11px]", config.bg, config.color)}>
                        <config.icon className="w-3 h-3 mr-1" />
                        {config.label}
                        {isCurrentUser && " (tu)"}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Document Checklist Section
   ═══════════════════════════════════════════════════════════════════ */
const DEFAULT_CHECKLIST = [
  "Contratto / Lettera di affidamento",
  "Verbale di consegna lavori",
  "Polizza CAR",
  "Polizza fidejussoria definitiva",
  "POS (Piano Operativo Sicurezza)",
  "PSC (Piano di Sicurezza e Coordinamento)",
  "DUVRI",
  "Nomina CSE",
  "Nomina Direttore Lavori",
  "Nomina RUP",
  "Progetto esecutivo",
  "Computo Metrico Estimativo",
  "Cronoprogramma dei lavori",
  "Attestazione SOA",
  "DURC",
  "Visura camerale",
  "Certificato casellario giudiziale",
  "Piano di gestione rifiuti",
  "Autorizzazioni ambientali",
  "Notifica preliminare ASL",
];

interface ChecklistItem {
  id: string;
  nome: string;
  sezione: string;
  indispensabile: boolean;
  sort_order: number;
}

function ChecklistSection() {
  const { commessaId } = useCommessa();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNome, setNewNome] = useState("");
  const [adding, setAdding] = useState(false);

  const loadChecklist = useCallback(async () => {
    if (!commessaId) return;
    setLoading(true);
    const { data } = await supabase
      .from("cm_checklist_documenti")
      .select("*")
      .eq("cm_commessa_id", commessaId)
      .order("sort_order");

    const loaded = (data as ChecklistItem[]) || [];

    if (loaded.length === 0) {
      // Seed default checklist
      const defaults = DEFAULT_CHECKLIST.map((nome, i) => ({
        cm_commessa_id: commessaId,
        nome,
        sezione: "documenti",
        indispensabile: i < 14, // First 14 are required by default
        sort_order: i,
      }));
      const { data: inserted } = await supabase
        .from("cm_checklist_documenti")
        .insert(defaults)
        .select();
      setItems((inserted as ChecklistItem[]) || []);
    } else {
      setItems(loaded);
    }
    setLoading(false);
  }, [commessaId]);

  useEffect(() => { loadChecklist(); }, [loadChecklist]);

  const toggleIndispensabile = async (id: string, current: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, indispensabile: !current } : i));
    const { error } = await supabase
      .from("cm_checklist_documenti")
      .update({ indispensabile: !current })
      .eq("id", id);
    if (error) {
      toast({ title: "Errore aggiornamento", variant: "destructive" });
      loadChecklist();
    }
  };

  const handleAdd = async () => {
    if (!commessaId || !newNome.trim()) return;
    const { error } = await supabase.from("cm_checklist_documenti").insert({
      cm_commessa_id: commessaId,
      nome: newNome.trim(),
      sezione: "documenti",
      indispensabile: false,
      sort_order: items.length,
    });
    if (error) { toast({ title: "Errore inserimento", variant: "destructive" }); return; }
    toast({ title: "Documento aggiunto alla checklist" });
    setNewNome("");
    setAdding(false);
    loadChecklist();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cm_checklist_documenti").delete().eq("id", id);
    if (error) { toast({ title: "Errore eliminazione", variant: "destructive" }); return; }
    toast({ title: "Voce rimossa" });
    loadChecklist();
  };

  const requiredCount = items.filter(i => i.indispensabile).length;

  return (
    <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">Checklist Documenti</h3>
          <Badge variant="secondary" className="text-[10px]">
            {requiredCount} indispensabili su {items.length}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setAdding(true)}
          disabled={adding}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Aggiungi
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">Indispensabile</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                Caricamento...
              </TableCell>
            </TableRow>
          ) : (
            <>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={item.indispensabile}
                      onCheckedChange={() => toggleIndispensabile(item.id, item.indispensabile)}
                    />
                  </TableCell>
                  <TableCell className={cn("text-sm", item.indispensabile ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {item.nome}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {adding && (
                <TableRow>
                  <TableCell />
                  <TableCell>
                    <Input
                      value={newNome}
                      onChange={(e) => setNewNome(e.target.value)}
                      className="h-8 text-sm"
                      placeholder="Nome documento..."
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewNome(""); } }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={handleAdd} disabled={!newNome.trim()}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setAdding(false); setNewNome(""); }}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main Settings Page
   ═══════════════════════════════════════════════════════════════════ */
export default function ImpostazioniPage() {
  const { toast } = useToast();
  const { isAdmin } = useUserProfile();
  const { commessaId } = useCommessa();
  const [centri, setCentri] = useState<Centro[]>([]);
  const [loading, setLoading] = useState(true);

  // inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editRegola, setEditRegola] = useState("");

  // new row
  const [addingTo, setAddingTo] = useState<{ sezione: string; tipo: string } | null>(null);
  const [newNome, setNewNome] = useState("");
  const [newRegola, setNewRegola] = useState("");

  // drag reorder
  const dragItemRef = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // search & sort
  const [centroSearch, setCentroSearch] = useState("");
  const [sortCol, setSortCol] = useState<"nome" | "regola" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSortToggle = (col: "nome" | "regola") => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const handleReorder = useCallback(async (draggedId: string, targetId: string, items: Centro[]) => {
    if (draggedId === targetId) return;
    const ordered = [...items];
    const fromIdx = ordered.findIndex(c => c.id === draggedId);
    const toIdx = ordered.findIndex(c => c.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = ordered.splice(fromIdx, 1);
    ordered.splice(toIdx, 0, moved);
    const updated = ordered.map((c, i) => ({ ...c, sort_order: i }));
    setCentri(prev => {
      const otherItems = prev.filter(p => !updated.some(u => u.id === p.id));
      return [...otherItems, ...updated].sort((a, b) => a.sort_order - b.sort_order);
    });
    for (const item of updated) {
      await supabase.from("cm_centri_imputazione").update({ sort_order: item.sort_order }).eq("id", item.id);
    }
  }, []);

  const loadData = async () => {
    if (!commessaId) return;
    setLoading(true);
    const { data } = await supabase
      .from("cm_centri_imputazione")
      .select("*")
      .eq("cm_commessa_id", commessaId)
      .order("sort_order");

    const loaded = (data as Centro[]) || [];

    if (loaded.length === 0) {
      const all = [...DEFAULT_CENTRI_CSSR, ...DEFAULT_CENTRI_CONSORZIATA].map((d, i) => ({
        ...d,
        cm_commessa_id: commessaId,
        is_default: true,
        sort_order: i,
        regola_denominazione: null,
      }));
      const { data: inserted } = await supabase.from("cm_centri_imputazione").insert(all).select();
      setCentri((inserted as Centro[]) || []);
    } else {
      setCentri(loaded);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [commessaId]);

  const startEdit = (c: Centro) => {
    setEditingId(c.id);
    setEditNome(c.nome);
    setEditRegola(c.regola_denominazione || "");
  };

  const saveEdit = async () => {
    if (!editingId || !editNome.trim()) return;
    const { error } = await supabase.from("cm_centri_imputazione").update({
      nome: editNome.trim(),
      regola_denominazione: editRegola.trim() || null,
    }).eq("id", editingId);
    if (error) { toast({ title: "Errore aggiornamento", variant: "destructive" }); return; }
    toast({ title: "Centro aggiornato" });
    setEditingId(null);
    loadData();
  };

  const cancelEdit = () => setEditingId(null);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("cm_centri_imputazione").delete().eq("id", id);
    if (error) { toast({ title: "Errore eliminazione", variant: "destructive" }); return; }
    toast({ title: "Centro eliminato" });
    loadData();
  };

  const [applyingAll, setApplyingAll] = useState(false);
  const handleApplyToAll = async () => {
    if (!commessaId || centri.length === 0) return;
    if (!confirm("Questa operazione sostituirà i centri di imputazione di TUTTE le altre commesse con quelli della commessa corrente. Continuare?")) return;
    setApplyingAll(true);
    try {
      // Get all other commesse
      const { data: allCommesse } = await supabase.from("cm_commessa_data").select("id").neq("id", commessaId);
      if (!allCommesse || allCommesse.length === 0) {
        toast({ title: "Nessun'altra commessa trovata" });
        setApplyingAll(false);
        return;
      }

      for (const c of allCommesse) {
        // Delete existing centri for this commessa
        await supabase.from("cm_centri_imputazione").delete().eq("cm_commessa_id", c.id);
        // Insert current centri
        const newCentri = centri.map((centro, i) => ({
          cm_commessa_id: c.id,
          nome: centro.nome,
          tipo: centro.tipo,
          sezione: centro.sezione,
          is_default: centro.is_default,
          sort_order: i,
          regola_denominazione: centro.regola_denominazione,
        }));
        await supabase.from("cm_centri_imputazione").insert(newCentri);
      }
      toast({ title: `Centri applicati a ${allCommesse.length} commesse` });
    } catch {
      toast({ title: "Errore durante l'applicazione", variant: "destructive" });
    } finally {
      setApplyingAll(false);
    }
  };

  const handleAdd = async () => {
    if (!commessaId || !addingTo || !newNome.trim()) return;
    const { error } = await supabase.from("cm_centri_imputazione").insert({
      cm_commessa_id: commessaId,
      nome: newNome.trim(),
      tipo: addingTo.tipo,
      sezione: addingTo.sezione,
      is_default: false,
      sort_order: centri.length,
      regola_denominazione: newRegola.trim() || null,
    });
    if (error) { toast({ title: "Errore inserimento", variant: "destructive" }); return; }
    toast({ title: "Centro aggiunto" });
    setAddingTo(null);
    setNewNome("");
    setNewRegola("");
    loadData();
  };

  const cancelAdd = () => { setAddingTo(null); setNewNome(""); setNewRegola(""); };

  const renderTable = (sezione: "cssr" | "consorziata", tipo: "costo" | "ricavo") => {
    const allItems = centri.filter((c) => c.sezione === sezione && c.tipo === tipo);
    let items = allItems;
    if (centroSearch.trim()) {
      const s = centroSearch.toLowerCase();
      items = items.filter(c => c.nome.toLowerCase().includes(s) || (c.regola_denominazione || "").toLowerCase().includes(s));
    }
    if (sortCol) {
      items = [...items].sort((a, b) => {
        const va = sortCol === "nome" ? a.nome.toLowerCase() : (a.regola_denominazione || "").toLowerCase();
        const vb = sortCol === "nome" ? b.nome.toLowerCase() : (b.regola_denominazione || "").toLowerCase();
        const cmp = va.localeCompare(vb, "it");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    const isAdding = addingTo?.sezione === sezione && addingTo?.tipo === tipo;
    const title = tipo === "costo" ? "Centri di Costo" : "Centri di Ricavo";

    return (
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <div className={cn("flex items-center justify-between px-4 py-3 border-b border-border", tipo === "costo" ? "bg-destructive" : "bg-emerald-600")}>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-white" />
            <h3 className="font-display font-semibold text-sm text-white">{title}</h3>
            <Badge variant={tipo === "costo" ? "secondary" : "default"} className="text-[10px]">
              {items.length}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => { setAddingTo({ sezione, tipo }); setNewNome(""); setNewRegola(""); }}
            disabled={isAdding}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Aggiungi
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="w-[40%] cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSortToggle("nome")}>
                <span className="flex items-center gap-1">
                  Nome
                  {sortCol === "nome" ? (sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer select-none hover:text-foreground transition-colors" onClick={() => handleSortToggle("regola")}>
                <span className="flex items-center gap-1">
                  Parole chiave matching
                  {sortCol === "regola" ? (sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </span>
              </TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">
                  Nessun centro configurato
                </TableCell>
              </TableRow>
            )}
            {items.map((c) => (
              <TableRow
                key={c.id}
                draggable={editingId !== c.id}
                onDragStart={() => { dragItemRef.current = c.id; }}
                onDragOver={(e) => { e.preventDefault(); setDragOverId(c.id); }}
                onDrop={() => { if (dragItemRef.current) { handleReorder(dragItemRef.current, c.id, items); } dragItemRef.current = null; setDragOverId(null); }}
                onDragEnd={() => { dragItemRef.current = null; setDragOverId(null); }}
                className={cn(dragOverId === c.id && "bg-accent")}
              >
                {editingId === c.id ? (
                  <>
                    <TableCell className="w-8 cursor-grab"><GripVertical className="w-4 h-4 opacity-30" /></TableCell>
                    <TableCell>
                      <Input
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editRegola}
                        onChange={(e) => setEditRegola(e.target.value)}
                        className="h-8 text-sm"
                        placeholder="es. materiale, cemento, nolo"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={saveEdit}>
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="w-8 cursor-grab"><GripVertical className="w-4 h-4 opacity-30" /></TableCell>
                    <TableCell className="font-medium text-sm">
                      {c.nome}
                      {c.is_default && (
                        <span className="ml-2 text-[10px] text-muted-foreground">(predefinito)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {c.regola_denominazione || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(c)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm(`Eliminare "${c.nome}"?`)) handleDelete(c.id); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {isAdding && (
              <TableRow>
                <TableCell />
                <TableCell>
                  <Input
                    value={newNome}
                    onChange={(e) => setNewNome(e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Nome centro..."
                    autoFocus
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newRegola}
                    onChange={(e) => setNewRegola(e.target.value)}
                    className="h-8 text-sm"
                    placeholder="es. materiale, cemento, nolo"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={handleAdd} disabled={!newNome.trim()}>
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelAdd}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-3 lg:p-4 max-w-full">
        <PageHeader title="Impostazioni" icon={Settings2} />

        <Tabs defaultValue="centri" className="animate-fade-in">
          <TabsList className="mb-4">
            <TabsTrigger value="centri">
              <Tag className="w-3.5 h-3.5 mr-1.5" /> Centri di Imputazione
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="ruoli">
                <Users className="w-3.5 h-3.5 mr-1.5" /> Ruoli Utenti
              </TabsTrigger>
            )}
            <TabsTrigger value="checklist">
              <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" /> Checklist Documenti
            </TabsTrigger>
          </TabsList>

          <TabsContent value="centri">
            <p className="text-sm text-muted-foreground mb-5">
              Configura i Centri di Costo e di Ricavo per le sezioni CSSR e Consorziata.
              Per ogni centro puoi definire delle <strong>parole chiave</strong> (separate da virgola) per l'assegnamento automatico delle fatture caricate.
              <code className="mx-1 px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                es. materiale, cemento, calcestruzzo
              </code>
            </p>

            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="relative max-w-xs flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={centroSearch}
                  onChange={(e) => setCentroSearch(e.target.value)}
                  placeholder="Cerca centro..."
                  className="h-8 text-sm pl-8"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleApplyToAll} disabled={applyingAll || centri.length === 0}>
                {applyingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                Applica a tutte le commesse
              </Button>
            </div>

            <Tabs defaultValue="cssr">
              <TabsList className="mb-4">
                <TabsTrigger value="cssr">CSSR</TabsTrigger>
                <TabsTrigger value="consorziata">Consorziata</TabsTrigger>
              </TabsList>

              <TabsContent value="cssr">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {renderTable("cssr", "costo")}
                  {renderTable("cssr", "ricavo")}
                </div>
              </TabsContent>

              <TabsContent value="consorziata">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {renderTable("consorziata", "costo")}
                  {renderTable("consorziata", "ricavo")}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="ruoli">
              <p className="text-sm text-muted-foreground mb-5">
                Gestisci i ruoli degli utenti dell'applicazione. I ruoli determinano le azioni che ogni utente può eseguire, incluse le operazioni tramite Rita.
                <strong className="ml-1">Admin</strong> = accesso completo,{" "}
                <strong>Operatore</strong> = lettura e scrittura,{" "}
                <strong>Osservatore</strong> = sola lettura.
              </p>
              <UserRolesSection />
            </TabsContent>
          )}

          <TabsContent value="checklist">
            <p className="text-sm text-muted-foreground mb-5">
              Definisci l'elenco dei documenti di commessa e seleziona quali sono <strong>indispensabili</strong>.
              Nel Report verrà verificata la presenza di ciascun documento indispensabile tra quelli caricati.
            </p>
            <ChecklistSection />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
