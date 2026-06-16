import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - تمام سیلز
export async function GET() {
  try {
    const sales = await db.sale.findMany({
      include: {
        customer: true,
        items: {
          include: {
            medicine: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Sales GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - نیا سیل
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // انوائس نمبر بناؤ
    const lastSale = await db.sale.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    const invoiceNumber = lastSale
      ? `INV-${String(parseInt(lastSale.invoiceNumber.split('-')[1]) + 1).padStart(6, '0')}`
      : 'INV-000001'

    // ٹوٹل حساب کریں
    const subtotal = body.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const total = subtotal

    // سیل بناؤ
    const sale = await db.sale.create({
      data: {
        invoiceNumber,
        customerId: (body.customerId && body.customerId !== "none") ? body.customerId : null,
        subtotal,
        discount: 0,
        tax: 0,
        total,
        paymentMethod: 'cash',
        status: 'completed',
        items: {
          create: body.items.map((item: any) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: item.price,
            discount: 0,
            total: item.price * item.quantity
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            medicine: true
          }
        }
      }
    })

    // اسٹاک اپڈیٹ کریں
    for (const item of body.items) {
      await db.medicine.update({
        where: { id: item.medicineId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })

      // اسٹاک لاگ بناؤ
      await db.stockLog.create({
        data: {
          medicineId: item.medicineId,
          type: 'sale',
          quantity: -item.quantity,
          notes: `سیل ${invoiceNumber}`
        }
      })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error('Sales POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}