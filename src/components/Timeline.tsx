import { Track } from "../types";
import { Plus, Trash2, Video, Music, Image as ImageIcon, Layers } from "lucide-react";
import { cn } from "../lib/utils";

interface TimelineProps {
  tracks: Track[];
  onAddTrack: () => void;
  onRemoveTrack: (id: string) => void;
  onUpdateTrack: (id: string, updates: Partial<Track>) => void;
  selectedTrackId: string | null;
  onSelectTrack: (id: string) => void;
}

export default function Timeline({
  tracks,
  onAddTrack,
  onRemoveTrack,
  onUpdateTrack,
  selectedTrackId,
  onSelectTrack,
}: TimelineProps) {
  // Sort tracks by zIndex (highest on top)
  const sortedTracks = [...tracks].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Layers</h3>
        <button
          onClick={onAddTrack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          <Plus className="w-3 h-3" />
          Add Layer
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto no-scrollbar">
        {sortedTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 bg-zinc-950/50 border border-dashed border-zinc-900 rounded-2xl text-zinc-700">
            <Layers className="w-6 h-6 mb-2 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No layers added</p>
          </div>
        ) : (
          sortedTracks.map((track) => (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-[0.98]",
                selectedTrackId === track.id
                  ? "bg-zinc-900 border-blue-500/50 shadow-lg shadow-blue-500/5"
                  : "bg-zinc-950 border-zinc-900 hover:border-zinc-800"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                track.type === 'video' ? "bg-red-500/10 text-red-500" :
                track.type === 'audio' ? "bg-green-500/10 text-green-500" :
                "bg-blue-500/10 text-blue-500"
              )}>
                {track.type === 'video' ? <Video className="w-4 h-4" /> :
                 track.type === 'audio' ? <Music className="w-4 h-4" /> :
                 <ImageIcon className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{track.name}</p>
                <p className="text-[8px] text-zinc-600 uppercase tracking-widest font-bold mt-0.5">
                  {track.type} • Layer {track.zIndex}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTrack(track.id);
                }}
                className="p-2 hover:bg-red-500/10 text-zinc-800 hover:text-red-500 transition-all rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
