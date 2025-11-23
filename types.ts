export enum AppMode {
  DASHBOARD = 'dashboard',
  STUDY = 'study', // Explanations, summaries
  QUIZ = 'quiz', // Assessment (Chat based)
  PLAN = 'plan', // Study planning
  SIMULADO = 'simulado' // Full exam simulation
}

export enum Sender {
  USER = 'user',
  AI = 'ai'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isLoading?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
}

export const COMMON_ADMIN_TOPICS = [
  "Administração Geral e Pública",
  "Gestão de Pessoas (RH)",
  "Licitações e Contratos (Lei 14.133)",
  "Gestão de Processos e Qualidade",
  "Orçamento Público e AFO",
  "Direito Constitucional e Administrativo",
  "Gestão de Projetos (PMBOK/Agile)",
  "Ética no Serviço Público",
  "Redação Oficial",
  "Raciocínio Lógico e Matemático"
];

// Topics that historically appear most frequently in exams (Pareto principle)
export const HIGH_FREQUENCY_TOPICS = [
  "Licitações e Contratos (Lei 14.133)",
  "Orçamento Público e AFO",
  "Gestão de Pessoas (RH)",
  "Direito Constitucional e Administrativo",
  "Administração Geral e Pública"
];

export const ACADEMIC_REFERENCES = `
**Referências:**
*   Dunlosky et al. (2013). *Improving Students’ Learning With Effective Learning Techniques*.
*   Brown, Roediger & McDaniel (2014). *Make It Stick: The Science of Successful Learning*.
*   Cepeda et al. (2006). *Spacing effects in learning*.
`;