import { categoryIcons } from '../categories'
import type { EventCategory } from '../types'

export default function CategoryLabel({ category }: { category: EventCategory }) {
  const Icon = categoryIcons[category]
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-muted uppercase">
      <Icon className="size-3.5 text-neon-400" />
      {category}
    </span>
  )
}
