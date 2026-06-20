import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getAuthUserId, unauthorized, serverError } from '../../../lib/api-auth'

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    // Bug fix: only return parties that have disputes with this user
    const parties = await prisma.party.findMany({
      where: {
        disputes: { some: { userId } },
      },
      include: {
        disputes: {
          where: { userId },
          select: { id: true, title: true, status: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(parties)
  } catch (err) {
    return serverError(err)
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId()
    if (!userId) return unauthorized()

    const body = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ message: 'name is required' }, { status: 400 })
    }

    const party = await prisma.party.create({
      data: { name: body.name.trim() },
    })

    return NextResponse.json(party, { status: 201 })
  } catch (err) {
    return serverError(err)
  }
}