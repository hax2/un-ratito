# Product and game design

## 1. Product promise

**A little Spanish whenever you have a little time.**

Build a collection of genuinely different small games inside one lightweight phone website. The user should be able to learn while waiting for a kettle, sitting on the toilet, or relaxing on the sofa. Most play should work silently, one-handed, without typing.

Short-session play means simple controls and forgiving pacing, with active decisions throughout. There is no unattended play, idle progression, or passive listening mode. Advanced language can still fit into a one-minute game.

### Initial audience and boundaries

- English-speaking learners from beginner to advanced, including people with uneven knowledge who want to practise one specific construction.
- Organize content into focused, independently selectable chapters, from everyday requests to advanced tense, mood, and pragmatic contrasts. Level labels are rough navigation aids, not certification claims.
- Production variety: Spanish from Spain, including natural vosotros usage and Spain vocabulary. Accept valid alternatives without presenting them as the target variety.
- Use reviewed Spain Spanish audio for dialogues, examples, and answer playback wherever practical. Silent play remains available for public transport.
- Aim for practical comprehension and production at each chapter's level. Pronunciation assessment and a complete proficiency syllabus remain outside the first release.
- Free, static, no account required. Progress stays on the current browser, with manual export/import.

### Design rules

1. **Start immediately.** Home offers “Continue my chapter,” “Explore chapters,” “Choose a game,” and a sound toggle. Ask for a self-selected starting level with a Skip option; never force a placement test or beginner course.
2. **One thumb is enough.** Large tap targets in the lower screen area. Tapping is always sufficient, including where dragging is offered.
3. **Interruptions are normal.** Save after each answer. Resume the exact prompt, options, and feedback state.
4. **No punishment for leaving.** No lives, forced countdowns, expiring rewards, or broken-streak guilt.
5. **Teach before testing.** Introduce unfamiliar material with its meaning and a short example.
6. **Every mistake has a useful response.** Show the correct form and one brief explanation, then revisit later.
7. **The learning transfers between games.** Seeing `la cuenta` in the market can prepare the learner to request the bill in a café story.

## 2. Shared experience

### Session flow

Home → select or resume a chapter → choose 30 seconds / 1 minute / 3 minutes → suitable game → short introduction if needed → 3–12 decisions → optional summary.

These durations are estimates, not timers. The player can finish the current question or stop immediately. A one-minute session defaults to five decisions. Sessions can also be extended voluntarily.

“Play a minute” selects a game that can exercise the chosen chapter's due items in the current sound mode. Offer “Mix my chapters” explicitly for broader review. If nothing is due, introduce a small number of chapter targets or practise known material. A game can also have a dedicated focus: Café targets ordering, while Tiny Tales can target past requests or hypothetical situations.

At the end, show a concrete summary: “You practised ordering water and asking for the bill.” Distinguish items seen today from items recalled on later days.

### A light reason to return

Completing a session earns one decorative stamp for a little illustrated neighbourhood. Stamps gradually decorate its market, café, station, and park. Replaying is allowed, with at most one stamp per completed session ID. Decorations never stand in for proficiency and never require perfect answers.

Keep this cosmetic system out of the first engineering slice. The games must be enjoyable before adding it. Avoid currency shops, idle production timers, and economies that reward unattended clicking.

### Visual direction

Warm cream backgrounds, ink-dark text, terracotta and teal accents, simple flat illustrations, generous spacing. Feel like a tiny travel notebook rather than a classroom worksheet. Use system fonts initially. Do not rely on emoji to disambiguate vocabulary such as glass, cup, and mug.

Animations should be brief feedback only, with a reduced-motion option. Correctness always has text and an icon, not just colour. No animation delays the next action.

## 3. Game specifications

### Game 1: Pocket Market

**Fantasy:** fill a little shopping bag for a neighbour.

- **Loop:** see a request → tap one of three labelled illustrated items → item enters the bag → read feedback → next request. Five requests fill a bag.
- **Example:** “Add the apple.” Choices: `la manzana`, `el pan`, `el agua`. Later, show `la manzana` and choose among pictures with accessible English descriptions.
- **Learning:** concrete nouns, article+noun chunks, recognition in both directions. Introduce `el agua` as a reviewed exception with feminine agreement, not a general gender rule.
- **Progression:** two introduced items → three choices → requests expressed in Spanish → short quantity phrases supported by reviewed content.
- **Feedback:** “La manzana = the apple.” A wrong choice stays visible beside the correction; the item returns after intervening questions.
- **Game feel:** a bag visibly fills, with different small shopping lists and settings. No speed score.
- **Implementation:** a choice renderer with an inventory illustration. Each request scores one primary learning target. Keep the same item and option order when resuming.
- **Content need:** unambiguous image assets, article+noun labels, sense-specific translations, and reviewed distractors.
- **Pitfall:** image matching alone does not establish recall. Later games revisit the same target without images or answer choices.

### Game 2: Café, Please

