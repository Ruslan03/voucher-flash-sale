---
name: tdd-workflow
description: Apply test-first development for Next.js and TypeScript features, bug fixes, and business logic using the Red-Green-Refactor cycle.
---

# TDD Workflow

## Execution Strategy
- Apply Red → Green → Refactor in small increments.
- Prioritize critical business behavior and acceptance criteria.
- Prefer focused tests over excessive test coverage.
- Reuse the existing approved testing framework.
- Avoid unnecessary test abstractions and setup.

## Workflow

### 1. Identify Behavior
- Read the requirements and acceptance criteria.
- Identify observable behavior and edge cases.
- Select the appropriate test level:
  - Unit test for pure business logic.
  - Component test for UI interactions.
  - Integration test for interactions across boundaries.

### 2. RED — Write Failing Tests
- Write tests before implementing the behavior.
- Run the tests and confirm they fail for the expected reason.
- Fix test setup, syntax, or import errors if necessary.
- Do not proceed until a meaningful failure is established.

### 3. GREEN — Implement
- Write the minimum code required to pass the tests.
- Follow project instructions and existing conventions.
- Avoid unrelated functionality and refactoring.
- Run the tests and confirm they pass.

### 4. REFACTOR — Improve
- Refactor only when it improves clarity or maintainability.
- Preserve existing behavior.
- Run the relevant tests again after changes.
- Skip unnecessary refactoring under time constraints.

### 5. VERIFY — Final Validation
- Run relevant regression tests.
- Run lint and typecheck when available.
- Report failed, skipped, or unavailable checks.
- Never claim tests passed without executing them.

## Testing Principles
- Test observable behavior, not implementation details.
- Use deterministic test data.
- Mock external dependencies at appropriate boundaries.
- Include relevant success, error, and edge cases.
- Avoid snapshot-only tests for critical business behavior.
- Do not change tests merely to make incorrect code pass.

## Completion Criteria
- A meaningful RED failure was observed.
- Required behavior passes its tests.
- Existing relevant tests remain passing.
- No known critical regressions remain.
- Verification results and limitations are reported.
