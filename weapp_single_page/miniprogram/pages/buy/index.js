// pages/buy/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrCodeimageUrl: "",
    docName: "",
    totalFee: 1,
    id: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      docName: options.docName
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {
    const { docName, totalFee } = this.data
    const res = await wx.cloud.callFunction({
      name: "new_pay_order",
      data: {
        goodsBody: docName,
        totalFee
      }
    }).catch(console.log)
    if (res && res.errMsg === "cloud.callFunction:ok") {
      const result = res.result
      if (result && result.errMsg === "ok") {
        const { qrCodeimageUrl, id } = result.data
        this.setData({
          qrCodeimageUrl,
          id
        })
      }
    }
  },

  async back(e) {
    const { id } = this.data
    const res = await wx.cloud.callFunction({
      name: "query_pay_state",
      data: {
        id
      }
    }).catch(console.log)
    if (res && res.errMsg === "cloud.callFunction:ok") {
      const result = res.result
      if (result && result.errMsg === "ok" && result.data.paid) {
        // 有权限
        wx.navigateBack({
          delta: -1,
        })
        return
      }
    }
    wx.showModal({
      title: "未支付？",
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})