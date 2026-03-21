export interface Fattura {
  id: string;
  tipo: "vendita" | "acquisto";
  numero: string;
  data: string;
  fornitore_cliente: string;
  descrizione: string | null;
  importo: number;
  aliquota_iva: number;
  importo_iva: number;
  importo_totale: number;
  importo_incassato: number;
  stato_pagamento: string;
  data_scadenza: string | null;
  centro_imputazione_id: string | null;
  file_path: string | null;
  note: string | null;
  cig: string | null;
  cup: string | null;
  split_payment: boolean;
  ritenuta_acconto: number | null;
  codice_sdi: string | null;
  centro_auto_assigned: boolean;
}

export interface CentroImputazione {
  id: string;
  nome: string;
  tipo: "costo" | "ricavo";
  is_default: boolean;
  sort_order: number;
}

export type FatturaColumnKey =
  | "tipo"
  | "numero"
  | "data"
  | "fornitore"
  | "cliente"
  | "descrizione"
  | "centro"
  | "importo"
  | "aliquota_iva"
  | "importo_iva"
  | "importo_totale"
  | "incassato"
  | "residuo"
  | "stato_pagamento"
  | "data_scadenza"
  | "cig"
  | "cup"
  | "codice_sdi";

export const ALL_FATTURA_COLUMNS: { key: FatturaColumnKey; label: string }[] = [
  { key: "tipo", label: "Tipo" },
  { key: "numero", label: "Numero" },
  { key: "data", label: "Data" },
  { key: "fornitore", label: "Fornitore" },
  { key: "cliente", label: "Cliente" },
  { key: "descrizione", label: "Descrizione" },
  { key: "centro", label: "Centro" },
  { key: "importo", label: "Imponibile" },
  { key: "aliquota_iva", label: "Aliquota IVA" },
  { key: "importo_iva", label: "IVA" },
  { key: "importo_totale", label: "Totale" },
  { key: "incassato", label: "Pagato" },
  { key: "residuo", label: "Differenza" },
  { key: "stato_pagamento", label: "Stato" },
  { key: "data_scadenza", label: "Scadenza" },
  { key: "cig", label: "CIG" },
  { key: "cup", label: "CUP" },
  { key: "codice_sdi", label: "Codice SDI" },
];

export const DEFAULT_FATTURA_COLUMNS: FatturaColumnKey[] = [
  "tipo", "numero", "data", "fornitore", "cliente", "centro", "importo", "aliquota_iva", "importo_iva", "importo_totale", "incassato", "residuo", "stato_pagamento",
];

export const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" as any }).format(v);

export const fmtNumber = (v: number, decimals = 2) =>
  new Intl.NumberFormat("it-IT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: "always" as any }).format(v);

export const fmtPercent = (v: number) =>
  new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" as any }).format(v) + "%";

export const statoPagamentoLabel: Record<string, string> = {
  da_pagare: "Da pagare",
  pagata: "Pagata",
  scaduta: "Scaduta",
};

/** Returns context-aware label: "Incassata" for paid sales, "Pagata" for paid purchases */
export function getStatoPagamentoLabel(stato: string, tipo: string): string {
  if (stato === "pagata") return tipo === "vendita" ? "Incassata" : "Pagata";
  if (stato === "da_pagare") return tipo === "vendita" ? "Da incassare" : "Da pagare";
  return statoPagamentoLabel[stato] || stato;
}

export const statoPagamentoColor: Record<string, string> = {
  da_pagare: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  pagata: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  scaduta: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};
