import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - سارے میڈیسنز لانے
export async function GET() {
  try {
    const medicines = await db.medicine.findMany({
      where: { isActive: true },
      include: {
        category: true,
        supplier: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(medicines)
  } catch (error) {
    console.error('Medicines GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - نیا میڈیسین بنانا
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const medicine = await db.medicine.create({
      data: {
        name: body.name,
        genericName: body.genericName || null,
        categoryId: body.categoryId || null,
        price: body.price,
        stock: body.stock,
        minStock: body.minStock || 10,
        batchNumber: body.batchNumber || null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        supplierId: body.supplierId || null
      },
      include: {
        category: true,
        supplier: true
      }
    })

    // اسٹاک لاگ بناؤ
    await db.stockLog.create({
      data: {
        medicineId: medicine.id,
        type: 'purchase',
        quantity: body.stock,
        notes: 'نیا میڈیسین شامل کیا گیا'
      }
    })

    return NextResponse.json(medicine)
  } catch (error) {
    console.error('Medicines POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - میڈیسین ڈیلیٹ کرنا
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Medicine ID required' }, { status: 400 })
    }

    await db.medicine.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Medicines DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}