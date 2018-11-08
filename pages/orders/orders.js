var app=getApp()
Page({
  data: {
    /** 
        * 页面配置 
        */
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    index:0,
    allOrder:[],
    scrollId: '',
    image: 'http://image.yiqixuan.com/',
    // apiSecret:'',
    // apiKey:'',
    disabled:false,
    url:''
  },
  
  onLoad: function (options){
    var that = this;
    if (options.curTab==500){
      that.setData({
        currentTab: options.curTab,
        url: app.globalData.http + '/mpa/after_sale'
      })
    }else{
      that.setData({
        currentTab: options.curTab,
        url: app.globalData.http + '/mpa/order'
      })
    }
    
  },

  changeScrollId (e) {
    this.setData({
      scrollId: e.currentTarget.id
    })
  },

  onShow: function () {
    if (this.data.allOrder.length > 0) {
      return
    }
    var that = this;
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        url:that.data.url,
        data:{
          page:this.data.index,
          per_page:15,
          status: that.data.currentTab
        },

        method:'get',
        dataType:'json',
        header: {
          "Api-Key": app.globalData.apiKey,
          "Api-Secret": app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success:function(data){
          var code = data.statusCode.toString()
          if (code.indexOf('20') > -1 && data.data.length > 0) {
            that.setData({
              allOrder: data.data
            })
          } else {
            that.setData({
              allOrder: ''
            })
          }         
        },
        fail:function(){
          that.setData({
            allOrder: ''
          })
        },
        complete:function(){
          wx.hideLoading()
        }
      })
    /** 
     * 获取系统信息 
     */
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }

    });
  },
  /* 查询支付状态*/
  checkPay: function (id,index,list) {
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
            var code = data.statusCode.toString()
            if (code >= 200 && code<300) {
              if (data.data.status == 205 && !list[index].groupon_member) {
                clearInterval(time)
                wx.hideLoading()
                wx.showToast({
                  title: '支付成功',
                  icon: 'success',
                  duration: 1000
                })
                var num = 'allOrder[' + index + '].status'
                that.setData({
                  [num]: 205
                })
                setTimeout(function () {
                  wx.navigateTo({
                    url: '/pages/orderDetail/orderDetail?id=' + id,
                  })
                }, 1000)
              } else if (data.data.status == 255 || data.data.status == 207 || data.data.status == 205) {
                clearInterval(time)
                wx.hideLoading()
                wx.showToast({
                  title: '支付成功',
                  icon: 'success',
                  duration: 1000
                })
                var num = 'allOrder[' + index + '].status'
                that.setData({
                  [num]: data.data.status
                })
                let goodsid = list[index].groupon_member.goods_id, groupid = list[index].groupon_member.groupon_id;
                setTimeout(function(){
                  wx.navigateTo({
                    url: '/pages/groupPurchase/groupShareDetails/groupShareDetails?groupid=' + groupid + '&goodsid=' + goodsid,
                  })
                },1000)
              }
            } else {
              clearInterval(time)
              wx.hideLoading()
              var tip = data.data.message.toString()
              wx.showToast({
                title: tip,
                icon: 'none',
                duration: 1000
              })
              setTimeout(function () {
                wx.navigateTo({
                  url: '/pages/orderDetail/orderDetail?id=' + id,
                })
              }, 1000)
            }

          },
          fail: function (res) {
            wx.hideLoading()
            wx.showToast({
              title: '支付失败',
              icon: 'none',
              duration: 500
            })
            clearInterval(time)
            that.setData({
              disabled: false
            })
            wx.navigateTo({
              url: '/pages/orderDetail/orderDetail?id=' + id,
            })
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 500
        })
        clearInterval(time)
        that.setData({
          disabled: false
        })
      }
    }, 1000)
  },
