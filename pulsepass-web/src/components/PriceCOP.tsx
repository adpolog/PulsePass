import { formatPrice } from '../lib/format'

interface PriceCOPProps {
  value: number
  className?: string
}

export default function PriceCOP({ value, className }: PriceCOPProps) {
  return <span className={className}>{formatPrice(value)}</span>
}
