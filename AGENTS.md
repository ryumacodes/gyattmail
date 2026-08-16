# gyattmail agent guide

This file is the shared repository instruction source for coding agents. Keep tool-specific configuration, credentials, and personal prompts out of the repository.

## Commands

- Install: `npm install`
- Develop: `npm run dev`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Production build: `npm run build`

Run typecheck and lint after code changes. Run the production build for framework, dependency, routing, or integration changes.

## Architecture

- `app/`: Next.js pages, API routes, and the mail UI
- `components/`: shared UI and Paper-Hatch components
- `lib/ai/`: AI providers, model catalog, and configuration
- `lib/email/`: IMAP, SMTP, AgentMail, sync, and scheduled sending
- `lib/storage/`: local encrypted and JSON-backed storage
- `lib/types/`: shared application types

## Engineering conventions

- Keep TypeScript strict. Do not use `any` casts to bypass type errors.
- Match the surrounding file's style and avoid explanatory comments for obvious code.
- Preserve provider-neutral behavior. Provider-specific logic belongs behind the email or AI provider boundary.
- Keep mail actions optimistic only when failures roll back cleanly and surface a useful error.
- Never commit secrets, `.env` files, `.data/`, cached mail, generated files, or research notes.
- Treat user data as private. Encrypt stored credentials and avoid logging message content or tokens.

## UI conventions

- Preserve the Paper-Hatch language: warm paper surfaces, cross-hatched edges, etched dividers, and restrained letterpress depth.
- Reuse the existing hatch utilities instead of introducing isolated border treatments.
- Design mobile-first for touch targets, dynamic viewport height, safe areas, keyboard visibility, and contained horizontal overflow.
- Check both the full-width mobile list/reader flow and the resizable desktop layout when changing mail UI.

## Skills and MCPs

- Skills and MCP servers are optional runtime capabilities, not repository dependencies.
- Use an available skill when its instructions match the task.
- Use MCPs only when the task requires their external system or data; do not assume a connector is installed.
- Do not add machine-specific MCP configuration, access tokens, or account identifiers to the repository.
- Prefer repository code, local framework documentation, and provider SDK types before external search.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
