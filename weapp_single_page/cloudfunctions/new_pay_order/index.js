// 小微商户支付
const cloud = require("wx-server-sdk")
const wepay = require("./small_micro_pay.js")
const short = require("short-uuid")
const axios = require("axios")

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let { OPENID: openid } = wxContext
  const { totalFee: total_fee, goodsBody: goods_body } = event
  // if (!openid) openid = event.openid

  let outTradeNo = `${new Date().getFullYear()}${short().new()}`
    , order_body = goods_body
    , trade = {
      out_trade_no: outTradeNo, // 开发者支付定单ID
      total_fee, // 以分为单位，货币的最小金额
      body: order_body, // 最长127字节
      notify_url: `http://frp.yishulun.com/api/pay_order/small_micro_pay/pay_success_notify`, // 支付成功的通知回调地址
      type: "wechat",
      goods_detail: "",
      attach: "",
      nonce_str: wepay.getRandomNumber()
    }
  trade.sign = wepay.getSign(trade)
  let payOrderRes = await axios.post("https://admin.xunhuweb.com/pay/payment", trade)
  // 写库
  const { out_trade_no, order_id, nonce_str, code_url: qrcode_url } = payOrderRes.data
  const saveRecordRes = await db.collection("pay_order").add({
    // data 字段表示需新增的 JSON 数据
    data: {
      _openid: openid,
      total_fee,
      order_body,
      out_trade_no,
      order_id,
      nonce_str,
      qrcode_url,
      date_created: db.serverDate(),
      paid: false
    }
  }).catch(console.log)
  if (saveRecordRes && saveRecordRes._id) {
    const qrCodeimageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=20&data=${encodeURI(qrcode_url)}`
    return {
      errMsg: "ok", data: {
        qrCodeimageUrl,
        id: saveRecordRes._id
      }
    }
  } else {
    ctx.status = 200
    ctx.body = { errMsg: "生成支付订单未成功" }
  }
}