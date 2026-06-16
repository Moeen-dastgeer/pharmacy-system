import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - تمام کیٹیگریز
export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { medicines: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - نئی کیٹیگری
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const category = await db.category.create({
      data: {
        name: body.name,
        description: body.description || null
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Categories POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}