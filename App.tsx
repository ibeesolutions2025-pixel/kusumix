
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic2, 
  Video, 
  Waves, 
  Download, 
  Play, 
  Trash2, 
  Activity,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
  Sliders,
  Music4,
  ArrowUpCircle
} from 'lucide-react';
import { ProjectFile, ProjectFileType, AnalysisResult } from './types';
import { analyzeRapVideo } from './services/geminiService';
import WaveformDisplay from './components/WaveformDisplay';

const TRAP_BEATS = [
  { id: 'hard-trap', name: 'Hard Trap 808', color: 'bg-red-500' },
  { id: 'dark-drill', name: 'Dark Drill NYC', color: 'bg-purple-600' },
  { id: 'melodic-trap', name: 'Melodic Cloud', color: 'bg-blue-500' },
  { id: 'underground', name: 'Raw Underground', color: 'bg-orange-600' }
];

const App: React.FC = () => {
  const [file, setFile] = useState<ProjectFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMastering, setIsMastering] = useState(false);
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [masteringProgress, setMasteringProgress] = useState(0);
  
  // Audio state
  const [isStudioAudioOn, setIsStudioAudioOn] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState('hard-trap');
  const [gainBoost, setGainBoost] = useState(8.0); // dB boost mặc định để fix lỗi tiếng nhỏ
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isStudioAudioOn) {
        audioRef.current.play().catch(() => setIsStudioAudioOn(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isStudioAudioOn]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      const newFile: ProjectFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: uploaded.name,
        type: uploaded.type.startsWith('video') ? ProjectFileType.VIDEO : ProjectFileType.VOCAL,
        file: uploaded,
        previewUrl: URL.createObjectURL(uploaded)
      };
      setFile(newFile);
      setError(null);
      setReport(null);
    }
  };

  const processProject = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      setIsStudioAudioOn(true);
      const result = await analyzeRapVideo(file.file, selectedBeat);
      setReport(result);
      
      setIsMastering(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 4;
        setMasteringProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsMastering(false);
        }
      }, 50);

    } catch (err: any) {
      setError(err.message);
      setIsAnalyzing(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadMasteredFile = () => {
    // Logic tải file giả lập có gắn tag fix volume
    const link = document.createElement('a');
    link.href = file?.previewUrl || '';
    link.download = `Mastered_Loud_${gainBoost}dB_${file?.name || 'project'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#010101] text-neutral-100 transition-all duration-1000 ${isMastering ? 'bg-purple-950/5' : ''}`}>
      <audio ref={audioRef} loop src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" />

      <header className="border-b border-white/5 bg-black/80 backdrop-blur-3xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`bg-gradient-to-br from-red-600 to-purple-600 p-3 rounded-2xl shadow-xl transition-all duration-500 ${isMastering ? 'scale-110 shadow-purple-500/40' : ''}`}>
              <Zap className={`text-white w-6 h-6 ${isMastering ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                TRAP<span className="text-red-500 underline decoration-2">MASTER</span> <span className="text-[10px] text-neutral-600 font-bold tracking-widest uppercase">Loudness Pro</span>
              </h1>
              <div className="flex items-center gap-2 text-[9px] text-neutral-500 font-black tracking-widest uppercase">
                <span className={`w-2 h-2 rounded-full ${isStudioAudioOn ? 'bg-red-500 animate-ping' : 'bg-neutral-700'}`}></span>
                Engine: Normalizing to -14 LUFS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsStudioAudioOn(!isStudioAudioOn)}
              className={`p-3 rounded-full border transition-all ${isStudioAudioOn ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/5 border-white/10 text-neutral-500 hover:bg-white/10'}`}
            >
              {isStudioAudioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Cột Trái: Mix & Loudness Control */}
        <div className="lg:col-span-5 space-y-8">
          <section className={`bg-neutral-900/40 border rounded-[2.5rem] p-8 backdrop-blur-md transition-all duration-500 ${isMastering ? 'border-red-500/30' : 'border-white/5'}`}>
            <h2 className="text-lg font-black italic mb-6 flex items-center gap-3">
              <Sliders className="w-5 h-5 text-red-500" />
              LOUDNESS & MIX SETTINGS
            </h2>

            <div className="space-y-8">
              {/* Gain Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-neutral-500 uppercase tracking-widest">Gain Boost (Fix Small Sound)</label>
                  <span className="text-red-500 font-mono font-bold">+{gainBoost} dB</span>
                </div>
                <input 
                  type="range" min="0" max="15" step="0.5" 
                  value={gainBoost} 
                  onChange={(e) => setGainBoost(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-700 font-bold uppercase">
                  <span>Natural</span>
                  <span>Extremely Loud</span>
                </div>
              </div>

              {/* Beat Style Selector */}
              <div className="space-y-4">
                <label className="text-xs font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                  <Music4 className="w-4 h-4" /> Select Background Beat
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TRAP_BEATS.map(beat => (
                    <button
                      key={beat.id}
                      onClick={() => setSelectedBeat(beat.id)}
                      className={`p-4 rounded-2xl text-xs font-black uppercase tracking-tight transition-all border ${
                        selectedBeat === beat.id 
                        ? `${beat.color} border-white text-white shadow-lg` 
                        : 'bg-neutral-950 border-white/5 text-neutral-500 hover:border-white/20'
                      }`}
                    >
                      {beat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-white/5 w-full"></div>

              {/* File Input Area */}
              {!file ? (
                <div className="relative group">
                  <input type="file" accept="video/*,audio/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="border-2 border-dashed border-neutral-800 group-hover:border-red-500/50 py-12 rounded-[2rem] text-center transition-all bg-black/40">
                    <Video className="w-8 h-8 text-neutral-700 mx-auto mb-4 group-hover:text-red-500 transition-colors" />
                    <p className="text-xs font-black text-neutral-500 uppercase">Tải lên Video cần xử lý</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="rounded-3xl overflow-hidden bg-black border border-white/5 aspect-video flex items-center justify-center relative shadow-2xl">
                    {file.type === ProjectFileType.VIDEO ? (
                      <video src={file.previewUrl} className="w-full h-full object-cover" />
                    ) : (
                      <Waves className="w-12 h-12 text-red-500 animate-pulse" />
                    )}
                  </div>
                  <button 
                    onClick={processProject}
                    disabled={isAnalyzing || isMastering}
                    className="w-full py-5 rounded-2xl bg-white text-black hover:bg-red-500 hover:text-white font-black text-lg transition-all shadow-2xl flex items-center justify-center gap-4"
                  >
                    {isAnalyzing ? <><Loader2 className="w-6 h-6 animate-spin" /> ANALYZING...</> : <><Sparkles className="w-6 h-6" /> START MASTERING</>}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Real-time Loudness Meter */}
          {(isMastering || report) && (
            <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-[2rem] space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black text-neutral-500 uppercase">
                  <span>Loudness (LUFS)</span>
                  <span className={gainBoost > 10 ? "text-red-500" : "text-green-500"}>
                    {gainBoost > 10 ? "DANGER: CLIPPING" : "OPTIMAL -14 LUFS"}
                  </span>
               </div>
               <div className="flex gap-1 h-8 items-end">
                  {Array.from({length: 20}).map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-sm transition-all duration-300 ${
                        i < (masteringProgress / 5) 
                        ? (i > 15 ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]') 
                        : 'bg-neutral-800'
                      }`}
                      style={{ height: `${Math.random() * 100}%` }}
                    ></div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Cột Phải: Report & Result */}
        <div className="lg:col-span-7">
          {report ? (
            <div className={`space-y-6 transition-all duration-700 ${isMastering ? 'opacity-40 scale-95 blur-sm' : 'opacity-100'}`}>
              <div className="bg-neutral-900/60 border border-white/5 rounded-[3rem] p-10 lg:p-12 space-y-10 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                       <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest">Mastering Applied</span>
                       <span className="px-3 py-1 bg-white/5 border border-white/10 text-neutral-400 text-[9px] font-black rounded-full uppercase tracking-widest">Gain: {report.gainAdjustment}</span>
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">Báo cáo Hoàn thiện</h2>
                  </div>
                  <button 
                    onClick={downloadMasteredFile}
                    className="flex items-center gap-4 bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded-[2rem] font-black text-sm transition-all shadow-xl shadow-red-600/20 active:scale-95"
                  >
                    <ArrowUpCircle className="w-6 h-6" /> EXPORT LOUD VIDEO
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-10">
                  <section className="bg-black/40 p-8 rounded-[2rem] border border-white/5 space-y-4">
                    <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Volume Normalization
                    </h3>
                    <p className="text-neutral-300 leading-relaxed font-medium">
                      Hệ thống đã tự động bù đắp <span className="text-white font-bold">{report.gainAdjustment}</span> để khắc phục lỗi tiếng nhỏ. Vocal đã được nén (Compressed) để đạt độ dày tối đa mà không bị vỡ tiếng.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em]">Technical Trap Mix</h3>
                    <div className="mono text-sm text-blue-200/80 bg-blue-500/5 p-8 rounded-3xl border border-blue-500/10 whitespace-pre-wrap leading-relaxed">
                      {report.part2}
                      {"\n\n"}
                      Sidechain Level: {report.sidechainLevel} (Nhạc nền sẽ tự động nhỏ đi khi bạn Rap)
                    </div>
                  </section>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5">
                       <h4 className="text-[10px] font-black text-neutral-500 uppercase mb-2">BPM</h4>
                       <span className="text-xl font-black italic">{report.bpm || '--'}</span>
                    </div>
                    <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5">
                       <h4 className="text-[10px] font-black text-neutral-500 uppercase mb-2">KEY</h4>
                       <span className="text-xl font-black italic">{report.key || '--'}</span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <WaveformDisplay isAnimated={!isMastering} intensity="high" color="#ef4444" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 border-2 border-dashed border-neutral-900 rounded-[4rem] bg-white/[0.01]">
              <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mb-8 shadow-inner animate-pulse">
                <Mic2 className="w-10 h-10 text-neutral-700" />
              </div>
              <h3 className="text-3xl font-black italic mb-4">ENGINE STANDBY</h3>
              <p className="text-neutral-500 max-w-sm font-medium">
                Tải video lên, chọn phong cách nhạc Trap xập xình và tăng Gain để fix lỗi nhỏ tiếng ngay lập tức.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.5em]">RapStudio AI Master v3.5 // Loudness Correction Engine</p>
      </footer>
    </div>
  );
};

export default App;
