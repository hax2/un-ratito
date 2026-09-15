# Implementation guide

## 1. Architecture decision

Build **one static application with six game modules**, sharing content, session handling, assessment, audio, and persistence. This makes it possible to add a game without rewriting progress tracking.

Recommended stack: TypeScript, React, Vite, plain CSS with design tokens, IndexedDB for progress, schema validation for authored JSON, Vitest for logic, and Playwright for browser flows. Use compatible stable versions at build time, commit the lockfile, and pin the supported Node version. A game engine is unnecessary for these DOM-based interactions.

GitHub Pages serves static HTML, CSS, and JavaScript, which suits this browser-only design. It does not provide the application's own backend or cross-device database. See [GitHub Pages overview](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

Use hash routes, for example `/#/play/market` and `/game/#/play/cafe`. The hash keeps navigation inside the application and avoids requiring server rewrites on Pages.

### Ownership boundaries

| Component | Owns | Must not own |
| --- | --- | --- |
| Content loader | Schema checks, pack versions, assets | Learner progress |
| Scheduler | Due items and eligible activity selection | Game animations |
| Session controller | Prompt state, resume, answer lifecycle | Spanish correctness rules |
| Evaluator | Pure answer assessment against authored content | Persistence or rewards |
| Game module | Presentation and input for its mechanic | Independent mastery logic |
| Progress repository | Transactions, migrations, backup | Choosing the next question |
| Audio service | Playback, availability, cancellation | Awarding listening mastery |

Suggested source layout:

```text
src/
  app/                 # shell, hash routes, settings, home
  components/          # accessible buttons, feedback, progress summary
  games/               # market/, cafe/, builder/, slip/, tales/, listening/
  learning/            # scheduler, evaluation, evidence, session controller
  content/             # schemas, loader, compatibility checks
  storage/             # IndexedDB repository, migrations, export/import
  audio/               # playback and speech fallback
  styles/              # tokens and responsive layouts
content/
  packs/               # reviewed targets, prompts, stories, audio manifests
public/
  assets/              # illustrations and recordings
scripts/               # validate content and asset references
tests/                 # unit and browser acceptance tests
.github/workflows/     # checks and Pages publishing, added during implementation
```

## 2. Content contracts

Use stable IDs independent of display text. A learning target represents a sense or construction, not simply a spelling. An authored prompt references one primary target plus any prerequisites; seeing prerequisites does not automatically advance them.

Illustrative target:

```json
{
  "id": "cafe.request-bill",
  "revision": 1,
  "packId": "cafe-es-ES-1",
  "type": "phrase",
  "spanish": "La cuenta, por favor.",
  "english": "The bill, please.",
  "locale": "es-ES",
  "register": "neutral-polite",
  "prerequisiteIds": [],
  "tags": ["cafe", "request"],
  "review": { "status": "draft", "reviewer": null },
  "audioAssetId": null
}
```

Illustrative future Builder prompt (draft, not launch-approved content):

```json
{
  "id": "builder.request-bill.1",
  "revision": 1,
  "game": "builder",
  "targetId": "cafe.request-bill",
  "evidence": "scaffolded-production",
  "intent": "Ask for the bill, please.",
  "tiles": [
    { "id": "t1", "text": "La" },
    { "id": "t2", "text": "cuenta" },
    { "id": "t3", "text": "por" },
    { "id": "t4", "text": "favor" }
  ],
  "acceptedSequences": [["t1", "t2", "t3", "t4"]],
  "canonicalDisplay": "La cuenta, por favor.",
  "explanation": "Use this phrase to ask for the bill.",
  "review": { "status": "draft", "reviewer": null }
}
```

Define a discriminated schema per game, with shared `id`, `revision`, `targetId`, `chapterId`, `evidence`, `prerequisiteIds`, `supportLevel`, review metadata, and feedback. Market adds labelled choices and a correct choice ID; Café adds structured order slots; Slip adds error spans; Tales adds graph nodes; Listening adds a clip and interpretation choices.

