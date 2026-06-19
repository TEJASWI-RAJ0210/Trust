import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET, POST } from '@/app/api/users/route'
import { GET as GET_USER, PATCH, DELETE } from '@/app/api/users/[id]/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('users API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET /api/users returns user list', async () => {
    ;(prisma.user.findMany as any).mockResolvedValue([{ id: '1', email: 'a@b.com', name: 'Alice' }])
    const response = await GET()
    const data = await response.json()

    expect(prisma.user.findMany).toHaveBeenCalled()
    expect(data).toEqual([{ id: '1', email: 'a@b.com', name: 'Alice' }])
  })

  it('POST /api/users creates a user', async () => {
    ;(prisma.user.create as any).mockResolvedValue({ id: '1', email: 'a@b.com', name: 'Alice' })
    const request = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', name: 'Alice' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(prisma.user.create).toHaveBeenCalledWith({ data: { email: 'a@b.com', name: 'Alice' } })
    expect(data).toEqual({ id: '1', email: 'a@b.com', name: 'Alice' })
  })

  it('GET /api/users/[id] returns a user', async () => {
    ;(prisma.user.findUnique as any).mockResolvedValue({ id: '1', email: 'a@b.com', name: 'Alice' })
    const response = await GET_USER(new Request('http://localhost'), { params: { id: '1' } })
    const data = await response.json()

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, include: { disputes: true, proofs: true } })
    expect(data).toEqual({ id: '1', email: 'a@b.com', name: 'Alice' })
  })

  it('PATCH /api/users/[id] updates a user', async () => {
    ;(prisma.user.update as any).mockResolvedValue({ id: '1', email: 'a@b.com', name: 'Alice Updated' })
    const request = new Request('http://localhost', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Updated' }),
    })

    const response = await PATCH(request, { params: { id: '1' } })
    const data = await response.json()

    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { name: 'Alice Updated' } })
    expect(data).toEqual({ id: '1', email: 'a@b.com', name: 'Alice Updated' })
  })

  it('DELETE /api/users/[id] deletes a user', async () => {
    ;(prisma.user.delete as any).mockResolvedValue({})
    const response = await DELETE(new Request('http://localhost'), { params: { id: '1' } })
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } })
    expect(response.status).toBe(204)
  })
})
