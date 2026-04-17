const ADMIN_PWD = 'lyc123';

Page({
  data: {
    loggedIn: false,
    orders: [],
    filter: 'all',
    selectedOrder: null,
    _pwd: '',
  },

  onLoad() {
    const saved = wx.getStorageSync('adminPwd');
    if (saved === ADMIN_PWD) {
      this.setData({ loggedIn: true, _pwd: saved });
      this.loadOrders();
    }
  },

  bindPwd(e) {
    this.setData({ _pwd: e.detail.value });
  },

  doLogin() {
    const pwd = this.data._pwd;
    if (!pwd) {
      const input = this.selectComponent('#adminPwdInput');
      if (input) {
        const value = input.data.value || input.data._pwd || '';
        if (value === ADMIN_PWD) {
          wx.setStorageSync('adminPwd', value);
          this.setData({ loggedIn: true });
          this.loadOrders();
          return;
        }
      }
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (pwd === ADMIN_PWD) {
      wx.setStorageSync('adminPwd', pwd);
      this.setData({ loggedIn: true });
      this.loadOrders();
    } else {
      wx.showToast({ title: '密码错误', icon: 'none' });
    }
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出商家登录吗？',
      success: m => {
        if (m.confirm) {
          wx.removeStorageSync('adminPwd');
          this.setData({ loggedIn: false, orders: [], _pwd: '' });
        }
      }
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ filter: tab });
    this.loadOrders();
  },

  loadOrders() {
    wx.cloud.callFunction({
      name: 'getOrders',
      data: { admin: true },
      success: res => {
        const all = res.result.orders || [];
        const filter = this.data.filter;
        const filtered = filter === 'all'
          ? all
          : all.filter(o => o.status === filter);
        this.setData({ orders: filtered });
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },

  bindQuoteField(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const order = this.data.selectedOrder || {};
    let qf = order._quoteForm || {};
    if (field === 'pricePerK') {
      qf.pricePerK = parseFloat(value) || 0;
    } else if (field === 'minQty') {
      qf.minQty = parseFloat(value) || 0;
    } else if (field === 'taxType') {
      qf.taxType = value;
    }
    order._quoteForm = qf;

    // Auto calc
    if (qf.pricePerK && qf.minQty) {
      const taxRate = qf.taxType === '含税' ? 1.08 : 1;
      const total = qf.pricePerK * qf.minQty * taxRate;
      const deposit = Math.round(total * 0.3);
      qf._total = total;
      qf._deposit = deposit;
    }

    this.setData({ selectedOrder: order });
  },

  bindTaxTypeChange(e) {
    const value = e.detail.value;
    const order = this.data.selectedOrder || {};
    let qf = order._quoteForm || {};
    qf.taxType = value;
    order._quoteForm = qf;
    if (qf.pricePerK && qf.minQty) {
      const taxRate = qf.taxType === '含税' ? 1.08 : 1;
      const total = qf.pricePerK * qf.minQty * taxRate;
      const deposit = Math.round(total * 0.3);
      qf._total = total;
      qf._deposit = deposit;
    }
    this.setData({ selectedOrder: order });
  },

  submitQuote(e) {
    const order = this.data.selectedOrder;
    if (!order || !order._id) return;
    const qf = order._quoteForm;
    if (!qf || !qf.pricePerK || !qf.minQty) {
      wx.showToast({ title: '请填写完整报价', icon: 'none' });
      return;
    }
    const quote = {
      pricePerK: qf.pricePerK,
      minQty: qf.minQty,
      taxType: qf.taxType || '未税',
      totalNoTax: qf.pricePerK * qf.minQty,
      total: qf._total || qf.pricePerK * qf.minQty,
      deposit: qf._deposit || Math.round(qf.pricePerK * qf.minQty * 0.3),
      quotedAt: new Date().toISOString(),
    };
    wx.cloud.callFunction({
      name: 'submitQuote',
      data: { orderId: order._id, quote },
      success: res => {
        if (res.result && res.result._id) {
          wx.showToast({ title: '报价已发送' });
          this.setData({ selectedOrder: null });
          this.loadOrders();
        } else {
          wx.showToast({ title: '报价失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '报价失败', icon: 'none' });
      }
    });
  },

  fmtDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', { hour12: false });
  },

  confirmPayment(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认收款',
      content: '确认客户已付款？',
      success: modal => {
        if (modal.confirm) {
          wx.cloud.callFunction({
            name: 'confirmPayment',
            data: { orderId },
            success: res => {
              if (res.result && res.result.success) {
                wx.showToast({ title: '已确认收款' });
                this.loadOrders();
              }
            },
            fail: () => {
              wx.showToast({ title: '操作失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  previewPaymentProof(e) {
    const orderId = e.currentTarget.dataset.id;
    const orders = this.data.orders;
    const order = orders.find(o => o._id === orderId);
    if (!order || !order.paymentProof) {
      wx.showToast({ title: '暂无凭证', icon: 'none' });
      return;
    }
    wx.cloud.getTempFileURL({
      fileList: [order.paymentProof],
      success: res => {
        if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
          wx.previewImage({ urls: [res.fileList[0].tempFileURL], current: res.fileList[0].tempFileURL });
        } else {
          wx.showToast({ title: '预览失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '预览失败', icon: 'none' });
      }
    });
  },

  async copyMerchantInfo() {
    const info = `艺菡光电科技(深圳)有限公司
地址:深圳市龙华区观澜街道桂花社区惠民一路32号
收件人:刘宇
电话:13456851528`;
    wx.setClipboardData({
      data: info,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'none' });
      }
    });
  },
});
