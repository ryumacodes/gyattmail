"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Account {
  id: string
  email: string
  provider: string
  authType: string
  connectionStatus: string
}

interface Email {
  id: string
  from: Array<{ name: string; address: string }>
  subject: string
  date: string
  snippet?: string
  isRead: boolean
}

export default function TestPage() {
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = React.useState<string>("")
  const [emails, setEmails] = React.useState<Email[]>([])
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState("")

  // Send email form
  const [sendTo, setSendTo] = React.useState("")
  const [sendSubject, setSendSubject] = React.useState("")
  const [sendBody, setSendBody] = React.useState("")

  // Load accounts on mount
  React.useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/accounts')
      const data = await response.json()
      if (data.success) {
        setAccounts(data.accounts)
        if (data.accounts.length > 0) {
          setSelectedAccount(data.accounts[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load accounts:', error)
    }
  }

  const handleSync = async () => {
    if (!selectedAccount) return

    setLoading(true)
    setMessage("Syncing emails...")

    try {
      const response = await fetch('/api/mail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: selectedAccount }),
      })

      const data = await response.json()
      if (data.success) {
        const result = data.results[0]
        setMessage(`Sync complete! ${result.newEmails} new emails, ${result.totalEmails} total`)
        // Load emails after sync
        await loadEmails()
      } else {
        setMessage(`Sync failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const loadEmails = async () => {
    if (!selectedAccount) return

    setLoading(true)
    try {
      const response = await fetch(`/api/mail/fetch?accountId=${selectedAccount}&folder=INBOX`)
      const data = await response.json()
      if (data.success) {
        setEmails(data.emails || [])
        setMessage(`Loaded ${data.emails?.length || 0} emails`)
      } else {
        setMessage(`Failed to load emails: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Load error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedAccount || !sendTo || !sendSubject) {
      setMessage("Please fill in all required fields")
      return
    }

    setLoading(true)
    setMessage("Sending email...")

    try {
      const response = await fetch('/api/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccount,
          to: sendTo,
          subject: sendSubject,
          text: sendBody,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessage(`Email sent successfully! Message ID: ${data.messageId}`)
        setSendTo("")
        setSendSubject("")
        setSendBody("")
      } else {
        setMessage(`Send failed: ${data.error} - ${data.details}`)
      }
    } catch (error) {
      setMessage(`Send error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">SMTP & IMAP Test Page</h1>

      {/* Status Message */}
      {message && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded">
          {message}
        </div>
      )}

      {/* Account Selection */}
      <div className="p-6 mb-6 border-2 border-hatch-600 rounded-lg bg-paper-200">
        <h2 className="text-xl font-bold mb-4">Connected Accounts</h2>
        {accounts.length === 0 ? (
          <p className="text-gray-600">
            No accounts connected. Go to <a href="/mail" className="text-blue-600 underline">/mail</a> to add an account.
          </p>
        ) : (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center gap-4">
                <input
                  type="radio"
                  name="account"
                  value={account.id}
                  checked={selectedAccount === account.id}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                />
                <span className="font-medium">{account.email}</span>
                <span className="text-sm text-gray-500">
                  ({account.provider} - {account.connectionStatus})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAccount && (
        <>
          {/* IMAP Test */}
          <div className="p-6 mb-6 border-2 border-hatch-600 rounded-lg bg-paper-200">
            <h2 className="text-xl font-bold mb-4">IMAP Receive Test</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={handleSync} disabled={loading}>
                  {loading ? "Syncing..." : "Sync INBOX"}
                </Button>
                <Button onClick={loadEmails} disabled={loading} variant="outline">
                  Load Emails
                </Button>
              </div>

              {/* Email List */}
              <div className="mt-4">
                <h3 className="font-bold mb-2">Emails ({emails.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className={`p-3 border rounded ${email.isRead ? 'bg-gray-50' : 'bg-white font-semibold'}`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {email.from[0]?.name || email.from[0]?.address}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(email.date).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm font-bold">{email.subject}</div>
                      {email.snippet && (
                        <div className="text-sm text-gray-600 mt-1">{email.snippet}</div>
                      )}
                    </div>
                  ))}
                  {emails.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No emails loaded. Click "Sync INBOX" to fetch emails.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SMTP Test */}
          <div className="p-6 border-2 border-hatch-600 rounded-lg bg-paper-200">
            <h2 className="text-xl font-bold mb-4">SMTP Send Test</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Test email"
                  value={sendSubject}
                  onChange={(e) => setSendSubject(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  placeholder="This is a test email..."
                  rows={5}
                  value={sendBody}
                  onChange={(e) => setSendBody(e.target.value)}
                />
              </div>
              <Button onClick={handleSendEmail} disabled={loading}>
                {loading ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
