import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AutoLawyer-MCP',
  description: 'Autonomous contract analysis with clause-level risk scoring & redlines',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

