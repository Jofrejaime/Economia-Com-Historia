import React, { useState } from 'react';
import { ArrowLeft, Plus, X, ChevronRight, Trash2 } from 'lucide-react';
import BottomNav from './BottomNav';

interface CreateQuizProps {
  onBack: () => void;
  onNavigate: (destination: 'dashboard' | 'content' | 'community' | 'quiz' | 'profile') => void;
  onSaveDraft?: () => void;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function CreateQuiz({ onBack, onNavigate, onSaveDraft }: CreateQuizProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Intermédio' | 'Avançado'>('Intermédio');
  const [duration, setDuration] = useState('15');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: '1',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    }
  ]);

  const categories = [
    'História Monetária',
    'Agronegócio',
    'Petróleo e Reforma',
    'Infraestrutura',
    'Economia Colonial',
    'Desenvolvimento Sustentável'
  ];

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      }
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Status Bar */}
      <div className="h-11 bg-white flex items-center justify-between px-5">
        <span className="font-['IBM_Plex_Sans'] font-bold text-[15px]">9:41</span>
        <div className="flex gap-1">
          <div className="w-4 h-4">📶</div>
          <div className="w-4 h-4">📡</div>
          <div className="w-4 h-4">🔋</div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3 text-[#8B1E2D]">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-['IBM_Plex_Sans'] font-bold text-[16px]">Criar Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pt-8 pb-32">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="font-['IBM_Plex_Sans'] font-bold text-[36px] text-[#8B1E2D] leading-[45px] mb-3">
            Novo Quiz
          </h1>
          <p className="font-['Source_Sans_3'] text-[16px] text-[#574142] leading-[26px]">
            Crie um quiz educativo para testar o conhecimento da comunidade sobre economia e história de Angola.
          </p>
        </div>

        {/* Quiz Info */}
        <div className="mb-8">
          <h2 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937] mb-4">
            Informações Gerais
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
                Título do Quiz
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: História Económica de Angola: 1975-1990"
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva brevemente o conteúdo do quiz..."
                rows={3}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
              >
                <option value="">Escolha uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Difficulty & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
                  Dificuldade
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-4 py-3 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
                >
                  <option value="Fácil">Fácil</option>
                  <option value="Intermédio">Intermédio</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>
              <div>
                <label className="block font-['Source_Sans_3'] font-semibold text-[14px] text-[#4B5563] mb-2">
                  Duração (min)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="5"
                  max="60"
                  className="w-full px-4 py-3 bg-white border-2 border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[16px] text-[#1F2937] focus:outline-none focus:border-[#8B1E2D] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['IBM_Plex_Sans'] font-bold text-[18px] text-[#1F2937]">
              Perguntas ({questions.length})
            </h2>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-[#8B1E2D] text-white rounded-lg font-['Source_Sans_3'] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#A52535] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div key={q.id} className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
                <div className="flex items-start justify-between mb-4">
                  <span className="font-['IBM_Plex_Sans'] font-bold text-[16px] text-[#8B1E2D]">
                    Pergunta {qIndex + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="p-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <div className="mb-4">
                  <label className="block font-['Source_Sans_3'] font-semibold text-[13px] text-[#4B5563] mb-2">
                    Pergunta
                  </label>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                    placeholder="Digite a pergunta..."
                    rows={2}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors resize-none"
                  />
                </div>

                {/* Options */}
                <div className="mb-4">
                  <label className="block font-['Source_Sans_3'] font-semibold text-[13px] text-[#4B5563] mb-2">
                    Opções de Resposta
                  </label>
                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctAnswer === optIndex}
                          onChange={() => updateQuestion(q.id, 'correctAnswer', optIndex)}
                          className="w-5 h-5 text-[#8B1E2D] focus:ring-[#8B1E2D] flex-shrink-0"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                          placeholder={`Opção ${String.fromCharCode(65 + optIndex)}`}
                          className="flex-1 px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="font-['Source_Sans_3'] text-[12px] text-[#9CA3AF] mt-2">
                    Selecione a opção correta marcando o círculo
                  </p>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block font-['Source_Sans_3'] font-semibold text-[13px] text-[#4B5563] mb-2">
                    Explicação (opcional)
                  </label>
                  <textarea
                    value={q.explanation}
                    onChange={(e) => updateQuestion(q.id, 'explanation', e.target.value)}
                    placeholder="Explique porque esta é a resposta correta..."
                    rows={2}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-['Source_Sans_3'] text-[15px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#8B1E2D] transition-colors resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full py-5 bg-[#8B1E2D] text-white rounded-xl font-['Source_Sans_3'] font-bold text-[17px] hover:bg-[#A52535] active:scale-[0.98] transition-all shadow-[0px_8px_24px_-4px_rgba(139,30,45,0.4)] flex items-center justify-center gap-2">
            Publicar Quiz
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={onSaveDraft}
            className="w-full font-['Source_Sans_3'] font-semibold text-[14px] text-[#8B1E2D] hover:text-[#A52535] transition-colors"
          >
            Salvar rascunho
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="quiz" onNavigate={onNavigate} />
    </div>
  );
}
