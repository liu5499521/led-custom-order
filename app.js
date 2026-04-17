App({
  onLaunch: function () {
    // 初始化云开发
    if (!wx.cloud) {
      wx.showToast({ title: '当前微信版本不支持云开发', icon: 'none' });
    } else {
      wx.cloud.init({
        env: 'cloudbase-3g2tyxqk0acc90ba',
        traceUser: true,
      });
    }
  },
  globalData: {}
});
