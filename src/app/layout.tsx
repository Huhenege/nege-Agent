import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SolarOmega | Retail Store Task Platform",
  description: "Manage store photo tasks and monitor results efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-gray-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
