import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "gyattmail",
  description: "Open-source email client with views, filters, and AI",
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
        </ThemeProvider>
      </body>
    </html>
  );
}
