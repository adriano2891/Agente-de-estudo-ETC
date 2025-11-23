import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  BrainCircuit, 
  Calendar, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Menu, 
  X, 
  GraduationCap,
  ClipboardList,
  CheckSquare,
  PlayCircle,
  Zap
} from 'lucide-react';
import { AppMode, Message, Sender, QuizQuestion, COMMON_ADMIN_TOPICS, HIGH_FREQUENCY_TOPICS } from './types';
import * as GeminiService from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';
import QuizModule from './components/QuizModule';

function App() {
  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.STUDY);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: `👋 **Olá, futuro Administrador!** \n\nSou seu Agente de Estudo ETC. Estou aqui para garantir sua aprovação com base em evidências científicas.\n\n**O que vamos estudar agora?** Digite um tópico do edital abaixo (ex: *Licitações*, *Gestão de Projetos*, *SWOT*) e escolha se quer uma **Explicação**, **Questões** ou um **Plano**.\n\n📚 *Referências: Dunlosky (2013), Brown (2014).*`,
      sender: Sender.AI,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [currentTopic, setCurrentTopic] = useState('');

  // Simulado State
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isTakingQuiz && activeMode !== AppMode.SIMULADO) {
      scrollToBottom();
    }
  }, [messages, isLoading, activeMode, isTakingQuiz]);

  const handleSendMessage = async (modeOverride?: AppMode, topicOverride?: string) => {
    const topic = topicOverride || inputText.trim();
    if (!topic) return;

    const mode = modeOverride || activeMode;
    setCurrentTopic(topic);
    
    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: topic,
      sender: Sender.USER,
      timestamp: new Date()
    };
    
    // If we are in quiz or plan mode selecting a topic from the grid, we might clear previous messages or keep them.
    // Let's append to keep history.
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      if (mode === AppMode.QUIZ) {
        const questions = await GeminiService.fetchQuizQuestions(topic);
        if (questions.length > 0) {
          setQuizQuestions(questions);
          setIsTakingQuiz(true);
        } else {
           setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: "⚠️ Não consegui gerar questões sobre este tópico. Tente ser mais específico.",
            sender: Sender.AI,
            timestamp: new Date()
          }]);
        }
      } else if (mode === AppMode.PLAN) {
        const plan = await GeminiService.fetchStudyPlan(topic);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: plan,
          sender: Sender.AI,
          timestamp: new Date()
        }]);
      } else {
        const explanation = await GeminiService.fetchStudyExplanation(topic);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: explanation,
          sender: Sender.AI,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Ocorreu um erro ao comunicar com o agente. Verifique sua conexão.",
        sender: Sender.AI,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const closeQuiz = () => {
    setIsTakingQuiz(false);
    setQuizQuestions([]);
    if (activeMode === AppMode.SIMULADO) {
       // Return to simulado setup 
    } else {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `✅ Quiz sobre **${currentTopic}** finalizado. Vamos revisar ou partir para o próximo?`,
        sender: Sender.AI,
        timestamp: new Date()
      }]);
    }
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic) 
        : [...prev, topic]
    );
  };

  const selectHighFrequencyTopics = () => {
    setSelectedTopics([...HIGH_FREQUENCY_TOPICS]);
  };

  const startSimulado = async () => {
    if (selectedTopics.length === 0) return;
    
    setIsLoading(true);
    setCurrentTopic("Simulado Personalizado");
    
    try {
      const questions = await GeminiService.fetchSimulatedExamQuestions(selectedTopics);
      if (questions.length > 0) {
        setQuizQuestions(questions);
        setIsTakingQuiz(true);
      }
    } catch (error) {
      alert("Erro ao gerar simulado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Helpers ---

  const renderSimuladoSetup = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Simulado Personalizado</h2>
            <p className="text-slate-500 text-sm">Monte sua prova focada. O Agente gerará questões estilo banca.</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Selecione os Tópicos</h3>
          <button 
            onClick={selectHighFrequencyTopics}
            className="text-sm flex items-center gap-1 text-amber-600 font-medium hover:text-amber-700 hover:underline bg-amber-50 px-3 py-1 rounded-full transition-colors"
          >
            <Zap className="w-4 h-4" />
            Selecionar os que mais caem (Top 5)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {COMMON_ADMIN_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                selectedTopics.includes(topic)
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                selectedTopics.includes(topic) ? 'bg-purple-500 border-purple-500' : 'border-slate-300 bg-white'
              }`}>
                {selectedTopics.includes(topic) && <CheckSquare className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm font-medium">{topic}</span>
              {HIGH_FREQUENCY_TOPICS.includes(topic) && (
                <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                  HOT
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={startSimulado}
            disabled={selectedTopics.length === 0 || isLoading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold shadow-md shadow-purple-200 transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Gerando Prova...
              </span>
            ) : (
              <>
                <PlayCircle className="w-5 h-5" />
                Iniciar Simulado
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTopicSelector = (icon: React.ElementType, title: string, subtitle: string, colorClass: string) => (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-3 mb-2">
           <div className={`p-2 rounded-lg ${colorClass === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
             {React.createElement(icon, { className: "w-6 h-6" })}
           </div>
           <div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <p className="text-slate-500 text-sm">{subtitle}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COMMON_ADMIN_TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => handleSendMessage(undefined, topic)}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all text-left group"
          >
            <div className="flex justify-between items-start">
              <span className="font-medium text-slate-700 group-hover:text-primary-700">{topic}</span>
              {HIGH_FREQUENCY_TOPICS.includes(topic) && (
                <Zap className="w-4 h-4 text-amber-500 opacity-50 group-hover:opacity-100" />
              )}
            </div>
          </button>
        ))}
        <div className="sm:col-span-2 mt-2">
           <p className="text-center text-sm text-slate-400">Ou digite outro tópico específico abaixo 👇</p>
        </div>
      </div>
    </div>
  );

  const showChatInterface = activeMode === AppMode.STUDY || (messages.length > 1 && (activeMode === AppMode.QUIZ || activeMode === AppMode.PLAN));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight">Agente ETC</h1>
              <p className="text-xs text-slate-500 font-medium">Administrador</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Modos de Estudo</p>
            
            <button
              onClick={() => { setActiveMode(AppMode.STUDY); setSidebarOpen(false); setIsTakingQuiz(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeMode === AppMode.STUDY && !isTakingQuiz ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <BookOpen className="w-5 h-5" />
              Explicação & Resumo
            </button>
            
            <button
              onClick={() => { setActiveMode(AppMode.QUIZ); setSidebarOpen(false); setIsTakingQuiz(false); setMessages([messages[0]]); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeMode === AppMode.QUIZ && !isTakingQuiz ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <BrainCircuit className="w-5 h-5" />
              Treino Rápido
            </button>

            <button
              onClick={() => { setActiveMode(AppMode.SIMULADO); setSidebarOpen(false); setIsTakingQuiz(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeMode === AppMode.SIMULADO ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <ClipboardList className="w-5 h-5" />
              Simulado
            </button>
            
            <button
              onClick={() => { setActiveMode(AppMode.PLAN); setSidebarOpen(false); setIsTakingQuiz(false); setMessages([messages[0]]); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeMode === AppMode.PLAN ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Calendar className="w-5 h-5" />
              Plano de Estudo
            </button>
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-xs text-slate-500 leading-relaxed text-center">
                Baseado em <strong>Dunlosky (2013)</strong> & <strong>Brown (2014)</strong>. Pratique o Recall Ativo!
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-semibold text-slate-800">Agente ETC</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 relative scroll-smooth">
          {isTakingQuiz ? (
            <div className="p-4 md:p-8 min-h-full">
               <button 
                onClick={closeQuiz}
                className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium"
              >
                <X className="w-4 h-4" /> Cancelar / Voltar
              </button>
              <QuizModule 
                topic={currentTopic} 
                questions={quizQuestions} 
                onClose={closeQuiz} 
              />
            </div>
          ) : activeMode === AppMode.SIMULADO ? (
             renderSimuladoSetup()
          ) : !showChatInterface && activeMode === AppMode.QUIZ ? (
             renderTopicSelector(BrainCircuit, "Treino Rápido", "Escolha um tópico para gerar questões instantâneas.", "blue")
          ) : !showChatInterface && activeMode === AppMode.PLAN ? (
             renderTopicSelector(Calendar, "Plano de Estudo", "Escolha um tópico para receber um roteiro estruturado.", "green")
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-32">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-4 ${msg.sender === Sender.USER ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === Sender.AI ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-600'}`}>
                    {msg.sender === Sender.AI ? <Sparkles className="w-4 h-4" /> : <span className="text-xs font-bold">EU</span>}
                  </div>
                  
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.sender === Sender.USER ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-5 py-4 shadow-sm ${
                      msg.sender === Sender.USER 
                        ? 'bg-primary-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-100 rounded-tl-sm'
                    }`}>
                      {msg.sender === Sender.AI ? (
                         <MarkdownRenderer content={msg.text} />
                      ) : (
                        <p className="text-sm md:text-base whitespace-pre-wrap">{msg.text}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                 <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area (only visible if not taking quiz AND not in Simulado mode) */}
        {!isTakingQuiz && activeMode !== AppMode.SIMULADO && (
          <div className="bg-white border-t border-slate-200 p-4 absolute bottom-0 left-0 right-0 z-10">
             <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                    Modo Atual: <span className="text-primary-600">{
                      activeMode === AppMode.STUDY ? "Explicação & Resumo" : 
                      activeMode === AppMode.QUIZ ? "Gerar Questões" : 
                      "Plano de Estudos"
                    }</span>
                  </span>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      activeMode === AppMode.QUIZ 
                      ? "Digite um tópico para gerar questões (ex: Gestão da Qualidade)..." 
                      : "Digite um tópico para estudar..."
                    }
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl py-3.5 pl-10 pr-14 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputText.trim()}
                    className="absolute right-2 bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  O Agente pode cometer erros. Verifique informações críticas. 
                </p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;