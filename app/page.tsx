'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Clock3, Film, History as HistoryIcon, Play, Search, Trash2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MediaType = 'movie' | 'tv'

type Movie = {
  id: number
  title: string
  overview: string
  poster_path: string | null
  release_date: string
  vote_average: number
}

type TVShow = {
  id: number
  name: string
  overview: string
  poster_path: string | null
  first_air_date: string
  vote_average: number
}

type Season = {
  season_number: number
  episode_count: number
  name: string
}

type SelectedItem =
  | { type: 'movie'; item: Movie }
  | { type: 'tv'; item: TVShow }

type HistoryEntry = {
  key: string
  type: MediaType
  id: number
  title: string
  poster_path: string | null
  year: string
  season?: number
  episode?: number
  progress: number
  lastWatched: number
  timeline: string[]
  item: Movie | TVShow
}

type AppTab = MediaType | 'history'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'
const CINESRC_BASE = 'https://cinesrc.st/embed'

const PLACEHOLDER_MOVIES: Movie[] = [
  {
    id: 0,
    title: 'Discover your next favorite',
    overview: 'Search the world of cinema with Sahand TV.',
    poster_path: null,
    release_date: '',
    vote_average: 0,
  },
]

const PLACEHOLDER_TV: TVShow[] = [
  {
    id: 0,
    name: 'Find your next binge',
    overview: 'Search thousands of TV shows with Sahand TV.',
    poster_path: null,
    first_air_date: '',
    vote_average: 0,
  },
]

// ---------------------------------------------------------------------------
// Helper: build CineSrc embed URL
// ---------------------------------------------------------------------------

function cinesrcUrl(selected: SelectedItem, season: number, episode: number): string {
  if (selected.type === 'movie') {
    return `${CINESRC_BASE}/movie/${selected.item.id}?back=https://sahand.tv`
  }
  return `${CINESRC_BASE}/tv/${selected.item.id}?s=${season}&e=${episode}&back=https://sahand.tv`
}

// ---------------------------------------------------------------------------
// iOS "Add to Home Screen" banner
// ---------------------------------------------------------------------------

