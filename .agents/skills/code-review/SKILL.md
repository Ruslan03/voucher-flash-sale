---
name: code-review
description: Review Next.js and TypeScript code changes for correctness, architecture compliance, test coverage, API contract consistency, and integration risks.
---

# Code Review

## Execution Strategy
- Review actual code changes and relevant context.
- Prioritize defects over stylistic preferences.
- Focus on correctness, stability, and hackathon requirements.
- Avoid speculative findings without evidence.
- Keep feedback concise and actionable.
- Do not modify code unless explicitly requested.

## Workflow

### 1. Inspect Changes
- Read the relevant Git diff and affected files.
- Understand the intended behavior and acceptance criteria.
- Inspect related code when necessary.
- Identify changes affecting shared components or contracts.

### 2. Review Correctness
- Look for logic errors and broken user flows.
- Check edge cases and error handling.
- Identify asynchronous state and duplicate request risks.
- Validate loading, success, empty, and error states.
- Check for potential security-sensitive behavior.

### 3. Review Architecture
- Validate compliance with project instructions.
- Check FDD feature boundaries.
- Check appropriate Atomic Design composition.
- Verify separation of business logic, UI, and infrastructure.
- Flag unnecessary abstractions only when they create meaningful risk.

### 4. Review Integration
- Verify consistency with agreed API contracts.
- Identify breaking changes to shared interfaces.
- Check relevant tests and integration assumptions.
- Distinguish mock behavior from verified live behavior.

### 5. Classify Findings
- P0: Critical blocker affecting core functionality,
  security, or build stability.
- P1: Significant defect or integration risk.
- P2: Minor issue or maintainability improvement.
- Report only actionable findings.
- Avoid duplicating the same issue.

### 6. Report
For each finding, provide:
- Severity (P0/P1/P2).
- File and relevant location.
- Evidence and impact.
- Recommended minimal fix.

Finish with:
- Summary of critical risks.
- Verification gaps.
- Whether changes are ready for integration.

## Review Principles
- Do not invent problems or test results.
- Do not confuse style preferences with defects.
- Do not claim code is safe without sufficient evidence.
- Prefer minimal corrections over broad refactoring.
- Respect agreed architectural and API decisions.
- Do not approve changes with unresolved P0 issues.

## Completion Criteria
- Relevant changes reviewed.
- Actionable findings prioritized.
- Integration risks identified.
- Verification limitations documented.
- Readiness assessment provided.
