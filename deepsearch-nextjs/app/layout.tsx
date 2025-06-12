import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpotifyAuthProvider } from "./context/SpotifyAuthContext";
import { ReduxProvider } from "./store/ReduxProvider";
import ConditionalAgent from "./components/ConditionalAgent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeepSearch - AI-Powered Music Discovery",
  description: "Discover and manage your music with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundColor: "#1e1e1e",
          color: "#a8f0e8",
          margin: 0,
          padding: 0,
          minHeight: "100vh",
        }}
      >
        <ReduxProvider>
          <SpotifyAuthProvider>
            {children}
            <ConditionalAgent />
          </SpotifyAuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
