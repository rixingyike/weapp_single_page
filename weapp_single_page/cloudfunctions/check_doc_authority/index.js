// 小微商户支付
const cloud = require("wx-server-sdk")

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let { OPENID: openid } = wxContext
  const { goodsBody: order_body } = event
  if (!openid) openid = event.openid

  const _ = db.command
  const res = await db.collection("pay_order").where({
    _openid: _.eq(openid),
    order_body: _.eq(order_body),
    paid: _.eq(true)
  }).orderBy("data_created", "desc").limit(1).get().catch(console.log)

  if (res && res.errMsg === "collection.get:ok"){
    const data = res.data[0]
    if (data && data.paid) return { errMsg: "ok", data}
  }

  return { errMsg: "没有找到购买记录" }
}