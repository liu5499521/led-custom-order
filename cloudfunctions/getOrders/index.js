// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { phone, tab, admin, orderId } = event

  try {
    // 查询单个订单
    if (orderId) {
      const res = await db.collection('orders').doc(orderId).get()
      return { orders: [res.data] }
    }

    let query = {}

    // 商家模式：获取所有订单，可按状态过滤
    if (admin) {
      if (tab && tab !== 'all') {
        query.status = tab
      }
    } else {
      // 客户模式：按手机号查询
      if (!phone) {
        return { orders: [] }
      }
      query.contactPhone = phone
      if (tab && tab !== 'all') {
        query.status = tab
      }
    }

    const res = await db.collection('orders')
      .where(query)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    return { orders: res.data }
  } catch (e) {
    console.error('getOrders error:', e)
    return { orders: [], error: e.message }
  }
}