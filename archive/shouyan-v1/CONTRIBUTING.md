# Contributing to 《寿宴》

Thanks for helping. This project is a finished, print-and-play mystery script with a small set of hard design rules. The most useful contributions are real-table reports, fairness critiques, and precise consistency fixes.

## Before you open an issue

- **Do not put the solution in an issue title.** Use a neutral title, then mark the body with a spoiler warning on the first line.
- **Search existing issues** for the same sentence, clue card, or stage.
- **For a rules question**, quote the file and section. The specification is the source of truth: [`spec.md`](spec.md).

## What makes a good playtest report

Include:

1. Which stage the problem appeared in.
2. The table composition (new players / experienced players, and whether anyone had read spoilers).
3. The exact sentence or clue card involved.
4. What the table concluded, and what the host had to do.
5. Whether the issue was a text problem, a flow problem, or a host-load problem.

The observation criteria used by the existing blind tests are in [`.scratch/blindtest-1.md`](.scratch/blindtest-1.md). They are a starting point, not a required form.

## Changing the script

Read these first:

- [`spec.md`](spec.md) §7 — writing locks: one name per person, forbidden assertions, and how to keep a clue in the background.
- [`spec.md`](spec.md) §1.2 — the hour-by-hour objective fact table. Every character action must exist there.
- [`spec.md`](spec.md) §9 — the revision log and the changes each revision pulled with it.

A change is not complete until:

- [ ] naming and forbidden-assertion checks pass;
- [ ] all 22 dual-reading mappings still hold;
- [ ] the M/S/K clue ledger still places every clue;
- [ ] the affected character book, host manual, and clue card agree;
- [ ] `spec.md` §9 records what changed and why;
- [ ] a blind playtest has checked for early reveals and an unclosable clue chain.

Do not add a lie, withhold a clue, or introduce a fact that is not in the objective timeline. If a fix requires one of those, it is a design change: open an issue first.

## Pull requests

- Keep each pull request to one logical change.
- Use a Conventional Commit style subject, for example `fix(script): correct the 20:40 witness line`.
- Describe what you changed, what you checked, and what you could not check.
- Do not include generated artifacts, local editor files, or credentials.

## Spoilers

The public overview files (`README.md`, `README.zh-CN.md`) contain no core solution outside their collapsed design notes. `spec.md`, `ying-yan.md`, `playthrough.md`, and `.scratch/` are full spoilers. When linking to them from a public discussion, label the link.

## License

By contributing, you agree that your contribution is released under the repository's [AGPL-3.0](LICENSE) license.
