import { useState, useEffect } from "react";
import { auth, signIn, logOut } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Editor from "./components/Editor";
import MediaUpload from "./components/MediaUpload";
import { LogOut, User as UserIcon, Zap, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MediaType } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [media, setMedia] = useState<{ file: File; type: MediaType } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleMediaSelect = (file: File, type: MediaType) => {
    setMedia({ file, type });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">
                SALMAN-EDIT-Z
              </h1>
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3" />
                Advanced AI Engine
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-zinc-200">{user.displayName}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Pro Editor</span>
                </div>
                <div className="relative group">
                  <img
                    src={user.photoURL || ""}
                    alt={user.displayName || ""}
                    className="w-10 h-10 rounded-full border-2 border-zinc-800 group-hover:border-blue-500 transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={logOut}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-zinc-200 transition-all active:scale-95"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!media ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-12"
            >
              <div className="text-center space-y-4 max-w-2xl">
                <h2 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                  Edit Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Pro</span>
                </h2>
                <p className="text-zinc-400 text-lg">
                  Advanced background removal, cinematic filters, and AI-powered enhancements. 
                  Inspired by CapCut, built for the next generation of creators.
                </p>
              </div>
              
              <div className="w-full max-w-3xl">
                <MediaUpload onMediaSelect={handleMediaSelect} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl mt-8">
                {[
                  { title: "AI BG Removal", desc: "Clean edges with MediaPipe technology", icon: Wand2Icon },
                  { title: "Sacred Wolf", desc: "Dark cinematic aesthetic for your shots", icon: MoonIcon },
                  { title: "Holy Light", desc: "Golden divine glow for perfect lighting", icon: SunIcon },
                ].map((feature, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
                    <feature.icon className="w-8 h-8 text-blue-500 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Editor
                initialMedia={media}
                onReset={() => setMedia(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 text-zinc-500 font-medium">
            <Zap className="w-4 h-4" />
            <span>Salman-Edit-Z © 2026</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icons for features
function Wand2Icon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>; }
function MoonIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>; }
function SunIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>; }
