import { LucideIcon, Plus, Upload, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionPlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  items?: { label: string; sublabel: string; icon: LucideIcon }[];
}

export function SectionPlaceholder({ icon: Icon, title, description, items }: SectionPlaceholderProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Actions bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Cerca in ${title.toLowerCase()}...`}
            className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
          <Upload className="w-4 h-4" /> Carica
        </Button>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
          <Plus className="w-4 h-4" /> Nuovo
        </Button>
      </div>

      {/* Content */}
      {items && items.length > 0 ? (
        <div className="grid gap-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-card rounded-lg border border-border p-4 hover:shadow-card transition-shadow cursor-pointer"
            >
              <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-display font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">{description}</p>
          <Button size="sm" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
            <Plus className="w-4 h-4" /> Aggiungi il primo elemento
          </Button>
        </div>
      )}
    </div>
  );
}
