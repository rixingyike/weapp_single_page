/**
 * @author 石桥码农 
 * 小白学编程7天入门，关注微信视频号“石桥码农”开启学习之路
 */
const { envList } = require('../../envList.js');

Page({
  data: {
    powerList: [{
      title: '小白学编程7天入门',
      tip: '面向编程初学者提倡入门互动书',
      showItem: true,
      item: [{
        title: "2021极客时间应邀4周年感言",
        docPath: 'cloud://weapp-ebfl5.7765-weapp-ebfl5-1301675402/2021极客时间应邀4周年感言.pdf'
      },
      {
        title: "诗词小集",
        docPath: 'cloud://weapp-ebfl5.7765-weapp-ebfl5-1301675402/诗词小集.pdf'
      }
      ]
    }],
    envList,
    selectedEnv: envList[0],
    haveCreateCollection: false
  },

  jumpPage(e) {
    const doc = e.target.dataset.page
    if(doc) this.checkDocAuthority(doc)
  },

  async checkDocAuthority(doc) {
    console.log("doc", doc);
    const { title: docName, docPath } = doc
    console.log(doc, docName);
    const res = await wx.cloud.callFunction({
      name: "check_doc_authority",
      data: {
        goodsBody: docName,
      }
    }).catch(console.log)
    if (res && res.errMsg === "cloud.callFunction:ok") {
      const result = res.result
      if (result && result.errMsg === "ok" && result.data.paid) {
        // 有阅读权限
        wx.navigateTo({
          url: `/pages/read/index?docPath=${docPath}`
        })
        return
      }
    }
    // 没有阅读权限
    wx.navigateTo({
      url: `/pages/buy/index?docName=${docName}`
    })
  }
});
