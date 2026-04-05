import React, { useState, useRef } from "react";
import { Music, Upload, Play, Pause, Check, Search, TrendingUp, Music2, Plus } from "lucide-react";
import { cn } from "../lib/utils";

interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  thumbnail: string;
}

const TRENDING_SONGS: Song[] = [
  {
    id: "trending-1",
    title: "Tiger Swag (Reels Mix)",
    artist: "Salman Edit Z",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 30,
    thumbnail: "https://picsum.photos/seed/tiger/100/100"
  },
  {
    id: "trending-2",
    title: "Cinematic Aura",
    artist: "VFX Master",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 45,
    thumbnail: "https://picsum.photos/seed/aura/100/100"
  },
  {
    id: "trending-3",
    title: "Neon Nights",
    artist: "Synth Wave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 60,
    thumbnail: "https://picsum.photos/seed/neon/100/100"
  },
  {
    id: "trending-4",
    title: "Phonk Bass Boost",
    artist: "Drift King",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 15,
    thumbnail: "https://picsum.photos/seed/phonk/100/100"
  },
  {
    id: "trending-5",
    title: "Tiger Roar (Trap)",
    artist: "Salman Edit Z",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: 25,
    thumbnail: "https://picsum.photos/seed/roar/100/100"
  },
  {
    id: "trending-6",
    title: "Golden Palace Theme",
    artist: "Royal Beats",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    duration: 50,
    thumbnail: "https://picsum.photos/seed/palace/100/100"
  }
];

interface MusicLibraryProps {
  onSelectMusic: (file: File | string, name: string) => void;
  onBeatSyncToggle: (enabled: boolean) => void;
  isBeatSyncEnabled: boolean;
}

export default function MusicLibrary({ onSelectMusic, onBeatSyncToggle, isBeatSyncEnabled }: MusicLibraryProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePlayPreview = (song: Song) => {
    if (playingId === song.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = song.url;
        audioRef.current.play();
      } else {
        const audio = new Audio(song.url);
        audio.play();
        audioRef.current = audio;
      }
      setPlayingId(song.id);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectMusic(file, file.name);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-pink-500" />
          Music & Audio
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Beat Sync</span>
          <button
            onClick={() => onBeatSyncToggle(!isBeatSyncEnabled)}
            className={cn(
              "w-10 h-5 rounded-full transition-all relative",
              isBeatSyncEnabled ? "bg-pink-600" : "bg-zinc-700"
            )}
          >
            <div className={cn(
              "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
              isBeatSyncEnabled ? "left-6" : "left-1"
            )} />
          </button>
        </div>
      </div>

      {/* Search & Upload */}
      <div className="flex gap-2">
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-pink-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-pink-500 transition-colors" />
          <input
            type="text"
            placeholder="Search Tiger Beats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/50 border border-zinc-700 group-focus-within:border-pink-500/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none transition-all relative z-10"
          />
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-pink-500/30 rounded-xl text-zinc-300 transition-all relative group"
          title="Upload My Own Music"
        >
          <div className="absolute inset-0 bg-pink-500/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          <Upload className="w-5 h-5 relative z-10" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Trending List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-3 h-3 text-pink-400" />
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Trending Now</span>
        </div>
        
        {TRENDING_SONGS.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).map((song) => (
          <div
            key={song.id}
            className="group flex items-center gap-3 p-2 bg-zinc-800/30 hover:bg-zinc-800/60 border border-transparent hover:border-pink-500/20 rounded-2xl transition-all cursor-pointer"
            onClick={() => onSelectMusic(song.url, song.title)}
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPreview(song);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {playingId === song.id ? <Pause className="w-5 h-5 text-white fill-white" /> : <Play className="w-5 h-5 text-white fill-white" />}
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-zinc-200 truncate">{song.title}</h4>
              <p className="text-xs text-zinc-500 truncate">{song.artist}</p>
            </div>
            <div className="text-[10px] font-mono text-zinc-600">
              {song.duration}s
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-pink-600/20 rounded-lg">
              <Plus className="w-4 h-4 text-pink-400" />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 p-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
          <Music2 className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Pro Tip</p>
            <p className="text-[9px] text-zinc-400 leading-relaxed">
              Use **Beat-Sync** to automatically match your video cuts with the music's rhythm for maximum swag! 🦾🔥
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
