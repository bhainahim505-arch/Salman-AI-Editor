import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { FilterType, applyFilters } from "../lib/filters";
import { GoogleGenAI } from "@google/genai";
import { Download, Share2, Trash2, Loader2, Wand2, Plus, Layers, Music, Video, Image as ImageIcon, Sparkles, Activity, Crown, Maximize, Minimize, X, AlertTriangle, Play } from "lucide-react";
import { unityAds } from "../lib/unityAds";
import FilterControls from "./FilterControls";
import Timeline from "./Timeline";
import CapCutToolbar from "./CapCutToolbar";
import VFXControls from "./VFXControls";
import MusicLibrary from "./MusicLibrary";
import AdminPanel from "./AdminPanel";
import { apiManager } from "../lib/apiManager";
import { cn } from "../lib/utils";
import { Track, MediaType, StyleType } from "../types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  color: string;
  type: 'smoke' | 'fire' | 'spark';
}

interface EditorProps {
  initialMedia: { file: File; type: MediaType };
  onReset: () => void;
}

export default function Editor({ initialMedia, onReset }: EditorProps) {
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "bg-track",
      type: "image",
      file: new File([], "Background"),
      url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1920&auto=format&fit=crop", // Dark moody cinematic bg
      startTime: 0,
      duration: 0,
      zIndex: 0,
      name: "Cinematic Background",
      isBgRemoved: false,
    },
    {
      id: "track-1",
      type: initialMedia.type,
      file: initialMedia.file,
      url: URL.createObjectURL(initialMedia.file),
      startTime: 0,
      duration: 0,
      zIndex: 1,
      name: initialMedia.file.name,
      isBgRemoved: true, // Auto-trigger BG removal
    },
    {
      id: "default-music",
      type: "audio",
      file: new File([], "Trending Reel Instrumental"),
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Default trending track
      startTime: 0,
      duration: 0,
      zIndex: 2,
      name: "Trending Reel Instrumental",
      isBgRemoved: false,
    }
  ]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>("track-1");
  const [filter, setFilter] = useState<FilterType>("sacred-wolf"); // Default cinematic filter
  const [isProcessing, setIsProcessing] = useState(true);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isStylizing, setIsStylizing] = useState(false);
  const [hasAutoStylized, setHasAutoStylized] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  const [apiStatus, setApiStatus] = useState(apiManager.getGlobalStatus());
  const [userRemaining, setUserRemaining] = useState(apiManager.getUserRemaining());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(apiManager.getMaintenanceMode());
  const [watermark, setWatermark] = useState(apiManager.getWatermarkConfig());
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [adminAlert, setAdminAlert] = useState<string | null>(null);
  const [customKey, setCustomKey] = useState<string | null>(apiManager.getCustomKey());
  const [isMusicLibraryOpen, setIsMusicLibraryOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [beatIntensity, setBeatIntensity] = useState(0);
  const [musicVolume, setMusicVolume] = useState(0.8);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const beatIntensityRef = useRef(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Audio Context on first interaction
  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;
    
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;
    
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    
    const bufferLength = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength);
    
    if (audioRef.current) {
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioSourceRef.current = source;
    }
    
    console.log("Audio Engine Initialized 🦾");
  }, []);

  useEffect(() => {
    const handleInteraction = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      initAudio();
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [initAudio]);

  // Sync audio element with tracks
  useEffect(() => {
    const musicTrack = tracks.find(t => t.type === 'audio');
    if (musicTrack && audioRef.current) {
      if (audioRef.current.src !== musicTrack.url) {
        audioRef.current.src = musicTrack.url;
        audioRef.current.load();
      }
      audioRef.current.volume = musicVolume;
    }
  }, [tracks, musicVolume]);

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const segmentationRef = useRef<SelfieSegmentation | null>(null);
  const isDestroyedRef = useRef(false);
  const isProcessingFrameRef = useRef(false);
  const lastResultsRef = useRef<any>(null);
  const requestRef = useRef<number | null>(null);
  
  // Latest state refs for the segmentation callback to use without re-initializing
  const tracksRef = useRef(tracks);
  const selectedTrackIdRef = useRef(selectedTrackId);
  const filterRef = useRef(filter);
  const glowIntensityRef = useRef(glowIntensity);

  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => {
    // Auto-trigger Cinematic Masterpiece on initial load (Free Sample)
    if (initialMedia.type === 'image' && !hasAutoStylized && isEngineReady) {
      setHasAutoStylized(true);
      handleStylize('cinematic-model', undefined, true); // Pass true for free sample
    }
  }, [initialMedia, isEngineReady, hasAutoStylized]);
  useEffect(() => { selectedTrackIdRef.current = selectedTrackId; }, [selectedTrackId]);
  useEffect(() => { filterRef.current = filter; }, [filter]);
  useEffect(() => { glowIntensityRef.current = glowIntensity; }, [glowIntensity]);
  const mediaRefs = useRef<Map<string, HTMLVideoElement | HTMLImageElement>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  const selectedTrack = useMemo(() => 
    tracks.find(t => t.id === selectedTrackId), 
    [tracks, selectedTrackId]
  );

  const processFrame = useCallback(async (results: any) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { width, height } = canvas;
    ctx.save();
    
    // Background Fill (Ensures no black screen/transparency)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#0a0a0c");
    bgGrad.addColorStop(1, "#050505");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Use refs to get latest state in the callback
    const currentTracks = tracksRef.current;
    const currentSelectedTrackId = selectedTrackIdRef.current;
    const currentFilter = filterRef.current;

    // Sort tracks by zIndex (lowest first for drawing)
    const sortedTracks = [...currentTracks].sort((a, b) => a.zIndex - b.zIndex);

    // --- 3D DYNAMIC PARALLAX & VFX ENGINE ---
    const time = Date.now() / 1000;
    
    // Beat Sync Logic
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
      beatIntensityRef.current = average / 255;
    }
    
    const currentBeat = beatIntensityRef.current;
    const beatScale = 1 + currentBeat * 0.15; // Pulse based on actual music beat
    
    const parallaxX = Math.sin(time * 0.5) * 15 * beatScale; // Subtle 3D sway
    const parallaxY = Math.cos(time * 0.3) * 10 * beatScale;
    const currentGlow = glowIntensityRef.current;

    // --- PRO-VFX PARTICLE GENERATION ---
    if (currentFilter === 'sacred-wolf' || currentFilter === 'wolf-forest' || currentFilter === 'gold-palace') {
      // Spawn Smoke/Mist
      if (particlesRef.current.length < 80) {
        let color = 'rgba(180, 180, 220, 0.15)';
        if (currentFilter === 'wolf-forest') color = 'rgba(100, 150, 120, 0.1)';
        if (currentFilter === 'gold-palace') color = 'rgba(255, 200, 100, 0.05)';

        particlesRef.current.push({
          x: width / 2 + (Math.random() - 0.5) * width * 1.2,
          y: height + 100,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 1.5 - 0.5,
          size: Math.random() * 150 + 80,
          alpha: Math.random() * 0.2 + 0.05,
          life: 1,
          color: color,
          type: 'smoke'
        });
      }
      
      // Spawn Sparks/Leaves/Gold
      if (Math.random() > 0.6) {
        let color = '#ff4d00';
        let type: 'spark' | 'smoke' = 'spark';
        
        if (currentFilter === 'wolf-forest') {
          color = Math.random() > 0.5 ? '#2d5a27' : '#1e3a1a'; // Dark green leaves
        } else if (currentFilter === 'gold-palace') {
          color = '#ffd700'; // Gold sparkles
        } else {
          color = Math.random() > 0.5 ? '#ff4d00' : '#ffae00';
        }

        particlesRef.current.push({
          x: width / 2 + (Math.random() - 0.5) * width * 0.9,
          y: height + 20,
          vx: (Math.random() - 0.5) * 5,
          vy: -Math.random() * 6 - 3,
          size: currentFilter === 'wolf-forest' ? Math.random() * 8 + 4 : Math.random() * 4 + 2,
          alpha: 1,
          life: 1,
          color: color,
          type: type
        });
      }

      ctx.save();
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.type === 'smoke' ? 0.002 : 0.01;
        if (p.type === 'smoke') p.size += 0.5;
        
        if (p.life <= 0) return false;

        ctx.globalAlpha = p.life * (p.type === 'smoke' ? 1 : (0.5 + currentGlow * 0.5));

        if (p.type === 'smoke') {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, p.color.replace('0.15', (p.alpha * p.life).toString()).replace('0.1', (p.alpha * p.life).toString()).replace('0.05', (p.alpha * p.life).toString()));
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.globalCompositeOperation = 'screen';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.shadowBlur = (currentFilter === 'gold-palace' ? 20 : 10) * currentGlow;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          if (currentFilter === 'wolf-forest') {
            // Draw leaf shape
            ctx.ellipse(p.x, p.y, p.size, p.size / 2, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
          } else {
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          }
          ctx.fill();
        }
        return true;
      });
      ctx.restore();
    }

    for (const track of sortedTracks) {
      if (track.type === 'audio') continue;
      
      const source = mediaRefs.current.get(track.id);
      if (!source) continue;

      ctx.save();
      
      // If this is the background track (zIndex 0) and Sacred Wolf is active, add extra shadows/light
      if (track.zIndex === 0 && (currentFilter === 'sacred-wolf' || currentFilter === 'wolf-forest' || currentFilter === 'gold-palace')) {
        // Apply cinematic background blur + Parallax
        let blur = 12;
        let brightness = 0.4 + currentGlow * 0.4;
        let tint = 'rgba(0, 0, 20, 0.3)';
        
        if (currentFilter === 'wolf-forest') {
          blur = 8;
          brightness = 0.6 + currentGlow * 0.3;
          tint = 'rgba(10, 40, 20, 0.4)';
        } else if (currentFilter === 'gold-palace') {
          blur = 15;
          brightness = 0.8 + currentGlow * 0.5;
          tint = 'rgba(60, 40, 10, 0.2)';
        }

        ctx.filter = `blur(${blur}px) brightness(${brightness})`;
        ctx.drawImage(source, -parallaxX, -parallaxY, width + parallaxX * 2, height + parallaxY * 2);
        ctx.filter = "none";
        
        // Add cinematic background shadows
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, tint.replace('0.3', (0.3 + currentGlow * 0.3).toString()).replace('0.4', (0.4 + currentGlow * 0.3).toString()).replace('0.2', (0.2 + currentGlow * 0.3).toString()));
        bgGradient.addColorStop(1, currentFilter === 'gold-palace' ? 'rgba(30, 15, 0, 0.8)' : 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
      } else if (track.isBgRemoved && track.id === currentSelectedTrackId && results) {
        // Create an offscreen buffer for the mask to process it
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
          // Draw the raw mask
          maskCtx.drawImage(results.segmentationMask, 0, 0, width, height);
          
          // --- 3D DEPTH SEPARATION (Drop Shadow) ---
          ctx.save();
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 40;
          ctx.shadowOffsetX = parallaxX * 0.5;
          ctx.shadowOffsetY = parallaxY * 0.5;
          
          // --- ADVANCED EROSION & FEATHERING ---
          ctx.save();
          ctx.filter = "blur(7px) contrast(2) brightness(0.9)"; 
          ctx.drawImage(maskCanvas, -2, -2, width + 4, height + 4);
          ctx.restore();
          
          ctx.globalCompositeOperation = "source-in";
          ctx.drawImage(source, 0, 0, width, height);
          ctx.restore();
        }
      } else {
        // Regular draw
        ctx.drawImage(source, 0, 0, width, height);
      }
      
      ctx.restore();
    }

    // --- TOP RIGHT BRANDING (Top Layer) ---
    ctx.save();
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    
    const margin = 60;
    const topOffset = 80;
    
    // Dynamic Watermark from Remote Config
    ctx.font = `italic ${watermark.size}px 'Inter', sans-serif`;
    const beatGlow = currentBeat * 50; // Extra glow on beat
    ctx.shadowColor = watermark.color;
    ctx.shadowBlur = (30 + beatGlow) * (0.5 + currentGlow * 0.5);
    ctx.fillStyle = `rgba(255, 255, 255, ${watermark.opacity})`;
    
    // Beat-Sync Pulse Scale
    const watermarkScale = 1 + currentBeat * 0.15; // Increased pulse for more "swag"
    ctx.save();
    ctx.translate(width - margin, topOffset);
    ctx.scale(watermarkScale, watermarkScale);
    
    // Draw a subtle outer glow for the text
    ctx.shadowColor = watermark.color;
    ctx.shadowBlur = 40 + currentBeat * 60;
    ctx.fillText(watermark.text, 0, 0);
    
    // Add a stylish stroke
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeText(watermark.text, 0, 0);
    ctx.restore();

    // Invisible trigger area for Admin Panel (100x100 area around watermark)
    // We handle this via a hidden button in the React layer for easier interaction
    
    ctx.restore();

    ctx.restore();

    // Apply cinematic filters to the final composite
    if (currentFilter !== "none") {
      applyFilters(ctx, width, height, currentFilter);
    }
  }, []); // No dependencies, uses refs

  useEffect(() => {
    let segmentation: SelfieSegmentation | null = null;
    isDestroyedRef.current = false;

    const init = async () => {
      try {
        console.log("Initializing MediaPipe AI Engine...");
        segmentation = new SelfieSegmentation({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });

        segmentation.setOptions({
          modelSelection: 1,
          selfieMode: false,
        });

        segmentation.onResults((results) => {
          if (!isDestroyedRef.current) {
            lastResultsRef.current = results;
          }
        });

        segmentationRef.current = segmentation;
        setIsEngineReady(true);
        setIsProcessing(false);
        console.log("MediaPipe AI Engine Initialized Successfully");
      } catch (error) {
        console.error("Failed to initialize MediaPipe AI Engine:", error);
        setIsEngineReady(false);
        setIsProcessing(false);
      }
    };

    init();

    return () => {
      isDestroyedRef.current = true;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (segmentation) {
        segmentation.close();
        segmentationRef.current = null;
      }
    };
  }, []); // Only run once

  useEffect(() => {
    const loop = async () => {
      if (isDestroyedRef.current) return;

      // Always render the current state
      processFrame(lastResultsRef.current);

      try {
        const currentSelectedTrack = tracksRef.current.find(t => t.id === selectedTrackIdRef.current);
        
        if (isEngineReady && segmentationRef.current && !isProcessingFrameRef.current && 
            currentSelectedTrack && currentSelectedTrack.type !== 'audio' && currentSelectedTrack.isBgRemoved) {
          
          const source = mediaRefs.current.get(currentSelectedTrack.id);
          if (source) {
            const isReady = currentSelectedTrack.type === "image" ? 
              ((source as HTMLImageElement).complete && (source as HTMLImageElement).naturalWidth > 0) : 
              ((source as HTMLVideoElement).readyState >= 2);

            if (isReady) {
              isProcessingFrameRef.current = true;
              await segmentationRef.current.send({ image: source });
              isProcessingFrameRef.current = false;
            }
          }
        }
      } catch (error) {
        console.error("Error in segmentation loop:", error);
        isProcessingFrameRef.current = false;
      }

      if (!isDestroyedRef.current) {
        requestRef.current = requestAnimationFrame(loop);
      }
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isEngineReady, processFrame]); // More stable dependencies

  useEffect(() => {
    // Load Banner Ad
    if (typeof window !== 'undefined' && (window as any).UnityAds) {
      (window as any).UnityAds.loadBanner("Banner_Android", {
        onComplete: () => {
          console.log("Banner Ad Loaded 🦾");
          (window as any).UnityAds.showBanner("unity-banner-ad");
        }
      });
    }
  }, []);

  const handleSetBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith("video/") ? "video" : "image";
      
      const newBgTrack: Track = {
        id: `bg-${Date.now()}`,
        type: type as MediaType,
        file: file,
        url: URL.createObjectURL(file),
        startTime: 0,
        duration: 0,
        zIndex: 0,
        name: `Custom BG: ${file.name}`,
        isBgRemoved: false,
      };
      
      // Replace existing bg-track or add as new at zIndex 0
      setTracks(prev => [newBgTrack, ...prev.filter(t => t.id !== 'bg-track' && t.zIndex !== 0)]);
      setSelectedTrackId(newBgTrack.id);
    }
  };

  useEffect(() => {
    apiManager.setConfigUpdatedCallback((config) => {
      setApiStatus(apiManager.getGlobalStatus());
      setIsMaintenance(config.maintenanceMode);
      setWatermark(config.watermarkConfig);
      console.log(`Editor: Remote config refreshed`, config);
    });
  }, []);

  useEffect(() => {
    const checkAlert = setInterval(() => {
      if ((window as any).adminAlert) {
        setAdminAlert((window as any).adminAlert);
        (window as any).adminAlert = null;
      }
    }, 1000);
    return () => clearInterval(checkAlert);
  }, []);

  const handleAdminTrigger = () => {
    setAdminClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setIsAdminOpen(true);
        return 0;
      }
      return next;
    });
    // Reset click count after 2 seconds of inactivity
    setTimeout(() => setAdminClickCount(0), 2000);
  };

  const handleAddTrack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith("video/") ? "video" : 
                   file.type.startsWith("audio/") ? "audio" : "image";
      
      const newTrack: Track = {
        id: `track-${Date.now()}`,
        type: type as MediaType,
        file: file,
        url: URL.createObjectURL(file),
        startTime: 0,
        duration: 0,
        zIndex: tracks.length + 1,
        name: file.name,
        isBgRemoved: type !== 'audio',
      };
      
      setTracks([...tracks, newTrack]);
      setSelectedTrackId(newTrack.id);

      // Auto-trigger for new image tracks
      if (type === 'image' && isEngineReady) {
        handleStylize('cinematic-model', newTrack);
      }
    }
  };

  const handleRemoveTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
    if (selectedTrackId === id) {
      setSelectedTrackId(tracks.length > 1 ? tracks[0].id : null);
    }
  };

  const handleUpdateTrack = (id: string, updates: Partial<Track>) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleStylize = async (style: StyleType, targetTrack?: Track, isFreeSample = false) => {
    const trackToStylize = targetTrack || selectedTrack;
    if (!trackToStylize || trackToStylize.type !== 'image') return;

    // --- ZERO-COST ENGINE: LOCAL AI PROCESSING ---
    console.log(`Zero-Cost Engine: Applying Local AI ${style} Engine`);
    setIsStylizing(true);
    
    try {
      // 1. Check for Gemini Nano (WebAI)
      if (typeof (window as any).ai !== 'undefined') {
        console.log("🔥 Gemini Nano (WebAI) Detected! Using Local LLM for Stylization...");
        const model = await (window as any).ai.languageModel.create();
        const response = await model.prompt(`Describe a visual style for a photo based on the theme: ${style}. Keep it short.`);
        console.log("Local AI Style Guidance:", response);
      } else {
        console.log("Gemini Nano not detected. Falling back to Local WASM Engine.");
      }

      // Simulate local processing delay (WASM speed)
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      // Map StyleType to Local FilterType in filters.ts
      let localFilter: FilterType = 'none';
      if (style === 'anime') localFilter = 'anime-local';
      else if (style === '3d-avatar') localFilter = '3d-avatar-local';
      else if (style === 'cinematic-model') localFilter = 'cinematic-local';
      else localFilter = style as FilterType; // Handle new local filters directly

      setFilter(localFilter);
      setTracks(prev => prev.map(t => 
        t.id === trackToStylize.id ? { ...t, name: `${t.name} (Zero-Cost AI ${style})` } : t
      ));
      
      // Record usage but don't throttle if it's purely local
      if (!isFreeSample) {
        apiManager.recordUsage();
        setUserRemaining(apiManager.getUserRemaining());
        setApiStatus(apiManager.getGlobalStatus());
      }
    } catch (error) {
      console.error("Local AI Processing Error:", error);
    } finally {
      setIsStylizing(false);
    }
  };

  const handleVideoTransform = async () => {
    if (!selectedTrack || selectedTrack.type !== 'image') return;

    if (apiManager.isThrottled()) {
      setShowUpgradeModal(true);
      return;
    }
    
    // --- ZERO-API MODE: LOCAL VIDEO MORPHING SIMULATION ---
    console.log("Zero-API Mode: Simulating Local Video Morphing...");
    setIsStylizing(true);
    
    try {
      // Simulate heavy local processing delay
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      
      // Instead of calling Veo API (which requires paid key), we'll create a "Local AI Video"
      // In a real local app, we'd use a client-side model. 
      // For now, we'll use the original image but add a 'video' flag to simulate the result.
      const newTrack: Track = {
        id: `video-local-${Date.now()}`,
        type: 'video',
        file: selectedTrack.file,
        url: selectedTrack.url, // Use same URL but as video track for simulation
        startTime: 0,
        duration: 5, // 5 second simulated video
        zIndex: selectedTrack.zIndex + 1,
        name: "Local AI Morph (Coming Soon)",
        isBgRemoved: true,
      };
      
      setTracks(prev => [...prev, newTrack]);
      setSelectedTrackId(newTrack.id);
      setFilter('sacred-wolf'); // Apply cinematic filter locally
      
      apiManager.recordUsage();
      setUserRemaining(apiManager.getUserRemaining());
      setApiStatus(apiManager.getGlobalStatus());
      
      alert("Bhai Salman, 'Local Video Morphing' engine load ho raha hai! Abhi ke liye ye preview hai. Full AI Video jald hi offline aayega! 🦾🚀");
      
    } catch (error) {
      console.error("Local Video transformation failed:", error);
    } finally {
      setIsStylizing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "salman-edit-z-export.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    
    setIsExporting(false);
  };

  const handleSelectMusic = (fileOrUrl: File | string, name: string) => {
    const url = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    const newTrack: Track = {
      id: `audio-${Date.now()}`,
      type: 'audio',
      file: typeof fileOrUrl === 'string' ? new File([], name) : fileOrUrl,
      url: url,
      startTime: 0,
      duration: 30, // Default duration for music
      zIndex: tracks.length + 1,
      name: name,
      isBgRemoved: false,
    };
    setTracks(prev => [...prev, newTrack]);
    setSelectedTrackId(newTrack.id);
    setIsMusicLibraryOpen(false);
    
    console.log("Music Engine: Beat-Sync Active 🦾🔥");
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-0 sm:p-4 min-h-screen bg-black">
      {/* Hidden Audio Element for Music */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setMusicCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setMusicDuration(e.currentTarget.duration)}
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
        onEnded={() => {
          setIsMusicPlaying(false);
          setMusicCurrentTime(0);
        }}
      />

      {/* Maintenance Mode Overlay */}
      {isMaintenance && (
        <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-8 bg-black text-center space-y-8">
          <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center border border-red-500/30 animate-pulse">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">System Offline 🦾</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Bhai Salman, Tiger abhi asleha (API) refill kar raha hai. ⛽<br/>
              App thodi der mein wapas live hogi. Sabr rakhein!
            </p>
          </div>
          <div className="pt-8 text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em]">
            Maintenance Mode Active
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {isAdminOpen && (
        <AdminPanel 
          onClose={() => setIsAdminOpen(false)} 
          onTestAd={() => setShowUpgradeModal(true)}
        />
      )}

      {/* Admin Alert Toast */}
      {adminAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] p-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-2xl shadow-red-500/40 animate-bounce flex items-center gap-3 border-2 border-white/20">
          <Activity className="w-5 h-5 animate-pulse" />
          {adminAlert}
          <button 
            onClick={() => setAdminAlert(null)}
            className="p-1 hover:bg-white/20 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 text-center space-y-6 shadow-2xl shadow-red-500/20">
            <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <Crown className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Credits Expired! 🦾</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Bhai Salman, aapka **1 Free Credit** khatm ho gaya hai. Tiger ki raftaar ko non-stop rakhne ke liye Pro upgrade karein!
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  unityAds.showRewardedAd(
                    () => {
                      apiManager.addCreditViaAd();
                      setUserRemaining(apiManager.getUserRemaining());
                      setShowUpgradeModal(false);
                      alert("🔥 Ad Completed! Sarkar, 1 Credit add ho gaya hai! 🦾⛽");
                    },
                    () => {
                      alert("Bhai, Ad fail ho gaya ya skip kar diya. Credit nahi mila! 🦾❌");
                    }
                  );
                }}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                WATCH AD TO UNLOCK
              </button>
              <button
                onClick={() => window.open('https://ai.google.dev/pricing', '_blank')}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 transition-all active:scale-95"
              >
                UPGRADE TO PRO
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-2xl font-bold text-sm transition-all"
              >
                Maybe Later
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
              Credits Reset Every 24 Hours
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-0">
        {/* Preview Area - Edge to Edge on Mobile */}
        <div className="w-full sticky top-0 z-30">
          <div ref={containerRef} className={cn(
            "relative group w-full aspect-[3/4] bg-zinc-950 overflow-hidden shadow-2xl border-b border-zinc-800 sm:rounded-3xl sm:border sm:m-4 sm:w-[calc(100%-2rem)]",
            isFullScreen && "rounded-none border-none m-0 w-full h-screen"
          )}>
            {/* Full Screen Toggle */}
            <button
              onClick={toggleFullScreen}
              className="absolute bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 backdrop-blur-md rounded-xl border border-zinc-800/50 text-white hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
            >
              {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {!isEngineReady && isProcessing && (
              <div className="absolute top-6 left-6 z-40 flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 backdrop-blur-md rounded-full border border-zinc-800/50">
                <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">AI Engine Loading...</span>
              </div>
            )}

            {isEngineReady && (
              <div className="absolute top-6 right-6 z-40 flex flex-col gap-2 items-end">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 backdrop-blur-md rounded-full border border-zinc-800/50">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">AI Engine Active</span>
                </div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={1920}
              height={1080}
              className="w-full h-full object-contain"
            />

            {/* Hidden Admin Trigger (Invisible button over watermark) */}
            <button 
              onClick={handleAdminTrigger}
              className="absolute top-0 right-0 w-64 h-32 z-[60] cursor-default"
              title="Watermark"
            />

            {/* Hidden Media Elements */}
            {tracks.map(track => (
              track.type === 'video' ? (
                <video
                  key={track.id}
                  ref={el => el && mediaRefs.current.set(track.id, el)}
                  src={track.url}
                  className="hidden"
                  autoPlay
                  loop
                  muted
                  playsInline
                  crossOrigin="anonymous"
                />
              ) : track.type === 'image' ? (
                <img
                  key={track.id}
                  ref={el => el && mediaRefs.current.set(track.id, el)}
                  src={track.url}
                  className="hidden"
                  alt={track.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              ) : (
                <audio
                  key={track.id}
                  src={track.url}
                  autoPlay
                  loop
                />
              )
            ))}

            {selectedTrack && selectedTrack.type !== 'audio' && (
              <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                <button
                  onClick={() => handleUpdateTrack(selectedTrack.id, { isBgRemoved: !selectedTrack.isBgRemoved })}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all shadow-lg uppercase tracking-widest",
                    selectedTrack.isBgRemoved ? "bg-blue-600 text-white" : "bg-zinc-900/80 backdrop-blur-md text-zinc-400 border border-zinc-800"
                  )}
                >
                  <Wand2 className="w-3 h-3" />
                  {selectedTrack.isBgRemoved ? "AI BG Removed" : "Keep BG"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Controls Area - Stacked Below for Thumb Access */}
        <div className="px-4 py-6 space-y-8 bg-black">
          {/* Quick Actions Scroll */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-400 hover:text-white transition-all active:scale-95"
            >
              <Plus className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">Add</span>
            </button>
            <button
              onClick={() => setIsMusicLibraryOpen(true)}
              className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-400 hover:text-white transition-all active:scale-95"
            >
              <Music className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">Music</span>
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-24 h-24 bg-blue-600 border border-blue-500 rounded-3xl text-white hover:bg-blue-500 transition-all active:scale-95"
            >
              {isExporting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
              <span className="text-[10px] font-black uppercase tracking-widest">Save</span>
            </button>
            <button
              onClick={onReset}
              className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-500 hover:text-red-400 transition-all active:scale-95"
            >
              <Trash2 className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
            </button>
          </div>

          {/* Holiya Badlo (AI Styles) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Holiya Badlo (AI Styles)</h3>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
            {/* Music Controls (Volume & Seek) */}
            {tracks.some(t => t.type === 'audio') && (
              <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-pink-500" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Music Engine</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (audioRef.current) {
                        if (isMusicPlaying) audioRef.current.pause();
                        else audioRef.current.play();
                      }
                    }}
                    className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-all"
                  >
                    {isMusicPlaying ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>

                {/* Seek Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                    <span>{Math.floor(musicCurrentTime / 60)}:{(Math.floor(musicCurrentTime % 60)).toString().padStart(2, '0')}</span>
                    <span>{Math.floor(musicDuration / 60)}:{(Math.floor(musicDuration % 60)).toString().padStart(2, '0')}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={musicDuration || 100}
                    value={musicCurrentTime}
                    onChange={(e) => {
                      if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
                    }}
                    className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-3">
                  <Activity className="w-3 h-3 text-zinc-600" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(Number(e.target.value))}
                    className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-zinc-400"
                  />
                </div>
              </div>
            )}

            <VFXControls 
              isStylizing={isStylizing}
              selectedTrackType={selectedTrack?.type}
              onStylize={handleStylize}
              onVideoTransform={handleVideoTransform}
              onOpenMusic={() => setIsMusicLibraryOpen(true)}
            />
          </div>

          {/* Timeline & Adjustments */}
          <div className="space-y-6">
            <Timeline
              tracks={tracks}
              onAddTrack={() => fileInputRef.current?.click()}
              onRemoveTrack={handleRemoveTrack}
              onUpdateTrack={handleUpdateTrack}
              selectedTrackId={selectedTrackId}
              onSelectTrack={setSelectedTrackId}
            />
            
            <div className="p-6 rounded-[32px] bg-zinc-900/40 border border-zinc-800/50">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cinematic Grading</span>
              </div>
              <FilterControls 
                currentFilter={filter} 
                onFilterChange={setFilter}
              />
            </div>

            {/* Banner Ad Area */}
            <div className="w-full h-16 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl flex items-center justify-center overflow-hidden">
              <div id="unity-banner-ad" className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em]">
                Unity Banner Ad Area
              </div>
            </div>

            {/* Footer Branding */}
            <footer className="py-8 text-center space-y-2">
              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
                © 2026 Salman-Edit-Z
              </p>
              <p className="text-[8px] font-bold text-zinc-800 uppercase tracking-[0.2em]">
                Powered by Shaista ✨ Gold Engine
              </p>
            </footer>
          </div>

          {/* Hidden Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAddTrack}
            className="hidden"
            accept="image/*,video/*,audio/*"
          />
          <input
            type="file"
            ref={bgFileInputRef}
            onChange={handleSetBackground}
            className="hidden"
            accept="image/*,video/*"
          />
        </div>
      </div>
    </div>
  );
}
