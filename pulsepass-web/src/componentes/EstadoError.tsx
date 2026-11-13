import Aviso from './Aviso'
import Boton from './Boton'

interface PropsEstadoError {
  mensaje: string
  /** Normalmente el `refetch` de la consulta. */
  onReintentar?: () => void
}

/** Estado de error de carga (PRD §9.20): mensaje + "Reintentar". */
export default function EstadoError({ mensaje, onReintentar }: PropsEstadoError) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-borde bg-superficie px-6 py-8 text-center">
      <Aviso tipo="error" className="w-full max-w-sm justify-center">
        {mensaje}
      </Aviso>
      {onReintentar && <Boton onClick={onReintentar}>Reintentar</Boton>}
    </div>
  )
}
