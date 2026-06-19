import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string }}) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: params.id },
    include: { user: true, party: true },
  })
  if (!dispute) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(dispute)
}

export async function PATCH(request: Request, { params }: { params: { id: string }}) {
  const body = await request.json()
  const data: any = {}
  if (body.title !== undefined) data.title = body.title
  if (body.status !== undefined) data.status = body.status
  if (body.description !== undefined) data.description = body.description

  const dispute = await prisma.dispute.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json(dispute)
}
