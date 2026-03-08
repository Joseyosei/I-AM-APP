'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '../ThemeProvider'
import styles from './signin.module.css'

const SCRIPTURES = [
  { quote: 'Before I formed you in the womb\nI knew you.', reference: '— Jeremiah 1:5' },
  { quote: 'For I know the plans I have for you,\nplans to prosper you and not to harm you.', reference: '— Jeremiah 29:11' },
  { quote: 'You are fearfully and wonderfully made.', reference: '— Psalm 139:14' },
  { quote: 'Trust in the Lord with all your heart\nand lean not on your own understanding.', reference: '— Proverbs 3:5' },
  { quote: 'I can do all things through him\nwho gives me strength.', reference: '— Philippians 4:13' },
]

const SCRIPTURE_INTERVAL_MS = 6000
const FADE_DURATION_MS = 400

export default function SignInPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [scriptureIndex, setScriptureIndex] = useState(0)
  const [scriptureVisible, setScriptureVisible] = useState(true)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const interval = setInterval(() => {
      setScriptureVisible(false)
      timeout = setTimeout(() => {
        setScriptureIndex((i) => (i + 1) % SCRIPTURES.length)
        setScriptureVisible(true)
      }, FADE_DURATION_MS)
    }, SCRIPTURE_INTERVAL_MS)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  const current = SCRIPTURES[scriptureIndex]
  const quoteLines = current.quote.split('\n')

  return (
    <div className={styles.page}>
      <button
        className={styles.themeToggleTopRight}
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      {/* Left — visual */}
      <div className={styles.visual}>
        <video
          className={styles.videoBg}
          src="/abstract-dark-particles.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className={styles.videoOverlay} />
        <div className={styles.visualText}>
          <div
            className={styles.scriptureSlide}
            style={{ opacity: scriptureVisible ? 1 : 0 }}
          >
            <p className={styles.visualQuote}>
              "{quoteLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < quoteLines.length - 1 && <br />}
                </span>
              ))}"
            </p>
            <p className={styles.visualRef}>{current.reference}</p>
          </div>
        </div>
      </div>

      {/* Right — sign in */}
      <div className={styles.panel}>
        <div className={styles.inner}>
          <img src="/iam-logo.svg" alt="I AM" className={styles.logoImg} />

          <h1 className={styles.title}>Welcome.</h1>
          <p className={styles.subtitle}>
            Declare who you are.<br />Receive your roadmap.
          </p>

          <div className={styles.buttons}>
            <button
              className={styles.btnGuest}
              onClick={() => router.push('/')}
            >
              Continue as Guest
            </button>
          </div>

          <p className={styles.terms}>
            By continuing, you agree to our{' '}
            <a href="/terms">Terms</a> and{' '}
            <a href="/privacy">Privacy Policy</a>.
          </p>

          <p className={styles.tagline}>
            For every person on every path.
          </p>
        </div>
      </div>
    </div>
  )
}