/*立即付款*/
  payMoney: function (event){
    var id = event.target.dataset.orderid
    var no = event.target.dataset.no
    var index = event.target.dataset.index
    var that=this
    let list = JSON.parse(JSON.stringify(that.data.allOrder))
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
                that.checkPay(id, index, list)
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
// 拼单详情
grouponDetail (e) {
  wx.navigateTo({
    url: '/pages/groupPurchase/groupShareDetails/groupShareDetails?groupid=' + e.currentTarget.dataset.groupid + '&goodsid=' + e.currentTarget.dataset.goodsid,
  })
},
/*查看物流*/
  checkLogistics:function(event){
    var id = event.target.dataset.orderid;
    wx.navigateTo({
      url: '/pages/logistics/logistics?id='+id
    })
  },

  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });

  },
  /*申请售后*/
  cancelOrder:function(event){
    var id = event.target.dataset.orderid;
    wx.navigateTo({
      url: '/pages/afterSale/afterSale?id='+id,
    })
  },
  /*取消订单*/
  cancel:function(event){
    var that=this
    var id = event.target.dataset.orderid;
    wx.showModal({
      title: '温馨提示',
      content: '确认要取消订单吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.http + '/mpa/order/' + id +'/canceled',
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
              var code=data.statusCode.toString()
              if (code.indexOf('20')>-1) {
                var newArr = that.data.allOrder
                for (var i = 0; i < newArr.length; i++) {
                  /*取消订单*/
                  if (newArr[i].id === id) {
                    newArr.splice(i, 1);
                    that.setData({
                      allOrder: newArr
                    })
                  }
                }
                wx.showToast({
                  title: '取消成功',
                  icon:'success',
                  duration:1000
                })
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
  /*确认收货 */
  confirm: function(event){
    var that=this;
    var id = event.target.dataset.orderid;
    wx.showModal({
      title: '温馨提示',
      content: '确认已经收到货了吗',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.http + '/mpa/order/' + id +'/received',
            method:'PUT',
            dataType:'json',
            data:{
              status:405
            },
            header: {
              "Api-Key": app.globalData.apiKey,
              "Api-Secret": app.globalData.apiSecret,
              'Api-Ext': app.globalData.apiExt
            },
            success:function(data){
              var code = data.statusCode.toString()
              
              if(code.indexOf('20')>-1){
                that.swichNav(405)
              }else{
                var tip=data.data.message.toString()
                  wx.showToast({
                    title:tip,
                    icon:'none',
                    duration:1000
                  })
              }
            },
            fail:function(){
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


  /*下拉加载*/
  getMore:function(){
    var that=this;
    var indexs=this.data.index;
    indexs++;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: that.data.url,
      data: {
        page: indexs,
        per_page: 15,
        status: this.data.currentTab
      },
      method: 'get',
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      dataType: 'json',
      success: function (data) {
        var code=data.statusCode.toString()
        if(code>=200 && code<=300){
          if(data.data.length>0){
            var order = that.data.allOrder
            order = order.concat(data.data)
            that.setData({
              allOrder: order,
              index: indexs
            })
          }
        }
      },
      complete:function(){
        wx.hideLoading()
      }
    })
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    var status;
    if (e == 405) {
      status = 405
    } else {
      status = e.target.dataset.current
    }
    if (status == 500) {
      var url = app.globalData.http + '/mpa/after_sale';
    }else{
      var url = app.globalData.http + '/mpa/order';
    }
    that.setData({
      index: 0,
      currentTab: status,
      url: url
    })
    wx.request({
      url:url,
      data: {
        page: 0,
        per_page: 15,
        status: status
      },
      method: 'get',
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      dataType: 'json',
      success: function (data) {
          var code=data.statusCode.toString()
          if (code.indexOf('20') > -1 && data.data.length>0 ){
            that.setData({
              allOrder: data.data
            })
          }else{
            that.setData({
              allOrder: ''
            })
          }   
      },
      fail:function(){
        that.setData({
          allOrder:''
        })
      }
    })
  }
})  