import PaginaEstado from '../componentes/PaginaEstado'

export default function SinPermisos() {
  return <PaginaEstado codigo="403" mensaje="No tienes permisos para acceder a esta sección." />
}
