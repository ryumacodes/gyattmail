# gyattmail TODO

## Temporary Placeholders

### Mail Data (`app/mail/data.tsx`)
- **TEMPORARY**: Currently using dummy mail data for testing
- Mails are assigned to `ryuma@codes.com` and `ryuma@icloud.com` for account filtering demo
- **TODO**: Replace with real IMAP/SMTP mail fetching when backend is implemented

**Current dummy distribution:**
- `ryuma@codes.com`: 3 mails (2 unread, 1 read)
- `ryuma@icloud.com`: 2 mails (2 unread, 0 read)

### Account Data (`app/mail/data.tsx`)
- **TEMPORARY**: Using placeholder accounts for Ryuma
- **TODO**: Replace with OAuth-connected accounts when authentication is implemented

---

## Backend Implementation Needed

### Authentication
- [ ] Gmail OAuth integration
- [ ] Outlook OAuth integration
- [ ] iCloud OAuth integration
- [ ] IMAP/SMTP manual configuration

### Mail Operations
- [ ] IMAP connection for fetching mails
- [ ] SMTP connection for sending mails
- [ ] Real-time mail sync
- [ ] Mark as read/unread
- [ ] Delete/archive operations
- [ ] Search functionality

### Account Management
- [ ] Persist connected accounts
- [ ] Handle OAuth token refresh
- [ ] Account removal
- [ ] Multiple account management

---

## UI Enhancements

- [ ] Loading states for mail operations
- [ ] Error handling and user feedback
- [ ] Email composition interface
- [ ] Mail detail view improvements
- [ ] Keyboard shortcuts
- [ ] Mobile responsive design

---

**Note**: This file tracks temporary data and implementation TODOs. Update as features are completed.
