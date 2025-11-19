# gyattmail

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.1.5-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

[![CodeRabbit Reviews](https://img.shields.io/coderabbit/prs/github/ryumacodes/gyattmail?utm_source=oss&utm_medium=github&utm_campaign=ryumacodes%2Fgyattmail&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)](https://coderabbit.ai)
[![GitHub Stars](https://img.shields.io/github/stars/ryumacodes/gyattmail?style=flat&logo=github)](https://github.com/ryumacodes/gyattmail)
[![GitHub Issues](https://img.shields.io/github/issues/ryumacodes/gyattmail?style=flat&logo=github)](https://github.com/ryumacodes/gyattmail/issues)
[![GitHub Forks](https://img.shields.io/github/forks/ryumacodes/gyattmail?style=flat&logo=github)](https://github.com/ryumacodes/gyattmail/network)

</div>

<p align="center">
<strong>Privacy-first, self-hosted email client</strong> with multi-provider support and AI features.<br/>
Built with <strong>Paper-Hatch</strong> design system – cross-hatched borders, paper grain textures, and warm artisanal aesthetics.
</p>

<p align="center">
Your emails, your machine, your rules.
</p>

> **Mood:** winter-quiet, engraved, tactile
> **Technique:** paper grain + cross-hatching + imperfect ink lines
> **Primary color:** hat brown (gnome cap) #B7662E
> **Foundation:** warm paper beige #F4EFE4

## Features

### Privacy & Control
- **Self-Hosted**: Your emails stay on your machine – no third-party servers, no cloud storage
- **Open Source**: Auditable code, community-driven development
- **User-Controlled OAuth**: Create your own Google/Microsoft OAuth credentials for full security control
- **AES-256-GCM Encryption**: All stored credentials encrypted locally

### Email & Accounts
- **Multi-Provider**: Gmail, Outlook, iCloud, Custom SMTP/IMAP in one unified inbox
- **Real-Time Sync**: IMAP/SMTP with automatic background polling (every 15 minutes)
- **Multi-Folder Support**: INBOX, Sent, Drafts, Trash, All Mail with incremental sync
- **Multiple Accounts**: Add unlimited accounts per provider
- **Flag Sync**: Mark read/unread, star/unstar with changes synced to email server

### Organization & Search
- **View-Based Organization**: Filter-based saved views with groups and custom properties
- **Server-Side Search**: Fast full-text search with rich query grammar
- **Labels & Badges**: Outlined pill-style labels
- **Follow-Up Reminders**: Email snoozing and reminders

### AI Features (Bring Your Own API Key)
- **Multi-Provider AI**: Support for Google Gemini, OpenAI GPT, Anthropic Claude, and OpenRouter
- **Cost-Effective**: Pay ~$2-5/month in API costs vs $20-30/month subscriptions
- **Smart Compose**: AI-powered email drafting with context awareness, tone adjustment, and reply generation
- **Email Analysis**: Automatic priority detection, sentiment analysis, and action item extraction
- **Quick Replies**: AI-generated smart reply suggestions with confidence scoring
- **Email Summarization**: Concise summaries of long emails and threads
- **Auto-Labeling**: Email categorization and label suggestions
- **Writing Assistance**: Grammar improvement, tone adjustment, and text completion
- **Privacy-First**: API keys stored locally, encrypted with AES-256-GCM

### Design & UX
- **Paper-Hatch Design System**: Cross-hatched borders, paper grain, letterpress buttons, hand-drawn elements
- **Resizable Panels**: Three-column layout with persistent sizing and hatched dividers
- **Warm Aesthetic**: Artisanal design with paper textures and hatched borders
- **Web-First**: Built with Next.js 15, React 19, and Turbopack

## Paper-Hatch Design System

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

#### Why Do I Need My Own OAuth Credentials?

Gyattmail is **open source first and locally ran first**. Each user creates their own Google Cloud Project and OAuth credentials to maintain complete privacy and control:

- 🔒 **True Privacy**: Your email data stays on YOUR machine – never touches third-party servers
- 🔐 **Full Control**: You own the OAuth app, you control the security policies
- 🚫 **No Shared Credentials**: No risk from shared API keys or rate limits
- 🌐 **Open Source Standard**: How all self-hosted email clients work (Thunderbird, Mailspring, etc.)
- ⚡ **No Limits**: No 100-user caps or artificial restrictions
- 🛡️ **Auditable**: Open source code means you can verify exactly what happens with your data

**This is the price of true privacy** – a one-time 10-15 minute setup that puts YOU in control.

---

#### Gmail Setup (Google Cloud Console)

##### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Select a project"** dropdown → **"New Project"**
3. **Project name:** "Gyattmail Personal" (or any name you prefer)
4. Click **"Create"** and wait for the project to be created
5. Select your new project from the dropdown

##### Step 2: Enable Gmail API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on it and press **"Enable"**
4. Wait for activation (takes ~30 seconds)

##### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type → Click **"Create"**

3. **App Information:**
   - **App name:** "Gyattmail (Self-Hosted)"
   - **User support email:** Your email address
   - **Developer contact information:** Your email address
   - **App logo:** (Optional - leave empty for personal use)
   - Click **"Save and Continue"**

4. **Add Scopes:**
   - Click **"Add or Remove Scopes"**
   - Search and select these scopes:
     - `https://mail.google.com/` (Full Gmail access)
     - `https://www.googleapis.com/auth/userinfo.email` (Email address)
   - Click **"Update"** → **"Save and Continue"**

5. **Test Users (if staying in Testing mode):**
   - Click **"Add Users"**
   - Enter your Gmail address
   - Click **"Add"** → **"Save and Continue"**
   - Click **"Back to Dashboard"**

6. **⚠️ IMPORTANT - Choose Your Publishing Mode:**

   **Option A: Testing Mode (Default)**
   - ✅ Works immediately
   - ⚠️ Tokens expire after 7 days - you'll need to re-authenticate
   - ✅ Perfect for trying out Gyattmail
   - ✅ No "unverified app" warning
   - 📝 Limited to 100 test users (must add Gmail addresses manually)
   - Skip to Step 4 (Create Credentials)

   **Option B: Production Mode** ⭐ **RECOMMENDED FOR DAILY USE**
   - ✅ **Tokens NEVER expire** - No weekly re-authentication
   - ✅ **Works indefinitely** - Set it up once, use forever
   - ✅ **No user limits** - Works for any Google account
   - ℹ️ **Shows "unverified app" warning** - Standard for ALL self-hosted email clients

   **To Publish to Production:**
   1. Click **"Back to Dashboard"** button at the bottom of the page
   2. In the left sidebar, click **"Audience"** tab
   3. Click the **"PUBLISH APP"** button
   4. You may see "Verification Required" notice - **this is normal, click "Confirm" anyway**
   5. In the "Push to Production?" dialog, click **"Confirm"**
   6. ✅ Status changes to "In production"

   **About Google's "Verification Required" Notice:**

   Google may display a message about needing verification. **You can safely ignore this and publish anyway.** Here's why:

   - ✅ Publishing to Production **works without verification**
   - ✅ Verification is **optional** (costs $15,000-$75,000 per year!)
   - ✅ Only purpose: Remove the "unverified app" warning
   - ✅ For self-hosted apps, the warning is **completely normal and safe**

   **What the "Unverified App" Warning Looks Like:**

   When you sign in to Gyattmail, Google will show:

   ```
   ⚠️ This app isn't verified
   This app hasn't been verified by Google yet.
   Only proceed if you know and trust the developer.
   ```

   **This is NORMAL and SAFE for self-hosted apps!** Here's how to proceed:

   1. Click **"Advanced"** (small link at the bottom)
   2. Click **"Go to Gyattmail (unsafe)"**
   3. Grant permissions and continue

   **Why it says "unsafe":** Google shows this for ANY app that hasn't paid $15k-$75k/year for their verification program. It does NOT mean the app is malicious.

   **Why it's safe for YOU:**
   - ✅ YOU created the OAuth app in YOUR Google Cloud account
   - ✅ YOU control the credentials and security policies
   - ✅ YOU can audit the open-source code to see exactly what it does
   - ✅ Your emails stay on YOUR machine (never uploaded to third parties)
   - ✅ This is how **all self-hosted email clients work** (Thunderbird, Mailspring, etc.)

   **Think of it this way:** You're the developer AND the user. You're trusting yourself!

   **📌 Important:** After publishing, you MUST re-authenticate in Gyattmail to get tokens that never expire:
   - **Simple option:** Sign out and sign in again (keeps same OAuth credentials)
   - **Fresh start:** Delete old credentials → Create new ones → Re-authenticate

##### Step 4: Create OAuth Credentials

**⚠️ If you just published to Production:** Make sure you're creating NEW credentials AFTER publishing. Old credentials from Testing mode will still expire after 7 days.

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. **Application type:** Select **"Web application"**
4. **Name:** "Gyattmail Web Client" (or any name)
5. **Authorized redirect URIs** → Click **"Add URI"**:
   - For local development: `http://localhost:3000/api/auth/gmail/callback`
   - For production deployment: `https://yourdomain.com/api/auth/gmail/callback`
6. Click **"Create"**

7. **Save Your Credentials:**
   - A dialog appears with your **Client ID** and **Client Secret**
   - Click the **copy icons** to copy each value
   - Add them to your `.env.local` file:
     ```env
     GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
     ```
   - Click **"OK"** to close the dialog
   - You can always retrieve these later from the Credentials page

##### Understanding the "Unverified App" Warning

If you published to Production (recommended), you'll see this warning screen when signing in:

<div align="center">
<img src="https://developers.google.com/static/identity/protocols/oauth2/images/oauth-consent-screen-unverified-app.png" width="400" alt="Unverified App Warning">
</div>

**This is the standard experience for ALL self-hosted email clients!**

**Why you see this:**
- Google shows this warning for any app that hasn't paid for their $15k-$75k/year verification program
- Verification is designed for commercial apps with 100+ users
- Self-hosted apps (used by 1 person) don't need verification

**Why it's safe:**
- ✅ You created this OAuth app yourself
- ✅ You control the security policies
- ✅ You can audit the open-source code
- ✅ Your emails never leave your machine
- ✅ This is how Thunderbird, Mailspring, and all privacy-focused email clients work

**How to proceed:**
1. Click **"Advanced"** (small link at bottom)
2. Click **"Go to Gyattmail (unsafe)"**
3. ✅ Grant permissions and you're done!

**This warning only appears ONCE per Google account** - after clicking through, you won't see it again.

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

---

#### Troubleshooting OAuth Issues

##### "Connection Failed - Authentication Expired" after 7 days

**Cause:** Your OAuth app is in Testing mode - Google automatically expires refresh tokens after 7 days.

**BEST SOLUTION: Publish to Production** (Permanent Fix)

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **"OAuth consent screen"**
2. Click **"Audience"** tab in sidebar
3. Click **"PUBLISH APP"** → Confirm
4. ✅ Status changes to "In production"
5. **Re-authenticate in Gyattmail** to get new tokens that never expire
   - Sign out and sign in again (simple)
   - OR delete old credentials → create new ones → re-auth (fresh start)

**Why this works:**
- Testing mode tokens expire after 7 days (Google policy)
- Production mode tokens **never expire** (unless manually revoked)
- Your OAuth credentials (Client ID/Secret) stay the same
- You just need fresh tokens issued under Production mode

**TEMPORARY WORKAROUND: Stay in Testing Mode**
- Click "Sign In Again" when you see the error
- Refreshes tokens for another 7 days
- Gyattmail auto-detects OAuth errors and prompts re-auth

##### "Invalid Grant" or "Token Expired" errors immediately after publishing

**Cause:** You published to Production but are still using OLD refresh tokens that were issued in Testing mode. Those old tokens still have the 7-day expiration.

**SOLUTION: Get Fresh Tokens** (Choose one option)

**Option 1: Simple Re-authentication** ⭐ Recommended
1. In Gyattmail, sign out and sign in again
2. ✅ New tokens will be issued in Production mode (never expire)
3. ✅ Same OAuth credentials (Client ID/Secret) work fine
4. Done!

**Option 2: Clean Slate** (If you want to start fresh)
1. Go to [Google Cloud Console](https://console.cloud.google.com) → **"Credentials"**
2. Delete the old OAuth 2.0 Client ID
3. Create NEW OAuth credentials (Step 4 in setup above)
4. Update `.env.local` with new Client ID and Secret
5. Restart dev server: `npm run dev`
6. Re-authenticate in Gyattmail

**Technical Explanation:**
- OAuth credentials (Client ID/Secret): The keys that identify your app ✅ These don't expire
- Access/Refresh tokens: Temporary keys that let Gyattmail access your Gmail ⏰ These expire based on Testing/Production mode
- Publishing to Production changes the token expiration policy, but doesn't automatically refresh your existing tokens
- You need to re-authenticate to get new tokens with the updated policy

##### "Redirect URI Mismatch" error

**Cause:** The redirect URI in your OAuth flow doesn't match the one registered in Google Cloud Console.

**Solution:**
1. Check your `.env.local`:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
2. Go to [Google Cloud Console](https://console.cloud.google.com) → **"Credentials"**
3. Click on your OAuth 2.0 Client ID
4. Verify **Authorized redirect URIs** includes:
   - `http://localhost:3000/api/auth/gmail/callback` (for local dev)
   - `https://yourdomain.com/api/auth/gmail/callback` (for production)
5. Save changes and try again

##### Emails not syncing / No emails visible

**Possible causes:**

1. **Fresh installation** - First sync can take 1-2 minutes
2. **Background sync not running** - Check browser console for errors
3. **IMAP connection failed** - Check server logs:
   ```bash
   npm run dev
   # Look for "IMAP connection failed" errors
   ```

**Solutions:**
- Wait 1-2 minutes after adding account
- Check that Gmail API is enabled in Google Cloud Console
- Verify your Gmail account has emails in INBOX
- Restart the dev server: `Ctrl+C` then `npm run dev`

##### "This app isn't verified" warning screen

**This is the standard experience for self-hosted email clients!** It's completely safe.

**How to proceed:**
1. Click **"Advanced"** (small link at bottom)
2. Click **"Go to Gyattmail (unsafe)"**
3. ✅ Complete authorization

**Why you see this:**
- Google shows this for ANY app that hasn't paid $15k-$75k/year for verification
- ALL self-hosted email clients show this warning (Thunderbird, Mailspring, etc.)
- Verification is designed for commercial apps with 100+ users
- You created this OAuth app yourself, so it's safe

**Why it's safe:**
- ✅ You own and control the OAuth app
- ✅ You can audit the open-source code
- ✅ Your emails stay on your machine (never uploaded anywhere)
- ✅ This warning appears ONCE per Google account (not every time)

**Think of it this way:** You're the developer AND the user - you're trusting yourself!

---

### AI Configuration (Optional)

Gyattmail supports AI-powered features with multiple providers. Configuration is done through the UI:

1. **Navigate to Settings** (⚙️ icon in sidebar)
2. **Click on "AI Settings"** tab
3. **Choose Your Provider**:
   - **Google Gemini** - Free tier available (15 RPM, 1M tokens/day) or ~$1.40 per 1M tokens
   - **OpenAI GPT** - Pay-as-you-go (~$1.125-6.25 per 1M tokens)
   - **Anthropic Claude** - Pay-as-you-go (~$2.40-9 per 1M tokens)
   - **OpenRouter** - Access to 100+ models, many free options
4. **Select Model** (e.g., `gemini-2.5-flash-preview-05-20`, `gpt-5-mini`, `claude-3-5-haiku`)
5. **Enter API Key** and click "Save AI Settings"

#### Getting API Keys

**Gemini (Google AI)**
- Visit: https://aistudio.google.com/app/apikey
- Click "Create API key" → Select or create project → Copy key
- Free tier: 15 requests/minute, 1M tokens/day

**OpenAI**
- Visit: https://platform.openai.com/api-keys
- Create account → Add payment method → Create new key
- Pricing: https://openai.com/api/pricing/

**Anthropic Claude**
- Visit: https://console.anthropic.com/
- Create account → Add credits → API Keys → Create key
- Pricing: https://www.anthropic.com/pricing#anthropic-api

**OpenRouter**
- Visit: https://openrouter.ai/keys
- Sign up → Create key → (Optional) Add credits for paid models
- Many free models available without payment

#### AI Features Available

Once configured, you'll see:
- ✨ **Smart Replies** - Quick AI-generated response suggestions
- 📊 **Email Analysis** - Priority, sentiment, and action items in mail view
- 📝 **AI Compose** - Draft emails with AI assistance
- ✍️ **Writing Tools** - Improve text, adjust tone, autocomplete

**Cost Estimate**: Most users spend $2-5/month with typical usage (vs $20-30/month for commercial AI email services).

---

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

### v1.0 - Core Email Client [COMPLETE]
- [x] Multi-account UI (Gmail, Outlook, iCloud, Custom IMAP)
- [x] OAuth2 authentication (Gmail & Outlook)
- [x] SMTP email sending with multi-recipient support
- [x] IMAP email receiving with real-time sync
- [x] Multi-folder support (INBOX, Sent, Drafts, Trash, All Mail)
- [x] Incremental sync with UIDVALIDITY tracking
- [x] Flag updates (read/unread, star/unstar) synced to IMAP server
- [x] Background sync (automatic polling every 15 minutes)
- [x] Email parsing (headers, body, attachments, snippets)
- [x] AES-256-GCM credential encryption
- [x] Multiple accounts per provider
- [x] View-based organization with filters
- [x] Resizable panel layout
- [x] Server-side full-text search
- [x] Paper-Hatch design system

### v1.1 - AI Features [COMPLETE]
- [x] Multi-provider AI support (Gemini, OpenAI, Claude, OpenRouter)
- [x] AI-powered email drafting with context awareness
- [x] Smart reply suggestions
- [x] Email analysis (priority, sentiment, action items)
- [x] Email summarization
- [x] Writing assistance (improve, adjust tone, autocomplete)
- [x] Label suggestions
- [x] Thread summarization
- [x] UI-based AI configuration (Settings panel)
- [x] Response caching for cost optimization

### v1.2 - Enhanced UX [IN PROGRESS]
- [x] Compose dialog with AI toolbar
- [x] Reply/Forward functionality
- [x] Keyboard shortcuts panel
- [x] Drag-and-drop email organization
- [ ] Advanced search filters UI
- [ ] Email templates
- [ ] Snooze/Follow-up reminders
- [ ] Dark mode support

### v2.0 - Advanced Features [PLANNED]
- [ ] Rules & Automations engine
- [ ] Calendar integration (ICS parsing to scheduling)
- [ ] Web Push notifications
- [ ] Team collaboration (shared views, assignments)
- [ ] Email analytics dashboard
- [ ] Plugin system for extensibility
- [ ] Progressive Web App (PWA) support
- [ ] Internationalization (i18n)

## Contributing

Open to contributions. Check out the issue tracker or submit a PR.

## Acknowledgments

- UI components based on [shadcn/ui](https://ui.shadcn.com/)
- Design influenced by paper textures and traditional hatching patterns
