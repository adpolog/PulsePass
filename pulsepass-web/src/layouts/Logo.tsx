import { Link } from 'react-router'
import { IconMusic } from '../components/icons'
import { ROUTES } from '../lib/routes'

export default function Logo() {
  return (
    <Link to={ROUTES.home} className="group flex items-center gap-2 rounded-full">
      <span className="grid size-8 place-items-center rounded-full border border-neon-400 text-neon-400 transition group-hover:bg-neon-400 group-hover:text-ink-950">
        <IconMusic className="size-4" />
      </span>
      <span className="font-display text-lg font-bold">
        Pulse<span className="text-neon-400">Pass</span>
      </span>
    </Link>
  )
}
