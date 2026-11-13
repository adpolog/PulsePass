import { Link } from 'react-router'
import { IconArrowLeft } from './icons'

export default function BackLink({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="mb-6 inline-flex items-center gap-2 font-mono text-xs tracking-wider text-muted uppercase hover:text-neon-300"
    >
      <IconArrowLeft className="size-4" />
      {children}
    </Link>
  )
}
