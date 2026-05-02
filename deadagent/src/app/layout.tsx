import type { Metadata } from "next";
import { Web3Provider } from "@/components/providers/Web3Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeadAgent - The Last Will Protocol",
  description: "A decentralised dead man's switch enabling AI agent succession, digital estate inheritance, and encrypted will storage on Web3.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-obsidian text-ivory">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
