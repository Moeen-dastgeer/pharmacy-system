import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - All returns
export async function GET() {
  try {
    const returns = await db.return.findMany({
      include: {
        sale: {
          include: {
            customer: true
          }
        },
        customer: true,
        items: {
          include: {
            medicine: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(returns)
  } catch (error) {
    console.error('Returns GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - New return
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate return number
    const lastReturn = await db.return.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    const returnNumber = lastReturn
      ? `RET-${String(parseInt(lastReturn.returnNumber.split('-')[1]) + 1).padStart(6, '0')}`
      : 'RET-000001'

    // Calculate refund amount
    const subtotal = body.items.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0)
    const refundAmount = subtotal

    // Create return
    const returnRecord = await db.return.create({
      data: {
        returnNumber,
        saleId: body.saleId,
        customerId: body.customerId || null,
        subtotal,
        refundAmount,
        reason: body.reason || null,
        status: 'approved',
        items: {
          create: body.items.map((item: any) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.unitPrice * item.quantity
          }))
        }
      },
      include: {
        items: {
          include: {
            medicine: true
          }
        }
      }
    })

    // Update stock for returned items
    for (const item of body.items) {
      await db.medicine.update({
        where: { id: item.medicineId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      })

      // Create stock log
      await db.stockLog.create({
        data: {
          medicineId: item.medicineId,
          type: 'return',
          quantity: item.quantity,
          notes: `Return ${returnNumber}`
        }
      })
    }

    // Update sale status
    await db.sale.update({
      where: { id: body.saleId },
      data: { status: 'returned' }
    })

    return NextResponse.json(returnRecord)
  } catch (error) {
    console.error('Returns POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}