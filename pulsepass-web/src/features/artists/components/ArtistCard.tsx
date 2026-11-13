import { Link } from 'react-router'
import { ROUTES } from '../../../lib/routes'
import type { ArtistResponse } from '../types'
import ArtistAvatar from './ArtistAvatar'

export default function ArtistCard({ artist }: { artist: ArtistResponse }) {
  return (
    <Link
      to={ROUTES.artist(artist.id)}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-neon-400 hover:shadow-neon"
    >
      <ArtistAvatar name={artist.stageName} />
      <div className="min-w-0">
        <p className="truncate font-display font-semibold group-hover:text-neon-300">{artist.stageName}</p>
        <p className="truncate font-mono text-xs text-muted">
          {[artist.genre, artist.country].filter(Boolean).join(' · ') || 'Artista'}
        </p>
      </div>
    </Link>
  )
}
