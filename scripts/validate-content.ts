import { TARGETS, CHAPTERS } from '../src/content/packs/chapters';
import { ALL_PROMPTS } from '../src/content/packs/prompts';

console.log('--- Validating Un Ratito Content Pack ---');

let errors: string[] = [];

// 1. Check Target ID uniqueness
const targetIds = new Set<string>();
for (const target of TARGETS) {
  if (targetIds.has(target.id)) {
    errors.push(`Duplicate target ID found: ${target.id}`);
  }
  targetIds.add(target.id);
}

// 2. Check Chapter ID uniqueness
const chapterIds = new Set<string>();
for (const chapter of CHAPTERS) {
  if (chapterIds.has(chapter.id)) {
    errors.push(`Duplicate chapter ID found: ${chapter.id}`);
  }
  chapterIds.add(chapter.id);

  // Check chapter targets resolve
  for (const tid of chapter.targetIds) {
    if (!targetIds.has(tid)) {
      errors.push(`Chapter ${chapter.id} references non-existent target ID: ${tid}`);
    }
  }
}

// 3. Check Prerequisite resolution and cycle detection
for (const target of TARGETS) {
  for (const prereqId of target.prerequisiteIds) {
    if (!targetIds.has(prereqId)) {
      errors.push(`Target ${target.id} references non-existent prerequisite: ${prereqId}`);
    }
    if (prereqId === target.id) {
      errors.push(`Target ${target.id} cannot be its own prerequisite`);
    }
  }
}

// Simple cycle check
const visiting = new Set<string>();
const visited = new Set<string>();
function checkCycle(tid: string): boolean {
  if (visiting.has(tid)) return true;
  if (visited.has(tid)) return false;
  visiting.add(tid);
  const target = TARGETS.find(t => t.id === tid);
  if (target) {
    for (const pid of target.prerequisiteIds) {
      if (checkCycle(pid)) return true;
    }
  }
  visiting.delete(tid);
  visited.add(tid);
  return false;
}
for (const target of TARGETS) {
  if (checkCycle(target.id)) {
    errors.push(`Prerequisite cycle detected involving target: ${target.id}`);
  }
}

// 4. Validate Prompts
const promptIds = new Set<string>();
for (const prompt of ALL_PROMPTS) {
  if (promptIds.has(prompt.id)) {
    errors.push(`Duplicate prompt ID found: ${prompt.id}`);
  }
  promptIds.add(prompt.id);

  if (!targetIds.has(prompt.targetId)) {
    errors.push(`Prompt ${prompt.id} references unknown target ID: ${prompt.targetId}`);
  }
  if (!chapterIds.has(prompt.chapterId)) {
    errors.push(`Prompt ${prompt.id} references unknown chapter ID: ${prompt.chapterId}`);
  }

  // Game-specific checks
  if (prompt.game === 'builder') {
    if (!prompt.tiles || prompt.tiles.length === 0) {
      errors.push(`Builder prompt ${prompt.id} has no tiles`);
    }
    const tileIds = new Set(prompt.tiles.map(t => t.id));
    if (!prompt.acceptedSequences || prompt.acceptedSequences.length === 0) {
      errors.push(`Builder prompt ${prompt.id} has no accepted sequences`);
    } else {
      for (const seq of prompt.acceptedSequences) {
        for (const tId of seq) {
          if (!tileIds.has(tId)) {
            errors.push(`Builder prompt ${prompt.id} sequence references invalid tileId ${tId}`);
          }
        }
      }
    }
  } else if (prompt.game === 'tales') {
    if (!prompt.turns || prompt.turns.length === 0) {
      errors.push(`Tales prompt ${prompt.id} has no turns`);
    }
    for (const turn of prompt.turns) {
      const correctChoices = turn.choices.filter(c => c.isCorrect);
      if (correctChoices.length === 0) {
        errors.push(`Tales turn in ${prompt.id} has no correct choice`);
      }
    }
  } else if (prompt.game === 'market') {
    if (!prompt.choices || prompt.choices.length === 0) {
      errors.push(`Market prompt ${prompt.id} has no choices`);
    }
    const correct = prompt.choices.find(c => c.id === prompt.correctItemId);
    if (!correct) {
      errors.push(`Market prompt ${prompt.id} correctItemId ${prompt.correctItemId} not in choices`);
    }
  } else if (prompt.game === 'cafe') {
    if (!prompt.targetSlot || !prompt.targetSlot.drink) {
      errors.push(`Cafe prompt ${prompt.id} has invalid targetSlot`);
    }
  } else if (prompt.game === 'tapeo') {
    if (!prompt.requiredItemIds || prompt.requiredItemIds.length === 0) {
      errors.push(`Tapeo prompt ${prompt.id} has no requiredItemIds`);
    }
    const availIds = new Set(prompt.availableItems.map(i => i.id));
    for (const req of prompt.requiredItemIds) {
      if (!availIds.has(req)) {
        errors.push(`Tapeo prompt ${prompt.id} required item ${req} not in availableItems`);
      }
    }
  } else if (prompt.game === 'listening') {
    const hasCorrect = prompt.choices.some(c => c.isCorrect);
    if (!hasCorrect) {
      errors.push(`Listening prompt ${prompt.id} has no correct choice`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Validation FAILED with ${errors.length} error(s):`);
  for (const err of errors) {
    console.error(` - ${err}`);
  }
  process.exit(1);
}

console.log(`Validation PASSED:`);
console.log(` - ${TARGETS.length} Targets`);
console.log(` - ${CHAPTERS.length} Chapters`);
console.log(` - ${ALL_PROMPTS.length} Prompts across 6 game engines`);
