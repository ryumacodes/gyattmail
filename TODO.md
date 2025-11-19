# Gyattmail Development TODO

This document tracks ongoing development tasks and future enhancements for Gyattmail.

## Current Sprint (v1.2 - Enhanced UX)

### High Priority

- [x] **Keyboard Shortcuts** [COMPLETE]
  - [x] Implement global keyboard shortcut handler
  - [x] Add shortcuts: `c` (compose), `r` (reply), `a` (reply all), `/` (search)
  - [x] Add shortcuts: `j/k` (navigate emails), `Enter` (open), `e` (archive)
  - [x] Create keyboard shortcuts help modal (triggered by `?`)

- [x] **Drag & Drop Organization** [COMPLETE]
  - [x] Drag email to folders/labels
  - [x] Visual feedback during drag operations
  - [x] Integration with @dnd-kit library

### Medium Priority

- [ ] **Advanced Search UI**
  - [ ] Build search filters panel (from:, to:, subject:, has:attachment, is:unread)
  - [ ] Add date range picker for search
  - [ ] Implement search suggestions/autocomplete
  - [ ] Save search queries as views

- [ ] **Email Templates**
  - [ ] Create template management UI in settings
  - [ ] Add template quick-insert in compose dialog
  - [ ] Support variable placeholders ({{name}}, {{date}})
  - [ ] Template sharing/import/export

- [ ] **Snooze & Follow-up**
  - [ ] Snooze email UI (custom date/time picker)
  - [ ] Background job to un-snooze emails
  - [ ] Follow-up reminders system
  - [ ] Reminder notifications

- [ ] **Dark Mode**
  - [ ] Design dark mode color tokens for Paper-Hatch
  - [ ] Implement theme switcher in settings
  - [ ] Add system preference detection
  - [ ] Persist theme choice in localStorage

### Low Priority

- [ ] **Performance Optimizations**
  - [ ] Virtualize email list for 1000+ emails
  - [ ] Lazy load email body content
  - [ ] Optimize background sync polling strategy
  - [ ] Add service worker for offline support

- [ ] **Accessibility**
  - [ ] ARIA labels for all interactive elements
  - [ ] Screen reader testing
  - [ ] High contrast mode support
  - [ ] Focus management improvements

---

## Backlog (v2.0 - Advanced Features)

### Automations & Rules

- [ ] **Rules Engine**
  - [ ] Visual rule builder UI
  - [ ] Rule triggers: new email, sender, subject contains, etc.
  - [ ] Rule actions: move to folder, apply label, mark as read, forward
  - [ ] Rule execution on background sync
  - [ ] Import/export rules as JSON

- [ ] **Smart Filters**
  - [ ] Auto-categorize emails (promotions, social, updates)
  - [ ] AI-powered importance scoring
  - [ ] Sender reputation tracking
  - [ ] Thread muting

### Calendar Integration

- [ ] **ICS Parsing & Display**
  - [ ] Parse .ics attachments
  - [ ] Display calendar events inline in emails
  - [ ] Extract meeting details (time, location, attendees)
  - [ ] Add to calendar button

- [ ] **CalDAV Integration**
  - [ ] CalDAV client for calendar sync
  - [ ] Two-way sync with Google Calendar, iCloud Calendar
  - [ ] Meeting scheduling assistant
  - [ ] Availability checker

### Collaboration

- [ ] **Team Features**
  - [ ] Shared inboxes (team@company.com)
  - [ ] Email assignment to team members
  - [ ] Internal comments/notes on emails
  - [ ] Shared views and labels

- [ ] **Delegation**
  - [ ] Delegate access to mailbox
  - [ ] Permission levels (read, respond, manage)
  - [ ] Activity log for delegated actions

### Notifications

- [ ] **Web Push Notifications**
  - [ ] Service worker for push support
  - [ ] Notification preferences (all, important only, specific senders)
  - [ ] Desktop notification UI
  - [ ] Notification click handlers

- [ ] **Notification Channels**
  - [ ] Email notifications (digest mode)
  - [ ] Slack/Discord webhooks for important emails
  - [ ] SMS notifications (via Twilio)

### Analytics & Insights

- [ ] **Email Analytics Dashboard**
  - [ ] Email volume charts (daily, weekly, monthly)
  - [ ] Response time metrics
  - [ ] Top senders/recipients
  - [ ] Email sentiment trends

