

## Piano: Parole chiave centri + indicatore visivo auto-assegnamento

### 1. Migrazione DB: campo `centro_auto_assigned` su `fatture`

Aggiungere una colonna booleana `centro_auto_assigned` (default `false`) alla tabella `fatture` per tracciare se il centro di imputazione e' stato assegnato automaticamente dall'AI.

### 2. `supabase/functions/analyze-document/index.ts`

Quando la edge function assegna automaticamente un `centro_imputazione_id`, settare anche `centro_auto_assigned: true` nell'insert della fattura.

### 3. `src/pages/Impostazioni.tsx`

Aggiornare il placeholder del campo "Regola denominazione" da `{centro}_{numero}_{data}.pdf` a qualcosa di chiaro come `materiale, cemento, nolo, gru` per indicare che sono parole chiave di matching separate da virgola. Aggiornare anche la descrizione in alto nella pagina.

### 4. `src/components/fatture/FattureTable.tsx`

Nella cella "centro", se `centro_auto_assigned === true`, mostrare un'icona `Sparkles` (o `Cpu`) accanto al nome del centro per indicare che e' stato assegnato dall'AI.

### 5. `src/components/fatture/types.ts`

Aggiungere `centro_auto_assigned: boolean` all'interfaccia `Fattura`.

### File da modificare
- Migrazione DB (1 colonna)
- `supabase/functions/analyze-document/index.ts`
- `src/pages/Impostazioni.tsx`
- `src/components/fatture/FattureTable.tsx`
- `src/components/fatture/types.ts`

