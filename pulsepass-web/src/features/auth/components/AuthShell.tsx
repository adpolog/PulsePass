import type { ReactNode } from 'react'
import { IconBolt } from '../../../components/icons'

interface AuthShellProps {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-16">
      <aside className="relative hidden overflow-hidden rounded-3xl border border-line bg-ink-950 p-8 lg:block">
        <div aria-hidden="true" className="absolute -top-24 -right-24 size-64 rounded-full bg-neon-400/20 blur-3xl" />
        <IconBolt className="size-8 text-neon-400" />
        <p className="mt-6 font-display text-3xl leading-tight font-bold">
          Tu próxima noche <span className="text-neon-400">empieza aquí.</span>
        </p>
        <ul className="mt-8 space-y-3 text-sm text-muted">
          <li>· Compra entradas en segundos</li>
          <li>· Tus tickets siempre a mano</li>
          <li>· Ingreso rápido con tu código</li>
        </ul>
      </aside>

      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <p className="font-mono text-xs tracking-widest text-neon-400 uppercase">// {eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <div className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">{footer}</div>
      </section>
    </div>
  )
}
