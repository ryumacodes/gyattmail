# gyattmail

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/ryumacodes/gyattmail?utm_source=oss&utm_medium=github&utm_campaign=ryumacodes%2Fgyattmail&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

An open-source, web-only email client with **Paper-Hatch** – a hand-crafted design system featuring cross-hatched borders, paper grain textures, and warm artisanal aesthetics.

> **Mood:** winter-quiet, engraved, tactile
> **Technique:** paper grain + cross-hatching + imperfect ink lines
> **Primary color:** hat brown (gnome cap) #B7662E
> **Foundation:** warm paper beige #F4EFE4

## ✨ Features

- 🎨 **Paper-Hatch Design System**: Cross-hatched borders, paper grain, letterpress buttons, and hand-drawn elements via RoughJS
- 📧 **Multi-account Support**: Gmail, Outlook, iCloud (OAuth + IMAP/SMTP)
- 📋 **View-based Organization**: Saved list views with filters, groups, and custom properties (Notion Mail–style)
- 🎯 **Resizable Panels**: Three-column layout with persistent sizing and hatched dividers
- 🔍 **Server-side Search**: Fast FTS with rich query grammar
- 🏷️ **Outlined Badges**: Artisanal pill-style labels (no solid fills)
- 🤖 **Optional AI**: OpenAI or Gemini for summaries, drafts, and inbox Q&A
- 📱 **Web-only (for now)**: Built with Next.js 15, React 19, and Turbopack

## 🎨 Paper-Hatch Design System

### Color Tokens

```typescript
{
  paper0: "#F4EFE4",  // page background
  paper1: "#E8DDC9",  // panels/cards
  ink9: "#1F1B17",    // main text (warm charcoal)
  ink7: "#4D4136",    // headings
  hatch6: "#7A6857",  // etched lines/dividers
  hat6: "#B7662E",    // PRIMARY accent (hat brown)
  hat7: "#8E4E22",    // active/darker
  hat4: "#E3A46E",    // light accent/hover
  pine5: "#2D5A4E",   // success
  berry5: "#7C3A2F",  // error
}
```

### Key Components

- **LetterpressButton**: Rounded buttons with inset shadows
- **PaperCard**: Cards with paper grain + cross-hatch
- **RoughBorder**: Hand-drawn wobbly borders via RoughJS
- **HatchDivider**: Etched separators (cross-hatched, not solid)
- **SketchIcon**: Lucide icons with dashed strokes
- **EtchedWindow**: Hero panels with window-pane aesthetic

See full docs: [`docs/paper-hatch.md`](./docs/paper-hatch.md)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Paper-Hatch tokens
- **UI Components**: shadcn/ui (Radix UI) + custom Paper-Hatch components
- **Hand-drawn borders**: RoughJS
- **State Management**: Jotai
- **Icons**: Lucide React (with sketch styling)

## Design System

### Paper-hatch Theme

The app features a unique design language inspired by paper textures and hatched borders:

- **Warm Color Palette**: Tan/beige backgrounds (#F5F1E8 - 42° 25% 95%)
- **Hatched Borders**: Diagonal line patterns instead of solid borders
- **Hatched Separators**: All dividers use the hatched pattern
- **Typography**: Clean, readable fonts at 14-16px base size

### Custom CSS Classes

- `.separator-hatched` - Horizontal hatched separator
- `.separator-hatched-vertical` - Vertical hatched separator
- `.border-hatched` - Full hatched border around elements
- `.border-hatched-subtle` - Subtle hatched borders for cards

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Google Cloud account (for Gmail OAuth)
- Azure account (for Outlook OAuth)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.local.example .env.local

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and paste as ENCRYPTION_KEY in .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### OAuth Setup (Required for Gmail & Outlook)

**Important:** As of March 14, 2025, Gmail requires OAuth2 for all third-party apps.

#### Gmail Setup (Google Cloud Console)

1. **Create a Google Cloud Project**
   - Go to [https://console.cloud.google.com](https://console.cloud.google.com)
   - Click "Select a project" → "New Project"
   - Name it "Gyattmail" → Click "Create"

2. **Enable Gmail API**
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API" → Click "Enable"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" → Fill required fields:
     - App name: "Gyattmail"
     - User support email: your email
     - Developer contact: your email
   - Click "Add or Remove Scopes" → Add:
     - `https://mail.google.com/`
     - `https://www.googleapis.com/auth/userinfo.email`
   - Add your Gmail as a test user

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `http://localhost:3000/api/auth/gmail/callback`
   - Copy Client ID and Client Secret to `.env.local`

#### Outlook Setup (Azure Portal)

1. **Register Application**
   - Go to [Azure Portal](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps)
   - Click "New registration"
   - Name: "Gyattmail"
   - Supported accounts: "Personal Microsoft accounts"
   - Click "Register"

2. **Add Redirect URI**
   - Go to "Authentication" → "Add a platform" → "Web"
   - Redirect URI: `http://localhost:3000/api/auth/outlook/callback`
   - Check "Access tokens" and "ID tokens"

3. **Create Client Secret**
   - Go to "Certificates & secrets" → "New client secret"
   - Copy the VALUE immediately (shown only once!)

4. **Configure API Permissions**
   - Go to "API permissions" → "Add a permission" → "Microsoft Graph"
   - Add delegated permissions:
     - `IMAP.AccessAsUser.All`
     - `SMTP.Send`
     - `User.Read`
     - `offline_access`
   - Click "Grant admin consent"

5. **Copy Credentials**
   - Copy Application (client) ID and Client Secret to `.env.local`

See [`.env.local.example`](./.env.local.example) for the complete configuration template.

## Project Structure

```
gyattmail/
├── app/
│   ├── mail/
│   │   ├── components/
│   │   │   ├── account-switcher.tsx
│   │   │   ├── mail.tsx
│   │   │   ├── mail-display.tsx
│   │   │   ├── mail-list.tsx
│   │   │   └── nav.tsx
│   │   ├── data.ts
│   │   ├── use-mail.ts
│   │   └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   └── ui/                      # shadcn/ui components
├── lib/
│   └── utils.ts
└── tailwind.config.ts           # Paper-hatch theme configuration
```

## Roadmap

Based on the full product spec:

### v1 (Current - MVP)
- ✅ Multi-account UI (Gmail, Outlook, iCloud)
- ✅ View-based organization with filters
- ✅ Resizable panel layout
- ✅ Search functionality
- ✅ Paper-hatch design system
- ✅ OAuth2 authentication (Gmail & Outlook)
- ✅ SMTP email sending
- ✅ AES-256-GCM credential encryption
- ✅ Multiple accounts per provider
- ✅ IMAP email receiving
- ✅ Real-time email sync (SSE)
- ✅ Multi-folder support (INBOX, Sent, Drafts, Trash, All Mail)
- ✅ Incremental sync with UIDVALIDITY tracking
- ✅ Flag updates (mark read/unread, star/unstar) synced to IMAP
- ✅ Background sync (automatic polling every 15 minutes)
- ✅ Email parsing (headers, body, attachments, snippets)

### v1.1 (Upcoming)
- 📋 Rules & Automations
- 🤖 AI features (OpenAI/Gemini integration)
- 📅 Calendar scheduling hooks
- 👥 Team collaboration (shared views, assignments)
- 🔔 Web Push notifications

## Contributing

This is an open-source project. Contributions are welcome!

## License

MIT

## Acknowledgments

- Inspired by [Notion Mail](https://notion.com/product/mail)'s view model
- UI components based on [shadcn/ui](https://ui.shadcn.com/)
- Design influenced by paper textures and traditional hatching patterns
