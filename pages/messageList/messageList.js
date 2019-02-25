var app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:[],
    name:'',
    image:'https://image.51zan.com/',
    logo_url:''
  },
  // 跳转动态详情
  trendsDetail(e) {
    let index = e.currentTarget.dataset.index;
    let that = this;
    if (!that.data.data[index].feed) {
      wx.showToast({
        title: '该动态已被删除',
        duration: 2000,
        icon: 'none'
      })
    } else {
      wx.navigateTo({
        url: '/pages/trendsDetail/trendsDetail?id=' + e.currentTarget.dataset.id,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var that=this
    wx.request({
      url: app.globalData.http + '/mpa/comment/unread',
      method: 'GET',
      dataType: 'json',
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success: function (data) {
        wx.hideLoading();
        for (let i = 0; i < data.data.length; i++) {
          data.data[i].time_stamp = that.getTime(data.data[i].updated_at)
          if (data.data[i].feed) {
            if (data.data[i].feed.type == 1 && data.data[i].images.length) {
              data.data[i].img_url = data.data[i].images[0].img_url
            }
          }
        }
        that.setData({
          data: data.data,
          name: app.globalData.name,
          logo_url: app.globalData.logo_url
        })
      },
      fail() {
        wx.hideLoading();
        wx.showToast({
          title: '获取动态数据失败，请重试',
          icon: 'none'
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
      }
    })
  },
  // 时间格式化
  getTime: function (value) {
    // var reg = getRegExp('/-/')
    var timestamp = value.replace(/-/gi, '/')
    timestamp = new Date(timestamp).getTime()
    var nowTime = new Date().getTime()
    var disTime = nowTime - timestamp;
    if (disTime < 60 * 60 * 1000) {
      var time = Math.ceil(disTime / 60 / 1000)
      time = time + '分钟前'
    } else if (disTime < 24 * 60 * 60 * 1000) {
      var time = Math.ceil(disTime / 60 / 1000 / 60)
      time = time + '小时前'
    } else if (disTime < 2 * 24 * 60 * 60 * 1000) {
      var time = '昨天' + value.substring(11, 16)
    } else {
      var time = value
    }
    return time
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