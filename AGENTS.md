# AGENTS.md

## Working Agreement

- Read the closest relevant files before editing, then make the smallest focused
  change that solves the request.
- Prefer existing local patterns, components, and tokens over new abstractions or
  dependencies.
- Ask or propose a short plan when requirements are ambiguous, architectural, or
  likely to touch several areas.

## UI Implementation Protocol

- Before building or changing UI, read `DESIGN.md` and treat it as the source of
  truth for visual style, typography, spacing, radius, color roles, motion, and
  responsive behavior.
- Prefer components from `@repo/ui/components/*` and tokens from
  `@repo/ui/globals.css` before creating app-level styles or new components.
- Import global styles once from `@repo/ui/globals.css`; do not duplicate design
  tokens in app-level CSS.

## Commands

- Use the existing pnpm workspace; do not switch package managers.
- After substantive code changes, run `pnpm verify`.
- For quick checks, run at least `pnpm check` and `pnpm typecheck`.
- For web-only feedback, prefer scoped commands such as
  `pnpm --filter @repo/web test` or `pnpm --filter @repo/web typecheck`.
- Do not install dependencies, push, delete files, or run destructive git
  commands without explicit user approval.

## Security Protocol

This repository is a wallet UI starter kit for public co-creation. It may include
wallet-like user flows, but security-sensitive behavior must be handled
explicitly and conservatively.

### What is in scope

- UI flows for wallet creation, import, account display, send/receive, signing
  preview, token approval warnings, DApp connection, and other wallet-related
  interactions are allowed.
- Mock data, test wallets, local-only demos, and testnet-oriented integrations
  are preferred during development and examples.
- If a feature touches real signing or chain interaction, make the risk visible
  in the UI and keep the implementation narrowly scoped to the user's request.

### Secrets (private keys, mnemonics, passwords)

- Never hardcode, log, analytics-track, or transmit private keys,
  mnemonics/seed phrases, keystore JSON, wallet passwords, or any other secret
  material to third-party services.
- Do not add telemetry, clipboard sync, remote persistence, or background sync
  for such secrets.
- If secret material appears in fixtures or examples, use obvious non-real mock
  strings and label them clearly.

### Signing and on-chain actions

- Real wallet features are not forbidden, but they must not be added casually or
  hidden behind mock-looking UI.
- Before implementing signing, approvals, or DApp interaction, read and apply
  the repository security skill referenced below.
- Prefer testnet defaults, explicit network display, human-readable transaction
  details, exact approval amounts, and clear risk disclosures.
- Do not silently broadcast transactions, request unlimited approvals without a
  prominent warning, or disguise authorization flows as harmless login prompts.

### Third-party dependencies

- Do not install, upgrade, downgrade, or replace dependencies (including
  transitive pinning, `resolutions`, `overrides`, or new `package.json`
  entries) without explicit user approval, per the Commands section.
- Before proposing a new dependency, prefer `@repo/ui/components/*` and
  existing libraries already in `package.json` or `pnpm-lock.yaml`.
- When a new dependency is genuinely needed, justify it with: source
  (publisher and repo), maintenance status, license, install size, and security
  posture.
- Be especially careful with dependencies that touch cryptography, wallet
  providers, signing, RPC transport, or remote code execution.
- Never run post-install scripts, fetch remote code at build/runtime, or pipe
  `curl | sh`-style installers from agent actions.

### Data egress and privacy

- Do not add analytics, error reporting, or outbound data collection to new
  third-party services without explicit maintainer approval.
- If a feature handles addresses, balances, transaction history, or wallet
  metadata, document any network egress clearly and keep it limited to the
  intended wallet / chain integration.
- Do not send user secrets off-device.

## Security Skill

Before generating any code that involves mnemonic phrases, private keys,
transaction signing, token approvals, DApp interaction, or risk-related UI
components, read and apply:

`./security/SKILL.md`