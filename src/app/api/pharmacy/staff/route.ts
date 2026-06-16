import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - All staff
export async function GET() {
  try {
    const staff = await db.staff.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Staff GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - New staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const staff = await db.staff.create({
      data: {
        email: body.email,
        name: body.name,
        phone: body.phone || null,
        role: body.role || 'staff',
        password: body.password
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Staff POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}