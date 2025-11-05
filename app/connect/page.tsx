"use client"

export default function ConnectPage() {
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
            className="w-full bg-paper-100 border-hatched rounded-xl p-8 hover:bg-paper-50 transition-all text-left paper-grain group soft-lift relative overflow-hidden"
            onClick={() => {
              // TODO: Implement Gmail OAuth
              console.log("Gmail OAuth")
            }}
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
                  Sign in with your Google account
                </p>
              </div>
              <div className="flex-shrink-0 text-hat-600 group-hover:text-hat-700 group-hover:translate-x-1 transition-all">
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
              </div>
            </div>
          </button>

          {/* Outlook Card */}
          <button
            className="w-full bg-paper-100 border-hatched rounded-xl p-8 hover:bg-paper-50 transition-all text-left paper-grain group soft-lift relative overflow-hidden"
            onClick={() => {
              // TODO: Implement Outlook OAuth
              console.log("Outlook OAuth")
            }}
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
                  Sign in with your Microsoft account
                </p>
              </div>
              <div className="flex-shrink-0 text-hat-600 group-hover:text-hat-700 group-hover:translate-x-1 transition-all">
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
            className="w-full bg-paper-100 border-hatched rounded-xl p-7 hover:bg-paper-50 transition-all text-left paper-grain group relative overflow-hidden"
            onClick={() => {
              // TODO: Navigate to IMAP/SMTP setup
              console.log("IMAP/SMTP setup")
            }}
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
    </div>
  )
}
