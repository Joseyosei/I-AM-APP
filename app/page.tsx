'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Roadmap, Worldview, WORLDVIEW_LABELS } from '@/lib/types'
import { useTheme } from './ThemeProvider'
import styles from './page.module.css'

type Screen = 'declaration' | 'worldview' | 'loading' | 'roadmap'

const LOADING_STEPS = [
  { icon: '📖', label: 'Searching wisdom traditions...' },
  { icon: '🎥', label: 'Curating your resources...' },
  { icon: '👥', label: 'Finding your community...' },
  { icon: '✦',  label: 'Building your roadmap...' },
]

const TYPEWRITER_PHRASES = [
  'a young entrepreneur finding my purpose...',
  'a woman building something meaningful...',
  'a student who doesn\'t know where to start...',
  'someone learning to trust the process...',
]

const PLATFORM_URLS: Record<string, string> = {
  'YouTube': 'https://youtube.com',
  'youtube': 'https://youtube.com',
  'X': 'https://x.com',
  'Twitter': 'https://x.com',
  'Instagram': 'https://instagram.com',
  'instagram': 'https://instagram.com',
  'Facebook': 'https://facebook.com',
  'Discord': 'https://discord.com',
  'Reddit': 'https://reddit.com',
  'LinkedIn': 'https://linkedin.com',
  'Slack': 'https://slack.com',
  'Podcast': 'https://podcasts.google.com',
  'Website': 'https://google.com',
}

