// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  // 前端传的是 { order: {...} }
  const order = event.order
  if (!order) {
    return { error: '缺少订单数据' }
  }

  // 必填校验
  if (!order.contactName || !order.contactPhone) {
    return { error: '联系人必填' }
  }
  if (!order.customerAddress) {
    return { error: '收货地址必填' }
  }

  // 清理前端自生成的_id，让数据库自动生成
  delete order._id
  // 确保 quote 初始为 null
  order.quote = null
  // 用服务端时间
  order.createdAt = new Date().toISOString()
  order.status = 'pending'

  try {
    const res = await db.collection('orders').add({ data: order })
    return { _id: res._id, success: true }
  } catch (e) {
    console.error('submitOrder error:', e)
    return { error: e.message }
  }
}