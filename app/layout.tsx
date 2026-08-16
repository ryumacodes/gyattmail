import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://gyatt.email'),
  title: { default: 'gyatt.email — Email, carved for focus', template: '%s | gyatt.email' },
  description: 'An open-source, not-for-profit email client with thoughtful AI tools, powerful search, and a calm inbox.',
  keywords: ['open-source email client', 'AI email client', 'email productivity', 'Gmail client', 'Outlook client'],
  category: 'productivity',
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'gyattmail', statusBarStyle: 'default' },
};

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#6f523b' };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "!bg-card !text-card-foreground !border-2 !border-border",
            }}
          />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
