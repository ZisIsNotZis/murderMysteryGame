<p align="center">
  <img src="assets/logo.svg" width="112" height="112" alt="The Birthday Banquet logo">
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh-CN.md">简体中文</a>
</p>

<h1 align="center">寿宴 · The Birthday Banquet</h1>

<p align="center"><strong>A complete six-player murder mystery you can print and play tonight.</strong></p>

<p align="center">Nobody lies. The murder still hides in plain sight.</p>

<p align="center">
  <b>6 players + 1 host</b> · <b>150–180 minutes</b> · <b>print-and-play</b> · <b>AGPL-3.0</b>
</p>

> **Spoiler note:** This README stays spoiler-free until the collapsed **Design notes** section. `spec.md`, `ying-yan.md`, and `playthrough.md` are full spoilers—players should not read them before the game.

---

## Why this exists

《寿宴》 (*The Birthday Banquet*) is a finished, table-ready Chinese murder-mystery script set in a Republican-era family mansion. It is also a proof of concept for a harder question:

> Can a mystery misdirect the table **without ever lying to it**?

Most fair-play mysteries hide information, bend a narrator's reliability, or rely on a last-minute fact. This one puts every decisive fact on the table and never asks the text to lie. The misdirection comes from the assumptions the table brings to a scene it can see completely.

After the reveal, every sentence still reads literally true—and the earlier reading becomes the trick.

---

## Quick start

No install. No server. No app. Print and sit down.

1. **Read the host manual.** Start with the opening contract and the seven-stage run sheet in [`script/host-manual.md`](script/host-manual.md).
2. **Print one set.** Six character books, the host manual, and the 32 clue cards from [`script/`](script/).
3. **Run the table.** Opening → introductions → two clue rounds → accusation → reveal. Use the host's fixed script, NPC answer cards, and early-reveal branch.

| You need | Details |
|---|---|
| Players | 6; ideally at least 2 have played a murder mystery before |
| Host | 1; read the manual beforehand |
| Materials | 6 character books, host manual, 32 clue cards |
| Extras | Paper, pens, a timer, optional envelopes or card sleeves |

The host only answers factual questions, never reasons for the players and never invents a fact. If the table solves it early, the manual includes a compressed reveal branch instead of a rescue.

---

## What it can do now

- **A complete game kit** — 6 character books, 1 host manual, 32 clue cards, 7 timed stages, NPC scripts, and a branching reveal.
- **Fair-play misdirection** — no withheld clues, no half-sentences, no unreliable narrator. The culprit's alibi is built entirely from public truths.
- **Two independent reveals** — two orthogonal tricks, each foreshadowed on its own. Neither depends on the other.
- **22 load-bearing sentences** — each one is literally true under both the surface reading and the true reading. The full mapping is in [`spec.md`](spec.md).
- **Host-ready structure** — fixed opening contract, clue-pool budgets, NPC Q&A cards, a 150-minute run sheet that stretches to 180, and a reveal script.
- **An auditable process** — design constitution, specification, clue ledger, red-team reviews, consistency audits, and two blind-playtest transcripts are all in the repository.

The game is in Chinese. The repository's design notes and this English overview make the method legible to non-Chinese readers; they are not a translated playable edition.

---

## Architecture

This is a writing project, not a software product. The repository is organized as a content pipeline: a constitution, a specification, the playable script, and the evidence that the script passes its own rules.

```text
.
├── README.md                  # Public overview (no core spoilers)
├── README.zh-CN.md            # Chinese overview
├── CONTRIBUTING.md            # How to propose a fix or a playtest report
├── assets/
│   └── logo.svg               # Project mark
├── idea.md                    # Design constitution: what counts as fair misdirection
├── spec.md                    # Full spoiler spec: timelines, dual readings, clues, rules
├── script/
│   ├── book-*.md              # Six character books
│   ├── host-manual.md         # Contract, run sheet, NPC answers, reveal branches
│   └── clue-cards.md          # All 32 clue cards
├── ying-yan.md                # Immersive spoiler walkthrough of the misdirection
├── playthrough.md             # Two blind playtests, edited for reading
├── .scratch/                  # Process archive: reviews, audits, raw transcripts, scripts
└── LICENSE                    # AGPL-3.0
```

The dependency direction is intentional: `idea.md` states the rules, `spec.md` turns them into a testable design, `script/` is the production text, and `.scratch/` records the checks. The public narrative documents—this README, `ying-yan.md`, and `playthrough.md`—point back to those sources rather than restating them.

### What to read

| File | Audience | Spoilers |
|---|---|---|
| [`README.md`](README.md) | Players, hosts, evaluators | No core solution (design notes collapsed) |
| [`script/host-manual.md`](script/host-manual.md) | Host | Full |
| [`script/book-*.md`](script/) | The matching player | That character's view |
| [`script/clue-cards.md`](script/clue-cards.md) | Host | Full |
| [`idea.md`](idea.md) | Anyone interested in the design method | Light |
| [`spec.md`](spec.md) | Authors, revisers, design reviewers | Full |
| [`ying-yan.md`](ying-yan.md) | Readers who want the guided reveal | Full |
| [`playthrough.md`](playthrough.md) | Readers who want to see a table in motion | Full |
| [`.scratch/`](.scratch/) | Anyone auditing the validation trail | Full |

