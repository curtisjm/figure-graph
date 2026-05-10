import type { Metadata } from "next";
import { Noto_Sans, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@shared/components/providers";
import { OnboardingGuard } from "@shared/components/onboarding-guard";
import { clerkAppearance } from "@shared/lib/clerk-appearance";
import { MainNav } from "@shared/components/main-nav";
import { cn } from "@shared/lib/utils";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "World of Floorcraft",
  description:
    "Interactive visualization of the ISTD ballroom dance syllabus",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(notoSans.variable, playfairDisplay.variable)}
      >
        <body className="font-sans antialiased">
          <Providers>
            <div className="min-h-screen flex flex-col">
              <MainNav />
              <main className="flex-1">
                <OnboardingGuard>{children}</OnboardingGuard>
              </main>
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
