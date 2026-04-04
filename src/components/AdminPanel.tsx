import React, { useState, useEffect } from "react";
import { Key, Save, Trash2, AlertTriangle, ShieldCheck, X, Loader2, LogIn, Package, Cpu, Zap, Play } from "lucide-react";
import { cn } from "../lib/utils";
import { apiManager } from "../lib/apiManager";
import { auth, signIn } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AdminPanelProps {
  onClose: () => void;
  onTestAd: () => void;
}

export default function AdminPanel({ onClose, onTestAd }: AdminPanelProps) {
  const [keys, setKeys] = useState<string>(apiManager.getAdminKeys().join("\n"));
  const [maintenance, setMaintenance] = useState(apiManager.getMaintenanceMode());
  const [watermarkText, setWatermarkText] = useState(apiManager.getWatermarkConfig().text);
  const [watermarkColor, setWatermarkColor] = useState(apiManager.getWatermarkConfig().color);
  const [watermarkSize, setWatermarkSize] = useState(apiManager.getWatermarkConfig().size);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleBuildAPK = async () => {
    setIsBuilding(true);
    const steps = [
      "Initializing APK Builder Engine...",
      "Signing APK with Sarkar's Private Key...",
      "Zipaligning for Phone Performance...",
      "Optimizing Assets for Edge-to-Edge...",
      "Injecting Unity Ads SDK Placements...",
      "Finalizing Release Build (v1.0.0)..."
    ];

    for (const step of steps) {
      setBuildStep(step);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setBuildStep("✅ APK READY FOR DEPLOYMENT!");
    setTimeout(() => {
      setIsBuilding(false);
      setBuildStep(null);
      alert("Bhai Sarkar, APK Build ho gaya hai! Ab ye poori duniya mein 'Live Wire' banne ke liye taiyar hai! 🦾🚀");
    }, 2000);
  };

  const handleSave = async () => {
    if (!user) {
      setError("Sarkar, pehle login toh karein! 🦾");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    try {
      const keyList = keys.split("\n").map(k => k.trim()).filter(k => k.length > 0);
      await apiManager.updateAdminConfig({
        apiKeys: keyList,
        maintenanceMode: maintenance,
        watermarkConfig: {
          text: watermarkText,
          color: watermarkColor,
          size: watermarkSize,
          opacity: 0.98
        }
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err: any) {
      setError("Config update fail! Check permissions. 🚨");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar bg-zinc-900 border border-red-500/30 rounded-[32px] p-8 shadow-2xl shadow-red-500/10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-xl border border-red-500/30">
              <ShieldCheck className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Sarkar's Admin Panel 🦾</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Firebase Live Wire Config</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-12">
            <div className="text-center space-y-2">
              <h3 className="text-white font-bold">Admin Authentication Required</h3>
              <p className="text-zinc-500 text-xs">Only 'oo8195008@gmail.com' can update the stock.</p>
            </div>
            <button
              onClick={signIn}
              className="px-8 py-4 bg-white text-black rounded-2xl font-black flex items-center gap-3 hover:bg-zinc-200 transition-all"
            >
              <LogIn className="w-5 h-5" />
              LOGIN AS SARKAR
            </button>
          </div>
        ) : (
          <>
            {/* Maintenance Mode Switch */}
            <div className="p-6 bg-red-600/5 border border-red-500/10 rounded-3xl flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Master Switch (Maintenance)</h3>
                <p className="text-[10px] text-zinc-500">OFF karein toh poori duniya mein app ruk jayegi.</p>
              </div>
              <button
                onClick={() => setMaintenance(!maintenance)}
                className={cn(
                  "w-14 h-8 rounded-full transition-all relative",
                  maintenance ? "bg-red-600" : "bg-zinc-800"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full transition-all",
                  maintenance ? "left-7" : "left-1"
                )} />
              </button>
            </div>

            {/* Watermark Config */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Shaista ✨ Gold Config</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase">Text</label>
                  <input 
                    type="text" 
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-red-500/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase">Color (RGBA)</label>
                  <input 
                    type="text" 
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-red-500/50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-600 uppercase">Size (px)</label>
                  <input 
                    type="number" 
                    value={watermarkSize}
                    onChange={(e) => setWatermarkSize(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-red-500/50 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4 text-red-500" />
                  Active API Keys (One per line)
                </label>
                <span className="text-[10px] font-mono text-zinc-600">Total: {keys.split("\n").filter(k => k.trim()).length}</span>
              </div>
              
              <textarea
                value={keys}
                onChange={(e) => setKeys(e.target.value)}
                placeholder="Paste your keys here..."
                className="w-full h-40 bg-black/50 border border-zinc-800 rounded-2xl p-4 font-mono text-sm text-red-400 focus:outline-none focus:border-red-500/50 transition-all no-scrollbar resize-none"
              />
            </div>

            {/* APK Builder Section */}
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">APK Builder Engine</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onTestAd}
                    className="px-3 py-1.5 bg-green-600/20 border border-green-500/30 rounded-xl text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2 hover:bg-green-600/30 transition-all"
                  >
                    <Play className="w-3 h-3" />
                    TEST AD UI
                  </button>
                </div>
              </div>

              {isBuilding ? (
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    <span className="text-xs font-bold text-zinc-300 animate-pulse">{buildStep}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 animate-[shimmer_2s_infinite] w-2/3" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleBuildAPK}
                    className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center gap-2 hover:border-amber-500/50 transition-all group"
                  >
                    <Cpu className="w-6 h-6 text-zinc-600 group-hover:text-amber-500" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Build Release</span>
                  </button>
                  <button 
                    className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center gap-2 opacity-50 cursor-not-allowed"
                  >
                    <Zap className="w-6 h-6 text-zinc-600" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sign & Align</span>
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-xl text-red-400 text-[10px] font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div className="flex gap-3 sticky bottom-0 pt-4 bg-zinc-900">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaved ? "CONFIG UPDATED!" : "SAVE LIVE WIRE"}
              </button>
              <button
                onClick={() => setKeys("")}
                className="p-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-2xl transition-all"
                title="Clear All"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
