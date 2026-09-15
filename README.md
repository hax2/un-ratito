# Un Ratito — a pocket Spanish arcade

Planning package for a collection of small Spanish-learning games, designed for spare moments on a phone. Working title: **Un Ratito** (“a little while”).

## Live App

🎮 **Play live on GitHub Pages**: [samermakes.com/un-ratito/](http://samermakes.com/un-ratito/) (or [hax2.github.io/un-ratito/](https://hax2.github.io/un-ratito/))

## The Games

Open the site, tap **Play a minute**, and do something satisfying with Spanish: serve a café order, fix a silly sentence, piece together a message, or navigate a tiny conversation. Every game shares the same vocabulary and learning history. Stop whenever you want; every answer is saved.

| Game | What you do | Typical session | Teaches |
| --- | --- | --- | --- |
| **Pocket Market** | Put the requested item in a shopping bag | 30–60 seconds | Everyday words and noun gender |
| **Café, Please** | Assemble and serve small orders | 60–120 seconds | Useful phrases, quantities, listening |
| **Phrase Builder** | Tap word tiles to compose a message | 60–120 seconds | Sentence construction and recall |
| **Spot the Slip** | Find and repair one mistake | 30–90 seconds | Grammar and meaning distinctions |
| **Tiny Tales** | Make choices in a short conversation | 2–3 minutes | Reading and practical communication |
| **What Did They Mean?** | Hear a short clip and solve a meaning challenge | 30–90 seconds | Listening, implication, and natural speech |

## Chapters Available

1. **Order politely** (Beginner): Requests, polite chunks with `quería`, quantities, drinks, requesting the bill.
2. **What was happening?** (Intermediate): `estaba + gerundio`, interrupting preterite events, simultaneous background actions.
3. **If I had more time…** (Advanced): `si + imperfect subjunctive + conditional`, advice (`si fuera tú`), hypothetical scenarios.

## Development & Testing

```bash
# Install dependencies
npm install

# Validate content schemas & graphs
npm run validate-content

# Run unit tests
npm run test

# Start local development server
npm run dev

# Build production bundle
npm run build
```

## Documentation

1. [Product and game design](docs/GAME_DESIGN.md): audience, mechanics, learning model, curriculum, and scope.
2. [Implementation guide](docs/IMPLEMENTATION_GUIDE.md): architecture, content contracts, scheduling, mobile behavior, deployment, and acceptance criteria.
3. [Chapter catalogue](docs/CHAPTERS.md): beginner-to-advanced roadmap and detailed grammar blueprints.
4. [Build backlog](docs/BUILD_BACKLOG.md): ordered deliverables and release gates.
