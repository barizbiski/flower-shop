# Git Workflow

## Branch naming

One branch per spec, named from the SoftwareOS slugs (no date prefixes):

```
feat/<epic-slug>/<spec-slug>          # spec work — the canonical branch
feat/<epic-slug>/<spec-slug>--t<id>   # parallel work on one spec, split by task
hotfix/<epic-slug>/<bug-slug>         # bug fixes
chore/<slug>                          # everything else
```

- The canonical branch is recorded in the spec's `tasks.md` `> Branch:` line. To map a branch to a spec: match that line first; fall back to suffix-matching `<spec-slug>` against `feat/*/`.
- Slugs are load-bearing — never rename an epic or spec after branches exist.
- Never commit on the default branch. Branch first.

## Commits

Conventional-commit-ish titles, scoped to the epic:

```
feat(<epic-slug>): add password reset endpoint
fix(<epic-slug>): handle expired reset tokens
chore: bump CI node version
```

- Small, focused commits. Reference task IDs in the body when useful (`T3`, `T4.1`).
- **Never `git commit --no-verify`.** Failing hooks mean fix the cause, not skip the check.
- No force pushes to the default branch.

## Pull requests

- Open PRs with the **pr** skill — it runs verification, builds the title (`feat(<epic-slug>): <spec title>` / `fix(<epic-slug>): <bug title>`) and body from the spec, and writes the PR URL back to `tasks.md`.
- Tasks incomplete → open as draft.

### Keep PRs small

Prefer several small PRs over one large one — small PRs get reviewed faster and more carefully, and are easier to revert.

- **One concern per PR.** A PR does one thing: a feature slice, a fix, a refactor, or a rename/move — not several at once.
- **Aim for ≤ ~400 changed lines** (excluding lockfiles, generated code and snapshots). Above that, split unless there's a clear reason not to, and say why in the PR body.
- **Separate mechanical changes from behavior changes.** Renames, moves, formatting and dependency bumps go in their own PR, before the change that depends on them.
- **Split a spec by task.** When a spec is too big for one PR, use the `--t<id>` branches above (one task or task group per PR), each one building and passing tests on its own. Stack them if needed and merge in order.
- **Each PR must leave the default branch working** — no half-finished features exposed; hide incomplete UI or endpoints behind a flag or leave them unwired.

## Production mode

When `softwareos/config.yml` has `mode: production`, the workflow tightens:

- **Git itself is never gated.** Commit and push as usual — pushing is how CI runs and how a branch gets reviewed, so blocking it would obstruct the verification the mode is asking for. The gates live in the tools that can actually check something.
- **A PR needs a passing `qa-report.md` and a recorded `> Reviewed:` line** (written by `/code-review`) before the pr skill will open it. A draft PR is for incomplete work, not for skipping verification.
- **Unfixed HIGH or CRITICAL review findings block the merge**, rather than being advice.

`/go-production` makes this transition and records any waivers; `/go-production --revert` goes back. Neither is a quiet config edit — both leave an entry in `softwareos/production-readiness.md`.
