import { clsx } from 'clsx'

type AvatarSize = 'sm' | 'md' | 'lg'

const sizes: Record<AvatarSize, string> = {
  sm: 'size-9 text-xs',
  md: 'size-14 text-base',
  lg: 'size-24 text-2xl',
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

interface ArtistAvatarProps {
  name: string
  size?: AvatarSize
}

export default function ArtistAvatar({ name, size = 'md' }: ArtistAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'grid shrink-0 place-items-center rounded-full border border-neon-700 bg-neon-950 font-mono font-bold text-neon-300',
        sizes[size],
      )}
    >
      {initials(name)}
    </span>
  )
}
