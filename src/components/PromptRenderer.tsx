import React from 'react';
import { AnyPrompt } from '../content/types';
import { PhraseBuilderGame } from '../games/builder/PhraseBuilderGame';
import { TinyTalesGame } from '../games/tales/TinyTalesGame';
import { PocketMarketGame } from '../games/market/PocketMarketGame';
import { CafePleaseGame } from '../games/cafe/CafePleaseGame';
import { SpotTheSlipGame } from '../games/slip/SpotTheSlipGame';
import { WhatDidTheyMeanGame } from '../games/listening/WhatDidTheyMeanGame';

interface Props {
  prompt: AnyPrompt;
  onAnswer: (outcome: 'correct' | 'incorrect' | 'assisted' | 'valid-off-target', payload: any, assisted?: boolean, evidenceOverride?: any) => void;
  disabled?: boolean;
}

export const PromptRenderer: React.FC<Props> = ({ prompt, onAnswer, disabled }) => {
  switch (prompt.game) {
    case 'builder':
      return <PhraseBuilderGame prompt={prompt} onAnswer={onAnswer} disabled={disabled} />;
    case 'tales':
      return <TinyTalesGame prompt={prompt} onAnswer={onAnswer} disabled={disabled} />;
    case 'market':
      return <PocketMarketGame prompt={prompt} onAnswer={onAnswer} disabled={disabled} />;
    case 'cafe':
      return <CafePleaseGame prompt={prompt} onAnswer={onAnswer} disabled={disabled} />;
    case 'slip':
      return <SpotTheSlipGame prompt={prompt} onAnswer={onAnswer} disabled={disabled} />;
    case 'listening':
      return <WhatDidTheyMeanGame prompt={prompt} onAnswer={onAnswer} disabled={disabled} />;
    default:
      return <div>Unknown game type</div>;
  }
};
