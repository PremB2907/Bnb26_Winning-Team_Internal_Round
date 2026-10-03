import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Re:Learn | Adaptive Multimodal Learning Environment",
  description: "Don't just detect wrong answers. Understand why. Re:Learn diagnoses learning misconceptions and provides targeted interventions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
