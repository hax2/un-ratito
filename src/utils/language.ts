import { LearnerLevel } from '../content/types';

export const LEVEL_INFO: Record<LearnerLevel, {
  name: string;
  nameEn: string;
  badge: string;
  description: string;
  chapterDefault: string;
  color: string;
}> = {
  beginner: {
    name: 'Principiante',
    nameEn: 'Beginner (A1–A2)',
    badge: 'A1–A2',
    description: 'English instructions and word glosses. Focus on everyday orders, food, drinks, and shopping.',
    chapterDefault: 'chapter-a',
    color: 'bg-mustard-100 text-mustard-800 border-mustard-300',
  },
  intermediate: {
    name: 'Intermedio',
    nameEn: 'Intermediate (B1–B2)',
    badge: 'B1–B2',
    description: 'Spanish instructions with minimal English. Focus on past actions, ongoing events, and conversational flow.',
    chapterDefault: 'chapter-b',
    color: 'bg-terracotta-100 text-terracotta-800 border-terracotta-300',
  },
  advanced: {
    name: 'Avanzado',
    nameEn: 'Advanced (C1–C2)',
    badge: 'C1–C2',
    description: 'Full Spanish immersion with zero English. Focus on subjunctive, hypotheticals, nuance, and implication.',
    chapterDefault: 'chapter-c',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
  },
};

export const UI_TEXT = {
  playMinute: {
    beginner: 'Play a Minute',
    intermediate: 'Jugar un minuto',
    advanced: 'Jugar un minuto',
  },
  chooseGame: {
    beginner: 'Choose a Game',
    intermediate: 'Elige un juego',
    advanced: 'Elige un juego',
  },
  checkAnswer: {
    beginner: 'Check Answer',
    intermediate: 'Comprobar respuesta',
    advanced: 'Comprobar respuesta',
  },
  nextQuestion: {
    beginner: 'Next Question',
    intermediate: 'Siguiente pregunta',
    advanced: 'Siguiente',
  },
  seeSummary: {
    beginner: 'See Summary',
    intermediate: 'Ver resumen',
    advanced: 'Ver resumen',
  },
  yourGoal: {
    beginner: '🎯 Your goal:',
    intermediate: '🎯 Tu objetivo:',
    advanced: '🎯 Objetivo:',
  },
  serveOrder: {
    beginner: 'Serve Order',
    intermediate: 'Servir pedido',
    advanced: 'Servir pedido',
  },
  sentenceHasNoMistake: {
    beginner: 'This sentence has no mistake',
    intermediate: 'Esta frase no tiene errores',
    advanced: 'La frase es correcta',
  },
  showTranscript: {
    beginner: 'Show transcript (reading assistance)',
    intermediate: 'Ver transcripción (ayuda)',
    advanced: 'Mostrar transcripción',
  },
  tapToHear: {
    beginner: 'Tap to hear the clip (Spain Spanish)',
    intermediate: 'Toca para escuchar (audio)',
    advanced: 'Toca para escuchar',
  },
  currentFocus: {
    beginner: 'Current Focus',
    intermediate: 'Enfoque actual',
    advanced: 'Enfoque',
  },
  change: {
    beginner: 'Change',
    intermediate: 'Cambiar',
    advanced: 'Cambiar',
  },
  availableGames: {
    beginner: '6 games available',
    intermediate: '6 juegos disponibles',
    advanced: '6 juegos disponibles',
  },
};

export function shouldShowEnglish(level: LearnerLevel): boolean {
  return level === 'beginner';
}
