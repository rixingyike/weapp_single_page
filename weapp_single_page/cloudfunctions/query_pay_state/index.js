// 小微商户支付
const cloud = require("wx-server-sdk")
const wepay = require("./small_micro_pay.js")
// const short = require("short-uuid")
const axios = require("axios")

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { id } = event

  const _ = db.command
  const res = await db.collection("pay_order").where({
    _id: _.eq(id)
  }).orderBy('data_created', 'desc').limit(1).get().catch(console.log)

  if (!res || !res.errMsg === "collection.get:ok" || !res.data[0]) return { errMsg: "没有找到购买记录" }

  const data = res.data[0]
  if (data.paid) {
    return { errMsg: "ok", data }
  } else {
    const { out_trade_no,
      order_id,
      nonce_str } = data
    const trade = {
      out_trade_no,
      order_id,
      nonce_str
    }
    trade.sign = wepay.getSign(trade)
    const resp = await axios.post("https://admin.xunhuweb.com/pay/query", trade)
    const paid = resp.data.status == "complete"
    if (paid) {
      data.paid = true
      await db.collection("pay_order").where({
        _id: _.eq(id)
      }).update({
        data: {
          paid: true
        }
      }).catch(console.log)
    }
    return { errMsg: "ok", data: data }
  }
}