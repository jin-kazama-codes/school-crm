import type { Metadata } from "next";
import { ReduxProvider } from "./providers";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "School CRM - The Skolar",
  description: "School CRM management system for managing students, teachers, employees, payments and more.",
  keywords: ["school", "crm", "management", "students", "teachers"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans h-full overflow-hidden", geist.variable)}>
      <body className="h-full overflow-hidden flex flex-col m-0 p-0">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