function IOSInstallGate() {
  return (
    <main className="ios-install-gate min-h-screen bg-[#08090d] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-md flex-col justify-center text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-[1.75rem] bg-[#e9a23b] text-4xl font-bold text-[#08090d] shadow-[0_0_60px_rgba(233,162,59,0.22)]">S</div>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-[#e9a23b]">Sahand TV</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Add the app to continue</h1>
        <p className="mt-4 text-sm leading-6 text-white/55">On iPhone and iPad, Sahand TV works as a Home Screen app so your watch history and full-screen player work properly.</p>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left">
          <div className="flex gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-bold">1</span><p className="text-sm leading-6 text-white/75">Tap the <strong className="text-white">Share</strong> button in Safari.</p></div>
          <div className="my-4 ml-4 h-5 border-l border-dashed border-white/20" />
          <div className="flex gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-bold">2</span><p className="text-sm leading-6 text-white/75">Choose <strong className="text-white">Add to Home Screen</strong>, then open Sahand TV from your Home Screen.</p></div>
        </div>
        <p className="mt-6 text-xs text-white/30">Already installed? Close this tab and open the Sahand TV icon.</p>
      </div>
    </main>
  )
}

function IOSInstallBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isInStandaloneMode = 'standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true
    if (isIOS && !isInStandaloneMode) {
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-[#1a1c25] p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          {/* App icon */}
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e9a23b] text-xl font-bold text-[#08090d]">
            S
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Add Sahand TV to your Home Screen</p>
            <p className="mt-1 text-xs leading-5 text-white/50">
              Tap the{' '}
              <span className="inline-flex items-center gap-0.5 rounded bg-white/10 px-1.5 py-0.5 text-white/70">
                {/* Share icon inline SVG */}
                <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M5.5 0v8M2 3l3.5-3L9 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 5H0v7h11V5h-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Share
              </span>{' '}
              button then <strong className="text-white/80">"Add to Home Screen"</strong>
            </p>
          </div>
        </div>
        {/* Notch arrow pointing down toward the share button */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="size-4 rotate-45 rounded-sm border-b border-r border-white/10 bg-[#1a1c25]" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Media card
// ---------------------------------------------------------------------------

function MediaCard({
  title,
  year,
  posterPath,
  rating,
  onClick,
}: {
  title: string
  year: string
  posterPath: string | null
  rating: number
  onClick: () => void
}) {
  return (
    <article className="group">
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e9a23b] focus-visible:ring-offset-4 focus-visible:ring-offset-[#08090d]"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-white/[0.06]">
          <img
            src={posterPath ? `${POSTER_BASE}${posterPath}` : '/placeholder.svg'}
            alt={`${title} poster`}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
          {rating > 0 && (
            <span className="absolute right-2 top-2 rounded-lg bg-[#08090d]/80 px-2 py-1 text-xs font-semibold text-[#f1b45d]">
              ★ {rating.toFixed(1)}
            </span>
          )}
          <span className="absolute inset-x-3 bottom-3 rounded-xl bg-[#e9a23b] px-3 py-2 text-center text-sm font-semibold text-[#08090d] opacity-0 transition group-hover:opacity-100">
            Watch now
          </span>
        </div>
        <h3 className="mt-3 truncate font-medium">{title}</h3>
        <p className="mt-1 text-sm text-white/35">{year || 'Unknown year'}</p>
      </button>
    </article>
  )
}

// ---------------------------------------------------------------------------
// Player modal
// ---------------------------------------------------------------------------

function PlayerModal({
  selected,
  onClose,
  resumeAt,
}: {
  selected: SelectedItem
  onClose: () => void
  resumeAt?: { season?: number; episode?: number }
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // TV state
  const [seasons, setSeasons] = useState<Season[]>([])
  const [seasonsLoading, setSeasonsLoading] = useState(false)
  const [currentSeason, setCurrentSeason] = useState(resumeAt?.season ?? 1)
  const [currentEpisode, setCurrentEpisode] = useState(resumeAt?.episode ?? 1)
  const [episodeCount, setEpisodeCount] = useState(1)

  // Fetch seasons when a TV show is selected
  useEffect(() => {
    if (selected.type !== 'tv') return
    setSeasonsLoading(true)
    fetch(`/api/movies?type=tv&id=${selected.item.id}`)
      .then((r) => r.json())
      .then((data: { seasons?: Season[] }) => {
        const list = data.seasons ?? []
        setSeasons(list)
        if (list.length > 0) {
          const savedSeason = resumeAt?.season && list.some((season) => season.season_number === resumeAt.season) ? resumeAt.season : list[0].season_number
          const savedSeasonData = list.find((season) => season.season_number === savedSeason) ?? list[0]
          setCurrentSeason(savedSeason)
          setEpisodeCount(savedSeasonData.episode_count)
          setCurrentEpisode(Math.min(resumeAt?.episode ?? 1, savedSeasonData.episode_count))
        }
      })
      .catch(() => setSeasons([]))
      .finally(() => setSeasonsLoading(false))
  }, [selected])

  // Update episode count when season changes
  useEffect(() => {
    const s = seasons.find((s) => s.season_number === currentSeason)
    if (s) {
      setEpisodeCount(s.episode_count)
      setCurrentEpisode(1)
    }
  }, [currentSeason, seasons])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const title = selected.type === 'movie' ? selected.item.title : selected.item.name
  const overview = selected.item.overview
  const year =
    selected.type === 'movie'
      ? selected.item.release_date?.slice(0, 4)
      : selected.item.first_air_date?.slice(0, 4)
  const rating = selected.item.vote_average

  const embedUrl = cinesrcUrl(selected, currentSeason, currentEpisode)

  return (
    <div
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-title"
        className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#11131a] shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e9a23b]">
              Now streaming
            </p>
            <h2 id="player-title" className="mt-1 text-xl font-semibold">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close player"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-xl text-white/70 transition hover:bg-white/15 hover:text-white"
          >
            ×
          </button>
        </div>

        {/* TV season / episode pickers */}
        {selected.type === 'tv' && (
          <div className="shrink-0 border-b border-white/[0.07] bg-white/[0.03] px-5 py-3 sm:px-7">
            {seasonsLoading ? (
              <p className="text-xs text-white/40">Loading seasons…</p>
            ) : seasons.length > 0 ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="season-select" className="text-xs font-medium text-white/50">
                    Season
                  </label>
                  <select
                    id="season-select"
                    value={currentSeason}
                    onChange={(e) => setCurrentSeason(Number(e.target.value))}
                    className="rounded-lg border border-white/10 bg-white/[0.08] px-3 py-1.5 text-sm text-white outline-none focus:border-[#e9a23b]"
                  >
                    {seasons.map((s) => (
                      <option key={s.season_number} value={s.season_number}>
                        {s.name || `Season ${s.season_number}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="episode-select" className="text-xs font-medium text-white/50">
                    Episode
                  </label>
                  <select
                    id="episode-select"
                    value={currentEpisode}
                    onChange={(e) => setCurrentEpisode(Number(e.target.value))}
                    className="rounded-lg border border-white/10 bg-white/[0.08] px-3 py-1.5 text-sm text-white outline-none focus:border-[#e9a23b]"
                  >
                    {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
                      <option key={ep} value={ep}>
                        Episode {ep}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="ml-auto text-xs text-white/30">
                  {episodeCount} episode{episodeCount !== 1 ? 's' : ''} in this season
                </span>
              </div>
            ) : (
              <p className="text-xs text-white/40">Season data unavailable — playing Season 1 Episode 1.</p>
            )}
          </div>
        )}

        {/* Player */}
        <div className="aspect-video w-full shrink-0 bg-black">
          <iframe
            key={embedUrl}
            ref={iframeRef}
            src={embedUrl}
            title={`Watch ${title}`}
            className="size-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Meta */}
        <div className="flex shrink-0 flex-col gap-3 overflow-y-auto px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-7">
          <p className="max-w-2xl text-sm leading-6 text-white/55">
            {overview || 'No description available.'}
          </p>
          <p className="shrink-0 text-sm text-white/40">
            {year || 'Unknown year'}
            {rating > 0 && ` · ★ ${rating.toFixed(1)}`}
          </p>
        </div>
      </section>
    </div>
  )
}

function HistoryPanel({ entries, onResume, onClear }: { entries: HistoryEntry[]; onResume: (entry: HistoryEntry) => void; onClear: () => void }) {
  if (!entries.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.025] px-6 py-20 text-center">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-[#e9a23b]/12 text-[#e9a23b]"><Clock3 size={28} /></div>
        <h2 className="text-2xl font-semibold">Your timeline starts here</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">Start watching something and Sahand TV will remember where you left off, even when you close the app.</p>
      </div>
    )
  }
  const current = entries[0]
  return (
    <div className="space-y-10">
      <section>
        <div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e9a23b]">Pick up where you left off</p><h2 className="mt-2 text-2xl font-semibold">Continue watching</h2></div><button onClick={onClear} className="flex items-center gap-2 text-xs text-white/35 hover:text-white"><Trash2 size={14} /> Clear history</button></div>
        <button onClick={() => onResume(current)} className="group flex w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] text-left transition hover:border-[#e9a23b]/50 sm:flex-row">
          <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-white/5 sm:w-72"><img src={current.poster_path ? `${POSTER_BASE}${current.poster_path}` : '/placeholder.svg'} alt={`${current.title} poster`} className="size-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" /><span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-[#e9a23b] px-3 py-1.5 text-xs font-bold text-[#08090d]"><Play size={12} fill="currentColor" /> Resume</span></div>
          <div className="flex flex-1 flex-col justify-center p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">{current.type === 'tv' ? `S${current.season} · E${current.episode}` : 'Movie'} · {current.year || 'Unknown year'}</p><h3 className="mt-2 text-2xl font-semibold">{current.title}</h3><p className="mt-2 text-sm text-white/40">Paused {new Date(current.lastWatched).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p><div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#e9a23b]" style={{ width: `${current.progress}%` }} /></div><p className="mt-2 text-xs text-white/35">{current.progress}% watched</p></div>
        </button>
      </section>
      <section><div className="mb-5 flex items-center gap-3"><HistoryIcon size={18} className="text-[#e9a23b]" /><h2 className="text-xl font-semibold">Watch timeline</h2></div><div className="divide-y divide-white/[0.07] rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5">{entries.map((entry) => <button key={entry.key} onClick={() => onResume(entry)} className="flex w-full items-center gap-4 py-4 text-left hover:bg-white/[0.03]"><div className="size-12 shrink-0 overflow-hidden rounded-xl bg-white/10"><img src={entry.poster_path ? `${POSTER_BASE}${entry.poster_path}` : '/placeholder.svg'} alt="" className="size-full object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate font-medium">{entry.title}</p><p className="mt-1 text-xs text-white/35">{entry.type === 'tv' ? `Season ${entry.season}, Episode ${entry.episode}` : 'Movie'} · {new Date(entry.lastWatched).toLocaleString()}</p></div><span className="text-xs text-[#e9a23b]">{entry.progress}%</span><Play size={15} className="text-white/25" /></button>)}</div></section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Page() {
  const [name, setName] = useState('')
  const [draftName, setDraftName] = useState('')
  const [requiresIOSInstall, setRequiresIOSInstall] = useState(false)

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
    setRequiresIOSInstall(isIOS && !isStandalone)
  }, [])

  // Tab
  const [activeTab, setActiveTab] = useState<AppTab>('movie')
  const [history, setHistory] = useState<HistoryEntry[]>([])

  // Search
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<Movie[]>(PLACEHOLDER_MOVIES)
  const [shows, setShows] = useState<TVShow[]>(PLACEHOLDER_TV)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchedQuery, setSearchedQuery] = useState('')

  // Player
  const [selected, setSelected] = useState<SelectedItem | null>(null)
  const [resumeAt, setResumeAt] = useState<{ season?: number; episode?: number }>()

  // Load saved name
  useEffect(() => {
    const saved = window.localStorage.getItem('sahand-tv-name')
    if (saved) setName(saved)
    const savedHistory = window.localStorage.getItem('sahand-tv-history')
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)) } catch { window.localStorage.removeItem('sahand-tv-history') }
    }
  }, [])

  function openMedia(selection: SelectedItem, resume?: HistoryEntry) {
    const item = selection.item
    const title = selection.type === 'movie' ? item.title : item.name
    const year = selection.type === 'movie' ? item.release_date?.slice(0, 4) : item.first_air_date?.slice(0, 4)
    const key = `${selection.type}-${item.id}`
    const existing = history.find((entry) => entry.key === key)
    const entry: HistoryEntry = { key, type: selection.type, id: item.id, title, poster_path: item.poster_path, year, season: resume?.season ?? existing?.season ?? 1, episode: resume?.episode ?? existing?.episode ?? 1, progress: Math.max(resume?.progress ?? existing?.progress ?? 8, 8), lastWatched: Date.now(), timeline: resume?.timeline ?? existing?.timeline ?? ['Opened title', 'Started watching'], item }
    const next = [entry, ...history.filter((item) => item.key !== key)].slice(0, 20)
    setHistory(next)
    window.localStorage.setItem('sahand-tv-history', JSON.stringify(next))
    setResumeAt(resume ? { season: resume.season, episode: resume.episode } : undefined)
    setSelected(selection)
  }

  function resumeEntry(entry: HistoryEntry) { openMedia({ type: entry.type, item: entry.item } as SelectedItem, entry) }

  function clearHistory() { setHistory([]); window.localStorage.removeItem('sahand-tv-history') }

  // Reset search state on tab change
  useEffect(() => {
    setQuery('')
    setError('')
    setSearchedQuery('')
    setMovies(PLACEHOLDER_MOVIES)
    setShows(PLACEHOLDER_TV)
  }, [activeTab])

  async function handleSearch(event?: FormEvent) {
    event?.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `/api/movies?type=${activeTab}&query=${encodeURIComponent(trimmed)}`,
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not find results.')
      if (activeTab === 'movie') setMovies(data.results ?? [])
      else setShows(data.results ?? [])
      setSearchedQuery(trimmed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function saveName(event: FormEvent) {
    event.preventDefault()
    const clean = draftName.trim()
    if (!clean) return
    window.localStorage.setItem('sahand-tv-name', clean)
    setName(clean)
  }

  // -------------------------------------------------------------------------
  // Name entry screen
  // -------------------------------------------------------------------------
  if (requiresIOSInstall) return <IOSInstallGate />
  if (!name) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#08090d] text-white">
        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-12 lg:px-16">
          <div className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-[#e9a23b]/15 blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <div className="mb-10 flex items-center gap-3 text-sm font-semibold tracking-[0.22em] text-[#f1b45d] uppercase">
              <span className="grid size-9 place-items-center rounded-xl bg-[#e9a23b] text-lg text-[#08090d]">S</span>
              Sahand TV
            </div>
            <p className="mb-4 text-sm font-medium tracking-[0.18em] text-white/45 uppercase">
              Your personal cinema
            </p>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-7xl">
              A better way to find what to watch.
            </h1>
            <p className="mt-7 max-w-md text-lg leading-8 text-white/55">
              Tell us your name and we&apos;ll make this little corner of the internet feel like yours.
            </p>
            <form onSubmit={saveName} className="mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="name">
                What&apos;s your name?
              </label>
              <input
                id="name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                autoFocus
                placeholder="What's your name?"
                className="h-14 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-base outline-none placeholder:text-white/30 focus:border-[#e9a23b]"
              />
              <button className="h-14 rounded-2xl bg-[#e9a23b] px-7 font-semibold text-[#08090d] transition hover:bg-[#f4bb6a]">
                Let&apos;s go
              </button>
            </form>
          </div>
          <div className="absolute bottom-10 right-12 hidden select-none text-right text-[11rem] font-black leading-none tracking-[-0.12em] text-white/[0.03] lg:block">
            STV
          </div>
        </div>
        <IOSInstallBanner />
      </main>
    )
  }

  // -------------------------------------------------------------------------
  // Current results to display
  // -------------------------------------------------------------------------
  const isPlaceholder =
    activeTab === 'movie'
      ? movies === PLACEHOLDER_MOVIES
      : shows === PLACEHOLDER_TV

  // -------------------------------------------------------------------------
  // Main app
  // -------------------------------------------------------------------------
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.08] bg-[#08090d]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-16">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-[#e9a23b] font-bold text-[#08090d]">
              S
            </span>
            <span className="font-semibold tracking-tight">Sahand TV</span>
          </div>
          {/* Tab nav */}
          <nav
            aria-label="Content type"
            className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm"
          >
            <button
              onClick={() => setActiveTab('movie')}
              className={`rounded-full px-5 py-2 font-medium transition ${
                activeTab === 'movie'
                  ? 'bg-white/10 text-white'
                  : 'text-white/45 hover:text-white/70'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`rounded-full px-5 py-2 font-medium transition ${
                activeTab === 'tv'
                  ? 'bg-white/10 text-white'
                  : 'text-white/45 hover:text-white/70'
              }`}
            >
              TV Shows
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 rounded-full px-5 py-2 font-medium transition ${
                activeTab === 'history' ? 'bg-[#e9a23b] text-[#08090d]' : 'text-white/45 hover:text-white/70'
              }`}
            >
              <HistoryIcon size={15} /> History
            </button>
          </nav>
          <div className="hidden text-right sm:block">
            <p className="text-xs text-white/35">Watching as</p>
            <p className="text-sm font-medium">{name}</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`relative mx-auto max-w-7xl overflow-hidden px-6 pb-12 pt-16 lg:px-16 lg:pt-24 ${activeTab === 'history' ? 'hidden' : ''}`}>
        <div className="pointer-events-none absolute right-0 top-0 size-[500px] rounded-full bg-[#e9a23b]/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-5 text-sm font-semibold tracking-[0.2em] text-[#e9a23b] uppercase">
            Good to see you, {name}
          </p>
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-7xl">
            Find your next
            <br />
            <span className="text-white/35">great watch.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/50">
            {activeTab === 'movie'
              ? 'Explore movies, rediscover classics, and stream instantly.'
              : 'Find your next series, pick a season and episode, and start watching.'}
          </p>
        </div>
        <form
          onSubmit={handleSearch}
          className="relative z-10 mt-10 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-2 focus-within:border-[#e9a23b]/70"
        >
          <span className="pl-4 text-xl text-white/40">⌕</span>
          <label className="sr-only" htmlFor="media-search">
            Search for {activeTab === 'movie' ? 'movies' : 'TV shows'}
          </label>
          <input
            id="media-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search for a ${activeTab === 'movie' ? 'movie' : 'TV show'}…`}
            className="h-12 min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-white/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#e9a23b] px-5 py-3 text-sm font-semibold text-[#08090d] disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      </section>

      {/* Results grid */}
      {activeTab === 'history' ? (
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-14 lg:px-16"><HistoryPanel entries={history} onResume={resumeEntry} onClear={clearHistory} /></section>
      ) : (
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-white/35 uppercase">
              Your results
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {searchedQuery
                ? `Results for "${searchedQuery}"`
                : activeTab === 'movie'
                ? 'Search for a movie'
                : 'Search for a TV show'}
            </h2>
          </div>
          {!isPlaceholder &&
            (activeTab === 'movie' ? movies.length : shows.length) > 1 && (
              <p className="text-sm text-white/35">
                {activeTab === 'movie' ? movies.length : shows.length} titles
              </p>
            )}
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-400/25 bg-red-400/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {isPlaceholder ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-16 text-center">
            <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[#e9a23b]/15 text-2xl text-[#e9a23b]">
              ✦
            </div>
            <h3 className="text-xl font-semibold">
              {activeTab === 'movie' ? 'What are you in the mood for?' : 'Find your next series'}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/40">
              {activeTab === 'movie'
                ? 'Search for a title, actor, or genre above and stream it right here.'
                : 'Search for a TV show above — pick a season and episode, and start watching.'}
            </p>
          </div>
        ) : activeTab === 'movie' ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {movies.map((movie) => (
              <MediaCard
                key={movie.id}
                title={movie.title}
                year={movie.release_date?.slice(0, 4)}
                posterPath={movie.poster_path}
                rating={movie.vote_average}
                onClick={() => openMedia({ type: 'movie', item: movie })}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {shows.map((show) => (
              <MediaCard
                key={show.id}
                title={show.name}
                year={show.first_air_date?.slice(0, 4)}
                posterPath={show.poster_path}
                rating={show.vote_average}
                onClick={() => openMedia({ type: 'tv', item: show })}
              />
            ))}
          </div>
        )}
      </section>
      )}

      {/* Player modal */}
  {selected && (
          <PlayerModal selected={selected} resumeAt={resumeAt} onClose={() => { setSelected(null); setResumeAt(undefined) }} />
        )}

      {/* iOS / iPadOS install prompt */}
      <IOSInstallBanner />

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-6 py-8 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>Movie and TV data provided by TMDB. Streaming powered by CineSrc.</p>
          <div className="flex gap-4">
            <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="text-[#e9a23b] hover:underline">
              TMDB
            </a>
            <a href="https://cinesrc.st" target="_blank" rel="noreferrer" className="text-[#e9a23b] hover:underline">
              CineSrc
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
