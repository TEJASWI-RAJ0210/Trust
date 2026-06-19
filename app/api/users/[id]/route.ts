import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string }}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { disputes: true, proofs: true },
  })
  if (!user) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(user)
}

export async function PATCH(request: Request, { params }: { params: { id: string }}) {
  const body = await request.json()
  const data: any = {}

  if (body.name !== undefined) data.name = body.name
  if (body.email !== undefined) data.email = body.email

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json(user)
}

export async function DELETE(request: Request, { params }: { params: { id: string }}) {
  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Deleted' }, { status: 204 })
}
