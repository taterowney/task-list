import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Lato } from "next/font/google";
import "./globals.css";

const LatoFont = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["400", "700"],
});


export const metadata: Metadata = {
  title: "To-do list",
  description: "Organization and focus tools made with React and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${LatoFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