Add chapter manifests with title, grammar search aliases, approximate level band, communicative goal, target IDs, supported games, explanation, refresher IDs, and audio coverage. The catalogue and two detailed grammar blueprints are in [CHAPTERS.md](CHAPTERS.md). Store learner-selected chapter and support level independently of assessed progress. Chapter access is unrestricted; prerequisite references recommend refreshers only.

Asset records include path, locale if applicable, transcript for audio, creator, licence, attribution, and review status. Pack manifests list content version, compatible schema version, target IDs, and required assets.

### Build-time validation

- IDs are unique; all references resolve; prerequisite graphs are acyclic.
- Every enabled game has usable prompts; every target in a release pack is reachable.
- Choices have valid answers and do not duplicate visible labels; alternate valid answers are explicit.
- Story graphs terminate within the designed turn budget and have no dangling nodes.
- Audio paths and transcripts exist for enabled listening prompts.
- Only reviewed targets, prompts, and assets enter production packs. Reject drafts in release mode.
- Tokens, quantities, and order slots are structurally valid. Human review still decides whether Spanish and distractors make sense.

Provide a readable validation report with file, content ID, and exact failing field.

## 3. Assessment and scheduling

### Attempt model

Persist an attempt with `attemptId`, `sessionId`, `promptId`, prompt/content revision, primary target, game, requested and actual evidence type, answer payload, first-answer result, hint/transcript usage, timestamp, and active response duration. Duration is diagnostic only; never grade someone worse for being interrupted.

Evidence channels: `meaning-recognition`, `listening-recognition`, `scaffolded-production`, `unaided-recall`. Exposure and self-reported recall are separate event types and do not advance assessed channels. Keep per-channel progress for each target.

Evaluators return `correct`, `incorrect`, `assisted`, or `valid-off-target`, plus authored feedback. The last outcome means the Spanish is valid but doesn't demonstrate the requested construction; invite another attempt without awarding target success or recording a grammar error. Preserve first-answer results even after repairs. Revealing an audio transcript downgrades the activity to meaning recognition and marks assistance; it cannot advance listening progress. An unseen content introduction records exposure only.

For typed answers, normalize Unicode to NFC, case where appropriate, whitespace, and permitted punctuation. Use explicitly accepted variants. Handle accent-only typos through prompt-specific policies and helpful feedback; never globally strip accents or ñ. Do not introduce free-form fuzzy grading in the MVP.

### Initial scheduler: deliberately simple

Use per-target/per-evidence stages with intervals of **1, 3, 7, 14, and 30 days**. These are configurable product defaults, not a scientific optimum.

1. An introduction sets the channel to unassessed. Its first unassisted correct assessment schedules stage 0 for one day later.
2. A correct unassisted assessment when due advances one stage, capped at stage 4, and schedules from the current timestamp.
3. Early practice can record a success but cannot advance a stage or push its due date later.
4. Incorrect or assisted answers set that channel to stage 0 and schedule it for the next day. Enqueue at most one remedial retry after at least three other prompts, if the current session has room.
5. A remedial retry never advances the stage. If there is insufficient intervening content, defer it; do not pad the session with repetitive questions.
6. Skips and valid-off-target responses record no mastery change and do not count as errors. Stop has no learning penalty.
7. Repeated early incorrect answers can reset a channel; repeated early correct answers cannot farm mastery.

Within each five-prompt session, aim for three due/recently difficult prompts, one eligible new introduction, and one familiar-context variation. This is a preference, not a rigid quota: fill empty categories with eligible known prompts, avoid immediate repeats, and allow a shorter session if content is insufficient. Cap novel targets at five per local day by default. Use epoch timestamps for due scheduling; local calendar dates only for user-facing daily counts.

Filter candidate prompts by selected chapter, support level, installed content, sound mode, and game capability before selection. Use prerequisite exposure to recommend help, not to block advanced chapter access. Use seeded randomness and persist selected prompt IDs and choice order. Offer a skippable teach step for new targets. When the player manually chooses a game, only select targets that game can actually assess. Mix chapters only when the player selects that mode; advanced practice must not silently pull beginner vocabulary into a focused session.

