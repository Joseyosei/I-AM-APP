export type Worldview = 'christian' | 'muslim' | 'jewish' | 'buddhist' | 'hindu' | 'spiritual' | 'secular' | 'exploring'

export interface RoadmapRequest {
  declaration: string
  worldview: Worldview
}

export interface Scripture {
  verse: string
  reference: string
  source: string // e.g. "Bible - NIV", "Quran", "Torah", "Buddhist teaching"
  why: string
}

export interface WatchResource {
  title: string
  creator: string
  why: string
}

export interface LearnResource {
  title: string
  platform: string
  why: string
}

export interface CommunityResource {
  name: string
  platform: string
  why: string
}

export interface DailyPractice {
  action: string
  duration: string
}

export interface Roadmap {
  affirmation: string
  wisdom: Scripture[]
  watch: WatchResource[]
  learn: LearnResource[]
  community: CommunityResource[]
  daily_practice: DailyPractice[]
}

export const WORLDVIEW_LABELS: Record<Worldview, { label: string; emoji: string; wisdomLabel: string }> = {
  christian:  { label: 'Christian',       emoji: '✝️',  wisdomLabel: 'Scripture' },
  muslim:     { label: 'Muslim',          emoji: '☪️',  wisdomLabel: 'Quran & Hadith' },
  jewish:     { label: 'Jewish',          emoji: '✡️',  wisdomLabel: 'Torah & Talmud' },
  buddhist:   { label: 'Buddhist',        emoji: '☸️',  wisdomLabel: 'Dharma' },
  hindu:      { label: 'Hindu',           emoji: '🕉️', wisdomLabel: 'Sacred Texts' },
  spiritual:  { label: 'Spiritual',       emoji: '✨',  wisdomLabel: 'Wisdom' },
  secular:    { label: 'Secular',         emoji: '🌍',  wisdomLabel: 'Philosophy & Science' },
  exploring:  { label: "I'm Exploring",   emoji: '🔍',  wisdomLabel: 'Wisdom Traditions' },
}
