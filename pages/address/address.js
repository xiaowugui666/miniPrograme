// pages/address/address.js
var app=getApp()
Page({
  data: {
      address:[],
      // address:[
      //   {
      //     name: '测试',
      //     mobile: '15856869998',
      //     province: '上海',
      //     city: '上海',
      //     county: '长宁区',
      //     detail: 'XXX街道XXX街道XXX街道XXX街道XXX街道XXX街道',
      //     status: 2
      //   },
      //   {
      //     name: '测试2',
      //     mobile: '15856869998',
      //     province: '上海',
      //     city: '上海',
      //     county: '徐汇',
      //     detail: 'XXX小区',
      //     status: 1
      //   },
      //   {
      //     name: '测试2',
      //     mobile: '15856869998',
      //     province: '上海',
      //     city: '上海',
      //     county: '徐汇',
      //     detail: 'XXX小区',
      //     status: 1
      //   },
      //   {
      //     name: '测试2',
      //     mobile: '15856869998',
      //     province: '上海',
      //     city: '上海',
      //     county: '徐汇',
      //     detail: 'XXX小区',
      //     status: 1
      //   },
      //   {
      //     name: '测试2',
      //     mobile: '15856869998',
      //     province: '上海',
      //     city: '上海',
      //     county: '徐汇',
      //     detail: 'XXX小区',
      //     status: 1
      //   },
      //   {
      //     name: '测试2',
      //     mobile: '15856869998',
      //     province: '上海',
      //     city: '上海',
      //     county: '徐汇',
      //     detail: 'XXX小区',
      //     status: 1
      //   },
      //   {
      //     name: '测试2',
      //     mobile: '15856869998',
      //     province: '上海',
      //     city: '上海',
      //     county: '徐汇',
      //     detail: 'XXX小区',
      //     status: 1
      //   },
      //   {
      //     name: '测试2',
      //     mobile: '15856869998',
      //     province: '上海',
      //     city: '上海',
      //     county: '徐汇',
      //     detail: 'XXX小区',
      //     status: 1
      //   },
      //   {
      //     name: '测试2',
      //     mobile: '15856869998',
      //     province: '上海',
      //     city: '上海',
      //     county: '徐汇',
      //     detail: 'XXX小区',
      //     status: 1
      //   },
      //   {
      //     name: '测试2',
      //     mobile: '15856869998',
      //     province: '上海',
      //     city: '上海',
      //     county: '徐汇',
      //     detail: 'XXX小区',
      //     status: 1
      //   }
      // ],
      touchStartX: 0,
      touchStartY: 0,
      userId:true,
      image: 'http://image.yiqixuan.com/'
  },
  onLoad:function(){
    this.setData({
      userId: app.globalData.userId
    })
  },
  onShow: function (options) {
    var that = this;
    if (app.globalData.userId){
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        url: app.globalData.http + '/mpa/address',
        method: 'get',
        dataType: 'json',
        header: {
          "Api-Key": app.globalData.apiKey,
          "Api-Secret": app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success: function (data) {
          var code = data.statusCode.toString()
          if (code == 500 || code.indexOf('40') > -1) {

          } else {
            that.setData({
              address: data.data
            })
          }

        },
        complete: function () {
          that.setData({
            userId: app.globalData.userId
          })
          wx.hideLoading()
        }
      })
    }
  },
  address:function(){
    var that=this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success() {
              wx.chooseAddress({
                success: function (res) {
                    wx.request({
                      url: app.globalData.http +'/mpa/address',
                      method: 'post',
                      dataType: 'json',
                      data:{
                        name: res.userName,
                        mobile:res.telNumber,
                        post_code: res.postalCode,
                        province: res.provinceName,
                        city: res.cityName,
                        county: res.countyName,
                        detail: res.detailInfo
                      },
                      header: {
                        "Api-Key": app.globalData.apiKey,
                        "Api-Secret": app.globalData.apiSecret,
                        'Api-Ext': app.globalData.apiExt
                      },
                      success: function (data) {
                        var code = data.statusCode.toString()
                        if (code.indexOf('20') > -1) {
                        }else{
                          var tip =data.data.message.toString()
                          wx.showToast({
                            title: tip,
                            icon: 'none',
                            duration: 1000
                          })
                        }
                      } 
                    })
                }
              })
            },
            fail:function(res){
              wx.openSetting({
                success: (res) => {}
              })
            }
          })
        }else{
          wx.chooseAddress({
            success: function (res) {
              wx.request({
                url: app.globalData.http +'/mpa/address',
                method: 'post',
                dataType: 'json',
                data: {
                  name: res.userName,
                  mobile: res.telNumber,
                  post_code: res.postalCode,
                  province: res.provinceName,
                  city: res.cityName,
                  county: res.countyName,
                  detail: res.detailInfo
                },
                header: {
                  "Api-Key": app.globalData.apiKey,
                  "Api-Secret": app.globalData.apiSecret,
                  'Api-Ext': app.globalData.apiExt
                },
                success: function (data) {       
                  var code = data.statusCode.toString()
                  if (code.indexOf('20') > -1) {
                  } else {
                    var tip = data.data.message.toString()
                    wx.showToast({
                      title: tip,
                      icon: 'none',
                      duration: 1000
                    })
                  }
                }
              })
            },
            fail:function(res){
              console.log(res)
            }
          })
        }
      },
      fail:function(res){
        wx.openSetting({
          success: (res) => {}
        })
      }
    })
  },

  deleteAddr:function(event){
    var that=this;
    wx.showModal({
      title: '提示',
      content: '确定删除地址?',
      success: function (res) {
        if (res.confirm) {
          var index = event.target.dataset.index;
          wx.request({
            url: app.globalData.http + '/mpa/address/' + that.data.address[index].id,
            method: 'delete',
            dataType: 'json',
            header: {
              "Api-Key": app.globalData.apiKey,
              "Api-Secret": app.globalData.apiSecret,
              'Api-Ext': app.globalData.apiExt
            },
            success: function (data) {
              var code=data.statusCode.toString()
              if (code.indexOf('20')>-1) { 
                if (app.globalData.address!=1){
                  //判断删除的地址是否是app.globalData.address的地址
                  if (that.data.address[index].id == app.globalData.address.id) {
                    app.globalData.address = 1
                  }
                }
                let newArr = JSON.parse(JSON.stringify(that.data.address))
                newArr.splice(index, 1)
                that.setData({
                  address: newArr
                })
                wx.showToast({
                  title: '删除成功',
                  icon: 'none',
                  duration: 1000
                })
              }else{
                var tip = data.data.message.toString();
                wx.showToast({
                  title: tip,
                  icon: 'none',
                  duration: 1000
                })
              }
            }
          })
        } else if (res.cancel) {
          
        }
      }
    })
  },
  updateAddr: function (event){
    var that = this
    var index = event.target.dataset.index;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success() {
              wx.chooseAddress({
                success: function (res) {
                  wx.request({
                    url: app.globalData.http +'/mpa/address/'+that.data.address[index].id,
                    method: 'PUT',
                    dataType: 'json',
                    data: {
                      name: res.userName,
                      mobile: res.telNumber,
                      post_code: res.postalCode,
                      province: res.provinceName,
                      city: res.cityName,
                      county: res.countyName,
                      detail: res.detailInfo
                    },
                    header: {
                      "Api-Key": app.globalData.apiKey,
                      "Api-Secret": app.globalData.apiSecret,
                      'Api-Ext': app.globalData.apiExt
                    },
                    success: function (data) {
                      
                    }
                  })
                }
              })
            }
          })
        } else {
          wx.chooseAddress({
            success: function (res) {
              wx.request({
                url: app.globalData.http +'/mpa/address/' + that.data.address[index].id,
                method: 'PUT',
                dataType: 'json',
                data: {
                  name: res.userName,
                  mobile: res.telNumber,
                  post_code: res.postalCode,
                  province: res.provinceName,
                  city: res.cityName,
                  county: res.countyName,
                  detail: res.detailInfo
                },
                header: {
                  "Api-Key": app.globalData.apiKey,
                  "Api-Secret": app.globalData.apiSecret,
                  'Api-Ext': app.globalData.apiExt
                },
                success: function (data) {
                }
              })
            }
          })
        }
      }
    })
  },
  chooseAddress:function(event){
    var index = event.currentTarget.dataset.index
      app.globalData.address = this.data.address[index];
      wx.navigateBack({
        url:'/pages/surePay/surePay'
      })
  },
  setDefault:function(event){
      var that=this 
      var key=event.target.dataset.key
      var keys
      if (key===1){
        keys=2
      }else{
        keys=1
      }
      var index = event.target.dataset.index
      var nums 
      var num = 'address[' + index + '].status'
      wx.request({
        url: app.globalData.http +'/mpa/address/' + that.data.address[index].id,
        method: 'PUT',
        dataType: 'json',
        data: {
          status:keys
        },
        header: {
          "Api-Key": app.globalData.apiKey,
          "Api-Secret": app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success: function (data) {
          var code=data.statusCode.toString()
          if(code.indexOf('20')>-1){
            if (key === 1) {
              for (var i = 0; i < that.data.address.length; i++) {
                if (that.data.address[i].status === 2) {
                  nums = 'address[' + i + '].status'
                }
              }
              that.setData({
                [num]: 2,
                [nums]: 1
              })

            } else {
              that.setData({
                [num]: 1
              })
            }
          }else{
            wx.showToast({
              title: '设置失败',
              icon: 'none',
              duration: 1000,
            })
          } 
        }
      })
  },
  touchStart: function (e){
    var index = e.currentTarget.dataset.index;
    var touchStartX = e.touches[0].pageX;
    var touchStartY = e.touches[0].pageY;
    this.setData({
      index: index,
      touchStartX: touchStartX,
      touchStartY: touchStartY
    })
  },
  touchMove: function (e) {
    var index = this.data.index;
    var touchEndX = e.changedTouches[0].pageX;
    var touchEndY = e.changedTouches[0].pageY;
    var tmX = touchEndX - this.data.touchStartX;
    var tmY = touchEndY - this.data.touchStartY;
    var address = this.data.address;
    var item = address[index];
    if (Math.abs(tmX) > Math.abs(tmY)) {
      if (tmX < 0) {

        address.forEach(function (v, k) {
          if (index == k) {
            v.isdelete = true;
          } else {
            v.isdelete = false;
          }
        })
      } else {
        item.isdelete = false;
      }
      this.setData({
        address: address
      })
    }
  },
  getPhoneNumber: function (e) {
    var that=this
    if (e.detail.encryptedData && e.detail.iv) {
      wx.login({
        success(code) {
          wx.request({
            url: app.globalData.http + '/mpa/wechat/auth',
            method: 'POST',
            header: {
              'Api-Ext': app.globalData.apiExt
            },
            data: {
              code: code.code
            },
            success: function (res) {
              var codes = res.statusCode.toString()
              if (codes >= 200 && codes < 300) {
                //保存响应头信息
                if (res.header["api-key"] && res.header["api-secret"]) {
                  var apiKey = res.header["api-key"],
                    apiSecret = res.header["api-secret"];
                } else if (res.header["Api-Key"] && res.header["Api-Secret"]) {
                  var apiKey = res.header["Api-Key"],
                    apiSecret = res.header["Api-Secret"];
                }
                app.globalData.apiKey = apiKey
                app.globalData.apiSecret = apiSecret
                var timestamp = new Date().getTime()
                wx.setStorage({
                  key: 'timestamp',
                  data: timestamp,
                })
                wx.setStorage({
                  key: 'apiKey',
                  data: apiKey,
                })
                wx.setStorage({
                  key: 'apiSecret',
                  data: apiSecret,
                })
                wx.setStorage({
                  key: 'userId',
                  data: res.data.user_id,
                })
                wx.request({
                  url: app.globalData.http + '/mpa/user/login',
                  method: 'post',
                  data: {
                    encrypted: e.detail.encryptedData,
                    iv: e.detail.iv
                  },
                  dataType: 'json',
                  header: {
                    "Api-Key": apiKey,
                    "Api-Secret":apiSecret,
                    'Api-Ext': app.globalData.apiExt
                  },
                  success: function (data) {
                    var datas = data.statusCode.toString()
                    if (datas >= 200 && datas < 300) {
                      if (data.header["api-key"] && data.header["api-secret"]) {
                        var apiKey = data.header["api-key"],
                          apiSecret = data.header["api-secret"];
                      } else if (data.header["Api-Key"] && data.header["Api-Secret"]) {
                        var apiKey = data.header["Api-Key"],
                          apiSecret = data.header["Api-Secret"];
                      }
                      app.globalData.apiKey = apiKey
                      app.globalData.apiSecret = apiSecret
                      app.globalData.userId = true
                      var timestamp = new Date().getTime()
                      wx.setStorage({
                        key: 'userId',
                        data: true,
                      })
                      wx.setStorage({
                        key: 'timestamp',
                        data: timestamp,
                      })
                      wx.setStorage({
                        key: 'apiKey',
                        data: apiKey,
                      })
                      wx.setStorage({
                        key: 'apiSecret',
                        data: apiSecret,
                      })
                      that.setData({
                        userId: true
                      })
                      that.setData({
                        userId:true
                      })
                    } else {
                      var tip = data.data.message.toString()
                      wx.showToast({
                        title: tip,
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  }
                })
              } else {
                var tip = res.data.message.toString()
                wx.showToast({
                  title: tip,
                  icon: 'none',
                  duration: 2000
                })
              }
            }
          })
        }
      })
    }
  },
})