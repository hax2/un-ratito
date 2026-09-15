# Build backlog

Build in vertical slices. Each milestone ends in a usable result; the later games must consume the shared learning system established first.

## M0 — Content and interaction prototype

- Use the confirmed audience: English speakers, beginner to advanced, learning Spain Spanish, with audio wherever practical and active short-session play.
- Prototype the three launch chapters from `CHAPTERS.md`: two targets per chapter, at least two Builder prompts per target, and one short Tales scene per chapter. Review before using them to teach.
- Sketch chapter selection, Builder input, Tales choices, feedback, and summary states.
- Try the two mechanics with a handful of people using tappable mock content.

**Exit:** players understand both interactions, can use one hand, and the content contract represents both games without game-specific progress fields.

## M1 — Phrase Builder vertical slice

- Scaffold Vite/React/TypeScript and the folder structure from the implementation guide.
- Build the shell, hash routing, accessible controls, and sound-off default.
- Implement chapter/pack validation, Builder renderer/evaluator, skippable introduction, and five-question sessions.
- Support token IDs, repeated words, authored alternatives, and valid-off-target feedback. Add an optional typed answer path for stretch practice.
- Make all three prototype chapters directly selectable with Supported / Standard / Stretch options.
- Add IndexedDB attempt/progress/session transactions and reload recovery.
- Implement the initial scheduler and meaningful unit tests.

**Exit:** introduce an item, answer it, make a mistake, leave, resume, and receive a correctly scheduled later review. Progress survives reload without duplicate attempts.

## M2 — Tiny Tales and shared-game proof

- Implement bounded dialogue graphs, branch persistence, and separate story/learning outcomes.
- Reuse the same session controller and target progress repository.
- Add chapter-scoped recommendation, optional mixed review, settings, export/import, and storage-error behavior.
- Expand to six targets per launch chapter: 18 targets, 108 Builder prompts, and nine stories of three to five turns.
- Record reviewed Spain Spanish audio for all nine dialogues and at least two example sentences per target. Add replay and transcript controls.

**Exit:** practising a shared target affects its appropriate channel across games; using a transcript never awards unaided listening evidence. Both games work silently. An advanced learner can enter the hypothetical chapter directly and use stretch prompts.

## M3 — First release on GitHub Pages

- Complete content, accessibility, persistence, and mobile release checks.
- Add PR checks and the Pages deployment workflow using the actual repository path.
- Verify production assets, hash routes, refresh, backup restore, and performance.
- Run a short pilot and gather delayed recall plus usability feedback.

**Exit:** a live two-game site works on real iPhone Safari and Android Chrome, and outstanding limitations are documented. This is the MVP.

## M4 — Spot the Slip

- Add error spans, correction choices, valid no-error prompts, and contextual explanations.
- Author at least 30 reviewed prompts across the grammar chapters.
- Offer prerequisite refreshers and distinguish wrong language from valid off-target constructions.

**Exit:** every challenge has exactly its authored error count, valid alternatives are respected, and feedback explains the contextual rule.

## M5 — What Did They Mean?

- Add clip playback plus active meaning, response, and event-order challenges.
- Author at least 30 reviewed challenges using Spain Spanish audio across levels.
- Add replay, transcript assistance, and clearly labelled reading fallback.

**Exit:** every clip leads to an active decision, audio failure is recoverable, and transcript use cannot advance listening mastery.

## M6 — Pocket Market and Café, Please

- Build Market's request-and-bag mechanic and Café's structured tray fulfilment.
- Extend beginner chapters with reviewed article+noun targets, quantity requests, and modifiers.
- Reuse shared progress, controller, and audio services; label the level/focus of these dedicated games.

**Exit:** both dedicated games are playable one-handed and save reliably; adding them has not changed grammar chapter scheduling.

## M7 — Expand the chapter catalogue

- Add focused chapters for past requests, wishes, and past habits before broad tense surveys.
- Add genuinely advanced chapters for contextual mood choices, counterfactual past, and tactful disagreement, following pilot demand.
- Review each chapter's alternatives, game coverage, Spain audio, and transfer challenges before publishing it.
- Add the cosmetic neighbourhood if pilot feedback supports it.

**Exit:** all six games share the same chapter/target catalogue, advanced practice tests meaning and production, and each released chapter has reviewed content and documented audio coverage.

## M8 — Offline polish, if useful in the pilot

- Add manifest, scoped service worker, explicit pack downloads, and update handling.
- Test incomplete downloads, missing network, stale content, quota failures, and recovery.

**Exit:** downloaded packs work offline after a prior successful load, and the UI clearly states which content is available.

## Effort and dependencies

M0–M3 are the first commitment. M4–M8 should be reprioritized after the pilot. For one developer, treat the online two-game, three-chapter MVP as approximately 3–5 focused weeks and the expanded mechanics plus a first chapter expansion as another 4–8 weeks, assuming prompt access to language review and recordings. These are planning ranges, not deadlines or an estimate for a complete beginner-to-advanced curriculum; content and real-device review may dominate elapsed time.

The highest-risk assumptions are whether the two mechanics feel fun, whether the prompts teach what they claim, and whether one-handed interrupted play feels effortless. Validate those before expanding the catalogue.

## Handoff instruction for the future builder

Read `README.md`, `GAME_DESIGN.md`, `CHAPTERS.md`, and `IMPLEMENTATION_GUIDE.md`. Start at M0/M1 with the confirmed audience and three-chapter scope. Build Builder end to end before adding Tales. Preserve stable target IDs, keep assessment out of visual components, and use the release gates to report what is actually verified. Do not mark planned features as implemented.
