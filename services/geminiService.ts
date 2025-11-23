import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizQuestion, ACADEMIC_REFERENCES } from "../types";

const apiKey = process.env.API_KEY || ''; 
// Note: In a real production app, ensure API_KEY is handled securely. 
// For this demo, we assume it's injected via Vite/Environment.

const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION_BASE = `
Você é um Agente de Estudo de classe mundial, focado na preparação para a prova da ETC para o cargo de Administrador.
Sua didática é impecável, objetiva e baseada em evidências científicas de aprendizado.

Sua função é:
1. Explicar assuntos de forma clara, objetiva e estruturada (Resumos, Mapas Mentais em Texto, Listas).
2. Elaborar questões no estilo da banca da ETC.
3. Avaliar o nível de conhecimento.
4. Orientar com técnicas de estudo (Recall Ativo, Repetição Espaçada).

Sempre fundamente suas explicações.
Use formatação Markdown rica (negrito, listas, code blocks para destaque).
`;

export const fetchStudyExplanation = async (topic: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Tópico do Edital: "${topic}"
      
      Por favor, gere um conteúdo de estudo completo para este tópico.
      Estrutura da resposta:
      1. **Resumo Direto**: O que é essencial saber.
      2. **Conceitos Chave**: Lista de pontos importantes.
      3. **Exemplo Prático**: Como isso se aplica na rotina de um Administrador.
      4. **Técnica de Estudo Sugerida**: Como estudar isso melhor (ex: criar flashcards, mapa mental).
      
      Finalize citando as referências padrão.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        temperature: 0.4, // Lower temperature for more factual responses
      }
    });

    return response.text || "Desculpe, não consegui gerar a explicação no momento.";
  } catch (error) {
    console.error("Error generating study content:", error);
    return `Erro ao conectar com o Agente: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export const fetchStudyPlan = async (topic: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Crie um micro-plano de estudo focado para o tópico: "${topic}".
      
      Inclua:
      - Sessão 1: Leitura e Conceitos (Recall Ativo).
      - Sessão 2: Prática (Questões).
      - Sessão 3: Revisão Espaçada (quando revisar).
      
      Seja breve e diretivo.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
      }
    });

    return response.text || "Erro ao gerar plano.";
  } catch (error) {
    console.error("Error generating plan:", error);
    return "Erro ao gerar plano de estudo.";
  }
};

export const fetchQuizQuestions = async (topic: string): Promise<QuizQuestion[]> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "O enunciado da questão estilo ETC." },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Lista de 4 ou 5 alternativas." 
          },
          correctAnswerIndex: { type: Type.INTEGER, description: "Índice da resposta correta (0-based)." },
          explanation: { type: Type.STRING, description: "Breve explicação do porquê está correta." }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"]
      }
    };

    const prompt = `
      Gere 5 questões de múltipla escolha sobre o tópico: "${topic}".
      Estilo: Banca ETC (foco em casos práticos, legislação aplicada ou teoria administrativa clássica).
      Dificuldade: Média/Difícil.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as QuizQuestion[];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

export const fetchSimulatedExamQuestions = async (topics: string[]): Promise<QuizQuestion[]> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "O enunciado da questão estilo ETC." },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Lista de 4 ou 5 alternativas." 
          },
          correctAnswerIndex: { type: Type.INTEGER, description: "Índice da resposta correta (0-based)." },
          explanation: { type: Type.STRING, description: "Breve explicação do porquê está correta e qual tópico ela aborda." }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"]
      }
    };

    const topicsString = topics.join(", ");
    const prompt = `
      Gere um SIMULADO DE PROVA com 10 questões de múltipla escolha para Administrador da ETC.
      
      Tópicos Selecionados: ${topicsString}.
      
      Instruções Críticas:
      1. Distribua as questões entre os tópicos selecionados.
      2. PRIORIDADE TOTAL: Gere apenas questões sobre os conceitos que MAIS CAEM em provas (Princípio de Pareto 80/20).
      3. Exemplos de foco: Nova Lei de Licitações (Modalidades, Dispensa), SWOT, PDCA, Liderança Situacional, Atos Administrativos (Elementos), Princípios da AFO.
      4. Nível de dificuldade: Difícil (estilo concurso, com estudos de caso).
      5. As questões devem simular o estilo da banca.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText) as QuizQuestion[];
  } catch (error) {
    console.error("Error generating simulated exam:", error);
    return [];
  }
};