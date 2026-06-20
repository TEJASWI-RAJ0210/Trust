import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import {
  getAuthUserId,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from '../../../../lib/api-auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const { id } = await params

    // Users can only fetch their own profile
    if (id !== userId) return forbidden()

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        country: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        // Safe summary counts — not the full records
        _count: {
          select: { disputes: true, proofs: true },
        },
      },
    })

    if (!user) return notFound('User')

    return NextResponse.json(user)
  } catch (err) {
    return serverError(err)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const { id } = await params

    // Users can only edit their own profile
    if (id !== userId) return forbidden()

    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.name !== undefined) data.name = body.name?.trim() || null
    if (body.phone !== undefined) data.phone = body.phone?.trim() || null
    if (body.country !== undefined) data.country = body.country?.trim() || null

    // Email change: check for duplicates first
    if (body.email !== undefined) {
      const normalized = body.email.toLowerCase().trim()
      const existing = await prisma.user.findUnique({
        where: { email: normalized },
      })
      if (existing && existing.id !== userId) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 409 }
        )
      }
      data.email = normalized
      data.emailVerified = false // re-verify after email change
    }

    // Never allow these to be changed via this endpoint
    // passwordHash → use a dedicated /change-password route
    // role → admin-only operation
    // id, createdAt → immutable

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        country: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (err) {
    return serverError(err)
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const { id } = await params

    // Users can only delete their own account
    if (id !== userId) return forbidden()

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) return notFound('User')

    // Cascade: Prisma will handle related disputes/proofs if schema has onDelete set,
    // otherwise delete them manually first
    await prisma.proof.deleteMany({ where: { userId: id } })
    await prisma.dispute.deleteMany({ where: { userId: id } })
    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ message: 'Account deleted' }, { status: 200 })
  } catch (err) {
    return serverError(err)
  }
}