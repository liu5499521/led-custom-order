// pages/orders/orders.js
function getDB() { const db = wx.cloud.database(); return { db, _: db.command }; }

Page({
  data: {
    orders: [],
    phone: '',
    loading: true,
    tab: 'all',
    showQuote: false,
    quoteDetail: {},
    quoteOrderId: '',
    qrImgUrl: '../../alipay-qr.jpg',
  },

  onLoad() {
    const phone = wx.getStorageSync('phone') || '';
    this.setData({ phone });
  },

  onShow() {
    const phone = wx.getStorageSync('phone') || '';
    this.setData({ phone });
    if (phone) this.loadOrders();
  },

  // 输入手机号查询
  bindPhone(e) {
    const phone = e.detail.value;
    this.setData({ phone });
    wx.setStorageSync('phone', phone);
  },

  // 查询订单
  loadOrders() {
    const { phone, tab } = this.data;
    if (!phone) { this.setData({ orders: [], loading: false }); return; }

    this.setData({ loading: true });
    wx.cloud.callFunction({
      name: 'getOrders',
      data: { phone, tab },
      success: res => {
        this.setData({ orders: (res.result && res.result.orders) || [], loading: false });
      },
      fail: () => {
        wx.showToast({ title: '加载失败', icon: 'none' });
        this.setData({ loading: false });
      }
    });
  },

  // 切换标签
  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
    this.loadOrders();
  },

  // 清除手机号
  clearPhone() {
    this.setData({ phone: '', orders: [] });
    wx.removeStorageSync('phone');
  },

  // 确认订单
  confirmOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    const phone = this.data.phone;
    wx.showModal({
      title: '确认报价',
      content: '确认商家的报价？确认后将锁定订单。',
      success: modal => {
        if (!modal.confirm) return;
        wx.showLoading({ title: '确认中...' });
        wx.cloud.callFunction({
          name: 'confirmOrder',
          data: { orderId, phone },
          success: res => {
            wx.hideLoading();
            if (res.result && res.result.success) {
              wx.showToast({ title: '已确认', icon: 'success' });
              this.loadOrders();
            } else {
              const err = res.result ? res.result.error : '确认失败';
              wx.showToast({ title: err, icon: 'none' });
            }
          },
          fail: () => {
            wx.hideLoading();
            wx.showToast({ title: '确认失败', icon: 'none' });
          }
        });
      }
    });
  },

  // 查看报价详情
  viewQuote(e) {
    const order = e.currentTarget.dataset.order;
    if (!order.quote) {
      wx.showModal({ title: '商家报价', content: '暂无报价', showCancel: false }); return;
    }
    const q = order.quote;
    this.setData({
      showQuote: true,
      quoteOrderId: order._id,
      quoteDetail: {
        pricePerK: q.pricePerK,
        minQty: q.minQty,
        totalNoTax: q.totalNoTax,
        taxAmount: q.taxAmount,
        totalWithTax: q.totalWithTax,
        deposit: q.deposit,
        taxType: q.taxType,
        note: q.note || '',
      }
    });
  },

  // 关闭报价弹窗
  closeQuote() {
    this.setData({ showQuote: false });
  },

  // 预览收款码
  previewQR() {
    wx.previewImage({ current: this.data.qrImgUrl, urls: [this.data.qrImgUrl] });
  },

  // 跳转支付宝付款（复制订单号）
  payByAlipay(e) {
    const { deposit, id } = e.currentTarget.dataset;
    wx.showModal({
      title: '支付宝转账',
      content: '请转账 ¥' + deposit + ' 到商家支付宝\n转账备注：' + (id ? id.slice(-8).toUpperCase() : '订单号'),
      confirmText: '上传截图',
      cancelText: '取消',
      success: modal => {
        if (modal.confirm) {
          this.chooseAndUploadProof(id);
        }
      }
    });
  },

  // 选择并上传付款截图
  chooseAndUploadProof(orderId) {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: chooseRes => {
        const tempFilePath = chooseRes.tempFiles[0].tempFilePath;
        wx.showLoading({ title: '上传中...' });

        const cloudPath = 'payment/' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.jpg';
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: tempFilePath,
          success: uploadRes => {
            wx.cloud.callFunction({
              name: 'uploadPaymentProof',
              data: { orderId: orderId, fileID: uploadRes.fileID },
              success: res => {
                wx.hideLoading();
                if (res.result && res.result.success) {
                  wx.showToast({ title: '上传成功', icon: 'success' });
                  that.loadOrders();
                } else {
                  const err = res.result ? res.result.error : '上传失败';
                  wx.showToast({ title: err, icon: 'none' });
                }
              },
              fail: () => {
                wx.hideLoading();
                wx.showToast({ title: '上传失败', icon: 'none' });
              }
            });
          },
          fail: () => {
            wx.hideLoading();
            wx.showToast({ title: '上传失败', icon: 'none' });
          }
        });
      },
      fail: () => {
        wx.showToast({ title: '已取消', icon: 'none' });
      }
    });
  },

  // 预览付款截图
  previewProof(e) {
    const url = e.currentTarget.dataset.url;
    if (url) wx.previewImage({ urls: [url], current: url });
  },

  // 格式化日期
  fmtDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }
});
