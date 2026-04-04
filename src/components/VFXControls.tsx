import React from "react";
import { Sparkles, Video, Loader2, Music } from "lucide-react";
import { cn } from "../lib/utils";
import { StyleType } from "../types";

interface VFXControlsProps {
  isStylizing: boolean;
  selectedTrackType: string | undefined;
  onStylize: (style: StyleType) => void;
  onVideoTransform: () => void;
  onOpenMusic: () => void;
}

export default function VFXControls({ 
  isStylizing, 
  selectedTrackType, 
  onStylize, 
  onVideoTransform,
  onOpenMusic
}: VFXControlsProps) {
  const isDisabled = isStylizing || selectedTrackType !== 'image';

  return (
    <div className="space-y-6">
      {/* AI Styles Horizontal Scroll */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => onStylize('cinematic-model')}
          disabled={isDisabled}
          className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-28 h-28 bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {isStylizing ? <Loader2 className="w-6 h-6 animate-spin text-amber-500" /> : <Sparkles className="w-6 h-6 text-amber-500" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Cinematic<br/>Holiya</span>
        </button>

        <button
          onClick={() => onStylize('anime' as any)}
          disabled={isDisabled}
          className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-28 h-28 bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {isStylizing ? <Loader2 className="w-6 h-6 animate-spin text-indigo-500" /> : <Sparkles className="w-6 h-6 text-indigo-500" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Anime<br/>Holiya</span>
        </button>

        <button
          onClick={() => onStylize('3d-avatar' as any)}
          disabled={isDisabled}
          className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-28 h-28 bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {isStylizing ? <Loader2 className="w-6 h-6 animate-spin text-purple-500" /> : <Sparkles className="w-6 h-6 text-purple-500" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-center">3D Avatar<br/>Holiya</span>
        </button>

        <button
          onClick={() => onStylize('gold-palace')}
          disabled={isDisabled}
          className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-28 h-28 bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {isStylizing ? <Loader2 className="w-6 h-6 animate-spin text-yellow-500" /> : <Sparkles className="w-6 h-6 text-yellow-500" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Gold Palace<br/>(Local)</span>
        </button>

        <button
          onClick={() => onStylize('wolf-forest')}
          disabled={isDisabled}
          className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-28 h-28 bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {isStylizing ? <Loader2 className="w-6 h-6 animate-spin text-green-500" /> : <Sparkles className="w-6 h-6 text-green-500" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Wolf Forest<br/>(Local)</span>
        </button>

        <button
          onClick={onVideoTransform}
          disabled={isDisabled}
          className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-28 h-28 bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-3xl text-red-400 hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          {isStylizing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Video className="w-6 h-6" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-center">AI Video<br/>Morph</span>
        </button>
      </div>

      {/* VFX Filters Section (Zero API) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">VFX Filters (Zero API)</h3>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-green-500" />
            <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Local Swag</span>
          </div>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'vibrant', label: 'Vibrant', color: 'text-orange-500' },
            { id: 'cinematic-black', label: 'Cinematic Black', color: 'text-zinc-400' },
            { id: 'gold-glow', label: 'Gold Glow', color: 'text-amber-500' },
            { id: 'sharp-detail', label: 'Sharp Detail', color: 'text-blue-400' },
            { id: 'soft-blur', label: 'Soft Blur', color: 'text-purple-400' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => onStylize(filter.id as any)}
              className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-24 h-24 bg-zinc-950 border border-zinc-900 rounded-2xl hover:border-zinc-700 transition-all active:scale-95"
            >
              <div className={cn("p-2 bg-zinc-900 rounded-xl", filter.color)}>
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
