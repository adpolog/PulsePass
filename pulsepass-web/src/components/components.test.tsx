import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Alert from './Alert'
import Button from './Button'
import Field from './Field'
import Modal from './Modal'
import PriceCOP from './PriceCOP'
import Table from './Table'

describe('Button', () => {
  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Comprar</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Comprar' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled while loading to avoid double submit', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Comprar
      </Button>,
    )
    const button = screen.getByRole('button', { name: /cargando/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('defaults to type="button"', () => {
    render(<Button>Ok</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})

describe('Field', () => {
  it('links the label to the input', () => {
    render(<Field label="Correo electrónico" />)
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
  })

  it('marks aria-invalid and describes the error', () => {
    render(<Field label="Nombre" error="Este campo es obligatorio" />)
    const input = screen.getByLabelText('Nombre')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Este campo es obligatorio')
  })
})

describe('Alert', () => {
  it('uses role="alert" for errors and role="status" otherwise', () => {
    render(
      <>
        <Alert type="error">Falló</Alert>
        <Alert type="success">Listo</Alert>
      </>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Falló')
    expect(screen.getByRole('status')).toHaveTextContent('Listo')
  })
})

describe('Modal', () => {
  it('uses the title as accessible name and calls onClose', async () => {
    const onClose = vi.fn()
    render(
      <Modal open title="Confirmar compra" onClose={onClose}>
        Contenido
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Confirmar compra' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('is not shown when closed', () => {
    render(
      <Modal open={false} title="Oculto" onClose={() => {}}>
        x
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Table', () => {
  it('renders headers and cells', () => {
    render(
      <Table
        title="Tickets"
        rows={[{ code: 'TKT-1' }]}
        rowKey={(r) => r.code}
        columns={[{ header: 'Código', cell: (r) => r.code }]}
      />,
    )
    expect(screen.getByRole('columnheader', { name: 'Código' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'TKT-1' })).toBeInTheDocument()
  })
})

describe('PriceCOP', () => {
  it('formats 250000 as COP', () => {
    render(<PriceCOP value={250000} />)
    expect(screen.getByText(/\$\s250\.000/)).toBeInTheDocument()
  })
})
