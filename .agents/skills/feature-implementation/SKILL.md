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

### 1. Analyze
- Read the requirement, acceptance criteria, and relevant code.
- Identify unclear requirements and API dependencies.
- Ask only if a missing detail blocks implementation.

### 2. Plan
- Identify affected files and feature boundaries.
- Follow project instructions: FDD, Atomic Design, and Clean Architecture.
- Keep the plan concise (maximum 5 steps).

### 3. Test First
- Use the `tdd-workflow` skill when available.
- Write failing tests for required behaviors before implementation.

### 4. Implement
- Implement the smallest solution satisfying acceptance criteria.
- Organize code by business feature.
- Use Atomic Design for UI composition where appropriate.
- Separate business logic from presentational components.
- Reuse existing components and approved dependencies.
- Avoid unrelated changes and overengineering.

### 5. Integrate
- Use the `api-integration` skill when API interaction is required.
- Follow agreed API contracts.
- Do not invent endpoints or response structures.

### 6. Verify
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
