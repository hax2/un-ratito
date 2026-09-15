import React from 'react';
import { AnyPrompt, LearnerLevel } from '../content/types';
import { PhraseBuilderGame } from '../games/builder/PhraseBuilderGame';
import { TinyTalesGame } from '../games/tales/TinyTalesGame';
import { PocketMarketGame } from '../games/market/PocketMarketGame';
import { CafePleaseGame } from '../games/cafe/CafePleaseGame';
import { TapeoFrenzyGame } from '../games/tapeo/TapeoFrenzyGame';
import { WhatDidTheyMeanGame } from '../games/listening/WhatDidTheyMeanGame';

interface Props {
  prompt: AnyPrompt;
  learnerLevel?: LearnerLevel;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any, assisted?: boolean, evidenceOverride?: any) => void;
  disabled?: boolean;
}

export const PromptRenderer: React.FC<Props> = ({ prompt, learnerLevel = 'beginner', onAnswer, disabled }) => {
  switch (prompt.game) {
    case 'builder':
      return <PhraseBuilderGame prompt={prompt} learnerLevel={learnerLevel} onAnswer={onAnswer} disabled={disabled} />;
    case 'tales':
      return <TinyTalesGame prompt={prompt} learnerLevel={learnerLevel} onAnswer={onAnswer} disabled={disabled} />;
    case 'market':
      return <PocketMarketGame prompt={prompt} learnerLevel={learnerLevel} onAnswer={onAnswer} disabled={disabled} />;
    case 'cafe':
      return <CafePleaseGame prompt={prompt} learnerLevel={learnerLevel} onAnswer={onAnswer} disabled={disabled} />;
    case 'tapeo':
      return <TapeoFrenzyGame prompt={prompt} learnerLevel={learnerLevel} onAnswer={onAnswer} disabled={disabled} />;
    case 'listening':
      return <WhatDidTheyMeanGame prompt={prompt} learnerLevel={learnerLevel} onAnswer={onAnswer} disabled={disabled} />;
    default:
      return <div>Unknown game type</div>;
  }
};
