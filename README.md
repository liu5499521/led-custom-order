# 灯珠定制询价小程序 - 部署指南

## 📁 项目结构

```
led-custom-miniapp/
├── app.js              # 小程序入口，初始化云开发
├── app.json            # 页面路由配置
├── app.wxss            # 全局样式（复用index页面样式）
├── project.config.json # 开发者工具项目配置
│
├── pages/
│   ├── index/          # 询价表单页（客户提交）
│   ├── orders/         # 我的订单页（客户查看订单/确认报价）
│   └── admin/           # 商家后台（商家报价）
│
├── cloudfunctions/
│   ├── submitOrder/    # 提交订单到云数据库
│   ├── getOrders/      # 查询订单列表
│   ├── submitQuote/    # 商家提交报价
│   └── confirmOrder/   # 客户确认报价
│
└── README.md           # 本文件
```

## 🚀 部署步骤

### 第一步：下载开发者工具
下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 第二步：在微信公众平台创建小程序
1. 打开 https://mp.weixin.qq.com/ 登录
2. 点击「开发」→「开发管理」→「开发设置」
3. 记下 AppID（以 wx 开头）

### 第三步：开通云开发
1. 在小程序后台 → 点击左侧「云开发」
2. 点击「开通」→ 等待初始化完成
3. 开通后在云开发控制台记下**环境 ID**（格式如 `led-cloud-xxxx`）

### 第四步：初始化 project.config.json
用微信开发者工具打开本项目，编辑 `app.js`：

```javascript
// 把这行：
env: 'led-custom-order-xxxxxx',

// 改成你的环境ID（从云开发控制台复制）：
env: '你的环境ID',
```

同时编辑 `project.config.json`，把 `appid` 改成你的真实 AppID。

### 第五步：上传云函数
在微信开发者工具中：

1. 右键点击 `cloudfunctions/submitOrder` → 「上传并部署」
2. 右键点击 `cloudfunctions/getOrders` → 「上传并部署」
3. 右键点击 `cloudfunctions/submitQuote` → 「上传并部署」
4. 右键点击 `cloudfunctions/confirmOrder` → 「上传并部署」

⚠️ 注意：每个云函数都要单独上传，且第一次上传会创建云数据库集合。

### 第六步：创建数据库集合
云函数上传后会自动创建 `orders` 集合。
如果没自动创建，手动在云开发控制台 → 「数据库」→ 新建集合 `orders`，权限设为「所有用户可读，仅创建者及管理员可写」。

**推荐权限配置（orders 集合）：**
- 集合权限：仅创建者及管理员可写
- 查询：关闭「需登录」，或设为所有用户可读

## 🔐 商家后台密码
- 默认密码：`lyc123`
- 在 `pages/admin/admin.js` 中修改 `ADMIN_PWD` 常量

## 📱 商家入口
在微信中打开小程序 → 点击「我的订单」→ 底部有「商家入口」链接（密码验证后进入）

## ⚙️ 配置项

| 配置项 | 文件位置 | 说明 |
|--------|---------|------|
| 云环境ID | app.js | 云开发控制台复制 |
| 商家密码 | pages/admin/admin.js | ADMIN_PWD |
| 税率 | pages/admin/admin.js | TAX_RATE = 0.08 |
| 定金比例 | pages/admin/admin.js | 0.3 (30%) |