- [ ] **Productivity Insights**
  - [ ] Time spent in inbox tracking
  - [ ] Email zero streak
  - [ ] Response rate statistics
  - [ ] AI-powered productivity tips

### Extensibility

- [ ] **Plugin System**
  - [ ] Plugin API design
  - [ ] Plugin marketplace
  - [ ] Plugin SDK with TypeScript support
  - [ ] Example plugins (Salesforce CRM, Notion, Linear)

- [ ] **Webhooks**
  - [ ] Outgoing webhooks on events (new email, email sent)
  - [ ] Webhook configuration UI
  - [ ] Webhook retry logic

### Platform

- [ ] **Progressive Web App (PWA)**
  - [ ] App manifest
  - [ ] Offline support
  - [ ] Install prompts
  - [ ] Push notification support

- [ ] **Internationalization**
  - [ ] i18n framework setup (next-i18next)
  - [ ] Extract all UI strings
  - [ ] Translation files (en, es, fr, de, ja, zh)
  - [ ] RTL language support (ar, he)

---

## Known Issues & Tech Debt

### Bugs

- [ ] **Redirect Loop Fix** (FIXED in latest commit)
  - [x] Fix NEXT_REDIRECT error handling in page.tsx and mail/page.tsx
  - [ ] Add unit tests for redirect logic

- [ ] **AI Response Type Mismatches**
  - [x] Fix SmartRepliesResponse type in ai-smart-replies.tsx
  - [x] Fix AnalyzeEmailResponse type in mail-display.tsx
  - [x] Fix replyTo prop interface in compose-dialog.tsx
  - [ ] Add integration tests for AI API responses

- [ ] **Email Sync Edge Cases**
  - [ ] Handle UIDVALIDITY changes (mailbox reset)
  - [ ] Handle extremely large emails (>10MB)
  - [ ] Handle malformed email headers gracefully

### Tech Debt

- [ ] **Type Safety**
  - [ ] Strict TypeScript mode
  - [ ] Remove any remaining `any` types
  - [ ] Add Zod schemas for all API routes

- [ ] **Testing**
  - [ ] Unit tests for AI providers
  - [ ] Integration tests for IMAP/SMTP
  - [ ] E2E tests with Playwright
  - [ ] CI/CD pipeline with GitHub Actions

- [ ] **Performance**
  - [ ] Database migration (SQLite or PostgreSQL)
  - [ ] Index emails for faster search
  - [ ] Implement email pagination
  - [ ] Optimize Paper-Hatch CSS (reduce bundle size)

- [ ] **Security**
  - [ ] Security audit of encryption implementation
  - [ ] Rate limiting on API routes
  - [ ] CSRF protection
  - [ ] Content Security Policy headers

---

## Documentation Needs

- [ ] **API Documentation**
  - [ ] OpenAPI/Swagger spec for REST APIs
  - [ ] AI provider integration guide
  - [ ] IMAP/SMTP configuration examples

- [ ] **Developer Guides**
  - [ ] Architecture overview
  - [ ] Adding new AI providers
  - [ ] Creating custom Paper-Hatch components
  - [ ] Plugin development guide

- [ ] **User Documentation**
  - [ ] User manual / wiki
  - [ ] Video tutorials
  - [ ] FAQ section
  - [ ] Troubleshooting guide

---

## Community & Project Management

- [ ] **Open Source Prep**
  - [x] Issue templates (bug, feature request)
  - [x] PR template
  - [ ] Comprehensive README documentation

- [ ] **Project Governance**
  - [ ] Define contribution workflow
  - [ ] Set up code review guidelines
  - [ ] Create release process
  - [ ] Version numbering strategy (semver)

- [ ] **Community Building**
  - [ ] Discord server
  - [ ] GitHub Discussions
  - [ ] Twitter/X account
  - [ ] Monthly dev blog updates

---

## Notes

- Prioritize features that improve daily email workflow (keyboard shortcuts, templates, snooze)
- Keep AI features optional and privacy-focused (local storage, user-owned keys)
- Maintain Paper-Hatch design consistency across all new features
- Test with real-world email volumes (1000+ emails, multiple accounts)

Last updated: 2025-11-18
