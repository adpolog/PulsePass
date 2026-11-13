// Pantalla de prueba temporal (equivalente a imagenes/Sistema.png con la paleta neón).
// Se reemplazará por el RouterProvider en la fase de rutas.
import { useState } from 'react'
import Aviso from './componentes/Aviso'
import Boton from './componentes/Boton'
import Campo from './componentes/Campo'
import Cargando from './componentes/Cargando'
import EstadoError from './componentes/EstadoError'
import EstadoVacio from './componentes/EstadoVacio'
import Modal from './componentes/Modal'
import PrecioCOP from './componentes/PrecioCOP'
import Selector from './componentes/Selector'
import Tabla from './componentes/Tabla'
import Tarjeta from './componentes/Tarjeta'
import BadgeEstadoEvento from './funcionalidades/eventos/componentes/BadgeEstadoEvento'
import { EventStatusSchema } from './funcionalidades/eventos/tipos'
import BadgeEstadoTicket from './funcionalidades/tickets/componentes/BadgeEstadoTicket'
import { TicketStatusSchema } from './funcionalidades/tickets/tipos'

const muestras = [
  { nombre: 'neon-400', clase: 'bg-neon-400' },
  { nombre: 'neon-600', clase: 'bg-neon-600' },
  { nombre: 'neon-950', clase: 'bg-neon-950' },
  { nombre: 'tinta-950', clase: 'bg-tinta-950' },
  { nombre: 'tinta-900', clase: 'bg-tinta-900' },
  { nombre: 'tinta-700', clase: 'bg-tinta-700' },
  { nombre: 'blanco', clase: 'bg-white' },
] as const

const ticketsDemo = [
  { codigo: 'TKT-8F2A1C', tipo: 'VIP', precio: 250000 },
  { codigo: 'TKT-91B07D', tipo: 'GENERAL', precio: 120000 },
]

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Tarjeta className="mt-6">
      <h2 className="mb-4 font-semibold">{titulo}</h2>
      {children}
    </Tarjeta>
  )
}

export default function App() {
  const [modalAbierto, setModalAbierto] = useState(false)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Sistema visual</h1>

      <Seccion titulo="Color">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {muestras.map((m) => (
            <div key={m.nombre}>
              <div className={`h-14 rounded-lg border border-borde ${m.clase}`} />
              <p className="mt-1 text-xs text-texto-suave">{m.nombre}</p>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Tipografía">
        <p className="font-titulo text-3xl font-extrabold">Poppins — títulos</p>
        <p className="mt-2 text-sm text-texto-suave">
          Inter — cuerpo. Precio: <PrecioCOP valor={250000} className="font-bold text-white" />
        </p>
      </Seccion>

      <Seccion titulo="Botones">
        <div className="flex flex-wrap gap-3">
          <Boton>Primario</Boton>
          <Boton variante="secundario">Secundario</Boton>
          <Boton variante="peligro">Peligro</Boton>
          <Boton variante="fantasma">Fantasma</Boton>
          <Boton cargando>Guardar</Boton>
          <Boton variante="secundario" onClick={() => setModalAbierto(true)}>
            Abrir modal
          </Boton>
        </div>
      </Seccion>

      <Seccion titulo="Badges de estado">
        <div className="flex flex-wrap gap-2">
          {EventStatusSchema.options.map((e) => (
            <BadgeEstadoEvento key={e} estado={e} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {TicketStatusSchema.options.map((e) => (
            <BadgeEstadoTicket key={e} estado={e} />
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Campos">
        <div className="grid gap-4 md:grid-cols-3">
          <Campo etiqueta="Campo normal" placeholder="Texto" ayuda="Texto de ayuda" />
          <Campo etiqueta="Campo con error" error="Este campo es obligatorio" />
          <Selector etiqueta="Categoría" defaultValue="MUSIC">
            <option value="MUSIC">MUSIC</option>
            <option value="SPORTS">SPORTS</option>
          </Selector>
        </div>
      </Seccion>

      <Seccion titulo="Avisos">
        <div className="grid gap-3 md:grid-cols-2">
          <Aviso tipo="exito">Cuenta creada, inicia sesión.</Aviso>
          <Aviso tipo="error">El ticket no puede cancelarse en su estado actual.</Aviso>
          <Aviso tipo="advertencia">El ticket ya fue utilizado.</Aviso>
          <Aviso tipo="info" onCerrar={() => {}}>
            Tu sesión expiró. Inicia sesión de nuevo.
          </Aviso>
        </div>
      </Seccion>

      <Seccion titulo="Tabla genérica (en móvil se ve como tarjetas)">
        <Tabla
          titulo="Tickets de demostración"
          filas={ticketsDemo}
          claveFila={(t) => t.codigo}
          columnas={[
            { encabezado: 'Código', celda: (t) => <span className="font-mono">{t.codigo}</span> },
            { encabezado: 'Tipo', celda: (t) => t.tipo },
            { encabezado: 'Precio', celda: (t) => <PrecioCOP valor={t.precio} /> },
            { encabezado: 'Estado', celda: () => <BadgeEstadoTicket estado="PAID" /> },
          ]}
        />
      </Seccion>

      <Seccion titulo="Estados de interfaz">
        <div className="grid gap-6 lg:grid-cols-3">
          <Cargando cantidad={1} className="lg:grid-cols-1" />
          <EstadoVacio
            mensaje="Aún no hay eventos publicados"
            accion={<Boton variante="secundario">Ver artistas</Boton>}
          />
          <EstadoError mensaje="No pudimos conectar con el servidor." onReintentar={() => {}} />
        </div>
      </Seccion>

      <Modal
        abierto={modalAbierto}
        titulo="Confirmar compra"
        onCerrar={() => setModalAbierto(false)}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton>Confirmar</Boton>
          </>
        }
      >
        <p className="text-texto-suave">Evento: Caribbean Music Fest 2026 · Tipo: VIP</p>
        <Aviso tipo="error">El usuario no cumple la edad mínima del evento.</Aviso>
      </Modal>
    </main>
  )
}
