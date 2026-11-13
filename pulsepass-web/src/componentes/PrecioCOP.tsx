import { formatearPrecio } from '../lib/formato'

interface PropsPrecioCOP {
  valor: number
  className?: string
}

/** Precio en pesos colombianos: 250000 → "$ 250.000". */
export default function PrecioCOP({ valor, className }: PropsPrecioCOP) {
  return <span className={className}>{formatearPrecio(valor)}</span>
}
