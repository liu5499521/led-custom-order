// confirmPayment 云函数 - 商家确认收款
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { orderId } = event

  if (!orderId) {
    return { success: false, error: '缺少订单ID' }
  }

  try {
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'confirmed',
        confirmedAt: new Date().toISOString()
      }
    })
    return { success: true }
  } catch (e) {
    console.error('confirmPayment error:', e)
    return { success: false, error: e.message }
  }
}