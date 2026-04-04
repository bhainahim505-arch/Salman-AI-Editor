import React from "react";
import { Plus, Wand2, Zap, Flame, Loader2, Key, Crown, Activity } from "lucide-react";
import { cn } from "../lib/utils";

interface CapCutToolbarProps {
  onUpload: () => void;
  onMorph: () => void;
  glowIntensity: number;
  onGlowChange: (val: number) => void;
  onSacredWolf: () => void;
  isStylizing: boolean;
  isSacredWolfActive: boolean;
  isDisabled: boolean;
  apiStatus: number;
  userRemaining: number;
  isLocalMode: boolean;
  customKey: string | null;
  onCustomKeyChange: (key: string) => void;
}

export default function CapCutToolbar({
  onUpload,
  onMorph,
  glowIntensity,
  onGlowChange,
  onSacredWolf,
  isStylizing,
  isSacredWolfActive,
  isDisabled,
  apiStatus,
  userRemaining,
  isLocalMode,
  customKey,
  onCustomKeyChange,
}: CapCutToolbarProps) {
  return (
    <div className="w-full bg-black/80 backdrop-blur-xl border-t border-zinc-800 px-4 py-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Top Bar: Status & Pro */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 rounded-full border border-blue-500/30">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.15em]">Zero-API Mode: Active</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
              <Activity className="w-3.5 h-3.5 text-zinc-500" />
              <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    userRemaining > 0 ? "bg-green-500" : "bg-red-500"
                  )}
                  style={{ width: `${(userRemaining / 1) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Free Credits: {userRemaining}/1</span>
            </div>
          </div>

          <button 
            onClick={() => window.open('https://ai.google.dev/pricing', '_blank')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-white rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-lg transition-all active:scale-95",
              userRemaining === 0 
                ? "bg-gradient-to-r from-red-600 to-orange-600 shadow-red-500/40 animate-pulse" 
                : "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20 hover:from-amber-400 hover:to-orange-500"
            )}
          >
            <Crown className="w-3.5 h-3.5" />
            {userRemaining === 0 ? "Credits Expired - Upgrade" : "Upgrade to Pro"}
          </button>
        </div>

        {/* Custom Key & Local Mode Info */}
        <div className="flex flex-col gap-2 px-2">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3 bg-zinc-900/50 rounded-xl px-4 py-2 border border-zinc-800">
              <Key className="w-4 h-4 text-zinc-500" />
              <input 
                type="password"
                placeholder="Enter your own Google API Key (Optional)"
                value={customKey || ''}
                onChange={(e) => onCustomKeyChange(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-zinc-300 w-full placeholder:text-zinc-600"
              />
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/30 rounded-xl text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              100% Local Engine (WASM)
            </div>
          </div>
          <p className="text-[9px] text-zinc-600 px-1">
            💡 **Zero-API Mode Active:** All filters and background removal are processed locally on your device. 
          </p>
        </div>

        {/* Main Toolbar */}
        <div className="overflow-x-auto no-scrollbar flex items-center gap-6 pb-2">
          {/* Upload Button */}
          <button
            onClick={onUpload}
            className="flex flex-col items-center gap-2 min-w-[80px] group transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:bg-zinc-700 group-hover:border-blue-500/50 transition-all">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Upload</span>
          </button>

          {/* AI Morph Button */}
          <button
            onClick={onMorph}
            disabled={isDisabled || isStylizing}
            className="flex flex-col items-center gap-2 min-w-[80px] group transition-all disabled:opacity-50"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center border border-indigo-400/30 group-hover:scale-105 transition-all shadow-lg shadow-indigo-500/20">
              {isStylizing ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Wand2 className="w-6 h-6 text-white" />}
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">AI Morph</span>
          </button>

          {/* Flash/Glow Control */}
          <div className="flex flex-col items-center gap-2 min-w-[160px] px-4 border-x border-zinc-800">
            <div className="flex items-center gap-3 w-full">
              <Zap className={cn("w-5 h-5 transition-colors", glowIntensity > 0.5 ? "text-yellow-400" : "text-zinc-500")} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={glowIntensity}
                onChange={(e) => onGlowChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Flash Intensity</span>
          </div>

          {/* Sacred Wolf Button */}
          <button
            onClick={onSacredWolf}
            className="flex flex-col items-center gap-2 min-w-[80px] group transition-all"
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all relative overflow-hidden",
              isSacredWolfActive 
                ? "bg-red-600/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" 
                : "bg-zinc-800 border-zinc-700 group-hover:border-red-500/50"
            )}>
              {isSacredWolfActive && (
                <div className="absolute inset-0 border-2 border-red-500 animate-pulse rounded-2xl" />
              )}
              <Flame className={cn("w-6 h-6", isSacredWolfActive ? "text-red-500" : "text-white")} />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Sacred Wolf</span>
          </button>
        </div>
      </div>
    </div>
  );
}
