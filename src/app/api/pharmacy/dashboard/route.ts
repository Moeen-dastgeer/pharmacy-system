import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [totalMedicines, lowStock, expiringSoon, todaySales, totalRevenue] = await Promise.all([
      db.medicine.count({ where: { isActive: true } }),
      db.medicine.count({
        where: {
          isActive: true,
          stock: { lte: db.medicine.fields.minStock }
        }
      }),
      db.medicine.count({
        where: {
          isActive: true,
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      db.sale.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      db.sale.aggregate({
        _sum: { total: true },
        where: { status: 'completed' }
      })
    ])

    return NextResponse.json({
      totalMedicines,
      lowStock,
      expiringSoon,
      todaySales,
      totalRevenue: totalRevenue._sum.total || 0
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}