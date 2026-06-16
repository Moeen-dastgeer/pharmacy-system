import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - تمام سپلائرز
export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      include: {
        _count: {
          select: {
            medicines: true,
            purchases: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Suppliers GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - نیا سپلائر
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const supplier = await db.supplier.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null
      }
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Suppliers POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}