Show “recalled on later days” using actual delayed-success counts. Do not label a target fully mastered or fluent based on a handful of multiple-choice responses. Scheduling stages remain internal.

## 4. Game module interface and session state

Each game provides a descriptor, eligibility check, prompt renderer, serializable input state, and pure answer evaluator. The controller owns progression and passes a single submit callback. Games submit meaning IDs, tile IDs, or slot values, never their own XP or mastery updates.

Session states:

```text
introducing → awaiting-answer → evaluating → feedback → awaiting-answer
                                                └──→ summary
any stable state → paused → same saved state
```

Disable duplicate submission during evaluation. Commit attempt, updated progress, and resumable session state in one IndexedDB transaction. Use unique attempt IDs for idempotency. Save selected-but-unsubmitted input as a draft without awarding progress. Save before feedback animation.

On reload, show Continue / Start a fresh session. Starting fresh preserves completed attempts. If a new pack invalidates the saved prompt, explain that the session was updated and start a new session while keeping progress. On a second tab, use repository revision checks to prevent stale writes; tell that tab to refresh its session when a conflicting commit is detected.

## 5. Persistence and privacy

IndexedDB stores settings, channel progress, attempts, sessions, and schema metadata. Keep keys namespaced for this app because GitHub Pages projects on one hostname share an origin. Use a small localStorage preference only if useful for avoiding a theme flash.

- Save immediately after answers; do not depend on unload events.
- Handle storage failures: continue in memory with a visible “Progress isn't being saved” notice and an export option.
- Export versioned JSON containing progress, settings, and resumable state. Validate imports, show their scope, then replace local progress after explicit user confirmation; do not attempt ambiguous automatic merges in v1.
- Before migrations, keep a recoverable snapshot. Run sequential schema migrations with fixtures.
- Keep a rolling maximum of 10,000 detailed attempts; retain aggregate learning progress when pruning old events.
- Browser data can be cleared or evicted. Describe progress as “saved on this browser,” and offer backup from settings.
- No personal details, third-party analytics, or remote learner telemetry by default. Learning checks do not require an account.

## 6. Mobile and accessibility requirements

- Support portrait layouts from 320 CSS pixels upward without horizontal scrolling. Use safe-area insets and dynamic viewport sizing where supported.
- Minimum 48 × 48 CSS pixel interactive targets; readable 18px default learning text; enough spacing to prevent accidental choices.
- Keep answer controls within comfortable thumb reach. Feedback must not shift buttons under an active tap.
- All controls work with keyboard and assistive technology. Use semantic buttons, visible focus, labelled groups, and polite live feedback announcements.
- Provide tap alternatives to all drag interactions. Do not require hover, colour perception, sound, or fine motor precision.
- Respect reduced motion and maintain readable contrast. Mark Spanish fragments with `lang="es"` or the appropriate locale.
- Pause session timing and audio when hidden. Resume without consuming questions or showing an expired timer.
- Do not block zoom. Check enlarged text, landscape, virtual keyboard, and screen reader order on actual phones.

## 7. Audio and optional offline support

Use reviewed Spain Spanish recorded audio as the listening source, loaded on demand. Provide audio on introductions, dialogue turns, and correct example playback wherever practical, including grammar chapters. Audio is a first-class content asset: the MVP requires recordings for nine dialogues and at least two examples per target. A single audio service cancels the previous clip when a new one starts. Present replay and transcript controls and handle loading/error states visibly. Listening challenges always await an active answer; no idle or autoplay learning loop.

