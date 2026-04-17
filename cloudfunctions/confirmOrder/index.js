// 云函数入口文件 - 客户确认报价
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { orderId, phone } = event

  if (!orderId) {
    return { success: false, error: '缺少订单ID' }
  }

  try {
    // 验证订单存在且属于该手机号
    const orderRes = await db.collection('orders').doc(orderId).get()
    const order = orderRes.data

    if (phone && order.contactPhone !== phone) {
      return { success: false, error: '无权操作此订单' }
    }

    if (order.status !== 'quoted') {
      return { success: false, error: '订单状态不允许确认' }
    }

    // 标记客户已确认报价（状态保持quoted，等待付款）
    await db.collection('orders').doc(orderId).update({
      data: {
        quoteConfirmed: true,
        quoteConfirmedAt: new Date().toISOString()
      }
    })

    return { success: true }
  } catch (e) {
    console.error('confirmOrder error:', e)
    return { success: false, error: e.message }
  }
}