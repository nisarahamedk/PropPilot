import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth"; // Import AuthProvider
import { SidebarLayout } from "@/components/shared/sidebar-layout";

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
          <SidebarLayout>
            {children}
          </SidebarLayout>
          {/* TODO: Add Footer component once created */}
        </AuthProvider>
      </body>
    </html>
  );
}