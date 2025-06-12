import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth"; // Import AuthProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PropPilot",
  description: "AI-powered proposal generation assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider> {/* Wrap with AuthProvider */}
          {/* TODO: Add ThemeProvider if shadcn/ui requires it at this level */}
          {/* TODO: Add Header/Navbar component once created */}
          <main className="min-h-screen bg-background font-sans antialiased">
            {children}
          </main>
          {/* TODO: Add Footer component once created */}
        </AuthProvider>
      </body>
    </html>
  );
}
