// pages/index/index.js
function getDB() { return wx.cloud.database(); }

Page({
  data: {
    // 灯珠规格
    specs: ['2835', '3030', '3535', '5050', '5730', '5054', '4014', '3014'],
    specIndex: -1,
    spec: '',
    // 电压
    voltages: ['3V', '6V', '9V', '18V', '36V'],
    voltageIndex: -1,
    voltage: '',
    // 色温
    ccts: ['3000K', '4000K', '5000K', '6000K', '8000-9000K', '10000K'],
    cctIndex: -1,
    cct: '',
    // 灯珠数量
    ledCount: '',
    // 串并数
    seriesParallel: '',
    // 方案类型
    solutions: ['线性', 'DOB', '其他'],
    solutionIndex: -1,
    solutionType: '',
    // 目标功率
    targetPower: '',
    // 功率类型
    powerTypes: ['稳态功率', '初态功率'],
    powerTypeIndex: -1,
    powerType: '',
    // 产品应用
    application: '',
    // 寄回样品
    returnSample: false,
    returnSampleDesc: '',
    // 联系方式
    contactCompany: '',
    contactName: '',
    contactPhone: '',
    // 收货地址
    customerAddress: '',
    // 补充说明
    deliveryNote: '',
    // 提交中
    submitting: false,
  },

  // 选择灯珠规格
  selectSpec(e) {
    const idx = e.detail.value;
    this.setData({ specIndex: idx, spec: this.data.specs[idx] });
  },

  // 选择电压
  selectVoltage(e) {
    const idx = e.detail.value;
    this.setData({ voltageIndex: idx, voltage: this.data.voltages[idx] });
  },

  // 选择色温
  selectCct(e) {
    const idx = e.detail.value;
    this.setData({ cctIndex: idx, cct: this.data.ccts[idx] });
  },

  // 选择方案
  selectSolution(e) {
    const idx = e.detail.value;
    this.setData({ solutionIndex: idx, solutionType: this.data.solutions[idx] });
  },

  // 选择功率类型
  selectPowerType(e) {
    const idx = e.detail.value;
    this.setData({ powerTypeIndex: idx, powerType: this.data.powerTypes[idx] });
  },

  // 寄回样品
  onReturnSampleChange(e) {
    this.setData({ returnSample: e.detail.value.length > 0 });
  },

  // 文本输入
  bindInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [field]: e.detail.value });
  },

  // 跳转我的订单
  goOrders() {
    wx.navigateTo({ url: '../orders/orders' });
  },

  // 跳转商家后台
  goAdmin() {
    wx.navigateTo({ url: '../admin/admin' });
  },

  // 提交询价
  submitOrder() {
    if (this.data.submitting) return;
    const d = this.data;

    // 必填检查：联系方式
    if (!d.contactPhone) {
      wx.showToast({ title: '请填写手机号', icon: 'none' }); return;
    }
    if (!d.contactName) {
      wx.showToast({ title: '请填写联系人', icon: 'none' }); return;
    }
    if (!d.customerAddress) {
      wx.showToast({ title: '请填写收货地址', icon: 'none' }); return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    const order = {
      _id: 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: 'pending',
      spec: d.spec,
      voltage: d.voltage,
      cct: d.cct,
      ledCount: d.ledCount,
      seriesParallel: d.seriesParallel,
      solutionType: d.solutionType,
      targetPower: d.targetPower,
      powerType: d.powerType,
      application: d.application,
      returnSample: d.returnSample,
      returnSampleDesc: d.returnSampleDesc,
      contactCompany: d.contactCompany,
      contactName: d.contactName,
      contactPhone: d.contactPhone,
      customerAddress: d.customerAddress,
      deliveryNote: d.deliveryNote,
      quote: null,
    };

    wx.cloud.callFunction({
      name: 'submitOrder',
      data: { order },
      success: res => {
        wx.hideLoading();
        if (res.result && res.result._id) {
          wx.showToast({ title: '提交成功！', icon: 'success' });
          setTimeout(() => {
            wx.navigateTo({ url: '../orders/orders' });
          }, 1500);
        } else {
          wx.showToast({ title: '提交失败，请重试', icon: 'none' });
          this.setData({ submitting: false });
        }
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
        this.setData({ submitting: false });
      }
    });
  }
});
