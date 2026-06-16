import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - All medicines
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

// POST - New medicine
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
        supplierId: body.supplierId || null,
        barcode: body.barcode || null,
        manufacturer: body.manufacturer || null,
        description: body.description || null
      },
      include: {
        category: true,
        supplier: true
      }
    })

    // Create stock log
    await db.stockLog.create({
      data: {
        medicineId: medicine.id,
        type: 'purchase',
        quantity: body.stock,
        notes: 'New medicine added'
      }
    })

    return NextResponse.json(medicine)
  } catch (error) {
    console.error('Medicines POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Soft delete medicine
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