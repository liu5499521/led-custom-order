// 路由和状态管理
const router = {
  currentPage: 'home',
  params: {}
};

// 表单数据
const formData = {
  // 灯珠规格
  spec: '',
  voltage: '',
  cct: '',
  ledCount: '',
  seriesParallel: '',
  solutionType: '',
  targetPower: '',
  powerType: '',
  application: '',
  returnSample: false,
  returnSampleDesc: '',
  // 联系方式
  contactCompany: '',
  contactName: '',
  contactPhone: '',
  // 补充说明
  deliveryNote: ''
};

// 订单数据
const orderState = {
  phone: '',
  orders: [],
  loading: false,
  currentOrder: null
};

// 选项数据
const options = {
  specs: ['2835', '3528', '5050', '5630', '5730', '3014', '2016', '0603', '0805', '1206', '分立光源', 'COB', 'CSP'],
  voltages: ['3V', '6V', '9V', '12V', '18V', '24V', '36V', '48V', 'Custom'],
  ccts: ['2700K', '3000K', '4000K', '5000K', '5500K', '6000K', '6500K', 'RGB', 'Custom'],
  solutions: ['恒流方案', '恒压方案', '线性方案', '自定义方案'],
  powerTypes: ['低功率(<1W)', '中功率(1-3W)', '高功率(>3W)']
};

// 渲染App
function render() {
  const app = document.getElementById('app');
  switch (router.currentPage) {
    case 'home':
      app.innerHTML = renderHome();
      bindHomeEvents();
      updateCopyPreview();
      break;
    case 'orders':
      app.innerHTML = renderOrders();
      bindOrdersEvents();
      break;
    case 'orderDetail':
      app.innerHTML = renderOrderDetail();
      bindOrderDetailEvents();
      break;
    case 'admin':
      app.innerHTML = renderAdmin();
      bindAdminEvents();
      break;
  }
}

// 首页 - 询价表单
function renderHome() {
  return `
    <div class="page-home">
      <header class="header">
        <h1>💎 灯珠定制询价单</h1>
        <p class="subtitle">填写以下参数，提交后等待商家报价</p>
      </header>

      <nav class="nav">
        <button class="nav-btn" onclick="navigate('orders')">📋 我的订单</button>
      </nav>

      <form class="form" id="orderForm">
        <!-- 灯珠规格 -->
        <div class="card">
          <div class="card-header">💡 灯珠规格</div>
          <select class="select" data-field="spec">
            <option value="">请选择规格</option>
            ${options.specs.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>

        <!-- 电压 -->
        <div class="card">
          <div class="card-header">⚡ 电压</div>
          <select class="select" data-field="voltage">
            <option value="">请选择电压</option>
            ${options.voltages.map(v => `<option value="${v}">${v}</option>`).join('')}
          </select>
        </div>

        <!-- 色温 -->
        <div class="card">
          <div class="card-header">🌈 色温</div>
          <select class="select" data-field="cct">
            <option value="">请选择色温</option>
            ${options.ccts.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>

        <!-- 灯珠数量 & 串并数 -->
        <div class="card card-row">
          <div class="card-item">
            <div class="card-header">🔢 灯珠数量</div>
            <input type="number" class="input" data-field="ledCount" placeholder="如：240">
          </div>
          <div class="card-item">
            <div class="card-header">🔗 串并数</div>
            <input type="text" class="input" data-field="seriesParallel" placeholder="如：三并24串">
          </div>
        </div>

        <!-- 方案类型 & 目标功率 -->
        <div class="card card-row">
          <div class="card-item">
            <div class="card-header">⚙️ 方案类型</div>
            <select class="select" data-field="solutionType">
              <option value="">请选择</option>
              ${options.solutions.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          <div class="card-item">
            <div class="card-header">🎯 目标功率(W)</div>
            <input type="number" class="input" data-field="targetPower" placeholder="如：50">
          </div>
        </div>

        <!-- 功率类型 -->
        <div class="card">
          <div class="card-header">📊 功率类型</div>
          <select class="select" data-field="powerType">
            <option value="">请选择功率类型</option>
            ${options.powerTypes.map(p => `<option value="${p}">${p}</option>`).join('')}
          </select>
        </div>

        <!-- 产品应用 -->
        <div class="card">
          <div class="card-header">🏷️ 产品应用</div>
          <input type="text" class="input" data-field="application" placeholder="如：植物灯 / 美容灯 / 消毒灯 / 台灯">
        </div>

        <!-- 寄回样品 -->
        <div class="card">
          <div class="card-header">📦 寄回样品</div>
          <label class="checkbox-label">
            <input type="checkbox" data-field="returnSample">
            <span>需要寄回样品打样确认</span>
          </label>
          <input type="text" class="input margin-top" data-field="returnSampleDesc" placeholder="样品描述（数量、尺寸等）" style="display:none">
        </div>

        <!-- 联系方式 -->
        <div class="card">
          <div class="card-header">📞 联系方式</div>
          <input type="text" class="input" data-field="contactCompany" placeholder="公司名称（选填）">
          <input type="text" class="input margin-top" data-field="contactName" placeholder="联系人 *" required>
          <input type="tel" class="input margin-top" data-field="contactPhone" placeholder="手机号 *" maxlength="11" required>
        </div>

        <!-- 补充说明 -->
        <div class="card">
          <div class="card-header">📝 补充说明（选填）</div>
          <input type="text" class="input" data-field="deliveryNote" placeholder="如：特殊时间要求、注意事项等">
        </div>

        <!-- 一键复制全部信息 -->
        <div class="card">
          <div class="card-header">📋 一键复制寄件信息</div>
          <div class="copy-info" id="copyInfoBox">
            <div class="copy-hint">点击下方按钮，复制全部信息用于寄快递</div>
            <div class="copy-preview" id="copyPreview"></div>
          </div>
          <button type="button" class="btn-copy" id="copyAllBtn" onclick="copyAllInfo()">📋 一键复制全部信息</button>
        </div>

        <!-- 提交按钮 -->
        <div class="submit-wrap">
          <button type="submit" class="btn-submit" id="submitBtn">提交询价 👉</button>
        </div>

        <!-- 商家入口 -->
        <div class="submit-wrap" style="margin-top:12px;">
          <button type="button" class="btn-admin" onclick="showAdminLogin()">🔐 商家入口</button>
        </div>
      </form>
    </div>
  `;
}

