import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle, XCircle, ChevronRight, RefreshCw, Award } from 'lucide-react';

interface QuizModuleProps {
  topic: string;
  questions: QuizQuestion[];
  onClose: () => void;
}

const QuizModule: React.FC<QuizModuleProps> = ({ topic, questions, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Não foi possível carregar as questões. Tente novamente.</p>
        <button onClick={onClose} className="mt-4 text-primary-600 hover:underline">Voltar</button>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 animate-in fade-in zoom-in duration-300">
        <div className="bg-primary-50 p-4 rounded-full mb-4">
          <Award className="w-12 h-12 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Finalizado!</h2>
        <p className="text-slate-600 mb-6 text-lg">Tópico: <span className="font-semibold">{topic}</span></p>
        
        <div className="w-full bg-slate-100 rounded-full h-4 mb-4 overflow-hidden">
          <div 
            className="bg-primary-500 h-4 transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-3xl font-bold text-primary-700 mb-8">{score} / {questions.length} <span className="text-base font-normal text-slate-500">({percentage}%)</span></p>

        <button 
          onClick={onClose}
          className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-900 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Estudar outro tópico
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-1">Questão {currentIndex + 1} de {questions.length}</h2>
          <h3 className="text-xl font-bold text-slate-800">{topic}</h3>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Placar: {score}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8">
        <div 
          className="bg-primary-500 h-1.5 rounded-full transition-all duration-300" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 mb-6">
        <p className="text-lg text-slate-800 font-medium leading-relaxed mb-6">
          {currentQuestion.question}
        </p>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let itemClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between group ";
            
            if (isAnswered) {
              if (idx === currentQuestion.correctAnswerIndex) {
                itemClass += "border-green-500 bg-green-50 text-green-900";
              } else if (idx === selectedOption) {
                itemClass += "border-red-500 bg-red-50 text-red-900";
              } else {
                itemClass += "border-slate-100 text-slate-400 opacity-60";
              }
            } else {
              itemClass += "border-slate-100 hover:border-primary-300 hover:bg-slate-50 text-slate-700";
            }

            return (
              <button 
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={isAnswered}
                className={itemClass}
              >
                <span className="flex-1">{option}</span>
                {isAnswered && idx === currentQuestion.correctAnswerIndex && (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 ml-3" />
                )}
                {isAnswered && idx === selectedOption && idx !== currentQuestion.correctAnswerIndex && (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 ml-3" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback & Next Button */}
      {isAnswered && (
        <div className="animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-lg mb-6 text-slate-700">
            <h4 className="font-bold text-blue-800 mb-1 flex items-center gap-2">
              <span className="text-lg">💡</span> Explicação
            </h4>
            <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleNext}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium shadow-md shadow-primary-200 transition-all flex items-center gap-2"
            >
              {currentIndex === questions.length - 1 ? "Ver Resultados" : "Próxima Questão"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizModule;