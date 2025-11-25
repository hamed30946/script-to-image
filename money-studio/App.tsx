import React, { useState, useRef } from 'react';
import { analyzeScript } from './services/geminiService';
import { Scene } from './types';
import SceneCard from './components/SceneCard';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Sparkles, 
  Loader2, 
  FileText, 
  LayoutTemplate,
  MonitorPlay,
  Smartphone,
  Square,
  Maximize
} from 'lucide-react';

export default function App() {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState<'script' | 'prompts'>('script');
  const [script, setScript] = useState('');
  const [niche, setNiche] = useState('');
  const [styleKeywords, setStyleKeywords] = useState('cinematic, photorealistic, 4k');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleScriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScript(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReferenceImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!script.trim()) {
      setError("Please provide a script or story content.");
      return;
    }

    setLoading(true);
    setError(null);
    setScenes([]);

    try {
      const results = await analyzeScript({
        script,
        niche,
        styleKeywords,
        referenceImage: referenceImage || undefined,
        aspectRatio
      });
      setScenes(results);
    } catch (err: any) {
      setError(err.message || "Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] text-slate-200 overflow-hidden font-sans">
      
      {/* --- Left Column: Controls (Fixed Width) --- */}
      <div className="w-[500px] flex flex-col border-r border-slate-800 bg-[#0B0F19] h-full">
        
        {/* Header Title (Matches style in image) */}
        <div className="p-6 pb-2 text-center">
          <h1 className="text-2xl font-bold text-[#4F86F7]">Script-to-Image Studio</h1>
          <p className="text-xs text-slate-500 mt-1">Your AI-powered visual storyteller</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Section 1: Provide Content */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <FileText size={16} className="text-[#4F86F7]" />
              1. Provide Content
            </div>

            {/* Tabs */}
            <div className="flex bg-[#111827] p-1 rounded-lg border border-slate-800">
              <button 
                onClick={() => setActiveTab('script')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'script' ? 'bg-[#2563EB] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                From Script
              </button>
              <button 
                onClick={() => setActiveTab('prompts')}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === 'prompts' ? 'bg-[#2563EB] text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                From Prompts
              </button>
            </div>

            {/* Script Text Area */}
            <div className="relative">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your script here, or upload a file. The AI will create a prompt for each paragraph or logical scene."
                className="w-full h-40 bg-[#111827] border border-slate-700 rounded-lg p-3 text-xs leading-relaxed text-slate-300 placeholder:text-slate-600 focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] outline-none resize-none"
              />
            </div>

            {/* Upload Script Button */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt,.md,.csv" 
              onChange={handleScriptUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#1F2937] hover:bg-[#374151] text-slate-300 text-xs font-medium py-2.5 rounded-lg border border-slate-700 transition-colors"
            >
              Upload Script File (.txt, .md)
            </button>

            {/* Niche / Topic Input */}
            <div className="space-y-2">
               <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                 <LayoutTemplate size={12} /> Niche / Topic (Optional)
               </label>
               <input 
                type="text" 
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., futuristic gadgets, ancient history"
                className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-300 focus:ring-1 focus:ring-[#2563EB] outline-none placeholder:text-slate-600"
               />
               <p className="text-[10px] text-slate-600">Provide a topic to give the AI more context about the script.</p>
            </div>
          </section>

          {/* Section 2: Define Image Style */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <ImageIcon size={16} className="text-[#4F86F7]" />
              2. Define Image Style
            </div>

            {/* Reference Image Box */}
            <div className="space-y-2">
               <label className="text-xs font-medium text-slate-400">Reference Image (Optional)</label>
               <p className="text-[10px] text-slate-600 mb-2">Upload an image to automatically analyze and apply its style.</p>
               
               {!referenceImage ? (
                 <div 
                   onClick={() => imageInputRef.current?.click()}
                   className="border-2 border-dashed border-slate-700 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-[#2563EB] hover:bg-[#111827] transition-all group"
                 >
                    <Upload size={20} className="text-slate-500 group-hover:text-[#2563EB] mb-1" />
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300">Upload Image</span>
                 </div>
               ) : (
                 <div className="relative h-24 w-full rounded-lg overflow-hidden border border-slate-700 group">
                    <img src={referenceImage} alt="Reference" className="w-full h-full object-cover opacity-70" />
                    <button 
                      onClick={() => setReferenceImage(null)}
                      className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="absolute bottom-1 left-2 text-[10px] text-white drop-shadow-md font-medium">Reference Loaded</div>
                 </div>
               )}
               <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            {/* Style Keywords Input */}
            <div className="space-y-2">
               <label className="text-xs font-medium text-slate-400">Style Keywords</label>
               <input 
                type="text" 
                value={styleKeywords}
                onChange={(e) => setStyleKeywords(e.target.value)}
                placeholder="cinematic, photorealistic, 4k"
                className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-slate-300 focus:ring-1 focus:ring-[#2563EB] outline-none placeholder:text-slate-600"
               />
               <p className="text-[10px] text-slate-600">Add keywords to combine with the reference style.</p>
            </div>
          </section>

          {/* Section 3: Aspect Ratio */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
               <Maximize size={16} className="text-[#4F86F7]" />
               3. Aspect Ratio
            </div>
            <div className="grid grid-cols-5 gap-2">
               {[
                 { label: '16:9', icon: MonitorPlay },
                 { label: '9:16', icon: Smartphone },
                 { label: '4:3', icon: LayoutTemplate },
                 { label: '3:4', icon: LayoutTemplate },
                 { label: '1:1', icon: Square }
               ].map((ratio) => (
                  <button
                    key={ratio.label}
                    onClick={() => setAspectRatio(ratio.label)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      aspectRatio === ratio.label 
                      ? 'bg-[#2563EB] border-[#2563EB] text-white' 
                      : 'bg-[#111827] border-slate-700 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    <ratio.icon size={14} className="mb-1" />
                    <span className="text-[10px] font-medium">{ratio.label}</span>
                  </button>
               ))}
            </div>
          </section>

        </div>

        {/* Generate Button Footer */}
        <div className="p-6 border-t border-slate-800 bg-[#0B0F19]">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-3.5 rounded-lg font-bold text-sm text-white shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 ${
                loading 
                ? 'bg-slate-800 cursor-not-allowed text-slate-500' 
                : 'bg-[#2563EB] hover:bg-blue-600 active:scale-[0.99]'
            }`}
          >
            {loading ? (
                <>
                   <Loader2 className="animate-spin" size={16} />
                   Processing Script...
                </>
            ) : (
                <>
                   Generate Images &raquo;
                </>
            )}
          </button>
          {error && <p className="text-red-400 text-xs mt-3 text-center">{error}</p>}
        </div>

      </div>

      {/* --- Right Column: Results (Flexible Width) --- */}
      <div className="flex-1 bg-[#0F1623] h-full flex flex-col relative">
         
         {/* Top Bar for Results */}
         {scenes.length > 0 && (
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0B0F19]/50 backdrop-blur-sm">
                <h2 className="text-slate-200 font-semibold flex items-center gap-2">
                    <Sparkles size={16} className="text-[#4F86F7]" /> Generated Results
                </h2>
                <button 
                  onClick={() => setScenes([])}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                    Clear Results
                </button>
            </div>
         )}

         <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* Empty State */}
            {scenes.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                    <div className="w-24 h-24 rounded-2xl bg-[#111827] border-2 border-dashed border-slate-700 flex items-center justify-center mb-6">
                        <ImageIcon size={40} className="text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-400 mb-2">Your generated content will appear here</h3>
                    <p className="text-sm max-w-xs text-center text-slate-500">
                        Fill in the details on the left and click "Generate Images" to start the magic.
                    </p>
                </div>
            )}

            {/* Loading State */}
            {loading && scenes.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 size={40} className="text-[#4F86F7] animate-spin" />
                    <p className="text-slate-400 text-sm animate-pulse">Analyzing script and dreaming up visuals...</p>
                </div>
            )}

            {/* Results Grid */}
            <div className="max-w-4xl mx-auto space-y-6">
                {scenes.map((scene) => (
                    <SceneCard key={scene.scene_number} scene={scene} />
                ))}
            </div>

         </div>
      </div>

    </div>
  );
}
