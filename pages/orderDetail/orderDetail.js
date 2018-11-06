var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: '',
    id: '',
    show: true,
    expire_at: '00 时 00 分 00 秒',
    // apiKey:'',
    image: 'http://image.yiqixuan.com/'
    // apiSecret:''
  },
  // 阻止蒙层事件冒泡
  preventTouchMove() {
  },
  preventTap () {},
  /**
   * 生命周期函数--监听页面加载
   */
  setInterval: function (time) {
    var that = this
    var t = parseInt(time)
    var ts = setInterval(function () {
      if (t <= 1) {
        clearInterval(ts)
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
      t = t - 1;
      var hour = parseInt(t / (60 * 60));
      var minute = Math.floor((t / 60) % 60)
      var second = t % 60

      hour = hour < 10 ? '0' + hour : hour
      minute = minute < 10 ? '0' + minute : minute
      second = second < 10 ? '0' + second : second
      that.setData({
        expire_at: hour + " 时 " + minute + " 分 " + second + " 秒"
      })
    }, 1000)
  },
  onLoad: function (options) {
    var that = this;
    var id = options.id;
    that.setData({
      id: id
    })
    wx.request({
      url: app.globalData.http + '/mpa/order/' + id,
      method: 'GET',
      dataType: 'json',
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success: function (data) {
        if (data.statusCode == 200) {
          that.setData({
            info: data.data
          })
          if (data.data.status == 200) {
            var time = data.data.expire_at
            that.setInterval(time)
          }
        } else {
          wx.showToast({
            title: '无法获取正确用户信息，请正常进入小程序完成授权',
            icon: 'none',
            duration: 3000
          })
          that.setData({
            pageVisible: false
          })
        }
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  /*关闭联系商家*/
  close: function () {
    this.setData({
      show: true
    })
  },
  groupDetail () {
    wx.navigateTo({
      url: '/pages/groupPurchase/groupShareDetails/groupShareDetails?groupid=' + this.data.info.groupon_id + '&goodsid=' + this.data.info.items[0].goods_id,
    })
  },
  goDetail: function (e) {
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + e.currentTarget.dataset.goods_id,
    })
  },
  /*联系商家*/
  contacts: function () {
    this.setData({
      show: false
    })
  },
  /*查看物流*/
  checkLogistics: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/logistics/logistics?id=' + that.data.info.id
    })
  },
  /*取消订单*/
  cancel: function (event) {
    var that = this
    var id = event.target.dataset.orderid;
    wx.showModal({
      title: '温馨提示',
      content: '确认要取消订单吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.http + '/mpa/order/' + id + '/canceled',
            method: 'PUT',
            dataType: 'json',
            data: {
              status: 207
            },
            header: {
              "Api-Key": app.globalData.apiKey,
              "Api-Secret": app.globalData.apiSecret,
              'Api-Ext': app.globalData.apiExt
            },
            success: function (data) {
              var code = data.statusCode.toString()
              if (code.indexOf('20') > -1) {
                wx.showToast({
                  title: '取消成功',
                  icon: 'none',
                  duration: 1000
                })
                setTimeout(function () {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 1000)
              } else {
                var tip = data.data.message.toString()
                wx.showToast({
                  title: tip,
                  icon: 'none',
                  duration: 1000
                })
              }
            },
            fail: function () {
              wx.showToast({
                title: '网络错误',
                icon: 'none',
                duration: 1000
              })
            }
          })
        }
      }
    })
  },
  /* 查询支付状态*/
  checkPay: function (id) {
    var that = this
    var t = 90;
    wx.showLoading({
      title: '加载中',
    })
    var time = setInterval(function () {
      t--
      if (t > 1) {
        wx.request({
          url: app.globalData.http + '/mpa/order/' + id + '/status',
          method: "get",
          dataType: 'json',
          header: {
            "Api-Key": app.globalData.apiKey,
            "Api-Secret": app.globalData.apiSecret,
            'Api-Ext': app.globalData.apiExt
          },
          success: function (data) {
            if(data.statusCode>=200 && data.statusCode<300){
              if (data.data.status == 205 && that.data.info.type != 1) {
                clearInterval(time)
                wx.hideLoading()
                wx.showToast({
                  title: '支付成功',
                  icon: 'success',
                  duration: 1000
                })
                var str='info.status'
                that.setData({
                  [str]:205
                })
              } else if (data.data.status == 255 || data.data.status == 207 || data.data.status == 205) {
                clearInterval(time)
                wx.hideLoading()
                wx.showToast({
                  title: '支付成功',
                  icon: 'success',
                  duration: 1000
                })
                var str = 'info.status'
                that.setData({
                  [str]: 255
                })
                setTimeout(function(){
                  wx.navigateTo({
                    url: '/pages/groupPurchase/groupShareDetails/groupShareDetails?groupid=' + that.data.info.groupon_id + '&goodsid=' + that.data.info.items[0].goods_id,
                  })
                },1000)
              }
            }
          },
          fail: function () {
            wx.hideLoading()
            wx.showToast({
              title: '支付失败',
              icon: 'none',
              duration: 500
            }, function () {
              clearInterval(time)
              that.setData({
                disabled: false
              })
              wx.navigateTo({
                url: '/pages/orderDetail/orderDetail?id=' + id,
              })
            })

          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 500
        }, function () {
          clearInterval(time)
          that.setData({
            disabled: false
          })
          wx.navigateTo({
            url: '/pages/orderDetail/orderDetail?id=' + id,
          })
        })
      }
    }, 1000)
  },
  /*立即付款*/
  payMoney: function (event) {
    var id = event.target.dataset.orderid
    var that = this
    wx.request({
      url: app.globalData.http + '/mpa/payment/payment',
      method: "post",
      dataType: 'json',
      data: {
        'order_id': id
      },
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          var time = res.data.timeStamp
          time = time.toString()
          wx.requestPayment({
            'timeStamp': time,
            'nonceStr': res.data.result.nonce_str,
            'package': 'prepay_id=' + res.data.result.prepay_id,
            'signType': 'MD5',
            'paySign': res.data.paySign,
            'success': function (res) {
              that.checkPay(id)
            },
            'fail': function () {
              that.setData({
                disabled: false
              })
            }
          })
        } else {
          var tip = res.data.message.toString()
          wx.showToast({
            title: tip,
            icon: 'none',
            duration: 2000
          })
          that.setData({
            disabled: false
          })
        }
      },
      fail: function () {
        that.setData({
          disabled: false
        })
      }
    })

  },
  /*申请售后*/
  cancelOrder: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/afterSale/afterSale?id=' + that.data.id
    })
  },

  /*确认收货 */
  confirm: function (event) {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '确认已经收到货了吗',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.http + '/mpa/order/' + that.data.id + '/received',
            method: 'PUT',
            dataType: 'json',
            data: {
              status: 405
            },
            header: {
              "Api-Key": app.globalData.apiKey,
              "Api-Secret": app.globalData.apiSecret,
              'Api-Ext': app.globalData.apiExt
            },
            success: function (data) {
              var code = data.statusCode.toString()
              if (code >=200 && code<300) {
                wx.showToast({
                  title: '收货成功',
                  icon: 'success',
                  duration: 1000
                })
                setTimeout(function(){
                  wx.navigateTo({
                    url: '/pages/orders/orders?curTab=405',
                  })
                },1000)
              } else {
                var tip = data.data.message.toString()
                wx.showToast({
                  title: tip,
                  icon: 'none',
                  duration: 1000
                })
              }
            },
            fail: function () {
              wx.showToast({
                title: '网络错误',
                icon: 'none',
                duration: 1000
              })
            }
          })
        }
      }
    })
  },
  callPhone: function () {
    this.setData({
      show: true
    })
    wx.makePhoneCall({
      phoneNumber: app.globalData.mobile
    })
  }
})