# gyattmail

A self-hosted email client for human and agent inboxes, with optional AI tools and a cross-hatched Paper-Hatch interface.

> Early-stage software under active development. Expect rough edges and breaking changes.

## Features

- Gmail, Outlook, IMAP/SMTP, and AgentMail accounts in one inbox
- Threads, search, saved views, labels, rules, snoozing, drafts, and scheduled send
- Attachments, calendar previews, notifications, bulk actions, and undo
- AI drafting, rewriting, summaries, analysis, smart replies, and label suggestions
- Gemini, OpenAI, ChatGPT, Claude, DeepSeek, OpenRouter, and OpenCode Zen
- Responsive mobile navigation, full-screen compose, and installable PWA metadata
- Paper textures, cross-hatched borders, and letterpress details

## Built with

- Next.js 16, React 19, and TypeScript 5.9
- Tailwind CSS 4, Radix UI, and Jotai
- IMAPFlow, Nodemailer, and AgentMail
- Google GenAI, OpenAI, and Anthropic SDKs

## Installation

Requirements: Node.js 20.9+, npm, and credentials for at least one mail provider.

```bash
git clone https://github.com/ryumacodes/gyattmail.git
cd gyattmail
npm install
cp .env.local.example .env.local
```

Generate the local encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set the output as `ENCRYPTION_KEY` in `.env.local`.

## Mail setup

| Provider | Setup |
|---|---|
| Gmail | Create a Google OAuth web app, enable the Gmail API, and add `http://localhost:3000/api/auth/gmail/callback` as a redirect URI. Enter the client ID and secret in gyattmail. |
| Outlook | Create a Microsoft Entra app with delegated IMAP, SMTP, profile, and offline-access permissions. Add `http://localhost:3000/api/auth/outlook/callback` as a redirect URI. |
| IMAP/SMTP | Enter the server hosts, ports, username, and password in the custom-provider form. Accounts with 2FA may require an app password. |
| AgentMail | Enter a workspace API key. Each discovered inbox appears as an agent-owned account. |

Set `NEXT_PUBLIC_APP_URL` when running on an origin other than `http://localhost:3000`, and use matching OAuth redirect URIs.

## Quick start

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), connect a mail account, and optionally configure an AI provider in Settings.

## Development

```bash
npm run typecheck
npm run lint
npm run build
```

Run the production server after building:

```bash
npm start
```

## Configuration

`.env.local.example` documents the available environment variables. Mail and AI credentials can also be entered through the app where supported.

Local account data, cached mail, drafts, preferences, and AI configuration live under `.data/`.

## Security

Sensitive credentials are encrypted at rest with AES-256-GCM. Keep `ENCRYPTION_KEY` private and stable; changing it makes previously encrypted values unreadable.

Mail content is sent to the connected mail provider, and AI requests are sent to the provider selected in Settings. Review each provider's data policy before connecting it.

## Third-party software

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
