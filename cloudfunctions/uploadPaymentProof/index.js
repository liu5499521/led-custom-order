// uploadPaymentProof 云函数 - 客户上传付款截图
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { orderId, fileID } = event;

    if (!orderId || !fileID) {
      return { success: false, error: '缺少必要参数' };
    }

    // 更新订单：上传付款截图，状态变为待确认
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'paid',
        paymentProof: fileID,
        paidAt: new Date().toISOString()
      }
    });

    return { success: true };
  } catch (e) {
    console.error('uploadPaymentProof error:', e);
    return { success: false, error: e.message };
  }
};