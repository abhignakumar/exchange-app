import type { Metadata } from "next";
import "./globals.css";
import { AppBar } from "./components/AppBar";

export const metadata: Metadata = {
  title: "Exchange App",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppBar />
        {children}
      </body>
    </html>
  );
}
