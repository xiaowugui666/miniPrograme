// pages/shoppingCar/shoppingCar.js
var app = getApp()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isshow: 1,
    selectAll: false,
    image: 'http://image.yiqixuan.com/',
    totalPrice: 0.00,
    page: 0,
    //远程购物车
    session: false,
    datalist: [],
    //本地购物车
    local: false,
    locallist: [],
    userId: false
  },
  //点击结算
  balance() {
    var that = this
    //如果没有选择商品,总价格为0，提示
    if (that.data.totalPrice == '0.00') {
      wx.showToast({
        title: '请选择商品',
        icon: "none"
      })
    } else {
      //购物车商品信息
      let good = that.data.datalist;
      var local = that.data.locallist
      //已选择商品数组
      var seleArr = [];
      //本地购物车已选中的商品
      var localArr = [];
      for (var i = 0; i < good.length; i++) {
        if (good[i].isSelect) {
          seleArr.push(good[i])
        }
      }
      for (var i = 0; i < local.length; i++) {
        if (local[i].isSelect) {
          localArr.push(local[i])
        }
      }

      if (seleArr.length > 0) {
        app.globalData.good = seleArr;
      } else if (localArr.length > 0) {
        app.globalData.good = localArr;
      }
      // app.globalData.good = seleArr;
      // app.globalData.localArr = localArr;
      wx.navigateTo({
        url: '/pages/surePay/surePay?fromCart=1',
      })
    }
  },
  //跳转首页
  goIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  /*减少数量  远程购物车*/
  subtraction(e) {
    var _this = this;
    var index = e.target.dataset.index;
    var total = _this.data.totalPrice;
    var id = e.target.dataset.id;
    var num = 'datalist[' + index + '].count';
    //当删除数量不小于1时，调用PUT接口减少数量
    if (parseInt(_this.data.datalist[index].count) > 1) {
      var newNum = parseInt(_this.data.datalist[index].count) - 1;
      //PUT，用户修改购物车数量
      wx.request({
        url: app.globalData.http + '/mpa/cart/' + id,
        method: "PUT",
        data: {
          count: newNum
        },
        header: {
          "Api-Key": app.globalData.apiKey,
          "Api-Secret": app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success(res) {

          if (res.statusCode == 200) {
            var num = 'datalist[' + index + '].count';
            _this.setData({
              [num]: newNum
            })
            //计算合计金额，单选情况
            if (_this.data.datalist[index].isSelect) {
              total -= _this.data.datalist[index].price
              _this.setData({
                totalPrice: total
              })
            }
          }
        }
      })
    } else if (parseInt(_this.data.datalist[index].count) == 1) {//当删除数量等于1时，调用DELETE接口删除所选
      wx.showModal({
        // title: '删除',
        content: '确定删除该商品？',
        success(res) {
          // 当用户点击确定按钮
          if (res.confirm) {
            wx.request({
              url: app.globalData.http + '/mpa/cart/' + _this.data.datalist[index].id,
              method: "DELETE",
              header: {
                "Api-Key": app.globalData.apiKey,
                "Api-Secret": app.globalData.apiSecret,
                'Api-Ext': app.globalData.apiExt
              },
              success(res) {
                //如果删除成功
                if (res.statusCode == 200) {

                  //计算合计金额，单选情况
                  if (_this.data.datalist[index].isSelect) {
                    total -= _this.data.datalist[index].price
                    _this.setData({
                      totalPrice: total
                    })
                  }
                  _this.data.datalist.splice(index, 1);
                  _this.setData({
                    datalist: _this.data.datalist
                  })
                  if (_this.data.datalist.length == 0) {
                    _this.setData({
                      session: false
                    })
                  }
                } else {
                  wx.showToast({
                    title: '请重新尝试',
                    icon: "none"
                  })
                }
              }
            })
          }
        }
      })
    }

  },
  /*减少数量 本地购物车*/
  subLocal(e) {
    var _this = this;
    var index = e.target.dataset.index;
    var total = _this.data.totalPrice;
    var id = e.target.dataset.id;
    var num = 'locallist[' + index + '].count';
    //当删除数量不小于1时，调用PUT接口减少数量
    if (parseInt(_this.data.locallist[index].count) > 1) {
      var newNum = parseInt(_this.data.locallist[index].count) - 1;
      if (_this.data.locallist[index].isSelect) {
        total -= _this.data.locallist[index].price
      }
      _this.setData({
        [num]: newNum,
        totalPrice: total
      },function(){
          wx.setStorage({
            key: 'good',
            data: _this.data.locallist,
          })
      })

    } else if (parseInt(_this.data.locallist[index].count) == 1) {//当删除数量等于1时，调用DELETE接口删除所选
      wx.showModal({
        // title: '删除',
        content: '确定删除该商品？',
        success(res) {
          // 当用户点击确定按钮
          if (res.confirm) {
            var local = wx.getStorageSync('good')
            if (_this.data.locallist[index].isSelect) {
              total -= _this.data.locallist[index].price
            }

            local.forEach(function (v, i) {
              if (v.id == _this.data.locallist[index].id) {
                local.splice(i, 1)
              }
            })

            if (local.length == 0) {
              _this.setData({
                local: false
              })
            }
            _this.setData({
              locallist: local,
              totalPrice: total
            })
            wx.setStorage({
              key: 'good',
              data: local,
            })
          }
        }
      })
    }
  },
  /*增加数量 远程购物车*/
  add(e) {
    var _this = this;
    var index = e.target.dataset.index;
    var total = _this.data.totalPrice;
    var id = e.target.dataset.id;
    var newNum = parseInt(_this.data.datalist[index].count) + 1;
    //PUT，用户修改购物车数量
    wx.request({
      url: app.globalData.http + '/mpa/cart/' + id,
      method: "PUT",
      data: {
        count: newNum
      },
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          var num = 'datalist[' + index + '].count';
          _this.setData({
            [num]: newNum
          })
          //计算合计金额
          if (_this.data.datalist[index].isSelect) {
            total += _this.data.datalist[index].price
            _this.setData({
              totalPrice: total
            })
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  addLocal(e) {
    var _this = this;
    var index = e.target.dataset.index;
    var total = _this.data.totalPrice;
    var id = e.target.dataset.id;
    var newNum = parseInt(_this.data.locallist[index].count) + 1;
    //PUT，用户修改购物车数量
    wx.request({
      url: app.globalData.http + '/mpa/goods_sku/' + id,
      method: "GET",
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success(res) {
        var count = res.data.stock_count
        if (newNum <= count) {
          var num = 'locallist[' + index + '].count';
          _this.setData({
            [num]: newNum
          }, function () {
            wx.setStorage({
              key: 'good',
              data: _this.data.locallist,
            })
          })
          //计算合计金额
          if (_this.data.locallist[index].isSelect) {
            total += _this.data.locallist[index].price
            _this.setData({
              totalPrice: total
            })
          }

        } else {
          wx.showToast({
            title: '商品库存不足',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  //远程购物车选中事件
  selSession(e) {
    var _this = this;
    var total = _this.data.totalPrice;
    var index = e.currentTarget.dataset.index
    var num = 'datalist[' + index + '].isSelect';
    //改变选中状态
    var newNum = !_this.data.datalist[index].isSelect;
    _this.setData({
      [num]: newNum
    })
    //计算合计金额
    if (_this.data.datalist[index].isSelect) {
      total += (_this.data.datalist[index].price) * (_this.data.datalist[index].count)
    } else {
      total -= (_this.data.datalist[index].price) * (_this.data.datalist[index].count)
    }
    //遍历每一项，确定是否全选
    var selectAll = this.data.selectAll;
    //远程购物车
    var seleArr1 = this.data.datalist.every(function (item, index, arr) {
      return item.isSelect;
    })
    //本地购物车
    var seleArr2 = this.data.locallist.every(function (item, index, arr) {
      return item.isSelect;
    })

    if (seleArr1 && seleArr2) {
      selectAll = true
    } else {
      selectAll = false
    }
    _this.setData({
      selectAll: selectAll,
      totalPrice: total
    })
  },
  //本地购物车选中事件
  selLocal(e) {
    var _this = this;
    var total = _this.data.totalPrice;
    var index = e.currentTarget.dataset.index
    var num = 'locallist[' + index + '].isSelect';
    //改变选中状态
    var newNum = !_this.data.locallist[index].isSelect;
    _this.setData({
      [num]: newNum
    })
    //计算合计金额
    if (_this.data.locallist[index].isSelect) {
      total += (_this.data.locallist[index].price) * (_this.data.locallist[index].count)
    } else {
      total -= (_this.data.locallist[index].price) * (_this.data.locallist[index].count)
    }
    //遍历每一项，确定是否全选
    var selectAll = this.data.selectAll;
    //远程购物车
    var seleArr1 = this.data.datalist.every(function (item, index, arr) {
      return item.isSelect;
    })
    //本地购物车
    var seleArr2 = this.data.locallist.every(function (item, index, arr) {
      return item.isSelect;
    })

    if (seleArr1 && seleArr2) {
      selectAll = true
    } else {
      selectAll = false
    }
    _this.setData({
      selectAll: selectAll,
      totalPrice: total
    })
  },
  //点击全选
  selectAll(e) {
    var selectAll = this.data.selectAll;
    var total = 0,
      tempArr2 = this.data.locallist,
      tempArr1 = this.data.datalist;
    if (!selectAll) {
      //将每一项的isSelect置为true
      tempArr1.forEach(function (item) {
        item.isSelect = true;
        total += item.price * item.count
      })
      tempArr2.forEach(function (item) {
        item.isSelect = true;
        total += item.price * item.count
      })
      selectAll = true;
    } else {
      //将每一项的isSelect置为false
      tempArr1.forEach(function (item) {
        item.isSelect = false;
      })
      tempArr2.forEach(function (item) {
        item.isSelect = false;
      })
      selectAll = false;
      total = 0.00;
    }
    this.setData({
      selectAll: selectAll,
      datalist: tempArr1,
      locallist: tempArr2,
      totalPrice: total
    })
  },
  //底部删除点击事件
  bottomDelete() {
    var that = this;
    //未选中item数组
    var seleArr1 = [], deleArr1 = [];
    var seleArr2 = [], deleArr2 = [];
    var nowArr1 = that.data.datalist;
    var nowArr2 = that.data.locallist;

    //远程仓库
    for (var i = 0; i < nowArr1.length; i++) {
      var val = nowArr1[i]
      if (!val.isSelect) {
        seleArr1.push(val)
      } else {
        deleArr1.push(val.id)
      }
    }

    //本地仓库
    for (var j = 0; j < nowArr2.length; j++) {
      var val = nowArr2[j]
      if (!val.isSelect) {
        seleArr2.push(val)
      } else {
        deleArr2.push(val)
      }
    };

    if (deleArr1.length == 0 && deleArr2.length == 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none',
        duration: 1000
      })
    } else {
      //点击删除提示信息
      wx.showModal({
        // title: '删除',
        content: '是否确认删除此商品？',
        confirmColor: '#EA2534',
        success(res) {
          if (res.confirm) {
            //删除远程购物车
            if (deleArr1.length > 0) {
              //删除单个商品
              if (deleArr1.length == 1) {
                wx.request({
                  url: app.globalData.http + '/mpa/cart/' + deleArr1[0],
                  method: "DELETE",
                  header: {
                    "Api-Key": app.globalData.apiKey,
                    "Api-Secret": app.globalData.apiSecret,
                    'Api-Ext': app.globalData.apiExt
                  },
                  success(res) {
                    that.setData({
                      datalist: seleArr1,
                      totalPrice: 0.00,
                      locallist: seleArr2
                    })
                    wx.setStorage({
                      key: 'good',
                      data: seleArr2,
                    })
                    if (seleArr1.length == 0) {
                      that.setData({
                        session: false,
                      })
                    }
                    if (seleArr2.length == 0) {
                      that.setData({
                        local: false,
                      })
                    }
                  }
                })
              } else {
                //批量删除请求
                wx.request({
                  url: app.globalData.http + '/mpa/cart/batch',
                  method: "DELETE",
                  data: {
                    ids: deleArr1
                  },
                  header: {
                    "Api-Key": app.globalData.apiKey,
                    "Api-Secret": app.globalData.apiSecret,
                    'Api-Ext': app.globalData.apiExt
                  },
                  success(res) {
                    that.setData({
                      datalist: seleArr1,
                      totalPrice: 0.00,
                      locallist: seleArr2
                    })
                    wx.setStorage({
                      key: 'good',
                      data: seleArr2,
                    })
                    if (seleArr1.length == 0 && seleArr2.length == 0) {
                      that.setData({
                        session: false,
                        local: false
                      })
                    }
                  }
                })
              }
            } else {
              wx.setStorage({
                key: 'good',
                data: seleArr2,
              })
              that.setData({
                totalPrice: 0.00,
                locallist: seleArr2
              })
              if (seleArr2.length == 0) {
                that.setData({
                  local: false
                })
              }
            }
          }
        }
      })
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  getData: function () {
    var that = this
    var pages = this.data.page;
    pages = pages + 1
    this.setData({
      page: pages
    })
    wx.showLoading({
      title: '加载中',
    })
    //获取用户购物车列表
    wx.request({
      url: app.globalData.http + '/mpa/cart',
      data: {
        page: pages
      },
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success(res) {
        if (res.data != "") {
          var list = []
          for (var z = 0; z < res.data.length; z++) {
            res.data[z].isSelect = false;
            res.data[z].isTouchMove = false
            list.push(res.data[z])
          }
          var datalists = that.data.datalist.concat(list)
          that.setData({
            datalist: datalists,
          })
        }
        wx.hideLoading();
      },
      fail: function () {
        wx.hideLoading();
      }
    })
  },
  getPhoneNumber: function (e) {
    var that = this
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
                    "Api-Key":apiKey,
                    "Api-Secret": apiSecret,
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
                    } else {
                      var tip = data.data.message.toString()
                      wx.showToast({
                        title: tip,
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  },
                  fail: function () {

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
  onShow: function (options) {
    let that = this;
    var goodlist = wx.getStorageSync('good')
    if (app.globalData.userId) {
      wx.showLoading({
        title: '加载中',
      })
      this.setData({
        page: 0,
        userId: true,
        locallist: [],
        selectAll: false,
        totalPrice: 0.00
      })
      //获取用户购物车列表
      wx.request({
        url: app.globalData.http + '/mpa/cart',
        data: {
          page: 0
        },
        header: {
          "Api-Key": app.globalData.apiKey,
          "Api-Secret": app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success(res) {
          var code = res.statusCode.toString()
          if (code.indexOf('20') > -1) {
            if (res.data.length != 0) {
              var list = []
              for (var z = 0; z < res.data.length; z++) {
                res.data[z].isSelect = false;
                list.push(res.data[z])
              }
              that.setData({
                datalist: list,
                session: true
              })
            } else {
              that.setData({
                session: false
              })
            }
          } else {
            var tip = res.data.message.toString()
            wx.showToast({
              title: tip,
              icon: 'none',
              duration: 2000
            })
          }
        },
        complete: function () {
          wx.hideLoading();
        }
      })
      if (goodlist.length > 0) {
        var cart = []
        goodlist.forEach(function (v, i) {
          var ob = new Object()
          ob.goods_sku_id = v.goods_sku_id
          ob.count = v.count
          cart.push(ob)
        })
        wx.request({
          url: app.globalData.http + '/mpa/cart/batch',
          method: "POST",
          dataType: 'json',
          header: {
            "Api-Key": app.globalData.apiKey,
            "Api-Secret": app.globalData.apiSecret,
            'Api-Ext': app.globalData.apiExt
          },
          data: {
            goods_skus: cart
          },
          success: function (res) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              that.setData({
                datalist: that.data.datalist.concat(goodlist)
              })
              wx.setStorage({
                key: 'good',
                data: [],
              })
            }
          }
        })
      }
    } else {
      if (goodlist.length > 0) {
        that.setData({
          locallist: goodlist,
          local: true,
          userId: app.globalData.userId
        })
      } else {
        that.setData({
          locallist: [],
          local: false,
          userId: app.globalData.userId
        })
      }
    }
  },
  /*
 * 页面上拉触底事件的处理函数
 */
  onReachBottom: function () {
		if (app.globalData.user_info.id) {
			this.getData()
		}
  }
})