// pages/groupList/goupList.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rank:2,
    data: [],
    x:[0,1],
    image: 'http://image.yiqixuan.com/'
  },
  // 选择不同类型订单
  bindRank (e) {
    let rank = e.currentTarget.dataset.id;
    this.setData({
      rank:rank
    })
    this.getData();
  },
  // 查看订单详情
  toOrderDetail (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?id=' + id,
    })
  },
  // 立即购买，跳转商品详情
  toDetail (e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
    })
  },
  // 获取列表数据
  getData () {
    let that = this;
    wx.request({
      url: app.globalData.http + '/mpa/groupon',
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      data: {
        status: that.data.rank
      },
      method: 'GET',
      success(res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          that.setData({
            data: res.data
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的拼团',
    })
    wx.showLoading({
      title: '加载中',
    })
    this.getData();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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