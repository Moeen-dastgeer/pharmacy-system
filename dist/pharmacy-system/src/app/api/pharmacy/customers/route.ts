import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - تمام کسٹمرز
export async function GET() {
  try {
    const customers = await db.customer.findMany({
      include: {
        _count: {
          select: { sales: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Customers GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - نیا کسٹمر
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const customer = await db.customer.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Customers POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}