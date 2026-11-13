import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Aviso from './Aviso'
import Boton from './Boton'
import Campo from './Campo'
import Modal from './Modal'
import PrecioCOP from './PrecioCOP'
import Tabla from './Tabla'

describe('Boton', () => {
  it('ejecuta onClick', async () => {
    const onClick = vi.fn()
    render(<Boton onClick={onClick}>Comprar</Boton>)
    await userEvent.click(screen.getByRole('button', { name: 'Comprar' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('en estado cargando se deshabilita para evitar doble envío', async () => {
    const onClick = vi.fn()
    render(
      <Boton cargando onClick={onClick}>
        Comprar
      </Boton>,
    )
    const boton = screen.getByRole('button', { name: /cargando/i })
    expect(boton).toBeDisabled()
    expect(boton).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(boton)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('es type="button" por defecto (no envía formularios por accidente)', () => {
    render(<Boton>Ok</Boton>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})

describe('Campo', () => {
  it('asocia la etiqueta al input', () => {
    render(<Campo etiqueta="Correo electrónico" />)
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
  })

  it('con error marca aria-invalid y lo describe', () => {
    render(<Campo etiqueta="Nombre" error="Este campo es obligatorio" />)
    const input = screen.getByLabelText('Nombre')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Este campo es obligatorio')
  })
})

describe('Aviso', () => {
  it('error usa role="alert"; el resto role="status"', () => {
    render(
      <>
        <Aviso tipo="error">Falló</Aviso>
        <Aviso tipo="exito">Listo</Aviso>
      </>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Falló')
    expect(screen.getByRole('status')).toHaveTextContent('Listo')
  })
})

describe('Modal', () => {
  it('muestra el título como nombre accesible y llama onCerrar', async () => {
    const onCerrar = vi.fn()
    render(
      <Modal abierto titulo="Confirmar compra" onCerrar={onCerrar}>
        Contenido
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Confirmar compra' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onCerrar).toHaveBeenCalledOnce()
  })

  it('cerrado no se muestra', () => {
    render(
      <Modal abierto={false} titulo="Oculto" onCerrar={() => {}}>
        x
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Tabla', () => {
  it('renderiza encabezados y celdas', () => {
    render(
      <Tabla
        titulo="Tickets"
        filas={[{ codigo: 'TKT-1' }]}
        claveFila={(f) => f.codigo}
        columnas={[{ encabezado: 'Código', celda: (f) => f.codigo }]}
      />,
    )
    expect(screen.getByRole('columnheader', { name: 'Código' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'TKT-1' })).toBeInTheDocument()
  })
})

describe('PrecioCOP', () => {
  // TEST-FE-LIB-005
  it('formatea 250000 como COP', () => {
    render(<PrecioCOP valor={250000} />)
    expect(screen.getByText(/\$\s250\.000/)).toBeInTheDocument()
  })
})