---

## How to develop

The script has hard invariants. Before changing a line, read:

1. [`spec.md`](spec.md) §7 — the writing locks: one name per person, forbidden assertions, and how to keep a clue in the background.
2. [`spec.md`](spec.md) §1.2 — the hour-by-hour objective fact table. Every character action must exist there.
3. [`spec.md`](spec.md) §9 — the revision log and the changes each revision pulled with it.

After a change, re-check at least:

- forbidden words and naming consistency (butler/gardener, death-time claims, head-count claims);
- all 22 dual-reading mappings;
- the M/S/K clue ledger;
- one blind playtest, watching for early reveals, an unclosable clue chain, or host improvisation.

The stage scripts in `.scratch/` are historical records of the agent workflow, not a one-command test suite. They document the process and are not guaranteed to run in today's environment.

---

## How to contribute

Issues and pull requests are welcome—especially real-table playtest reports, fairness critiques, and typo or consistency fixes.

- **Do not post the solution in an issue title or in a public player-facing thread.** Use the spoiler conventions in [`CONTRIBUTING.md`](CONTRIBUTING.md).
- **Keep the invariants.** A fix that adds a lie, withholds a clue, or changes a fact must also update `spec.md` and the affected ledgers.
- **Say what you tested.** A report is more useful with the stage, the table composition, and the exact sentence that caused the problem.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full checklist.

---

## Design notes (spoilers)

<details>
<summary><strong>Open the design notes</strong></summary>

- **Main trick, “Death in the Afternoon”**: the script never states a time of death. Players default to “found at 20:30 ≈ died at 20:30” and anchor every alibi to the evening. The truth is that the victim died in the afternoon; the evening’s conflicts all happen after death. The culprit’s alibi is made of public truths, and its very completeness proves that nobody saw the afternoon.
- **Secondary trick, “One Person, Two Jobs”**: the servant Lao Chen is both butler and gardener. The text never asserts that these are two people; the table’s assumption that job titles equal headcount adds a phantom gardener.
- **Both readings are true**: 22 load-bearing sentences read literally true under the surface reading and under the true reading. No character lies, and the victim never makes a statement about the time of death.
- **Fairness**: the main trick is reachable through physical evidence, witness evidence, and paper records; clue cards are background noise, not spotlights. The host never suppresses a correct inference or invents a fact.
- **Structure**: the two tricks are orthogonal—a time ledger and a headcount ledger—and the reveal always opens the timeline first, then the headcount.

The full design is in [`spec.md`](spec.md); the line-by-line walkthrough is [`ying-yan.md`](ying-yan.md).

</details>

---

## Roadmap

### Implemented

- **v1.0 complete kit** — six character books, host manual, 32 clue cards, seven-stage flow, and both reveals.
- **Specification red team** — fairness, structure, and surface-reading reviews; one P0 fixed (a culprit line that broke the zero-lie rule).
- **Consistency audit** — naming, forbidden assertions, and 22 dual-reading truth checks; all M/S/K ledger entries placed.
- **Two blind playtests** — a standard table and an experienced table, both run with LLM players and a host. Transcripts are in [`playthrough.md`](playthrough.md).
- **Author playtest** — the author played the finished script and accepted it as a completed proof of concept.

### Planned

- [ ] One or two real human table tests, recorded against the observation criteria in [`.scratch/blindtest-1.md`](.scratch/blindtest-1.md).
- [ ] A physical card layout with art and better materials—without adding, removing, or changing any fact sentence.
- [ ] Revisions driven by real-table evidence, with every change logged in `spec.md` §9.

### Future vision

The long-term goal is a repeatable method for AI-assisted fair-play mysteries: write the truth first, make every sentence survive both readings, then let the table discover the frame it brought with it. This script is the proof of concept. The next step is not more features—it is evidence from real tables, and a revision trail that shows exactly what changed when the evidence arrived.

---

## Known limits

- **No full human-table test yet.** The two blind tests used LLM players and a host. They validate text consistency, information reachability, and branch behavior, but not human reading pace, social dynamics, or host pressure.
- **Clue cards are text-only.** They are designed for print, not final art. Physical production may add layout and texture, but not new facts.
- **The runtime is tight.** 150 minutes is the floor; 180 is the safer booking for six players and two tricks.
- **This is not a software product.** There is no web app, voice channel, or automatic scoring.
- **The pipeline scripts are archival.** They record the process, not a supported build.

---

## License

Text and code in this repository are released under **AGPL-3.0**, © 2026 ZisIsNotZis. See [`LICENSE`](LICENSE). Public performances, commercial table runs, and adaptations should follow that license; for commercial publication, contact the repository author about attribution and permission.

---

<sub>Built through an agentic pipeline: brainstorm → specification → red team → parallel writing → consistency audit → blind playtests → author playtest.</sub>
