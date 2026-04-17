// uploadQRCode - 上传收款码到云存储，返回 fileID
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { imageBuffer } = event
  if (!imageBuffer) {
    return { success: false, error: 'no imageBuffer' }
  }
  try {
    const buf = Buffer.from(imageBuffer, 'base64')
    const res = await cloud.uploadFile({
      cloudPath: 'payment/alipay-qr.jpg',
      fileContent: buf
    })
    return { success: true, fileID: res.fileID }
  } catch(e) {
    return { success: false, error: e.message }
  }
}
