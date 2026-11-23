import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  actions?: ReactNode
}

export default function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 font-mono text-xs tracking-widest text-neon-400 uppercase">// {eyebrow}</p>
        )}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      </div>
      {actions}
    </div>
  )
}
