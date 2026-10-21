# Frontend Hackathon 2026

## Context and constraints

Build a dynamic Next.js frontend POC within an eight-hour event. Follow the user's request and acceptance criteria; avoid unnecessary features or stack changes. Match the user's language in conversation and the repository's language and conventions in code. These instructions are written in English.

The following summarizes sections 2-6 of `Official Hackathon 2026 Rules and Guidelines 1.pdf`; it does not authorize actions beyond the user's request:

- The official window is 10:00-18:00 WIB on the event date. Stop coding, building, and committing at code freeze; finish the final push beforehand. Do not assume the event date or that the current session falls within this window. When working on the official submission and timing is unknown, ask for the event date/time before changing submission code.
- Repositories start empty at kickoff. Code, private templates, agents, MCP setups, workflows, and custom skills created before the event are prohibited, subject to the organizers' exceptions for public GitHub workflows and official SALT/verified public libraries. This file grants no exception for preparation before the event.
- Use Next.js for FE; the backend stack is Golang, PostgreSQL, and Redis. Do not move backend responsibilities into FE merely to make a demo appear successful.
- TDD, trunk-based development, Clean Architecture, SALT Coding Standards, and a green pipeline are mandatory. Obtain SALT standards from team sources; do not invent rules or claim compliance without the source.
- GLM is the primary model; personal AI tools are a fallback when GLM quota is exhausted. Participants remain responsible for model selection; these skills do not switch models automatically.
- Dummy merchant, category, MSISDN, and promotional data are allowed. The demo must operate dynamically; FE mocks do not prove backend integration or concurrency safety.
- Participants must understand and defend their code during Q&A. Coordinate concurrency, atomicity, and quotas with BE/QA; disabling a button alone does not prevent duplicate claims across users.

## Default workflow

1. Inspect repository structure, local instructions, package manifests/lockfiles, CI scripts, and relevant modules. The initial repository contains no application; do not assume a dependency, router, or script exists. Do not install an application starter merely to read a skill.
2. Find acceptance criteria, designs, and API contracts in context or the repository. Ask only for information that blocks correctness; continue independent work. State minor assumptions briefly.
3. Share a short plan, then implement one testable vertical slice. Use TDD for new behavior and bug fixes. Cosmetic changes without behavioral impact can be verified visually.
4. Follow existing structure. Separate UI, use cases/domain, and API adapters as needed; keep domain logic independent of React/Next.js. Avoid unnecessary generic layers or libraries.
5. Respect Next.js server/client boundaries: prefer server execution where appropriate, use `use client` for interactivity, and keep secrets on the server. `NEXT_PUBLIC_*` variables are public. Follow the installed Next.js version.
6. Keep diffs small to reduce collisions between the two FE developers. Use trunk or very short-lived branches according to team policy. Do not create long-lived branches, overwrite teammates' changes, force-push, merge, or push without authorization. Implementation requests do not automatically authorize publication.
7. Run relevant repository checks: affected tests and typecheck/lint/build as appropriate to the change and CI. Passing local checks does not prove the remote pipeline is green. Do not disable tests or quality gates to obtain a passing result.
8. Finish with changes, actual check results, unverified items, and brief demo steps. If blocked, explain why and identify work that can still proceed.

## Skill routing

Load only relevant skills and read supporting skills when the workflow requires them.

| Need | Skill |
| --- | --- |
| New end-to-end feature or page | `.agents/skills/feature-implementation/SKILL.md` |
| Red-green-refactor and behavior testing | `.agents/skills/tdd-workflow/SKILL.md` |
| Connect UI to an API, contract, or mock adapter | `.agents/skills/api-integration/SKILL.md` |
| Review a diff before integration | `.agents/skills/code-review/SKILL.md` |

Short prompt examples:

- `$feature-implementation Build the promotion claim flow from the attached story and design.`
- `$api-integration Connect the promotion list to the contract in docs/api.md.`
- `$tdd-workflow Add quota-exhaustion tests for the claim flow.`
- `$code-review Review current FE changes against the acceptance criteria.`

## Time priorities and handoff

Once event timing is known, use this adjustable initial budget: hours 0-1 for MVP scope, contracts, designs, and minimum tooling; hours 1-5 for vertical slices; hours 5-6.5 for integration and edge cases; remaining time for stabilization, verification, documentation, and pushing before freeze. Do not sacrifice TDD or assume concurrency checks happened without evidence.

Update relevant documentation when behavior or setup changes. Contribute FE build/environment/deployment README instructions, contracts, architecture decisions, test cases/defects, and demo steps to existing team documents. Do not regenerate every team document for every task. Final handoff must distinguish real APIs from mocks and record limitations and test evidence for QA/TL. Team deliverables also include SRS/story sizing, HLD/LLD, a Figma link accessible to SALT email accounts, a 5-7-slide PDF deck, and a backup demo video of at most two minutes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