**Fantasy:** run a relaxed café counter with one customer at a time.

- **Loop:** read or hear an order → tap the matching drink/food and quantity → explicitly serve → see the customer response. Three orders complete a round.
- **Example:** `Un café con leche, por favor.` Choose a drink, then a milk modifier; tap Serve. Later: `Dos cafés y un agua, por favor.`
- **Learning:** requests, numbers, modifiers, polite routines, and listening comprehension.
- **Progression:** one item with text → modifier → quantity → two-item order → audio-first version. Introduce the language before adding operational complexity.
- **Feedback:** show the requested order next to the served order and highlight the mismatch. Let the player repair it without recording a second first-attempt success.
- **Game feel:** assembling a visible tray makes this a small fulfilment puzzle. Customers never become angry or leave on a timer.
- **Implementation:** model orders as structured slots. Compare semantic IDs and quantities, not display strings. One authored primary target per order; do not give every word mastery credit.
- **Content need:** authored order sentences, matching slot data, reviewed recordings, and explicit milk/quantity icons with labels.
- **Pitfall:** text mode is reading evidence. If the transcript was revealed, audio mode must not report an unassisted listening success.

### Game 3: Phrase Builder

**Fantasy:** put together a tiny postcard or text message.

- **Loop:** see an intent → tap word tiles into a sentence → submit → see a natural answer and one explanation. Three messages complete a postcard.
- **Example:** “Ask for the bill, please.” Tiles form `La cuenta, por favor.` Later: “Say that you want a table for two”: `Quiero una mesa para dos.`
- **Learning:** useful chunks, word order, agreements, and increasingly independent production.
- **Progression:** complete phrase chunks → individual words → a missing word with optional typing → optional full typed recall. Keyboard play is never required by the default session.
- **Feedback:** accept all authored valid variants. Do not reject a grammatical alternative merely because it differs from the canonical sentence.
- **Game feel:** building a readable message with a small destination/reaction, not moving identical flashcards.
- **Implementation:** tile IDs handle repeated words; tap to insert/remove; optional drag is an enhancement. Evaluate token sequences against authored alternatives.
- **Content need:** intents, tokens, valid alternatives, and feedback. Avoid automatically permuting arbitrary Spanish into questions.
- **Pitfall:** tile construction is scaffolded production. Track it separately from unaided typed or self-reported recall.

### Game 4: Spot the Slip

**Fantasy:** repair a confused travel guide's signs and captions.

- **Loop:** inspect a short sentence → tap the part needing repair → choose a correction → see the repaired sign. Occasionally the sign is already correct.
- **Example:** `La casa es rojo.` Tap `rojo`, choose `roja`. Feedback: “Casa is feminine, so use roja.”
- **Learning:** a single contextual contrast per challenge: agreement, verb form, or meaning. Teach ser/estar through specific situations, not the misleading permanent/temporary shortcut.
- **Progression:** highlighted choice → locate the error → include valid sentences → apply the contrast in a new setting.
- **Feedback:** one sentence explaining the rule in this example, followed by the natural corrected sentence.
- **Game feel:** visibly repair signs around the neighbourhood.
- **Implementation:** authored token spans and correction choices; represent an explicit no-error answer. Assess error location and correction as one composite attempt.
- **Content need:** pairs reviewed to ensure exactly one intended error or an explicitly valid sentence.
- **Pitfall:** only introduce this after the learner has seen enough correct examples. Do not repeatedly expose unknown learners to incorrect forms.

### Game 5: Tiny Tales

**Fantasy:** get through a very small everyday adventure.

- **Loop:** read a one-sentence scene → choose a response → see a consequence → continue for three to five turns.
- **Example:** a server asks `¿Para cuántas personas?` The goal says “You and a friend need a table.” Choose `Para dos, por favor.` The next turn asks about drinks.
- **Learning:** understanding dialogue, selecting an appropriate response, and applying known phrases in a new context.
- **Progression:** glossed dialogue → optional word help → new combinations of familiar phrases → short multi-turn scenes.
- **Feedback:** incorrect task responses produce a gentle clarification. Valid conversational alternatives remain valid, even if they take another branch.
- **Game feel:** small narrative outcomes—catch the train, find the bakery, meet a friend. No large branching RPG.
- **Implementation:** bounded graph of authored nodes. Every branch resolves within five turns; persist the current node and previous choices.
- **Content need:** scene goals, prerequisites, response classifications, branches, and useful explanations.
- **Pitfall:** track story completion independently of learning success. A funny outcome is not automatically evidence of comprehension.

### Game 6: What Did They Mean?

**Fantasy:** solve tiny misunderstandings from overheard conversations.

