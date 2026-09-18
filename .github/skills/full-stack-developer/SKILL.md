---
name: full-stack-developer
description: "Use when building or fixing full-stack features across frontend UI, backend APIs, databases, auth, and deployment; planning app architecture, implementing user-facing flows, debugging end-to-end issues, or validating production readiness."
---

# Full-Stack Developer

## Purpose

Use this workflow to design, implement, and validate full-stack product work with a reliable engineering loop: clarify the outcome, define the data flow, implement the minimal correct solution, and verify the behavior end-to-end.

## Workflow

### 1. Clarify the problem and success criteria

- Confirm the user or business goal.
- Define the exact behavior in concrete terms: inputs, outputs, edge cases, and failure states.
- Identify the affected layer(s): frontend, API, database, infrastructure, or external service.
- Write down the acceptance criteria before making code changes.

Decision point:
- If the issue is a bug, reproduce it and isolate the failing path before changing code.
- If it is a feature, define the end-to-end flow from UI to data persistence and back.

### 2. Choose the smallest viable architecture

- Prefer the simplest structure that solves the problem without broad refactors.
- Keep boundaries clear between UI, API, business logic, and persistence.
- Reuse existing patterns and conventions in the codebase before inventing new abstractions.
- Keep secrets, environment config, and access rules explicit.

Decision point:
- If the task can be solved in one layer, do not add unnecessary cross-layer complexity.
- If data shape or validation is shared, centralize it in one canonical model or schema.

### 3. Model the data and interfaces

- Define or update the data contract, API contract, and validation rules.
- Align the database schema, typed models, request payloads, and response structures.
- Consider nullability, error handling, permissions, and edge cases before implementation.

Decision point:
- If the feature changes persisted state, add or update migrations, schema definitions, and validation.
- If it is a read-only or UI-only change, do not widen the persistence scope unnecessarily.

### 4. Implement the backend first

- Build the server-side behavior to satisfy the API contract and business rules.
- Validate input, handle authorization, and produce clear failure responses.
- Keep logic deterministic and testable.

Quality bar:
- API behavior is correct for success and failure paths.
- Error handling is explicit and not silently swallowed.
- Business logic is not duplicated across layers.

### 5. Implement the frontend or client integration

- Connect the UI to the backend contract using the existing app patterns.
- Handle loading, empty states, validation messages, and optimistic or fallback states as needed.
- Keep the UI focused on user outcomes rather than implementation details.

Quality bar:
- The interaction matches the requested behavior.
- Loading and error states are visible and understandable.
- The front end does not rely on invalid assumptions about the backend.

### 6. Verify the end-to-end result

- Run the smallest relevant tests or checks for the changed behavior.
- Validate the happy path and at least the key failure path.
- Confirm the data flows correctly between the client, server, and database.
- Check for regressions in adjacent flows.

Decision point:
- If a bug is fixed, verify the original failing scenario is resolved.
- If a feature is added, validate it with realistic user inputs and environment conditions.

### 7. Improve quality before finishing

- Remove dead code, confirm naming is consistent, and keep the patch scoped.
- Ensure configuration, environment variables, and deployment assumptions are documented.
- Review the final patch for security, observability, and maintainability.

## Completion Checklist

A task is complete only when all of the following are true:

- The problem statement and acceptance criteria are clear.
- The chosen solution matches the existing architecture and does not add unnecessary complexity.
- The API or data contract is explicit and consistent.
- Backend logic, validation, and error handling are correct.
- Frontend behavior reflects the actual user flow and handles errors gracefully.
- Relevant validation checks have been run and pass.
- The change is scoped, reviewed for regressions, and ready for deployment or handoff.

## Branching Guidance

### If it is a bug

1. Reproduce it consistently.
2. Trace the exact path through the stack.
3. Add a minimal failing check if possible.
4. Fix the root cause, not just the symptom.
5. Validate the original scenario and nearby flows.

### If it is a feature

1. Define the user story and data flow.
2. Design the contract and edge cases.
3. Build backend behavior first.
4. Wire the client experience.
5. Verify the full path end-to-end.

### If it touches the database

1. Confirm schema or migration needs.
2. Update code and validation in sync.
3. Check compatibility with existing data and application assumptions.
4. Validate the migrated state through a realistic workflow.

## Quality Standards

- Prefer correctness and maintainability over cleverness.
- Keep changes small and easy to reason about.
- Handle failure states explicitly.
- Make config and runtime assumptions visible.
- Validate the real behavior, not just the happy path.
