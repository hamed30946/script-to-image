import React from 'react';
import { Scene } from '../types';
import { Copy, Image as ImageIcon, Clapperboard } from 'lucide-react';

interface SceneCardProps {
  scene: Scene;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(scene.image_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-4 hover:border-slate-600 transition-all shadow-lg backdrop-blur-sm group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-sm border border-indigo-500/30">
                {scene.scene_number}
            </span>
            <h3 className="text-slate-200 font-semibold text-lg flex items-center gap-2">
               <Clapperboard size={16} className="text-slate-400" />
               Scene Description
            </h3>
        </div>
      </div>
      
      <p className="text-slate-400 mb-6 pl-10 text-sm leading-relaxed border-l-2 border-slate-700">
        {scene.description}
      </p>

      <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700/50 relative group-hover:border-indigo-500/30 transition-colors">
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 flex items-center gap-1">
                <ImageIcon size={12} />
                Image Prompt
            </span>
            <button 
                onClick={handleCopy}
                className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
                {copied ? "Copied!" : <><Copy size={12} /> Copy</>}
            </button>
        </div>
        <p className="text-slate-200 text-sm font-mono leading-relaxed break-words">
            {scene.image_prompt}
        </p>
      </div>
    </div>
  );
};

export default SceneCard;