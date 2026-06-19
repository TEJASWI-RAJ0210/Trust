import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string }}) {
  const party = await prisma.party.findUnique({
    where: { id: params.id },
    include: { disputes: true },
  })
  if (!party) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(party)
}

export async function DELETE(request: Request, { params }: { params: { id: string }}) {
  await prisma.party.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Deleted' }, { status: 204 })
}