- **Loop:** tap to hear a 3–12 second Spain Spanish clip → choose its meaning, the next appropriate reply, or the matching event sequence → receive feedback and transcript → next challenge. No automatic progression without an answer.
- **Examples:** beginner: identify an order; intermediate: determine what was happening when someone called; advanced: distinguish `Aunque está lejos…` from `Aunque esté lejos…` in an authored context.
- **Learning:** listening comprehension, tense and mood distinctions, register, and implication.
- **Progression:** one clear voice → natural conversational speed → two-speaker exchange → contextual inference. Increase linguistic difficulty, not background noise.
- **Feedback:** replay the relevant span with transcript and a short explanation. Replay alone does not count as help; revealing the transcript changes the evidence type.
- **Game feel:** resolve a small misunderstanding, identify a speaker's intention, or choose what a character should do next.
- **Implementation:** clip player plus choice/sequence input; preserve the prompt on interruption. In silent mode, present a separately labelled reading version and award reading evidence only.
- **Content need:** Spain Spanish recordings, transcripts, segment timings, valid interpretations, and reviewed distractors.
- **Pitfall:** without enough context, several interpretations can be valid. Author context explicitly instead of treating every mood difference as a binary right/wrong rule.

## 4. Curriculum and shared learning

### Chapters, not a single beginner ladder

The [chapter catalogue](CHAPTERS.md) defines the curriculum. Each chapter focuses on one practical use or contrast, offers a short explanation, and provides repeated practice in several contexts. A broad topic such as the imperfect subjunctive becomes several small chapters rather than one giant conjugation unit.

Prototype three chapters: **Order politely**, **What was happening?**, and **If I had more time…**. Start with two targets per chapter, with Builder and Tales examples. For the MVP expand to six targets per chapter (18 total), at least six Builder prompts per target (108 total), and three three-to-five-turn Tales per chapter (nine stories). Map each scored story decision to one target. A target here is a specific communicative pattern, not every conjugated word. Include a compact irregular-forms reference where needed.

Provide Spain Spanish audio for all nine MVP dialogues and at least two example sentences per target. Track missing optional recordings in the content manifest; never advertise unavailable listening challenges. All examples still require language review.

The broader catalogue covers beginner through advanced needs without claiming a complete A1–C2 course. Add chapters based on demand and review capacity, not an arbitrary total word count.

### What counts as learning evidence

Track each target separately for meaning recognition, listening recognition, scaffolded production, and unaided recall. A learner can recognize `la cuenta` without being able to produce it. Text and audio versions can therefore schedule different follow-ups.

Use a small transparent review schedule, specified in the implementation guide. New material has a daily soft cap of five targets; users may deliberately choose more. A mistake leads to feedback and a delayed retry, not an immediate success that erases the mistake.

Practice with spacing has experimental support in vocabulary learning, but the exact schedule here is an engineering starting point, not a validated optimum. See [Pavlik and Anderson's vocabulary spacing study](https://pubmed.ncbi.nlm.nih.gov/21702785/). Assess this product with delayed recall in different contexts rather than only in-game accuracy.

### Language quality rules

- Store nouns with articles and senses. Teach phrase chunks when word-for-word translation would mislead.
- Keep dialect, register, and context metadata. Distinguish informal and formal address.
- Accept reviewed regional alternatives. Do not silently mix vosotros and ustedes paradigms within a single teaching sequence.
- Treat diacritics carefully: `si/sí`, `el/él`, and `ano/año` cannot be indiscriminately normalized to the same word.
- Distractors should expose the intended confusion without creating a second valid answer.
- Every published target and prompt needs a competent Spanish-language review. Generated drafts remain drafts until reviewed.
- Record image/audio rights and attribution alongside assets. Use original or appropriately licensed material.

## 5. Release scope and product checks

### First release

Phrase Builder + Tiny Tales; three chapters spanning beginner, intermediate, and upper-intermediate/advanced practice; 18 reviewed targets, 108 Builder prompts, and nine stories; Spain Spanish audio; chapter selection; shared review; silent play; local save; export/import; accessible controls; GitHub Pages deployment. Advanced learners can start directly with the hypothetical chapter and its harder variants.

### Later

Spot the Slip + What Did They Mean? extend grammar and listening practice; Pocket Market + Café add focused everyday games. Then consider offline installation and cosmetic neighbourhood features. Keep every chapter directly accessible, with optional prerequisite refreshers.

### Deliberately deferred

Accounts, cloud sync, live leaderboards, multiplayer, runtime AI chat, microphone scoring, native apps, subscriptions, and a complete proficiency syllabus. Revisit only after the core loop works.

### Pilot acceptance targets

These are proposed goals, not observed results:

- A first-time player reaches the first meaningful decision within 15 seconds without assistance.
- Five pilot users can stop mid-session and resume without losing an answer.
- Most pilot users can explain what their last session taught them.
- For a small reviewed target set, measure unaided recall after 24 hours and seven days using a different prompt; report the sample and assistance, not a sweeping efficacy claim.
- Ask whether the games feel different and whether the player would voluntarily open them during a spare minute.

Collect pilot feedback manually. In-app metrics stay local by default; user-initiated diagnostic exports can support the pilot.
