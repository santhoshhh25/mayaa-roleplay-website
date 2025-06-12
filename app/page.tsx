'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import AboutPreview from './components/AboutPreview'
import CallToAction from './components/CallToAction'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'
import SectionDivider from './components/SectionDivider'

export default function Home() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-dark">
        <Navbar />
        <Hero />
        
        <SectionDivider variant="minimal" />
        <Features />
        
        <SectionDivider variant="minimal" />
        <AboutPreview />
        
        <SectionDivider variant="minimal" />
        <CallToAction />
        
        <SectionDivider variant="minimal" />
        <Footer />
      </main>
    </PageTransition>
  )
} 