import { Link } from 'react-router'
import Container from './Container'
import { IconInbox } from './icons'
import { buttonClasses } from './styles'

interface NotAvailableProps {
  message: string
  backTo: string
  backLabel: string
}

// 404/403 on a resource page: does not reveal whether the resource exists.
export default function NotAvailable({ message, backTo, backLabel }: NotAvailableProps) {
  return (
    <Container width="narrow" className="flex flex-col items-center gap-4 py-20 text-center">
      <IconInbox className="size-10 text-neon-400" />
      <h1 className="text-2xl font-bold">{message}</h1>
      <Link to={backTo} className={buttonClasses('secondary')}>
        {backLabel}
      </Link>
    </Container>
  )
}
