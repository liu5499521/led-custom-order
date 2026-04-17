// submitQuote 云函数 - 商家提交报价
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { orderId, quote } = event

    if (!orderId || !quote || !quote.pricePerK || !quote.minQty) {
      return { success: false, error: '缺少报价参数' }
    }

    await db.collection('orders').doc(orderId).update({
      data: {
        quote: {
          pricePerK: quote.pricePerK,
          minQty: quote.minQty,
          totalNoTax: quote.totalNoTax,
          taxAmount: quote.taxAmount || 0,
          totalWithTax: quote.totalWithTax,
          deposit: quote.deposit,
          taxType: quote.taxType || '未税',
          note: quote.note || '',
          quotedAt: quote.quotedAt || new Date().toISOString(),
        },
        status: 'quoted'
      }
    })

    return { _id: orderId, success: true }
  } catch (e) {
    console.error('submitQuote error:', e)
    return { success: false, error: e.message }
  }
}