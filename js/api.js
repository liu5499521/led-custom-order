// API调用模块
const API = {
  // 调用云函数
  async callFunction(name, data) {
    try {
      const res = await fetch(`${CONFIG.baseUrl}${CONFIG.functions[name]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.error) throw new Error(typeof result.error === 'string' ? result.error : result.error.message || '请求失败');
      return result;
    } catch (err) {
      console.error(`API ${name} error:`, err);
      throw err;
    }
  },

  // 提交询价单
  async submitOrder(formData) {
    return this.callFunction('submitOrder', { order: formData });
  },

  // 获取订单列表
  async getOrders(phone) {
    const result = await this.callFunction('getOrders', { phone });
    return result.orders || [];
  },

  // 确认订单
  async confirmOrder(orderId) {
    return this.callFunction('confirmOrder', { orderId });
  },

  // 上传支付证明
  async uploadPaymentProof(orderId, imageBase64) {
    return this.callFunction('uploadPaymentProof', { orderId, image: imageBase64 });
  }
};