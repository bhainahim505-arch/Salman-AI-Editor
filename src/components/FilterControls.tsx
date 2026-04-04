import { FilterType } from "../lib/filters";
import { Sparkles, Moon, Sun } from "lucide-react";
import { cn } from "../lib/utils";

interface FilterControlsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function FilterControls({ currentFilter, onFilterChange }: FilterControlsProps) {
  const filters = [
    { id: 'none', name: 'Original', icon: Sparkles, color: 'bg-zinc-800' },
    { id: 'sacred-wolf', name: 'Sacred Wolf', icon: Moon, color: 'bg-indigo-900/50 text-indigo-200 border-indigo-500/50' },
    { id: 'holy-light', name: 'Holy Light', icon: Sun, color: 'bg-amber-900/50 text-amber-200 border-amber-500/50' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-2xl">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id as FilterType)}
          className={cn(
            "group relative flex flex-col items-center gap-2 px-6 py-4 rounded-2xl transition-all duration-300",
            "hover:scale-105 active:scale-95",
            currentFilter === filter.id 
              ? cn("ring-2 ring-blue-500 shadow-lg shadow-blue-500/20", filter.color)
              : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          )}
        >
          <div className={cn(
            "p-3 rounded-xl transition-colors",
            currentFilter === filter.id ? "bg-white/10" : "bg-zinc-700/50 group-hover:bg-zinc-700"
          )}>
            <filter.icon className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold tracking-wide uppercase">
            {filter.name}
          </span>
          {currentFilter === filter.id && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
}
