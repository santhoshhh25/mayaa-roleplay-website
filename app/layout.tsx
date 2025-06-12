import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron, Roboto } from 'next/font/google'
import React from 'react'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap'
})

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'MAYAAALOKAM ROLEPLAY - Premium FiveM RP Server',
  description: 'Join India\'s most immersive GTA V RP experience. Your story. Your city. Your rules. Premium Telugu community server powered by Mayaavi Games.',
  keywords: 'FiveM, RP, Roleplay, GTA V, Gaming, Telugu, Mayaavi Games, MAYAAALOKAM',
  authors: [{ name: 'Mayaavi Games' }],
  robots: 'index, follow',
  metadataBase: new URL('https://mayaaalokam.com'),
  openGraph: {
    title: 'MAYAAALOKAM ROLEPLAY - Premium FiveM RP Server',
    description: 'Join India\'s most immersive GTA V RP experience. Your story. Your city. Your rules.',
    type: 'website',
    locale: 'en_US',
    siteName: 'MAYAAALOKAM ROLEPLAY',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAYAAALOKAM ROLEPLAY - Premium FiveM RP Server',
    description: 'Join India\'s most immersive GTA V RP experience. Your story. Your city. Your rules.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://i.ibb.co" />
        <link rel="preconnect" href="https://mayaavigames.com" />
        <link rel="dns-prefetch" href="https://discord.gg" />
        {/* Preload critical first slideshow image */}
        <link rel="preload" href="/images/slideshow/wallhaven-1k8r79.png" as="image" />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} ${roboto.variable} font-sans bg-dark text-white antialiased overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
} 