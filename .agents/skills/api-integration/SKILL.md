---
name: api-integration
description: Integrate Next.js frontend features with REST APIs using agreed contracts, typed responses, mock data, and consistent error handling.
---

# API Integration

## Execution Strategy
- Follow agreed API contracts as the source of truth.
- Support parallel FE and BE development using contract-based mocks.
- Implement only required endpoints and behaviors.
- Prefer existing API clients and approved dependencies.
- Keep API integration simple and feature-scoped.
- Do not silently modify API contracts.

## Workflow

### 1. Analyze Contract
- Read the agreed endpoint documentation.
- Identify request parameters, response types, and error cases.
- Inspect existing API clients and project conventions.
- Report missing or conflicting contract details.
- Do not invent endpoints or response structures.

### 2. Define Types
- Define TypeScript request and response types.
- Use shared types only when genuinely reused.
- Keep API contracts separate from presentation logic.
- Avoid unnecessary type abstractions.

### 3. Test First
- Apply the `tdd-workflow` skill when available.
- Write tests for API response handling.
- Cover success, expected errors, and relevant edge cases.
- Mock external HTTP requests at the API boundary.

### 4. Implement API Client
- Use the existing approved HTTP client.
- Implement request serialization and response parsing.
- Handle HTTP errors and malformed responses.
- Follow project conventions for authentication.
- Avoid exposing sensitive information in logs.

### 5. Mock Integration
- Use contract-aligned mock responses when BE is unavailable.
- Keep mock data replaceable without changing UI behavior.
- Clearly distinguish mocked and live behavior.
- Do not present mocked behavior as verified live integration.

### 6. Real API Integration
- Connect to the actual backend endpoint.
- Verify request and response compatibility.
- Test critical success and failure paths.
- Escalate contract mismatches to FE/BE owners.
- Do not modify backend contracts unilaterally.

### 7. Verify
- Run relevant tests, lint, and typecheck.
- Confirm real API behavior when the endpoint is available.
- Report integration status and unresolved dependencies.

## API Principles
- Follow RESTful API conventions defined by the project.
- Use explicit TypeScript types at API boundaries.
- Treat external responses as untrusted data.
- Handle loading, success, empty, and error states.
- Avoid duplicate requests caused by UI interactions.
- Do not treat frontend validation as backend security.
- Do not store or log credentials or sensitive tokens.

## Completion Criteria
- Implementation matches the agreed API contract.
- Required API handling tests pass.
- Errors are handled appropriately.
- Mock or live integration status is reported accurately.
- No critical integration issues remain unresolved.