function getPlatformUrl(platform: string, name: string): string {
  const normalized = platform.trim()
  const url = PLATFORM_URLS[normalized] ?? PLATFORM_URLS[normalized.toLowerCase()]
  if (url) return url
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + platform)}`
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('declaration')
  const [declaration, setDeclaration] = useState('')
  const [worldview, setWorldview] = useState<Worldview | null>(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [typewriterText, setTypewriterText] = useState('')
  const [typewriterPhraseIndex, setTypewriterPhraseIndex] = useState(0)
  const [typewriterCharIndex, setTypewriterCharIndex] = useState(0)
  const [typewriterDeleting, setTypewriterDeleting] = useState(false)
  const [typewriterPaused, setTypewriterPaused] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Typewriter animation
  useEffect(() => {
    if (screen !== 'declaration') return
    const phrase = TYPEWRITER_PHRASES[typewriterPhraseIndex]
    if (typewriterPaused) return

    const timer = setTimeout(() => {
      if (typewriterDeleting) {
        if (typewriterCharIndex === 0) {
          setTypewriterDeleting(false)
          setTypewriterPhraseIndex((i) => (i + 1) % TYPEWRITER_PHRASES.length)
          setTypewriterPaused(true)
          return
        }
        setTypewriterCharIndex((i) => i - 1)
        setTypewriterText(phrase.slice(0, typewriterCharIndex - 1))
      } else {
        if (typewriterCharIndex >= phrase.length) {
          setTypewriterPaused(true)
          return
        }
        setTypewriterCharIndex((i) => i + 1)
        setTypewriterText(phrase.slice(0, typewriterCharIndex + 1))
      }
    }, typewriterDeleting ? 30 : 50)

    return () => clearTimeout(timer)
  }, [screen, typewriterPhraseIndex, typewriterCharIndex, typewriterDeleting, typewriterPaused])

  // Pause 2s when full, brief pause when empty
  useEffect(() => {
    if (screen !== 'declaration' || !typewriterPaused) return
    const phrase = TYPEWRITER_PHRASES[typewriterPhraseIndex]
    const isFull = typewriterCharIndex >= phrase.length && !typewriterDeleting
    const delay = isFull ? 2000 : 500
    const timer = setTimeout(() => {
      setTypewriterPaused(false)
      if (isFull) setTypewriterDeleting(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [screen, typewriterPaused, typewriterPhraseIndex, typewriterCharIndex, typewriterDeleting])

  // Voice input (Web Speech API)
  async function startVoiceInput() {
    if (typeof window === 'undefined') return
    setError('')
    const win = window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }
    const SpeechRecognitionAPI = win.SpeechRecognition ?? win.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      setError('Voice input is not supported in your browser. Try Chrome or Edge.')
      return
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Microphone access denied. Please allow microphone in your browser.')
      return
    }
    const recognition = new SpeechRecognitionAPI() as SpeechRecognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript
      }
      if (transcript) {
        // Only append final results to avoid duplicates from interim
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            setDeclaration((prev) => {
              const combined = prev + e.results[i][0].transcript
              return combined.slice(0, 400)
            })
          }
        }
        // Reset silence timer on any speech
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(stopVoiceInput, 10000)
      }
    }
    recognition.onend = () => {
      setIsRecording(false)
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
    }
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      setIsRecording(false)
      const messages: Record<string, string> = {
        'not-allowed': 'Microphone access denied. Please allow microphone in your browser settings.',
        'no-speech': 'No speech detected. Try speaking again.',
        'audio-capture': 'No microphone found.',
        'network': 'Network error. Check your connection.',
        'aborted': 'Recording stopped.',
      }
      const msg = messages[e.error] ?? 'Speech recognition failed. Try again.'
      setError(msg)
    }
    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    // Stop after 10s if no speech
    silenceTimerRef.current = setTimeout(stopVoiceInput, 10000)
  }

  function stopVoiceInput() {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }

  function toggleVoiceInput() {
    if (isRecording) stopVoiceInput()
    else startVoiceInput()
  }

  // Redirect to sign in if not authenticated (disabled for direct access)
  // useEffect(() => {
  //   if (status === 'unauthenticated') router.push('/signin')
  // }, [status, router])

  // if (status === 'loading' || status === 'unauthenticated') {
  //   return (
  //     <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--navy)' }}>
  //       <div style={{ width: 40, height: 40, border: '2px solid rgba(201,168,76,0.2)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  //     </div>
  //   )
  // }

  const worldviewOptions = Object.entries(WORLDVIEW_LABELS) as [Worldview, typeof WORLDVIEW_LABELS[Worldview]][]

  function goToWorldview() {
    if (!declaration.trim() || declaration.trim().length < 5) {
      setError('Please tell us a little more about who you are.')
      return
    }
    setError('')
    setScreen('worldview')
  }

  async function buildRoadmap() {
    if (!worldview) return
    setScreen('loading')
    setLoadingStep(0)

    // Animate loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= LOADING_STEPS.length - 1) { clearInterval(stepInterval); return prev }
        return prev + 1
      })
    }, 2200)

    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ declaration: declaration.trim(), worldview }),
      })

      const data = await res.json()
      clearInterval(stepInterval)

      if (!res.ok) throw new Error(data.error || 'Something went wrong.')

      setRoadmap(data.roadmap)
      setScreen('roadmap')
    } catch (err: unknown) {
      clearInterval(stepInterval)
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setScreen('declaration')
    }
  }

  function restart() {
    setDeclaration('')
    setWorldview(null)
    setRoadmap(null)
    setError('')
    setLoadingStep(0)
    setScreen('declaration')
  }

  const wv = worldview ? WORLDVIEW_LABELS[worldview] : null
  const { theme, toggleTheme } = useTheme()

  return (
    <main className={styles.main}>

      {/* ===== USER NAV ===== */}
      <nav className={styles.nav}>
        <img src="/iam-logo.svg" alt="I AM" className={styles.navLogoImg} />
        <div className={styles.navUser}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {session?.user?.image && (
            <img src={session.user.image} alt="" className={styles.avatar} />
          )}
          <span className={styles.navName}>{session?.user?.name?.split(' ')[0]}</span>
          <button className={styles.signOutBtn} onClick={() => signOut({ callbackUrl: '/signin' })}>
            Sign out
          </button>
        </div>
      </nav>

      {/* ===== SCREEN 1: DECLARATION ===== */}
      {screen === 'declaration' && (
        <div className={`${styles.screen} ${styles.screenWithVideo}`}>
          <video
            className={styles.screenVideoBg}
            src="/ethereal-golden-particles.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className={styles.screenVideoOverlay} />
          <div className={styles.screenContent}>
          <img src="/iam-logo.svg" alt="I AM" className={styles.logoImg} />

          <h1 className={styles.heroTitle}>
            Who Are<br /><em>You?</em>
          </h1>
          <p className={styles.heroSub}>Declare it. Build your roadmap.</p>

          <div className={styles.declarationCard}>
            <span className={styles.iamPrefix}>I am...</span>
            <div className={styles.textareaRow}>
              <div className={styles.textareaWrapper}>
              {!declaration && (
                <div className={styles.typewriterOverlay} aria-hidden>
                  {typewriterText}
                  <span className={styles.typewriterCursor}>|</span>
                </div>
              )}
              <textarea
                ref={textareaRef}
                className={styles.textarea}
                value={declaration}
                onChange={e => setDeclaration(e.target.value)}
                placeholder=""
                rows={4}
                maxLength={400}
              />
            </div>
              <button
                type="button"
                className={`${styles.micBtn} ${isRecording ? styles.micBtnRecording : ''}`}
                onClick={toggleVoiceInput}
                aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                <MicIcon />
                {isRecording && <span className={styles.micPulse} />}
              </button>
            </div>
            <div className={styles.charCount}>{declaration.length} / 400</div>
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <button className={styles.btnPrimary} onClick={goToWorldview}>
            Continue →
          </button>

          <p className={styles.footer}>
            For every person on every path
          </p>
          </div>
        </div>
      )}

      {/* ===== SCREEN 2: WORLDVIEW ===== */}
      {screen === 'worldview' && (
        <div className={styles.screen}>
          <img src="/iam-logo.svg" alt="I AM" className={styles.logoImg} />

          <h2 className={styles.worldviewTitle}>What guides you?</h2>
          <p className={styles.worldviewSub}>
            We'll personalise your roadmap to your worldview.
          </p>

          <div className={styles.worldviewGrid}>
            {worldviewOptions.map(([key, val]) => (
              <button
                key={key}
                className={`${styles.worldviewBtn} ${worldview === key ? styles.worldviewBtnActive : ''}`}
                onClick={() => setWorldview(key)}
              >
                <span className={styles.worldviewEmoji}>{val.emoji}</span>
                <span className={styles.worldviewLabel}>{val.label}</span>
              </button>
            ))}
          </div>

          <button
            className={styles.btnPrimary}
            onClick={buildRoadmap}
            disabled={!worldview}
            style={{ opacity: worldview ? 1 : 0.4, cursor: worldview ? 'pointer' : 'not-allowed' }}
          >
            Build My Roadmap →
          </button>

          <button className={styles.btnBack} onClick={() => setScreen('declaration')}>
            ← Back
          </button>
        </div>
      )}

      {/* ===== SCREEN 3: LOADING ===== */}
      {screen === 'loading' && (
        <div className={`${styles.screen} ${styles.loadingScreen}`}>
          <div className={styles.ringContainer}>
            <svg className={styles.ringSvg} viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="2"/>
              <circle cx="70" cy="70" r="62" fill="none" stroke="url(#goldGrad)" strokeWidth="2"
                strokeDasharray="390" strokeDashoffset="290" strokeLinecap="round"/>
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C9A84C"/>
                  <stop offset="100%" stopColor="transparent"/>
                </linearGradient>
              </defs>
            </svg>
            <div className={styles.ringCenter}>I AM</div>
          </div>

          <div className={styles.loadingSteps}>
            {LOADING_STEPS.map((step, i) => (
              <div
                key={i}
                className={`${styles.loadingStep} ${i === loadingStep ? styles.stepActive : ''} ${i < loadingStep ? styles.stepDone : ''}`}
              >
                <span className={styles.stepIcon}>{step.icon}</span>
                <span>{step.label}</span>
                <div className={styles.stepDot} />
              </div>
            ))}
          </div>

          <p className={styles.loadingVerse}>
            "For I know the plans I have for you..."<br />
            <em>— Jeremiah 29:11</em>
          </p>
        </div>
      )}

      {/* ===== SCREEN 4: ROADMAP ===== */}
      {screen === 'roadmap' && roadmap && (
        <div className={styles.roadmapScreen}>
          {/* Header */}
          <div className={styles.roadmapHeader}>
            <img src="/iam-logo.svg" alt="I AM" className={styles.logoImgHeader} />
            <div className={styles.declarationDisplay}>
              <em style={{ color: 'var(--gold)' }}>I am </em>
              {declaration}
            </div>
            {wv && (
              <div className={styles.worldviewBadge}>
                {wv.emoji} {wv.label}
              </div>
            )}
          </div>

          <div className={styles.roadmapBody}>
            {/* Affirmation */}
            <div className={styles.affirmationCard}>
              <p className={styles.affirmationText}>{roadmap.affirmation}</p>
            </div>

            {/* Wisdom */}
            <RoadmapSection
              icon="📖"
              title={wv?.wisdomLabel || 'Wisdom'}
            >
              {roadmap.wisdom.map((w, i) => (
                <a
                  key={i}
                  className={styles.wisdomCard}
                  href={`https://www.google.com/search?q=${encodeURIComponent(w.verse + ' ' + w.reference)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className={styles.verseText}>"{w.verse}"</p>
                  <p className={styles.verseRef}>{w.reference}</p>
                  <p className={styles.resourceMeta}>{w.source}</p>
                  <p className={styles.resourceWhy}>{w.why}</p>
                </a>
              ))}
            </RoadmapSection>

            {/* Watch */}
            <RoadmapSection icon="🎥" title="Watch">
              {roadmap.watch.map((w, i) => (
                <a
                  key={i}
                  className={styles.resourceCard}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(w.title + ' ' + w.creator)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.resourceTitle}>{w.title}</div>
                  <div className={styles.resourceMeta}>🎥 {w.creator} — Search on YouTube ↗</div>
                  <div className={styles.resourceWhy}>{w.why}</div>
                </a>
              ))}
            </RoadmapSection>

            {/* Learn */}
            <RoadmapSection icon="📚" title="Learn">
              {roadmap.learn.map((l, i) => (
                <a
                  key={i}
                  className={styles.resourceCard}
                  href={`https://www.google.com/search?q=${encodeURIComponent(l.title + ' ' + l.platform)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.resourceTitle}>{l.title}</div>
                  <div className={styles.resourceMeta}>📚 {l.platform}</div>
                  <div className={styles.resourceWhy}>{l.why}</div>
                </a>
              ))}
            </RoadmapSection>

            {/* Community */}
            <RoadmapSection icon="👥" title="Community">
              {roadmap.community.map((c, i) => (
                <a
                  key={i}
                  className={styles.resourceCard}
                  href={getPlatformUrl(c.platform, c.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className={styles.resourceTitle}>{c.name}</div>
                  <div className={styles.resourceMeta}>👥 {c.platform}</div>
                  <div className={styles.resourceWhy}>{c.why}</div>
                </a>
              ))}
            </RoadmapSection>

            {/* Daily Practice */}
            <RoadmapSection icon="✅" title="Daily Practice">
              {roadmap.daily_practice.map((p, i) => (
                <div key={i} className={styles.practiceCard}>
                  <div className={styles.practiceNumber}>{i + 1}</div>
                  <div className={styles.practiceText}>{p.action}</div>
                  <div className={styles.practiceDuration}>{p.duration}</div>
                </div>
              ))}
            </RoadmapSection>

            <button className={styles.btnRestart} onClick={restart}>
              ← New Declaration
            </button>
          </div>
        </div>
      )}

    </main>
  )
}

function RoadmapSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{icon}</span>
        <span className={styles.sectionTitle}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}