Audio starts after a deliberate interaction because browsers restrict automatic playback. See [MDN audio guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices). Offer browser speech synthesis for optional read-aloud when a suitable Spanish voice is available, but account for voice availability changing asynchronously. See [MDN speech synthesis](https://developer.mozilla.org/en-US/docs/Web/API/Window/speechSynthesis). If playback fails, offer the text activity and change its evidence type.

Add installable/offline behavior after the online MVP is stable. Cache the shell and explicitly downloaded content/audio packs; show whether each pack is ready offline. Scope the service worker and manifest to the repository path. Use versioned caches, leave existing sessions on their compatible version, and offer an update between sessions. A fresh visitor without network cannot load uncached content. Test partial downloads and browser storage clearing; never promise permanent offline storage.

## 8. Performance budgets

Proposed engineering budgets: initial application JS at most 200 KB gzip; initial transfer below 500 KB excluding optional media; no eager loading of the entire audio catalogue. Lazy-load later game modules and packs. Measure the production build on a throttled mobile profile and one ordinary physical phone. Aim for a usable first screen within two seconds on a warm load; record device/network conditions with results.

No remote fonts or heavy canvas framework needed. Use small SVG illustrations where suitable and compressed recordings. The content and media budget will matter more as packs grow.

## 9. GitHub Pages deployment

Follow [Vite's Pages deployment instructions](https://vite.dev/guide/static-deploy.html#github-pages) when implementing the workflow.

1. Confirm the actual repository name and owner when deployment work begins. The local folder name `game` is not evidence of the remote URL.
2. Configure Vite `base` to `/<repository>/` for a project site, or `/` for a user site/custom domain. Construct content and media URLs with the configured base; avoid root-relative `/assets/...` paths.
3. Configure repository Settings → Pages → GitHub Actions.
4. Add a workflow for the default branch and manual dispatch: checkout → set up pinned Node → `npm ci` → typecheck → content validation → unit tests → build → browser smoke test → configure Pages → upload `dist` → deploy Pages.
5. Use supported official Actions, pinned to verified commit SHAs when writing the workflow. Grant deployment jobs `pages: write` and `id-token: write`, and checkout `contents: read`. Pull-request checks must not deploy.
6. Use a `github-pages` environment and one deployment concurrency group. Publish generated `dist`, not source files.
7. Verify the live repository subpath: home, direct hash link, refresh, media, export/import, and a completed session surviving reload.
8. Roll back by reverting the offending source change and redeploying; content/storage migrations must remain compatible with the previous release or have an explicit recovery path.

Pages has a 1 GB published-site limit and a soft 100 GB monthly bandwidth limit; keep audio packs modest. See [GitHub's limits](https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/github-pages-limits). A later account/sync feature would need a separate service and a new architecture decision.

## 10. Verification and release gates

### Logic tests with meaningful failure cases

- Scheduler: stage changes, early practice, failed/assisted attempts, remedial retries, empty pools, daily cap, and independent evidence channels.
- Evaluators: quantity mismatch, valid alternate sequences, repeated tiles, no-error sentences, accents, and transcript assistance.
- Persistence: duplicate submits, reload at feedback, transaction failure, migrations, malformed imports, and conflicting tab commits.
- Content: unresolved IDs, draft leakage, missing audio, ambiguous duplicate choices, and nonterminating stories.

### Browser flows

Fresh start → introduction → correct answer → wrong answer → delayed revisit → summary. Then stop during a prompt, reload, continue, export, clear app data deliberately in a test profile, import, and verify progress. Run under both `/` and a non-root deployment base such as `/game/`.

Test touch layouts, keyboard use, reduced motion, sound disabled, missing audio, offline transition if enabled, and 200% zoom. Automated accessibility checks supplement manual screen reader checks. Desktop browser emulation does not replace a real iPhone Safari and Android Chrome check.

### Release acceptance

The two-game MVP ships only when Builder and Tales cover all three launch chapters, their 18 targets / 108 Builder prompts / nine stories have language review, required Spain Spanish recordings are present, and every chapter is directly accessible. Both games must work silently, evidence channels must stay separate, interruption recovery and backup restore must pass, and the live Pages URL must work on both target phone browsers. Verify beginner, intermediate, and stretch sessions separately. If physical-device or language review is unavailable, mark the release as a prototype and list the unverified gate.
