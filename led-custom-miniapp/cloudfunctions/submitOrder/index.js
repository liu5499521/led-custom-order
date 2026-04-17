// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { order } = event;
    if (!order || !order._id) {
      return { success: false, error: '订单数据不完整' };
    }

    // 写入云数据库
    const result = await db.collection('orders').add({
      data: {
        ...order,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    return { success: true, _id: result._id };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
