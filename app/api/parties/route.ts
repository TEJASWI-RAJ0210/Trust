import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const parties = await prisma.party.findMany({
    include: { disputes: true },
  })
  return NextResponse.json(parties)
}

export async function POST(request: Request) {
  const body = await request.json()
  if (!body.name) {
    return NextResponse.json({ message: 'name is required' }, { status: 400 })
  }
  const party = await prisma.party.create({
    data: { name: body.name },
  })
  return NextResponse.json(party, { status: 201 })
}
