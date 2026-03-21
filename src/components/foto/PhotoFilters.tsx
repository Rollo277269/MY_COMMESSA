import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Tag, X } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PhotoFiltersProps {
  documents: any[];
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  selectedTags: string[];
  onSelectedTagsChange: (tags: string[]) => void;
}

export function PhotoFilters({ documents, dateRange, onDateRangeChange, selectedTags, onSelectedTagsChange }: PhotoFiltersProps) {
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    documents.forEach((doc) => {
      const ai = doc.ai_extracted_data;
      if (!ai) return;
      const tags: string[] = ai.tags || ai.categorie || ai.etichette || [];
      tags.forEach((t: string) => { if (typeof t === "string" && t.trim()) tagSet.add(t.trim()); });
      if (ai.tipo_documento) tagSet.add(ai.tipo_documento);
      if (ai.categoria) tagSet.add(ai.categoria);
    });
    return Array.from(tagSet).sort();
  }, [documents]);

  const hasActiveFilters = dateRange.from || dateRange.to || selectedTags.length > 0;
  const activeCount = (dateRange.from || dateRange.to ? 1 : 0) + selectedTags.length;

  const toggleTag = (tag: string) => {
    onSelectedTagsChange(
      selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
    );
  };

  const clearAll = () => {
    onDateRangeChange({});
    onSelectedTagsChange([]);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Date filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1.5", dateRange.from && "border-primary text-primary")}>
            <CalendarIcon className="w-3.5 h-3.5" />
            {dateRange.from ? (
              dateRange.to
                ? `${format(dateRange.from, "dd/MM/yy")} - ${format(dateRange.to, "dd/MM/yy")}`
                : `Dal ${format(dateRange.from, "dd/MM/yy")}`
            ) : (
              "Data"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
            onSelect={(range) => onDateRangeChange({ from: range?.from, to: range?.to })}
            locale={it}
            numberOfMonths={1}
          />
          {dateRange.from && (
            <div className="p-2 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onDateRangeChange({})}>
                Rimuovi filtro data
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className={cn("h-8 text-xs gap-1.5", selectedTags.length > 0 && "border-primary text-primary")}>
              <Tag className="w-3.5 h-3.5" />
              Tag {selectedTags.length > 0 && `(${selectedTags.length})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 max-h-72 overflow-auto" align="start">
            <p className="text-xs font-medium text-muted-foreground mb-2">Tag AI estratti</p>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <Button variant="ghost" size="sm" className="w-full text-xs mt-2" onClick={() => onSelectedTagsChange([])}>
                Rimuovi tutti i tag
              </Button>
            )}
          </PopoverContent>
        </Popover>
      )}

      {/* Active filter indicator + clear */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-muted-foreground hover:text-destructive" onClick={clearAll}>
          <X className="w-3.5 h-3.5" />
          Rimuovi filtri ({activeCount})
        </Button>
      )}
    </div>
  );
}
