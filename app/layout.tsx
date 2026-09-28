import type { Metadata } from 'next';
import './globals.css';
import { ReviewerProvider } from '@/context/ReviewerContext';

export const metadata: Metadata = {
  title: 'AWS Developer Associate Power Reviewer ⚡',
  description: 'Study for the AWS Certified Developer Associate exam with your own Excel reviewer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <ReviewerProvider>
          {children}
        </ReviewerProvider>
      </body>
    </html>
  );
}
