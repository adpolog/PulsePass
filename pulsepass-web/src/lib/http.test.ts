import { http as mock, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { API, errorBody } from '../test/mocks/handlers'
import { server } from '../test/mocks/server'
import { ApiError, GENERIC_MESSAGE, NETWORK_MESSAGE, http, onUnauthorized, setAuthToken } from './http'

const OkSchema = z.object({ ok: z.boolean() })

describe('http client', () => {
  it('TEST-FE-LIB-001: adds Authorization Bearer when there is a session', async () => {
    let header: string | null = null
    server.use(
      mock.get(`${API}/ping`, ({ request }) => {
        header = request.headers.get('Authorization')
        return HttpResponse.json({ ok: true })
      }),
    )
    setAuthToken('abc123')
    await http.get('/ping', OkSchema)
    expect(header).toBe('Bearer abc123')
  })

  it('does not send Authorization without a session', async () => {
    let header: string | null = 'x'
    server.use(
      mock.get(`${API}/ping`, ({ request }) => {
        header = request.headers.get('Authorization')
        return HttpResponse.json({ ok: true })
      }),
    )
    await http.get('/ping', OkSchema)
    expect(header).toBeNull()
  })

  it('TEST-FE-LIB-002: a valid ErrorResponse becomes an ApiError with status and details', async () => {
    server.use(mock.post(`${API}/ping`, () => errorBody(400, 'Validation failed', { name: 'Name is required' })))
    const error = await http.post('/ping', OkSchema, {}).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, message: 'Validation failed', details: { name: 'Name is required' } })
  })

  it('TEST-FE-LIB-003: an invalid error body becomes a generic ApiError', async () => {
    server.use(mock.get(`${API}/ping`, () => new HttpResponse('<html>boom</html>', { status: 500 })))
    await expect(http.get('/ping', OkSchema)).rejects.toMatchObject({ status: 500, message: GENERIC_MESSAGE })
  })

  it('TEST-FE-LIB-004: a 401 on an authenticated request triggers logout', async () => {
    const handler = vi.fn()
    onUnauthorized(handler)
    server.use(mock.get(`${API}/ping`, () => errorBody(401, 'Authentication required or invalid token')))

    setAuthToken('expired')
    await expect(http.get('/ping', OkSchema)).rejects.toMatchObject({ status: 401 })
    expect(handler).toHaveBeenCalledOnce()

    setAuthToken(null)
    await expect(http.get('/ping', OkSchema)).rejects.toMatchObject({ status: 401 })
    expect(handler).toHaveBeenCalledOnce()
  })

  it('a network failure becomes a "network" ApiError', async () => {
    server.use(mock.get(`${API}/ping`, () => HttpResponse.error()))
    await expect(http.get('/ping', OkSchema)).rejects.toMatchObject({ status: 0, kind: 'network', message: NETWORK_MESSAGE })
  })

  it('a 2xx body that breaks the schema becomes a "contract" ApiError', async () => {
    server.use(mock.get(`${API}/ping`, () => HttpResponse.json({ ok: 'yes' })))
    await expect(http.get('/ping', OkSchema)).rejects.toMatchObject({ kind: 'contract' })
  })
})
