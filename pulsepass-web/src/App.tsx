// Pantalla de prueba temporal (PRD §29, etapa 2): verifica que Tailwind v4 y los tokens
// del sistema visual "Neón" funcionan. Se reemplazará por el RouterProvider en la fase de rutas.

const muestras = [
  { nombre: 'neon-400', clase: 'bg-neon-400' },
  { nombre: 'neon-600', clase: 'bg-neon-600' },
  { nombre: 'neon-950', clase: 'bg-neon-950' },
  { nombre: 'tinta-950', clase: 'bg-tinta-950' },
  { nombre: 'tinta-900', clase: 'bg-tinta-900' },
  { nombre: 'tinta-700', clase: 'bg-tinta-700' },
  { nombre: 'blanco', clase: 'bg-white' },
] as const

export default function App() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Sistema visual</h1>

      <section className="mt-6 rounded-xl border border-borde bg-superficie p-6">
        <h2 className="font-semibold">Color</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {muestras.map((m) => (
            <div key={m.nombre}>
              <div className={`h-14 rounded-lg border border-borde ${m.clase}`} />
              <p className="mt-1 text-xs text-texto-suave">{m.nombre}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-borde bg-superficie p-6">
        <h2 className="font-semibold">Botones</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="min-h-11 rounded-lg bg-primario px-4 font-semibold text-sobre-primario shadow-neon-sm hover:bg-primario-hover">
            Primario
          </button>
          <button className="min-h-11 rounded-lg border border-borde-fuerte px-4 font-semibold hover:border-neon-400">
            Secundario
          </button>
          <button className="min-h-11 rounded-lg bg-red-600 px-4 font-semibold hover:bg-red-700">
            Peligro
          </button>
          <button className="min-h-11 rounded-lg px-4 font-semibold text-neon-400 hover:bg-neon-950">
            Fantasma
          </button>
        </div>
      </section>
    </main>
  )
}
