import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string }}) {
  const proof = await prisma.proof.findUnique({
    where: { id: params.id },
    include: { user: true },
  })

  if (!proof) {
    return NextResponse.json({ message: 'Proof not found' }, { status: 404 })
  }

  return NextResponse.json(proof)
}

export async function DELETE(request: Request, { params }: { params: { id: string }}) {
  await prisma.proof.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Deleted' }, { status: 204 })
}
