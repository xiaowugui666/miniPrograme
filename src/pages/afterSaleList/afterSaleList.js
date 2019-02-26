// pages/groupList/goupList.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 500,
    rank:1,
    data: [],
    image: 'https://image.51zan.com/'
  },
  // 选择不同类型订单
  bindRank (e) {
    wx.showLoading({
      title: '加载中',
    })
    let rank = e.currentTarget.dataset.id;
    let that = this;
    that.setData({
      rank: rank,
      status: 500
    })
    if (rank == 1) {
      wx.request({
        url: app.globalData.http + '/mpa/groupon/user/refund',
        method: 'get',
        dataType: 'json',
        // data: {
        //   status: 2
        // },
        header: {
          "Api-Key": app.globalData.apiKey,
          "Api-Secret": app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success(res) {
          wx.hideLoading();
          that.setData({
            data: res.data
          })
        }
      })
    } else {
      wx.request({
        url: app.globalData.http + '/mpa/after_sale',
        method: 'get',
        dataType: 'json',
        // data: {
        //   status: 500
        // },
        header: {
          "Api-Key": app.globalData.apiKey,
          "Api-Secret": app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success(res) {
          wx.hideLoading();
          that.setData({
            data: res.data
          })
        }
      })
    }
  },
  bindStatus(e) {
    let status = e.currentTarget.dataset.id;
    let that = this;
    if (that.data.rank == 2) {
      wx.request({
        url: app.globalData.http + '/mpa/after_sale',
        method: 'get',
        dataType: 'json',
        data: {
          status: status
        },
        header: {
          "Api-Key": app.globalData.apiKey,
          "Api-Secret": app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success(res) {
          that.setData({
            data: res.data,
            status: status
          })
        }
      })
    } else {
      wx.request({
        url: app.globalData.http + '/mpa/groupon/user/refund',
        method: 'get',
        dataType: 'json',
        data: {
          status: status == 500 ? 2 : 3
        },
        header: {
          "Api-Key": app.globalData.apiKey,
          "Api-Secret": app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success(res) {
          that.setData({
            data: res.data,
            status: status
          })
        }
      })
    }
    
  },
  // 跳转售后详情订单
  toDetail (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    console.log(e)
    console.log(index)
    console.log(that.data.data)
    if (!that.data.data[index].is_groupon) {
      wx.navigateTo({
        url: '/pages/refundDetail/refundDetail?id=' + that.data.data[index].id,
      })
    } else {
      wx.navigateTo({
        url: '/pages/groupPurchase/refundProgress/refundProgress?id=' + that.data.data[index].id,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.setNavigationBarTitle({
      title: '售后列表',
    })
    wx.request({
      url: app.globalData.http +  '/mpa/groupon/user/refund',
      method: 'get',
      dataType: 'json',
      data: {
        status: 1
      },
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success (res) {
        console.log(res)
        that.setData({
          data: res.data
        })
      }
    })
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