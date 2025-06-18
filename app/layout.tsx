import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const font = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chatatoe",
  description: "Chatatoe, A new Discord",
  icons: {
    icon: '/favicon.ico'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <body className={cn(font.className, "bg-white dark:bg-[#292929]")}>
          <main className="flex-grow" />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="discord-theme"
          >
            <SocketProvider>
              <ModalProvider/>
                <QueryProvider>{children}</QueryProvider>
            </SocketProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
