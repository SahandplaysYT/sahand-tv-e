import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sahand TV — Find your next great watch',
  description: 'Find and stream movies & TV shows instantly.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sahand TV',
    startupImage: '/apple-icon.png',
  },
  icons: {
    apple: '/apple-icon.png',
    icon: '/icon.svg',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#08090d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* iOS standalone mode — hides Safari UI when launched from home screen */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sahand TV" />
        {/* Prevent iOS from auto-linking phone numbers */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>{children}</body>
    </html>
  )
}
