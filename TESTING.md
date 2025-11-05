# Gyattmail Email Client - Comprehensive Testing Guide

This guide covers all testing scenarios for SMTP email sending, IMAP email receiving, multi-folder support, and real-time synchronization features.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Account Connection Testing](#account-connection-testing)
4. [SMTP Email Sending Tests](#smtp-email-sending-tests)
5. [IMAP Email Receiving Tests](#imap-email-receiving-tests)
6. [Multi-Folder Sync Tests](#multi-folder-sync-tests)
7. [Flag Updates Tests](#flag-updates-tests)
8. [Real-Time Sync Tests](#real-time-sync-tests)
9. [Background Sync Tests](#background-sync-tests)
10. [Error Handling Tests](#error-handling-tests)
11. [Performance Tests](#performance-tests)

---

## Prerequisites

### Required Accounts
- **Gmail Account** (for OAuth2 testing)
- **Outlook/Microsoft Account** (for OAuth2 testing)
- **Optional:** iCloud or custom IMAP account (for password-based auth testing)

### Required Software
- Node.js 20+
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Fill in the required values:

```env
# Gmail OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback

# Outlook OAuth2
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/outlook/callback

# Encryption Key
ENCRYPTION_KEY=your_64_character_hex_key
```

### 3. Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `ENCRYPTION_KEY` in `.env.local`.

### 4. Start Development Server

```bash
npm run dev
```

Server should start at: `http://localhost:3000`

---

## Account Connection Testing

### Test 1: Connect Gmail Account via OAuth2

**Steps:**
1. Navigate to `http://localhost:3000/mail`
2. Click "Add Account" button
3. Click "Continue with Gmail"
4. Verify OAuth popup opens (600x700 window)
5. Sign in to Google account
6. Grant requested permissions:
   - `https://mail.google.com/` (full mail access)
   - `https://www.googleapis.com/auth/userinfo.email` (email address)
7. Popup should close automatically
8. Page should refresh and show new account

**Expected Results:**
- ✅ OAuth popup opens without popup blocker issues
- ✅ Successful OAuth flow redirects to `/mail?account=added&email=your@gmail.com`
- ✅ Account appears in account list with status "connected"
- ✅ Credentials stored encrypted in `.data/accounts.json`

**Verification:**
```bash
cat .data/accounts.json
# Should see encrypted accessToken and refreshToken fields
```

### Test 2: Connect Outlook Account via OAuth2

**Steps:**
1. Navigate to `http://localhost:3000/mail`
2. Click "Add Account" button
3. Click "Continue with Outlook"
4. Sign in to Microsoft account
5. Grant requested permissions:
   - `IMAP.AccessAsUser.All`
   - `SMTP.Send`
   - `User.Read`
   - `offline_access`
6. Verify account added successfully

**Expected Results:**
- ✅ Microsoft OAuth flow completes
- ✅ Account appears with provider "outlook"
- ✅ Encrypted credentials stored

### Test 3: Multiple Accounts Per Provider

**Steps:**
1. Add first Gmail account (email1@gmail.com)
2. Add second Gmail account (email2@gmail.com)
3. Verify both appear with unique labels:
   - "email1@gmail.com"
   - "email2@gmail.com (2)"

**Expected Results:**
- ✅ Both accounts appear in list
- ✅ Each has unique label
- ✅ Can switch between accounts

---

## SMTP Email Sending Tests

**Test Page:** `http://localhost:3000/test`

### Test 4: Send Plain Text Email

**Steps:**
1. Navigate to `/test`
2. Select account from list
3. Fill in:
   - To: `recipient@example.com`
   - Subject: `Test Plain Text Email`
   - Body: `This is a test email.`
4. Click "Send Email"

**Expected Results:**
- ✅ Success message with Message-ID
- ✅ Email appears in recipient's inbox within 5-30 seconds
- ✅ Sender address matches selected account
- ✅ Subject and body match input

### Test 5: Send Email with Special Characters

**Steps:**
1. Send email with:
   - Subject: `Test: Émojis 🎉 & Spëcial Çharacters`
   - Body: `Testing unicode: こんにちは 世界 🌍`

**Expected Results:**
- ✅ Email sends successfully
- ✅ Special characters preserved in subject and body
- ✅ Emojis display correctly

### Test 6: Send Email to Multiple Recipients

**Steps:**
1. API call with multiple recipients (use curl or test UI update):

```bash
curl -X POST http://localhost:3000/api/mail/send \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "your_account_id",
    "to": ["recipient1@example.com", "recipient2@example.com"],
    "subject": "Test Multiple Recipients",
    "text": "This should go to two people"
  }'
```

**Expected Results:**
- ✅ Both recipients receive the email
- ✅ Both appear in "To" field

### Test 7: Send Email with CC and BCC

```bash
curl -X POST http://localhost:3000/api/mail/send \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "your_account_id",
    "to": "primary@example.com",
    "cc": ["cc1@example.com"],
    "bcc": ["bcc1@example.com"],
    "subject": "Test CC/BCC",
    "text": "Testing CC and BCC"
  }'
```

**Expected Results:**
- ✅ Primary recipient receives email
- ✅ CC recipient receives email and sees they are CC'd
- ✅ BCC recipient receives email but is not visible to others

### Test 8: Error Handling - Invalid Recipient

**Steps:**
1. Try to send to: `invalid-email-address`

**Expected Results:**
- ✅ Error response with status 400
- ✅ Error message: "Invalid email address format"

### Test 9: Error Handling - Missing Subject

**Steps:**
1. Try to send email without subject

**Expected Results:**
- ✅ Error response with status 400
- ✅ Error message: "Missing required field: subject"

---

## IMAP Email Receiving Tests

### Test 10: Initial INBOX Sync

**Steps:**
1. Navigate to `/test`
2. Select account
3. Click "Sync INBOX"
4. Wait for sync to complete

**Expected Results:**
- ✅ Progress message appears: "Syncing emails..."
- ✅ Success message shows: "Sync complete! X new emails, Y total"
- ✅ On first sync, fetches last 50 emails from INBOX
- ✅ Emails stored in `.data/emails/{accountId}/INBOX.json`
- ✅ Sync state saved in `.data/sync-state.json`

**Verification:**
```bash
# Check emails were stored
cat .data/emails/{your-account-id}/INBOX.json | jq 'length'

# Check sync state
cat .data/sync-state.json | jq .
```

### Test 11: Incremental Sync

**Steps:**
1. Perform initial sync
2. Send yourself a new email from another account
3. Wait 30 seconds
4. Click "Sync INBOX" again

**Expected Results:**
- ✅ Only new emails are fetched (not all 50 again)
- ✅ Sync message shows: "1 new emails"
- ✅ New email appears in list
- ✅ `lastSeenUid` updated in sync state

### Test 12: Load and Display Synced Emails

**Steps:**
1. After syncing, click "Load Emails"
2. Verify email list displays

**Expected Results:**
- ✅ Emails appear sorted by date (newest first)
- ✅ Each email shows:
  - From (name and email)
  - Subject
  - Date/time
  - Snippet (first 200 characters)
- ✅ Unread emails shown in bold
- ✅ Read emails shown in normal weight

### Test 13: Email Parsing - Headers

**Steps:**
1. Sync emails
2. Check stored email data structure

**Expected Results:**
- ✅ Emails have all headers:
  - `from: [{ name, address }]`
  - `to: [{ name, address }]`
  - `subject: string`
  - `date: ISO 8601 string`
  - `messageId: string`

### Test 14: Email Parsing - Body Content

**Expected Results:**
- ✅ Plain text emails have `text` field
- ✅ HTML emails have `html` field
- ✅ Multipart emails have both `text` and `html`
- ✅ Snippet generated correctly (200 chars, HTML stripped)

### Test 15: Email Parsing - Attachments

**Steps:**
1. Send yourself an email with attachments
2. Sync INBOX
3. Verify attachment data

**Expected Results:**
- ✅ Email has `attachments` array
- ✅ Each attachment has:
  - `filename: string`
  - `content: base64 string`
  - `contentType: string`
  - `size: number`

---

## Multi-Folder Sync Tests

### Test 16: Sync Sent Folder (Gmail)

```bash
curl -X POST http://localhost:3000/api/mail/sync \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "your_gmail_account_id",
    "folders": ["[Gmail]/Sent Mail"]
  }'
```

**Expected Results:**
- ✅ Sent emails synced
- ✅ Stored in `.data/emails/{accountId}/_Gmail__Sent_Mail.json`

### Test 17: Sync Multiple Folders

```bash
curl -X POST http://localhost:3000/api/mail/sync \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "your_account_id",
    "fullSync": true
  }'
```

**Expected Results:**
- ✅ Syncs all standard folders:
  - **Gmail:** INBOX, Sent Mail, Drafts, Trash, All Mail
  - **Outlook:** INBOX, Sent Items, Drafts, Deleted Items
- ✅ Each folder has its own JSON file
- ✅ Each folder has separate sync state

### Test 18: List Available Folders

```bash
curl http://localhost:3000/api/mail/folders?accountId=your_account_id
```

**Expected Results:**
```json
{
  "success": true,
  "folders": [
    {
      "name": "INBOX",
      "displayName": "Inbox",
      "icon": "inbox",
      "path": "INBOX"
    },
    {
      "name": "[Gmail]/Sent Mail",
      "displayName": "Sent",
      "icon": "send",
      "path": "[Gmail]/Sent Mail"
    }
  ]
}
```

### Test 19: Sync Essential Folders Only

```bash
curl -X POST http://localhost:3000/api/mail/sync \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "your_account_id"
  }'
```

**Expected Results:**
- ✅ Syncs essential folders only:
  - INBOX
  - Sent
  - Drafts
- ✅ Faster than full sync

---

## Flag Updates Tests

### Test 20: Mark Email as Read

**Steps:**
1. Find an unread email ID from synced emails
2. Make API call:

```bash
curl -X PATCH http://localhost:3000/api/mail/flags \
  -H "Content-Type: application/json" \
  -d '{
    "emailId": "accountId:INBOX:123",
    "read": true
  }'
```

**Expected Results:**
- ✅ Success response
- ✅ Local storage updated (`isRead: true`)
- ✅ IMAP `\Seen` flag added on server
- ✅ Verify in webmail: email marked as read

### Test 21: Mark Email as Unread

```bash
curl -X PATCH http://localhost:3000/api/mail/flags \
  -H "Content-Type: application/json" \
  -d '{
    "emailId": "accountId:INBOX:123",
    "read": false
  }'
```

**Expected Results:**
- ✅ Email marked unread locally
- ✅ `\Seen` flag removed on IMAP server
- ✅ Appears unread in webmail

### Test 22: Star Email

```bash
curl -X PATCH http://localhost:3000/api/mail/flags \
  -H "Content-Type: application/json" \
  -d '{
    "emailId": "accountId:INBOX:123",
    "starred": true
  }'
```

**Expected Results:**
- ✅ Email starred locally
- ✅ `\Flagged` flag added on server
- ✅ Shows as starred in webmail

### Test 23: Update Both Read and Starred

```bash
curl -X PATCH http://localhost:3000/api/mail/flags \
  -H "Content-Type: application/json" \
  -d '{
    "emailId": "accountId:INBOX:123",
    "read": true,
    "starred": true
  }'
```

**Expected Results:**
- ✅ Both flags updated
- ✅ Changes reflected on IMAP server

---

## Real-Time Sync Tests

### Test 24: SSE Stream Connection

**Steps:**
1. Open browser console
2. Run:

```javascript
const eventSource = new EventSource('/api/mail/sync/stream?accountId=your_account_id')

eventSource.addEventListener('connected', (e) => {
  console.log('Connected:', JSON.parse(e.data))
})

eventSource.addEventListener('progress', (e) => {
  console.log('Progress:', JSON.parse(e.data))
})

eventSource.addEventListener('sync-complete', (e) => {
  console.log('Complete:', JSON.parse(e.data))
  eventSource.close()
})

eventSource.onerror = (e) => {
  console.error('Error:', e)
}
```

**Expected Results:**
- ✅ `connected` event received immediately
- ✅ `progress` events as folders sync
- ✅ `sync-complete` event with results
- ✅ Connection closes gracefully

### Test 25: SSE Keep-Alive Pings

**Steps:**
1. Connect to SSE stream
2. Wait 60+ seconds without activity

**Expected Results:**
- ✅ `ping` event every 30 seconds
- ✅ Connection stays alive
- ✅ No timeout errors

### Test 26: SSE Multi-Folder Progress

**Steps:**
1. Connect to SSE stream with `fullSync=true`
2. Monitor progress events

**Expected Results:**
- ✅ Progress event for each folder:
  - `status: "connecting"`
  - `status: "syncing"`
  - `status: "completed"`
- ✅ Final `sync-complete` with all results

---

## Background Sync Tests

### Test 27: Manual Background Sync

```bash
curl -X POST http://localhost:3000/api/mail/sync/background
```

**Expected Results:**
```json
{
  "success": true,
  "message": "Background sync completed",
  "accountsSynced": 2,
  "accountsFailed": 0,
  "totalNewEmails": 5,
  "results": [...]
}
```

### Test 28: Background Sync Rate Limiting

**Steps:**
1. Call background sync endpoint
2. Immediately call it again

**Expected Results:**
```json
{
  "success": true,
  "message": "Sync skipped (too soon since last sync)",
  "nextSyncAvailableIn": 59
}
```

### Test 29: Client-Side Background Sync Hook

**Steps:**
1. Add to a React component:

```tsx
import { useBackgroundSync } from '@/app/mail/use-background-sync'

function MyComponent() {
  const {
    isSyncing,
    lastSyncTime,
    totalNewEmails,
    syncNow
  } = useBackgroundSync({
    enabled: true,
    interval: 60000, // 1 minute for testing
    onSyncComplete: (data) => {
      console.log('Sync complete:', data)
    }
  })

  return (
    <div>
      <p>Syncing: {isSyncing ? 'Yes' : 'No'}</p>
      <p>Last Sync: {lastSyncTime?.toLocaleString()}</p>
      <p>New Emails: {totalNewEmails}</p>
      <button onClick={syncNow}>Sync Now</button>
    </div>
  )
}
```

**Expected Results:**
- ✅ Initial sync after 5 seconds
- ✅ Automatic sync every 60 seconds
- ✅ "Sync Now" button triggers immediate sync
- ✅ New emails count increments

---

## Error Handling Tests

### Test 30: Invalid OAuth Token

**Steps:**
1. Manually corrupt refresh token in `.data/accounts.json`
2. Try to sync

**Expected Results:**
- ✅ Error message: "Authentication failed"
- ✅ Account status updated to "failed"
- ✅ `lastError` field populated

### Test 31: Network Timeout

**Steps:**
1. Disconnect internet
2. Try to sync

**Expected Results:**
- ✅ Error caught and handled
- ✅ User-friendly error message
- ✅ Sync can be retried when connection restored

### Test 32: Mailbox Not Found

**Steps:**
1. Try to sync non-existent folder:

```bash
curl -X POST http://localhost:3000/api/mail/sync \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "your_account_id",
    "folders": ["NonExistentFolder"]
  }'
```

**Expected Results:**
- ✅ Error in response
- ✅ Other folders continue syncing (if multi-folder)

---

## Performance Tests

### Test 33: Large Mailbox Sync (1000+ emails)

**Steps:**
1. Sync account with 1000+ emails in INBOX
2. Measure time

**Expected Results:**
- ✅ First sync: ~30-60 seconds (fetches last 50)
- ✅ Subsequent syncs: <5 seconds (incremental)
- ✅ Memory usage stays reasonable
- ✅ No crashes or timeouts

### Test 34: Multiple Account Concurrent Sync

**Steps:**
1. Add 3 accounts
2. Trigger background sync

**Expected Results:**
- ✅ Syncs in batches of 3 concurrently
- ✅ Completes within reasonable time
- ✅ All accounts synced successfully

### Test 35: Bandwidth Usage

**Expected Results:**
- ✅ First sync: Downloads ~50 email headers + bodies (~1-5 MB)
- ✅ Incremental sync: Only new emails (<100 KB typically)
- ✅ Attachments fetched on-demand (not in initial sync)

---

## Complete Test Checklist

### Setup
- [ ] Environment variables configured
- [ ] Encryption key generated
- [ ] Dev server running

### Account Connection
- [ ] Gmail OAuth works
- [ ] Outlook OAuth works
- [ ] Multiple accounts per provider
- [ ] Accounts appear in list
- [ ] Credentials encrypted

### SMTP Sending
- [ ] Send plain text email
- [ ] Send email with special characters
- [ ] Send to multiple recipients
- [ ] CC/BCC works
- [ ] Error handling (invalid email)
- [ ] Error handling (missing fields)

### IMAP Receiving
- [ ] Initial INBOX sync (50 emails)
- [ ] Incremental sync (new emails only)
- [ ] Email parsing (headers, body, attachments)
- [ ] Snippet generation
- [ ] Unread/read status preserved

### Multi-Folder
- [ ] Sync Sent folder
- [ ] Sync all standard folders
- [ ] List folders endpoint
- [ ] Essential folders only

### Flag Updates
- [ ] Mark as read
- [ ] Mark as unread
- [ ] Star email
- [ ] Unstar email
- [ ] Changes sync to IMAP server

### Real-Time Sync
- [ ] SSE connection works
- [ ] Progress events received
- [ ] Keep-alive pings
- [ ] Graceful disconnect

### Background Sync
- [ ] Manual background sync
- [ ] Rate limiting works
- [ ] Client hook auto-syncs
- [ ] New emails counted

### Error Handling
- [ ] Invalid token handled
- [ ] Network errors handled
- [ ] Missing mailbox handled

### Performance
- [ ] Large mailbox handled
- [ ] Multiple accounts concurrent
- [ ] Bandwidth reasonable

---

## Troubleshooting

### Issue: OAuth popup blocked
- **Solution:** Allow popups for localhost:3000

### Issue: Sync fails with "Authentication failed"
- **Solution:** Check OAuth credentials in `.env.local`
- **Solution:** Regenerate refresh token by reconnecting account

### Issue: No emails showing after sync
- **Solution:** Check `.data/emails/{accountId}/INBOX.json` exists
- **Solution:** Verify sync-state.json has correct accountId

### Issue: Background sync not working
- **Solution:** Check browser console for errors
- **Solution:** Verify `/api/mail/sync/background` endpoint is accessible

---

## Next Steps

After completing all tests:

1. **Document Results:** Create a spreadsheet with test results
2. **Report Bugs:** File issues for any failing tests
3. **Optimize:** Identify and fix performance bottlenecks
4. **Security Audit:** Review encryption and token handling
5. **User Testing:** Get feedback from real users

---

## Support

For questions or issues:
- Check logs in browser console
- Check server logs in terminal
- Review `/Users/affan/Projects/gyattmail/README.md`
- File issues at GitHub repository

Happy Testing! 🧪
