import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NSMS - National School Management System',
  description: 'Papua New Guinea National School Management System - SaaS Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
