import type { Metadata } from "next";
import { ReduxProvider } from "./providers";
import "./globals.css";

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
    <html lang="en">
      <body>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
