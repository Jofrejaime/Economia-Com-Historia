import React, { useState } from 'react';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, FileText, Wifi, X, Trophy, Users } from 'lucide-react';
import BottomNav from './BottomNav';

interface PodcastProps {
  onBack: () => void;
  onStartQuiz?: () => void;
  onCreateTopic?: (title: string, category: string) => void;
  onNavigate?: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  isLoggedIn?: boolean;
}

export default function Podcast({ onBack, onStartQuiz, onCreateTopic, onNavigate, isLoggedIn = false }: PodcastProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTranscript, setShowTranscript] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8B1E2D] to-[#6D1522]">
      {/* Status Bar */}
      <div className="h-11 bg-[rgba(255,255,255,0.05)] backdrop-blur-md flex items-center justify-between px-5">
        <span className="font-['IBM_Plex_Sans'] font-bold text-[15px] text-white">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-4">📶</div>
          <div className="w-4 h-4">📡</div>
          <div className="w-4 h-4">🔋</div>
        </div>
      </div>

      {/* Header */}
      <div className="backdrop-blur-md bg-[rgba(255,255,255,0.05)] px-6 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-white/60 font-['IBM_Plex_Sans'] font-bold text-[12px] uppercase tracking-[1.2px]">
            A Reproduzir
          </span>
          <span className="text-white font-['IBM_Plex_Sans'] font-bold text-[14px]">
            Economia com História
          </span>
        </div>

        <button className="flex items-center justify-center w-10 h-10 rounded-xl">
          <div className="flex flex-col gap-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-8 pt-12 pb-24">
        {/* Artwork */}
        <div className="relative mb-12">
          <div className="absolute inset-x-0 -bottom-4 h-16 bg-black/20 blur-[20px] rounded-lg opacity-50"></div>
          <div className="relative w-full aspect-square rounded-lg shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80"
              alt="Podcast cover"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Track Info */}
        <div className="mb-8">
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[24px] text-white text-center leading-[32px] mb-3">
            Kwanza: História e Desafios da Moeda Nacional
          </h1>
          <div className="flex items-center justify-center gap-2 opacity-80">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            <p className="font-['Source_Sans_3'] text-[16px] text-white">
              Narrado por Prof. Dr. Arnaldo Santos
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative h-1.5 bg-white/20 rounded-full mb-2">
            <div className="absolute inset-y-0 left-0 w-[42%] bg-white rounded-full"></div>
            <div className="absolute -top-1.5 left-[42%] -ml-3">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-white/60 font-['Source_Sans_3'] font-bold text-[10px] tracking-[1px]">
            <span>12:45</span>
            <span>28:10</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between px-4 mb-8">
          <button className="text-white/60">
            <Shuffle className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-8">
            <button className="text-white">
              <SkipBack className="w-7 h-8" fill="currentColor" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 bg-white rounded-xl shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-6 h-7 text-[#8B1E2D]" fill="currentColor" />
              ) : (
                <Play className="w-6 h-7 text-[#8B1E2D] ml-1" fill="currentColor" />
              )}
            </button>

            <button className="text-white">
              <SkipForward className="w-7 h-8" fill="currentColor" />
            </button>
          </div>

          <button className="text-white/60">
            <Volume2 className="w-5.5 h-6" />
          </button>
        </div>

        {/* Secondary Controls */}
        <div className="border-t border-white/10 pt-4 mb-8">
          <div className="flex items-center justify-around px-4">
            <button className="flex flex-col items-center gap-1">
              <span className="font-['IBM_Plex_Sans'] font-bold text-[14px] text-white/80">
                1.25x
              </span>
              <span className="font-['Source_Sans_3'] font-bold text-[10px] text-white/60 uppercase tracking-[1px]">
                Velocidade
              </span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <FileText className="w-4 h-5 text-white/80" />
              <span className="font-['Source_Sans_3'] font-bold text-[10px] text-white/60 uppercase tracking-[1px]">
                Transcrição
              </span>
            </button>

            <button className="flex flex-col items-center gap-1">
              <Wifi className="w-5 h-4 text-white/80" />
              <span className="font-['Source_Sans_3'] font-bold text-[10px] text-white/60 uppercase tracking-[1px]">
                Dispositivos
              </span>
            </button>
          </div>
        </div>

        {/* Transcript Section */}
        {showTranscript && (
          <div className="backdrop-blur-md bg-white/5 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['IBM_Plex_Sans'] font-bold text-[12px] text-white/60 uppercase tracking-[1.2px]">
                Transcrição em Tempo Real
              </h3>
              <button onClick={() => setShowTranscript(false)}>
                <X className="w-3 h-3 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="font-['Source_Sans_3'] text-[18px] text-white leading-[29.25px]">
                "...a introdução do <span className="text-[#ff9da0]">Kwanza</span> em 1977
                não foi apenas uma mudança
                monetária, mas um símbolo de
                soberania económica..."
              </p>

              <p className="font-['Source_Sans_3'] text-[18px] text-white/40 leading-[29.25px]">
                Neste capítulo, analisamos como as
                flutuações cambiais impactaram o
                mercado de Luanda durante a
                década de 90...
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons - Quiz and Forum */}
        <div className="mt-8 mb-24 px-8">
          <h3 className="font-['IBM_Plex_Sans'] font-bold text-[11px] text-white/60 uppercase tracking-[0.12em] mb-4">
            Atividades
          </h3>
          <div className="space-y-3">
            <button
              onClick={onStartQuiz}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
            >
              <span className="font-['Source_Sans_3'] font-semibold text-[15px]">
                Realizar Quiz
              </span>
              <Trophy className="w-5 h-5" />
            </button>

            <button
              onClick={() => onCreateTopic?.('Kwanza: História e Desafios da Moeda Nacional', 'História Monetária')}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
            >
              <span className="font-['Source_Sans_3'] font-semibold text-[15px]">
                Debater no Fórum
              </span>
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="content" onNavigate={onNavigate || (() => {})} isLoggedIn={isLoggedIn} />
    </div>
  );
}
