<!--
=== Sync Impact Report ===
Version change: N/A (initial) → 1.0.0
Modified principles: N/A (initial creation)
Added sections:
  - Core Principles (5 principles: Code Quality, Testing Standards, UX Consistency, Performance, Simplicity)
  - Quality Gates
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md: ✅ Compatible (Success Criteria aligns with performance principles)
  - .specify/templates/tasks-template.md: ✅ Compatible (Test phases align with testing principles)
Follow-up TODOs: None
========================
-->

# vim-jp-profile-stats Constitution

## Core Principles

### I. Code Quality

All Python code MUST adhere to established quality standards to ensure maintainability and reliability.

**Non-negotiable rules:**
- Type hints MUST be used for all function signatures and class attributes
- All code MUST pass `ruff` linting with the configured rules (E, F, I)
- All code MUST pass `mypy` type checking
- Functions MUST be single-purpose and under 50 lines (excluding docstrings)
- Magic numbers and strings MUST be extracted to named constants
- Import statements MUST follow isort ordering (enforced by ruff)

**Rationale:** Consistent code quality reduces cognitive load during reviews and maintenance, catches bugs early through static analysis, and enables confident refactoring.

### II. Testing Standards

Testing MUST validate both data integrity and user-facing functionality.

**Non-negotiable rules:**
- Data fetching functions MUST have unit tests with mocked external services
- Data transformation logic MUST have property-based or example-based tests
- Chart generation functions MUST be tested for correct data binding
- Integration tests MUST verify end-to-end data flow from Google Sheets to visualization
- Tests MUST run in isolation without network dependencies (use fixtures/mocks)
- Test coverage for core business logic MUST exceed 80%

**Rationale:** A data visualization dashboard's value depends entirely on data correctness. Testing ensures users can trust the displayed information.

### III. User Experience Consistency

The dashboard MUST provide a consistent, intuitive experience across all visualizations.

**Non-negotiable rules:**
- All charts MUST use a consistent color palette defined in a central configuration
- Loading states MUST be displayed for any operation exceeding 500ms
- Error messages MUST be user-friendly and actionable (no raw exceptions)
- Layout MUST be responsive and functional on viewport widths from 768px to 1920px
- Japanese text MUST be the primary language for all user-facing content
- Interactive elements MUST provide immediate visual feedback

**Rationale:** Users rely on this dashboard for quick insights. Consistent UX reduces learning curve and builds trust in the data presented.

### IV. Performance Requirements

The dashboard MUST remain responsive under typical usage patterns.

**Non-negotiable rules:**
- Initial page load MUST complete within 3 seconds on standard connections
- Chart rendering MUST complete within 1 second after data is available
- Google Sheets API calls MUST be cached with appropriate TTL (minimum 5 minutes)
- Memory usage MUST remain under 512MB during normal operation
- No blocking operations on the main thread exceeding 100ms without progress indication
- Data refresh operations MUST support cancellation

**Rationale:** Performance directly impacts user adoption. Slow dashboards are abandoned dashboards.

### V. Simplicity

Solutions MUST favor simplicity over extensibility unless complexity is explicitly justified.

**Non-negotiable rules:**
- New dependencies MUST be justified with clear benefits over existing solutions
- Abstractions MUST NOT be introduced for single-use cases
- Configuration MUST use environment variables or Streamlit secrets (no custom config systems)
- YAGNI (You Aren't Gonna Need It) principle MUST be followed for all features
- Code duplication is acceptable if abstraction would obscure intent

**Rationale:** This is a focused visualization tool, not a framework. Simplicity ensures maintainability with minimal ongoing effort.

## Quality Gates

Code changes MUST pass all quality gates before merge.

**Automated checks:**
- `ruff check .` - Zero errors required
- `ruff format --check .` - Format compliance required
- `mypy .` - Zero type errors required
- `pytest` - All tests passing required

**Manual review requirements:**
- UX changes MUST include screenshot or screen recording
- Performance-impacting changes MUST include before/after metrics
- New dependencies MUST be approved by project maintainer

## Development Workflow

Development follows a trunk-based approach with feature branches.

**Branch naming:** `feature/description` or `fix/description`

**Commit standards:**
- Commits MUST use emoji prefixes as defined in project conventions
- Commits MUST be atomic (one logical change per commit)
- Commit messages MUST be in English

**Pull request requirements:**
- PRs MUST pass all automated quality gates
- PRs MUST include description of changes and testing performed
- PRs affecting UX MUST include visual evidence of changes

## Governance

This constitution is the authoritative source for development standards. All PRs and code reviews MUST verify compliance with these principles.

**Amendment process:**
1. Propose changes via pull request to this document
2. Changes MUST include rationale and impact assessment
3. Breaking changes to principles require explicit migration plan
4. Version MUST be incremented according to semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle or material expansion
   - PATCH: Clarification or wording refinement

**Compliance review:**
- Code reviews MUST verify alignment with Core Principles
- Complexity exceptions MUST be documented in PR description
- Persistent violations MUST trigger constitution review discussion

**Version**: 1.0.0 | **Ratified**: 2026-01-27 | **Last Amended**: 2026-01-27
