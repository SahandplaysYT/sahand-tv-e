import { NextRequest, NextResponse } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'

function tmdbFetch(path: string, apiKey: string) {
  const sep = path.includes('?') ? '&' : '?'
  return fetch(`${TMDB_BASE}${path}${sep}api_key=${encodeURIComponent(apiKey)}&language=en-US`, {
    next: { revalidate: 300 },
  })
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'TMDB_API_KEY is not configured yet.' }, { status: 503 })
  }

  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') ?? 'movie' // 'movie' | 'tv'
  const id = searchParams.get('id')?.trim()
  const query = searchParams.get('query')?.trim()

  // --- TV: fetch season count for a specific show ---
  if (type === 'tv' && id) {
    const res = await tmdbFetch(`/tv/${encodeURIComponent(id)}`, apiKey)
    if (!res.ok) {
      return NextResponse.json({ error: 'TMDB could not load that TV show.' }, { status: res.status })
    }
    const data = await res.json()
    // Return number_of_seasons and number_of_episodes plus seasons array
    const seasons: { season_number: number; episode_count: number; name: string }[] =
      (data.seasons ?? [])
        .filter((s: { season_number: number }) => s.season_number > 0)
        .map((s: { season_number: number; episode_count: number; name: string }) => ({
          season_number: s.season_number,
          episode_count: s.episode_count,
          name: s.name,
        }))
    return NextResponse.json({ seasons })
  }

  // --- Movie: fetch trailer key for a specific movie ---
  if (type === 'movie' && id) {
    const res = await tmdbFetch(`/movie/${encodeURIComponent(id)}/videos`, apiKey)
    if (!res.ok) {
      return NextResponse.json({ error: 'TMDB could not load the trailer.' }, { status: res.status })
    }
    const data = await res.json()
    // kept for backward compat but no longer used by the player
    const trailer =
      (data.results ?? []).find(
        (v: { site: string; type: string; official?: boolean }) =>
          v.site === 'YouTube' && v.type === 'Trailer' && v.official,
      ) ??
      (data.results ?? []).find(
        (v: { site: string; type: string }) => v.site === 'YouTube' && v.type === 'Trailer',
      )
    return NextResponse.json({ trailerKey: trailer?.key ?? null })
  }

  // --- Search ---
  if (!query) {
    return NextResponse.json({ error: 'A search term is required.' }, { status: 400 })
  }

  const endpoint =
    type === 'tv'
      ? `/search/tv?query=${encodeURIComponent(query)}&include_adult=false&page=1`
      : `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&page=1`

  const res = await tmdbFetch(endpoint, apiKey)
  if (!res.ok) {
    return NextResponse.json({ error: 'TMDB could not complete that search.' }, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json({ results: data.results ?? [] })
}
