import './globals.css'

export const metadata = {
  title: 'Tradie Web',
  description: 'Tradie Web Application',
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