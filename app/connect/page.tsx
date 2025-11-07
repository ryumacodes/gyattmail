"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Provider = "gmail" | "outlook" | "custom"

export default function ConnectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

  const handleGmailConnect = () => {
    setSelectedProvider("gmail")
    setShowConfigDialog(true)
  }

  const handleOutlookConnect = () => {
    setSelectedProvider("outlook")
    setShowConfigDialog(true)
  }

  const handleCustomConnect = () => {
    setSelectedProvider("custom")
    setShowConfigDialog(true)
  }

  return (
    <div className="flex h-screen items-center justify-center bg-paper-200 paper-grain">
      <div className="w-full max-w-2xl px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif font-bold text-ink-700 text-5xl mb-3 tracking-tight">
            gyattmail
          </h1>
          <p className="text-ink-700 text-lg font-medium">
            Connect your email to get started
          </p>
        </div>

        {/* Provider Cards */}
        <div className="space-y-5">
          {/* Gmail Card */}
          <button
            className="w-full bg-paper-100 border-hatched rounded-xl p-8 hover:bg-paper-50 transition-all text-left paper-grain group soft-lift relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGmailConnect}
            disabled={loading !== null}
          >
            <div className="flex items-center gap-5 relative z-10">
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-paper-200 rounded-lg border-2 border-hatch-600">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-hat-700"
                >
                  <title>Gmail</title>
                  <path
                    d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-ink-700 text-2xl mb-1.5 tracking-tight">
                  Gmail
                </h3>
                <p className="text-hatch-600 text-sm font-medium">
                  {loading === "gmail" ? "Connecting..." : "Sign in with your Google account"}
                </p>
              </div>
              <div className="flex-shrink-0 text-hat-600 group-hover:text-hat-700 group-hover:translate-x-1 transition-all">
                {loading === "gmail" ? (
                  <svg
                    className="animate-spin h-7 w-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </div>
          </button>

          {/* Outlook Card */}
          <button
            className="w-full bg-paper-100 border-hatched rounded-xl p-8 hover:bg-paper-50 transition-all text-left paper-grain group soft-lift relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleOutlookConnect}
            disabled={loading !== null}
          >
            <div className="flex items-center gap-5 relative z-10">
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-paper-200 rounded-lg border-2 border-hatch-600">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-hat-700"
                >
                  <title>Microsoft Outlook</title>
                  <path
                    d="M24 7.386V16.614C24 18.489 22.489 20 20.614 20H3.386C1.511 20 0 18.489 0 16.614V7.386C0 5.511 1.511 4 3.386 4H20.614C22.489 4 24 5.511 24 7.386zM12 13.614L3.386 8.386V16.614L12 13.614zM12 10.386L20.614 5.614H3.386L12 10.386z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-ink-700 text-2xl mb-1.5 tracking-tight">
                  Outlook
                </h3>
                <p className="text-hatch-600 text-sm font-medium">
                  {loading === "outlook" ? "Connecting..." : "Sign in with your Microsoft account"}
                </p>
              </div>
              <div className="flex-shrink-0 text-hat-600 group-hover:text-hat-700 group-hover:translate-x-1 transition-all">
                {loading === "outlook" ? (
                  <svg
                    className="animate-spin h-7 w-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </div>
          </button>

          {/* Separator */}
          <div className="relative py-4">
            <div className="separator-hatched"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-paper-200 px-4 text-hatch-600 text-xs font-semibold uppercase tracking-wider">
                or use
              </span>
            </div>
          </div>

          {/* IMAP/SMTP Card */}
          <button
            className="w-full bg-paper-100 border-hatched rounded-xl p-7 hover:bg-paper-50 transition-all text-left paper-grain group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCustomConnect}
            disabled={loading !== null}
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-paper-200 rounded-lg border-2 border-hatch-600">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-hat-700"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-ink-700 text-lg mb-1 tracking-tight">
                  Other Email (IMAP/SMTP)
                </h3>
                <p className="text-hatch-600 text-xs font-medium">
                  iCloud, Yahoo, custom domains, or any email provider
                </p>
              </div>
              <div className="flex-shrink-0 text-hat-600 group-hover:text-hat-700 group-hover:translate-x-1 transition-all">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-hatch-600 text-sm font-medium">
            Your credentials are stored securely and never shared
          </p>
        </div>
      </div>

      {/* Configuration Dialog */}
      {showConfigDialog && (
        <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-paper-100 border-hatched rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto paper-grain shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif font-bold text-ink-700 text-3xl tracking-tight">
                  {selectedProvider === "gmail" && "Connect Gmail Account"}
                  {selectedProvider === "outlook" && "Connect Outlook Account"}
                  {selectedProvider === "custom" && "Connect IMAP/SMTP Account"}
                </h2>
                <button
                  onClick={() => setShowConfigDialog(false)}
                  className="text-hatch-600 hover:text-ink-700 transition-colors"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {selectedProvider === "gmail" && (
                  <GmailConfigForm onClose={() => setShowConfigDialog(false)} />
                )}
                {selectedProvider === "outlook" && (
                  <OutlookConfigForm onClose={() => setShowConfigDialog(false)} />
                )}
                {selectedProvider === "custom" && (
                  <CustomConfigForm onClose={() => setShowConfigDialog(false)} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Gmail Configuration Form
function GmailConfigForm({ onClose }: { onClose: () => void }) {
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Store credentials temporarily and redirect to OAuth
      sessionStorage.setItem("gmail_client_id", clientId)
      sessionStorage.setItem("gmail_client_secret", clientSecret)

      // Redirect to Gmail OAuth with these credentials
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
      })
      window.location.href = `/api/auth/gmail?${params.toString()}`
    } catch (error) {
      console.error("Failed to initiate Gmail OAuth:", error)
      alert("Failed to connect. Please check your credentials.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-paper-200 border-2 border-hatch-600 rounded-lg p-4">
        <p className="text-sm text-ink-700 font-medium mb-2">
          📚 Need OAuth credentials?
        </p>
        <ol className="text-xs text-hatch-600 space-y-1 list-decimal list-inside">
          <li>Go to <a href="https://console.cloud.google.com" target="_blank" className="text-hat-600 hover:underline">Google Cloud Console</a></li>
          <li>Create a project and enable Gmail API</li>
          <li>Create OAuth 2.0 credentials (Web application)</li>
          <li>Add redirect URI: <code className="bg-paper-100 px-1 rounded">http://localhost:3000/api/auth/gmail/callback</code></li>
          <li>Copy your Client ID and Client Secret below</li>
        </ol>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-ink-700 mb-2">
            Client ID
          </label>
          <input
            id="clientId"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            placeholder="your-client-id.apps.googleusercontent.com"
            className="w-full px-4 py-3 bg-paper-50 border-2 border-hatch-600 rounded-lg text-ink-700 placeholder-hatch-600/50 focus:outline-none focus:border-hat-600 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="clientSecret" className="block text-sm font-medium text-ink-700 mb-2">
            Client Secret
          </label>
          <input
            id="clientSecret"
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            required
            placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-3 bg-paper-50 border-2 border-hatch-600 rounded-lg text-ink-700 placeholder-hatch-600/50 focus:outline-none focus:border-hat-600 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-paper-200 border-2 border-hatch-600 rounded-lg text-ink-700 font-medium hover:bg-paper-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !clientId || !clientSecret}
          className="flex-1 px-6 py-3 bg-hat-600 text-paper-100 rounded-lg font-medium hover:bg-hat-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Connecting..." : "Continue to Google"}
        </button>
      </div>
    </form>
  )
}

// Outlook Configuration Form
function OutlookConfigForm({ onClose }: { onClose: () => void }) {
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      sessionStorage.setItem("outlook_client_id", clientId)
      sessionStorage.setItem("outlook_client_secret", clientSecret)

      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
      })
      window.location.href = `/api/auth/outlook?${params.toString()}`
    } catch (error) {
      console.error("Failed to initiate Outlook OAuth:", error)
      alert("Failed to connect. Please check your credentials.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-paper-200 border-2 border-hatch-600 rounded-lg p-4">
        <p className="text-sm text-ink-700 font-medium mb-2">
          📚 Need OAuth credentials?
        </p>
        <ol className="text-xs text-hatch-600 space-y-1 list-decimal list-inside">
          <li>Go to <a href="https://portal.azure.com" target="_blank" className="text-hat-600 hover:underline">Azure Portal</a></li>
          <li>Register a new application</li>
          <li>Add redirect URI: <code className="bg-paper-100 px-1 rounded">http://localhost:3000/api/auth/outlook/callback</code></li>
          <li>Create a client secret under "Certificates & secrets"</li>
          <li>Add API permissions: IMAP.AccessAsUser.All, SMTP.Send, offline_access</li>
        </ol>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="outlookClientId" className="block text-sm font-medium text-ink-700 mb-2">
            Application (Client) ID
          </label>
          <input
            id="outlookClientId"
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full px-4 py-3 bg-paper-50 border-2 border-hatch-600 rounded-lg text-ink-700 placeholder-hatch-600/50 focus:outline-none focus:border-hat-600 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="outlookClientSecret" className="block text-sm font-medium text-ink-700 mb-2">
            Client Secret Value
          </label>
          <input
            id="outlookClientSecret"
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            required
            placeholder="Your client secret value"
            className="w-full px-4 py-3 bg-paper-50 border-2 border-hatch-600 rounded-lg text-ink-700 placeholder-hatch-600/50 focus:outline-none focus:border-hat-600 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-paper-200 border-2 border-hatch-600 rounded-lg text-ink-700 font-medium hover:bg-paper-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !clientId || !clientSecret}
          className="flex-1 px-6 py-3 bg-hat-600 text-paper-100 rounded-lg font-medium hover:bg-hat-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Connecting..." : "Continue to Microsoft"}
        </button>
      </div>
    </form>
  )
}

// Custom IMAP/SMTP Configuration Form
function CustomConfigForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [imapHost, setImapHost] = useState("")
  const [imapPort, setImapPort] = useState("993")
  const [smtpHost, setSmtpHost] = useState("")
  const [smtpPort, setSmtpPort] = useState("587")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          imapHost,
          imapPort: parseInt(imapPort),
          smtpHost,
          smtpPort: parseInt(smtpPort),
          password,
        }),
      })

      if (response.ok) {
        window.location.href = "/mail"
      } else {
        const data = await response.json()
        alert(data.error || "Failed to connect. Please check your credentials.")
      }
    } catch (error) {
      console.error("Failed to configure custom IMAP/SMTP:", error)
      alert("Failed to connect. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-paper-200 border-2 border-hatch-600 rounded-lg p-4">
        <p className="text-sm text-ink-700 font-medium mb-2">
          📚 Common Providers
        </p>
        <div className="text-xs text-hatch-600 space-y-1">
          <p><strong>iCloud:</strong> imap.mail.me.com:993, smtp.mail.me.com:587</p>
          <p><strong>Yahoo:</strong> imap.mail.yahoo.com:993, smtp.mail.yahoo.com:587</p>
          <p><strong>Note:</strong> Some providers require app-specific passwords</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-paper-50 border-2 border-hatch-600 rounded-lg text-ink-700 placeholder-hatch-600/50 focus:outline-none focus:border-hat-600 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="imapHost" className="block text-sm font-medium text-ink-700 mb-2">
              IMAP Host
            </label>
            <input
              id="imapHost"
              type="text"
              value={imapHost}
              onChange={(e) => setImapHost(e.target.value)}
              required
              placeholder="imap.example.com"
              className="w-full px-4 py-3 bg-paper-50 border-2 border-hatch-600 rounded-lg text-ink-700 placeholder-hatch-600/50 focus:outline-none focus:border-hat-600 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="imapPort" className="block text-sm font-medium text-ink-700 mb-2">
              IMAP Port
            </label>
            <input
              id="imapPort"
              type="number"
              value={imapPort}
              onChange={(e) => setImapPort(e.target.value)}
              required
              className="w-full px-4 py-3 bg-paper-50 border-2 border-hatch-600 rounded-lg text-ink-700 focus:outline-none focus:border-hat-600 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="smtpHost" className="block text-sm font-medium text-ink-700 mb-2">
              SMTP Host
            </label>
            <input
              id="smtpHost"
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              required
              placeholder="smtp.example.com"
              className="w-full px-4 py-3 bg-paper-50 border-2 border-hatch-600 rounded-lg text-ink-700 placeholder-hatch-600/50 focus:outline-none focus:border-hat-600 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="smtpPort" className="block text-sm font-medium text-ink-700 mb-2">
              SMTP Port
            </label>
            <input
              id="smtpPort"
              type="number"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              required
              className="w-full px-4 py-3 bg-paper-50 border-2 border-hatch-600 rounded-lg text-ink-700 focus:outline-none focus:border-hat-600 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-2">
            Password (or App-Specific Password)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Your email password"
            className="w-full px-4 py-3 bg-paper-50 border-2 border-hatch-600 rounded-lg text-ink-700 placeholder-hatch-600/50 focus:outline-none focus:border-hat-600 transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-paper-200 border-2 border-hatch-600 rounded-lg text-ink-700 font-medium hover:bg-paper-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-hat-600 text-paper-100 rounded-lg font-medium hover:bg-hat-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Connecting..." : "Connect Account"}
        </button>
      </div>
    </form>
  )
}
