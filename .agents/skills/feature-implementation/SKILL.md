---
name: feature-implementation
description: Implement Next.js frontend features from user stories and acceptance criteria. Use for new features, UI flows, and feature enhancements.
---

# Feature Implementation

## Execution Strategy
- Adapt workflow depth to task complexity.
- For small changes, minimize planning and execute directly.
- For complex features, split work into small, testable increments.
- Do not stop between workflow steps unless blocked.
- Prioritize a working end-to-end flow over optional enhancements.

## Workflow

Architecture source: [nextjs-fdd-clean-architecture](../nextjs-fdd-clean-architecture/SKILL.md). Read it before planning feature structure or shared UI changes. It defines FDD/Clean Architecture using `src/features/voucher` as the repository reference, shared Atomic Design under `src/shared/presentation/components/`, and dependency/server-client boundaries. Keep those rules there rather than duplicating them in this workflow.

### 1. Analyze
- Read the requirement, acceptance criteria, and relevant code.
- Identify unclear requirements and API dependencies.
- Ask only if a missing detail blocks implementation.

### 2. Plan
- Identify affected files and feature boundaries.
- Apply the referenced architecture skill: map changes to the required feature layers and decide whether UI is feature-specific or shared. Do not scaffold unused layers or migrate existing folders outside the requested scope.
- Keep the plan concise (maximum 5 steps).

### 3. Test First
- Use the `tdd-workflow` skill when available.
- Write failing tests for required behaviors before implementation.

### 4. Implement
- Implement the smallest solution satisfying acceptance criteria.
- Organize code by business feature.
- Place reusable Atomic Design UI under `src/shared/presentation/components/` according to the architecture reference; keep feature compositions in the feature.
- Separate business logic from presentational components.
- Reuse existing components and approved dependencies.
- Avoid unrelated changes and overengineering.

### 5. Integrate
- Use the `api-integration` skill when API interaction is required.
- Follow agreed API contracts.
- Do not invent endpoints or response structures.

### 6. Verify
- Check layer imports, shared component placement, and server/client boundaries against the architecture reference.
- Run relevant tests, lint, and typecheck when available.
- Fix failures caused by the implementation.
- Do not modify unrelated code to make checks pass.

### 7. Report
- Summarize changes and affected files.
- Report verification results.
- Highlight unresolved issues or risks.

## Completion Criteria
- Acceptance criteria satisfied.
- Relevant tests pass.
- Architecture follows project instructions.
- No known critical errors remain.
- Changes are integration-ready.