// 订单列表页
function renderOrders() {
  const statusLabels = {
    pending: '待报价',
    quoted: '待付款',
    paid: '审核中',
    confirmed: '已完成'
  };

  return `
    <div class="page-orders">
      <header class="header">
        <button class="back-btn" onclick="navigate('home')">← 返回</button>
        <h1>📋 我的订单</h1>
      </header>

      ${!orderState.phone ? `
        <div class="phone-query">
          <p class="phone-tip">📱 请先输入查询手机号</p>
          <input type="tel" class="input" id="phoneInput" placeholder="输入手机号" maxlength="11">
          <button class="btn-query" onclick="queryOrders()">查询</button>
        </div>
      ` : `
        <div class="phone-info">
          <span>📱 ${orderState.phone}</span>
          <button class="change-phone" onclick="clearPhone()">切换</button>
        </div>

        <div class="orders-list">
          ${orderState.loading ? '<div class="loading">加载中...</div>' : ''}
          ${!orderState.loading && orderState.orders.length === 0 ? `
            <div class="empty">
              <div class="empty-icon">📋</div>
              <p class="empty-text">暂无订单记录</p>
              <p class="empty-sub">提交询价后将显示在此处</p>
            </div>
          ` : ''}
          ${orderState.orders.map(order => `
            <div class="order-card" onclick="viewOrderDetail('${order._id}')">
              <div class="order-header">
                <span class="order-id">#${order._id.slice(-6).toUpperCase()}</span>
                <span class="order-status status-${order.status}">${statusLabels[order.status] || '未知'}</span>
              </div>
              <div class="order-params">
                ${[order.spec, order.voltage, order.cct, order.ledCount ? order.ledCount + '颗' : '', order.targetPower ? order.targetPower + 'W' : ''].filter(Boolean).join(' · ')}
              </div>
              <div class="order-meta">
                <span>${formatTime(order.createdAt)}</span>
                <span>${order.contactName} · ${order.contactPhone}</span>
              </div>
              ${order.quote ? `
                <div class="quote-summary">
                  <span>单价 ¥${order.quote.pricePerK}/K</span>
                  <span>总价 ¥${order.quote.totalNoTax}（未税）</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

// 订单详情页
function renderOrderDetail() {
  const order = orderState.currentOrder;
  if (!order) return '<div class="loading">加载中...</div>';

  const statusLabels = {
    pending: '待报价',
    quoted: '待付款',
    paid: '审核中',
    confirmed: '已完成'
  };

  return `
    <div class="page-detail">
      <header class="header">
        <button class="back-btn" onclick="navigate('orders')">← 返回</button>
        <h1>订单详情</h1>
      </header>

      <div class="detail-card">
        <div class="detail-header">
          <span class="order-id">#${order._id.slice(-6).toUpperCase()}</span>
          <span class="order-status status-${order.status}">${statusLabels[order.status] || '未知'}</span>
        </div>

        <div class="detail-section">
          <h3>📋 询价参数</h3>
          <div class="detail-grid">
            <div class="detail-item"><label>规格</label><span>${order.spec || '-'}</span></div>
            <div class="detail-item"><label>电压</label><span>${order.voltage || '-'}</span></div>
            <div class="detail-item"><label>色温</label><span>${order.cct || '-'}</span></div>
            <div class="detail-item"><label>灯珠数量</label><span>${order.ledCount || '-'}颗</span></div>
            <div class="detail-item"><label>串并数</label><span>${order.seriesParallel || '-'}</span></div>
            <div class="detail-item"><label>方案类型</label><span>${order.solutionType || '-'}</span></div>
            <div class="detail-item"><label>目标功率</label><span>${order.targetPower ? order.targetPower + 'W' : '-'}</span></div>
            <div class="detail-item"><label>功率类型</label><span>${order.powerType || '-'}</span></div>
            <div class="detail-item"><label>产品应用</label><span>${order.application || '-'}</span></div>
            <div class="detail-item"><label>寄回样品</label><span>${order.returnSample ? '是' : '否'}</span></div>
          </div>
        </div>

        <div class="detail-section">
          <h3>📞 联系方式</h3>
          <div class="detail-grid">
            <div class="detail-item"><label>公司</label><span>${order.contactCompany || '-'}</span></div>
            <div class="detail-item"><label>联系人</label><span>${order.contactName || '-'}</span></div>
            <div class="detail-item"><label>手机</label><span>${order.contactPhone || '-'}</span></div>
          </div>
        </div>

        ${order.quote ? `
          <div class="detail-section">
            <h3>💰 报价信息</h3>
            <div class="detail-grid">
              <div class="detail-item"><label>单价</label><span>¥${order.quote.pricePerK}/K</span></div>
              <div class="detail-item"><label>起订量</label><span>${order.quote.minQty}K</span></div>
              <div class="detail-item"><label>未税总价</label><span class="price">¥${order.quote.totalNoTax}</span></div>
              ${order.quote.taxAmount ? `<div class="detail-item"><label>税额</label><span>¥${order.quote.taxAmount}</span></div>` : ''}
              ${order.quote.totalWithTax ? `<div class="detail-item"><label>含税总价</label><span class="price">¥${order.quote.totalWithTax}</span></div>` : ''}
              ${order.quote.deposit ? `<div class="detail-item"><label>定金(30%)</label><span class="price">¥${order.quote.deposit}</span></div>` : ''}
              <div class="detail-item"><label>税种</label><span>${order.quote.taxType}</span></div>
            </div>
            ${order.quote.note ? `<p class="quote-note">💬 备注：${order.quote.note}</p>` : ''}
          </div>
        ` : ''}

        ${order.status === 'quoted' ? `
          <div class="detail-section pay-section">
            <h3>💚 支付宝转账</h3>
            <div class="qr-container">
              <img src="../../alipay-qr.jpg" alt="支付宝收款码" class="qr-img" onclick="previewImage(this.src)">
            </div>
            <p class="pay-tip">长按保存 → 打开支付宝扫一扫</p>
            <p class="pay-amount">转账 ¥${order.quote?.deposit || 0}，备注：${order._id.slice(-8).toUpperCase()}</p>
            <button class="btn-upload" onclick="uploadPaymentProof('${order._id}')">💚 我已转账，上传付款截图</button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// 商家后台
function renderAdmin() {
  const statusLabels = {
    all: '全部订单',
    pending: '待报价',
    quoted: '待客户确认',
    confirmed: '已完成'
  };

  const tabs = ['all', 'pending', 'quoted', 'confirmed'];
  const currentTab = adminState.currentTab;

  let filteredOrders = adminState.orders;
  if (currentTab !== 'all') {
    filteredOrders = adminState.orders.filter(o => o.status === currentTab);
  }

  return `
    <div class="page-admin">
      <header class="header">
        <button class="back-btn" onclick="navigate('home')">← 返回</button>
        <h1>🔐 商家后台</h1>
        <button class="logout-btn" onclick="adminLogout()">退出</button>
      </header>

      <div class="admin-tabs">
        ${tabs.map(tab => `
          <button class="admin-tab ${currentTab === tab ? 'active' : ''}" onclick="switchAdminTab('${tab}')">
            ${statusLabels[tab]}
            <span class="tab-count">${tab === 'all' ? adminState.orders.length : adminState.orders.filter(o => o.status === tab).length}</span>
          </button>
        `).join('')}
      </div>

      <div class="admin-content">
        ${adminState.loading ? '<div class="loading">加载中...</div>' : ''}
        ${!adminState.loading && filteredOrders.length === 0 ? `
          <div class="empty">
            <div class="empty-icon">📋</div>
            <p class="empty-text">暂无${statusLabels[currentTab]}</p>
          </div>
        ` : ''}
        ${filteredOrders.map(order => `
          <div class="admin-order-card" onclick="viewAdminOrderDetail('${order._id}')">
            <div class="order-header">
              <span class="order-id">#${order._id.slice(-6).toUpperCase()}</span>
              <span class="order-status status-${order.status}">${statusLabels[order.status] || '未知'}</span>
            </div>
            <div class="order-params">
              ${[order.spec, order.voltage, order.cct, order.ledCount ? order.ledCount + '颗' : '', order.targetPower ? order.targetPower + 'W' : ''].filter(Boolean).join(' · ')}
            </div>
            <div class="order-meta">
              <span>${formatTime(order.createdAt)}</span>
              <span>${order.contactName} · ${order.contactPhone}</span>
            </div>
            ${order.quote ? `
              <div class="quote-summary">
                <span>单价 ¥${order.quote.pricePerK}/K</span>
                <span>总价 ¥${order.quote.totalNoTax}（未税）</span>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 绑定商家后台事件
function bindAdminEvents() {
  // 事件绑定
}

// 商家状态
const adminState = {
  password: 'admin123',
  isLoggedIn: false,
  orders: [],
  loading: false,
  currentTab: 'all'
};

// 显示商家登录框
function showAdminLogin() {
  const password = prompt('请输入商家密码：');
  if (password === adminState.password) {
    adminState.isLoggedIn = true;
    loadAdminOrders();
    navigate('admin');
  } else if (password !== null) {
    alert('密码错误！');
  }
}

// 退出商家后台
function adminLogout() {
  adminState.isLoggedIn = false;
  adminState.orders = [];
  adminState.currentTab = 'all';
  navigate('home');
}

// 加载商家订单
async function loadAdminOrders() {
  adminState.loading = true;
  render();

  try {
    const result = await API.callFunction('getOrders', { admin: true, tab: adminState.currentTab });
    adminState.orders = result.orders || [];
  } catch (err) {
    console.error('加载订单失败:', err);
    adminState.orders = [];
  }

  adminState.loading = false;
  render();
}

// 切换商家后台Tab
function switchAdminTab(tab) {
  adminState.currentTab = tab;
  loadAdminOrders();
}

// 查看商家订单详情
function viewAdminOrderDetail(orderId) {
  const order = adminState.orders.find(o => o._id === orderId);
  if (order) {
    orderState.currentOrder = order;
    navigate('orderDetail');
  }
}

// 更新复制预览
function updateCopyPreview() {
  const preview = document.getElementById('copyPreview');
  if (!preview) return;

  const info = buildCopyInfo();
  preview.innerHTML = info.replace(/\n/g, '<br>');
}

// 构建复制信息文本
function buildCopyInfo() {
  const info = [
    '【灯珠定制询价单】',
    '',
    `规格：${formData.spec || '-'}  电压：${formData.voltage || '-'}  色温：${formData.cct || '-'}`,
    `灯珠数量：${formData.ledCount || '-'}颗  串并数：${formData.seriesParallel || '-'}`,
    `方案类型：${formData.solutionType || '-'}  目标功率：${formData.targetPower ? formData.targetPower + 'W' : '-'}`,
    `功率类型：${formData.powerType || '-'}`,
    `产品应用：${formData.application || '-'}`,
    `寄回样品：${formData.returnSample ? '是' : '否'}`,
    '',
    '【联系方式】',
    `公司：${formData.contactCompany || '-'}`,
    `联系人：${formData.contactName || '-'}`,
    `手机：${formData.contactPhone || '-'}`,
    '',
    '【补充说明】',
    `${formData.deliveryNote || '-'}`
  ].filter(line => line !== undefined).join('\n');

  return info;
}

// 一键复制全部信息
async function copyAllInfo() {
  const info = buildCopyInfo();

  try {
    await navigator.clipboard.writeText(info);
    alert('已复制到剪贴板！');
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = info;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      alert('已复制到剪贴板！');
    } catch (e) {
      alert('复制失败，请手动长按选择复制');
    }
    document.body.removeChild(textarea);
  }
}

// 绑定首页事件
function bindHomeEvents() {
  const form = document.getElementById('orderForm');
  const returnSampleCheckbox = form.querySelector('[data-field="returnSample"]');
  const returnSampleDesc = form.querySelector('[data-field="returnSampleDesc"]');

  returnSampleCheckbox.addEventListener('change', (e) => {
    returnSampleDesc.style.display = e.target.checked ? 'block' : 'none';
  });

  // 绑定所有输入字段
  form.querySelectorAll('[data-field]').forEach(el => {
    const field = el.dataset.field;
    if (el.type === 'checkbox') {
      el.addEventListener('change', (e) => {
        formData[field] = e.target.checked;
        if (field === 'returnSample') {
          form.querySelector('[data-field="returnSampleDesc"]').style.display = e.target.checked ? 'block' : 'none';
        }
      });
    } else {
      el.addEventListener('input', (e) => {
        formData[field] = e.target.value;
      });
      el.addEventListener('change', (e) => {
        formData[field] = e.target.value;
      });
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitOrder();
  });
}

// 绑定订单列表事件
function bindOrdersEvents() {
  const phoneInput = document.getElementById('phoneInput');
  if (phoneInput) {
    phoneInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') queryOrders();
    });
  }
}

// 绑定订单详情事件
function bindOrderDetailEvents() {
  // 事件绑定
}

// 导航
function navigate(page, params = {}) {
  router.currentPage = page;
  router.params = params;
  render();
  window.scrollTo(0, 0);
}

// 查询订单
async function queryOrders() {
  const phoneInput = document.getElementById('phoneInput');
  const phone = phoneInput?.value.trim();
  if (!phone) {
    alert('请输入手机号');
    return;
  }

  orderState.phone = phone;
  orderState.loading = true;
  render();

  try {
    orderState.orders = await API.getOrders(phone);
  } catch (err) {
    alert('查询失败: ' + err.message);
  }

  orderState.loading = false;
  render();
}

// 清除手机号
function clearPhone() {
  orderState.phone = '';
  orderState.orders = [];
  render();
}

// 查看订单详情
function viewOrderDetail(orderId) {
  const order = orderState.orders.find(o => o._id === orderId);
  if (order) {
    orderState.currentOrder = order;
    navigate('orderDetail');
  }
}

// 提交询价单
async function submitOrder() {
  const btn = document.getElementById('submitBtn');
  if (!formData.contactName) {
    alert('请填写联系人');
    return;
  }
  if (!formData.contactPhone) {
    alert('请填写手机号');
    return;
  }

  btn.disabled = true;
  btn.textContent = '提交中...';

  try {
    const result = await API.submitOrder(formData);
    if (result.error) throw new Error(result.error.message || result.error);
    alert('提交成功！订单号：' + (result._id || result.orderId));
    // 重置表单
    Object.keys(formData).forEach(k => formData[k] = k === 'returnSample' ? false : '');
    navigate('orders');
  } catch (err) {
    alert('提交失败: ' + err.message);
  }

  btn.disabled = false;
  btn.textContent = '提交询价 👉';
}

// 上传支付证明（需要后端支持：云函数需改为接受base64，或提供HTTP上传接口）
async function uploadPaymentProof(orderId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 提示：后端需确认云函数是否支持HTTP base64上传
    alert('上传功能需后端确认HTTP访问配置');
    return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(',')[1];
      try {
        await API.uploadPaymentProof(orderId, base64);
        alert('上传成功！');
        // 刷新订单
        const orders = await API.getOrders(orderState.phone);
        orderState.orders = orders;
        const order = orders.find(o => o._id === orderId);
        if (order) {
          orderState.currentOrder = order;
          render();
        }
      } catch (err) {
        alert('上传失败: ' + err.message);
      }
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// 预览图片
function previewImage(src) {
  const win = window.open();
  win.document.write(`<img src="${src}" style="max-width:100%">`);
}

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// 初始化
document.addEventListener('DOMContentLoaded', render);
