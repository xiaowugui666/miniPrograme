 // pages/trends/trends.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    image: 'http://image.yiqixuan.com/',
    type: 1,
    messages: [1,2,3,4,5,6,7,8,9],
    comments: [1],
    trendsData:[],
    name: '',
    logo_url:'',
    inputVisi: false,
    inputValue: '',
    modalVisi:false,
    voted: false,
    autoFocus: false,
    hasUserInfo:false,
    userId:false,
    userInfo: {},
    page:0,
    value: '',
    commentId: 0
  },
  // 阻止按钮事件冒泡
  catchPreventDefault () {
  },
  // 阻止蒙层事件冒泡
  preventTouchMove () {
  },
  // 动态点赞
  vote (e) {
    let that = this;
    // 判断是否已进行微信授权和绑定手机号
    wx.request({
      url: app.globalData.http + '/mpa/feed/' + e.currentTarget.dataset.id + '/vote',
      method: 'POST',
      header: {
        'Api-Key': app.globalData.apiKey,
        'Api-Secret': app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success(res) {
        // 修改本地数据
        let tempArr = that.data.trendsData,
            i = e.currentTarget.dataset.index;
        tempArr[i].vote = true;
        tempArr[i].pv_vote += 1;
        that.setData({
          trendsData:tempArr
        })
        wx.showToast({
          title: '点赞成功',
        })
      }
    })
  },
  // 动态取消点赞
  cancledVote (e) {
    let that = this;
    // 判断是否已进行微信授权和绑定手机号
      wx.request({
        url: app.globalData.http + '/mpa/feed/' + e.currentTarget.dataset.id + '/unvote',
        method: 'POST',
        header: {
          'Api-Key': app.globalData.apiKey,
          'Api-Secret': app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success(res) {
          // 修改本地数据
          let tempArr = that.data.trendsData,
            i = e.currentTarget.dataset.index;
          tempArr[i].vote = false;
          tempArr[i].pv_vote -= 1;
          that.setData({
            trendsData: tempArr
          })
          wx.showToast({
            title: '取消点赞成功',
          })
        }
      })
  },
  // input输入值改变
  userInput (e) {
    this.setData({
      value: e.detail.value
    })
    let str = e.detail.value;
    if (str.length >= 100) {
      wx.showToast({
        title: '已达输入长度上限',
        icon: 'none'
      })
    }
  },
  // input框失去焦点
  userBlur (e) {
    let that = this;
    setTimeout(function(){
      that.setData({
        inputVisi: false,
        autoFocus: false
      })
    },200)
  },
  // 点击评论
  commentVisi (e) {
      this.setData({
        inputVisi: true,
        autoFocus: true,
        commentId: e.currentTarget.dataset.id
      })
  },
  // 图片预览
  viewImage (e) {
    var that = this;
    let index = e.currentTarget.dataset.index;
    var arr = []
    arr.push(that.data.image + that.data.trendsData[index].cover_url)
    wx.previewImage({
      current: that.data.image + that.data.trendsData[index].cover_url, // 当前显示图片的http链接
      urls: arr // 需要预览的图片http链接列表
    })
  },
  viewImages (e) {
    var that = this;
    let index = e.currentTarget.dataset.index,
      ind = e.currentTarget.dataset.ind,
      tempArr = [], temp = that.data.trendsData[index].images;
    for (let i = 0; i < temp.length; i++) {
      tempArr.push(that.data.image + temp[i].img_url)
    }
    wx.previewImage({
      current: that.data.image + that.data.trendsData[index].images[ind].img_url, // 当前显示图片的http链接
      urls: tempArr // 需要预览的图片http链接列表
    })
  },
  // 动态评论
  comment(e) {
    let that = this;
    if (that.data.value) {
      that.setData({
        autoFocus: false
      })
      wx.request({
        url: app.globalData.http + '/mpa/feed/' + that.data.commentId + '/comment',
        method: 'POST',
        header: {
          "Api-Key": app.globalData.apiKey,
          "Api-Secret": app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        data: {
          content: that.data.value
        },
        success(res) {
          var code = res.statusCode.toString()
          if(code>= 200 && code< 300){
              wx.showToast({
                title: '评论已提交，需商家审核',
                icon:'none',
                duration: 1000
              })
          }
        }
      })
    }
  },
  // 跳转动态详情,若存在goods_id,跳转商品详情
  commentDetail (e) {
    let index = e.currentTarget.dataset.index;
    let that = this;
    if (that.data.trendsData[index].goods_id) {
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + that.data.trendsData[index].goods_id,
      })
    } else {
      wx.navigateTo({
        url: '/pages/trendsDetail/trendsDetail?id=' + e.currentTarget.dataset.id,
      })
    }
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    if (wx.getStorageSync('huzan_avatarUrl')) {
      app.globalData.userInfo = wx.getStorageSync('huzan_avatarUrl')
    }
    let that = this;
    // 动态列表数据
    wx.request({
      url: app.globalData.http + '/mpa/feed',
      method: 'GET',
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success (res) {
        // 对评论进行截取，只保留前十条评论
        for (let i = 0; i < res.data.length; i++ ) {
          // 当数组长度大于10时截取
          if (res.data[i].comments.length > 10) {
            res.data[i].comments.splice(10, res.data[i].comments.length - 10);
          }
          res.data[i].time_stamp = that.getTime(res.data[i].created_at)
        }
        if (res.data.length) {
          wx.hideLoading();
        } else {
          wx.hideLoading();
        }
        that.setData({
          trendsData: res.data,
          name: app.globalData.name,
          logo_url: app.globalData.logo_url,
          userId:app.globalData.userId,
          hasUserInfo: app.globalData.userInfo
        })
      },
      fail () {
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
    setTimeout(function () {
      wx.hideLoading();
    }, 2000)
  },
  // 页面显示
  onShow () {
    this.setData({
      userId: app.globalData.userId
    })
  },
  // 页面显示
  onShow () {
    this.setData({
      userId: app.globalData.userId
    })
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    // 动态列表数据
    wx.request({
      url: app.globalData.http + '/mpa/feed',
      method: 'GET',
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success(res) {
        // 对评论进行截取，只保留前十条评论
        for (let i = 0; i < res.data.length; i++) {
          // 当数组长度大于10时截取
          if (res.data[i].comments.length > 10) {
            res.data[i].comments.splice(10, res.data[i].comments.length - 10);
          }
          res.data[i].time_stamp = that.getTime(res.data[i].created_at)
        }
        if (res.data.length) {
          wx.hideLoading();
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '暂无动态数据',
            icon: 'none'
          })
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
        }
        that.setData({
          trendsData: res.data,
          name: app.globalData.name,
          page:0,
          logo_url: app.globalData.logo_url
        })
      },
      fail() {
        wx.hideLoading();
        wx.showToast({
          title: '获取动态数据失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
    wx.stopPullDownRefresh()    
  },
  // 获取用户信息
  getUserInfo (e) {
    var that = this;
    if (e.detail.userInfo) {
      that.setData({
        userInfo: e.detail.userInfo
      })
      wx.login({
        success(code) {
          //获取用户信息，拿到userInfo
          var userInfo = e.detail.userInfo;
          //向后台发起请求，传code
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
              var code = res.statusCode.toString()
              if (code == 500) {
                wx.showToast({
                  title: '网络错误',
                  icon: 'none',
                  duration: 1000
                })
              } else if (code.indexOf('40') > -1) {
                var tip = res.data.message.toString()
                wx.showToast({
                  title: tip,
                  icon: 'none',
                  duration: 1000
                })
              }
              else {
                //保存响应头信息
                if (res.header["api-key"] && res.header["api-secret"]) {
                  var apiKey = res.header["api-key"],
                    apiSecret = res.header["api-secret"];
                } else if (res.header["Api-Key"] && res.header["Api-Secret"]) {
                  var apiKey = res.header["Api-Key"],
                    apiSecret = res.header["Api-Secret"];
                }
                //设置storage
                //获取时间戳保存storage
                // let timestamp = Date.parse(new Date());
                app.globalData.apiKey = apiKey
                app.globalData.apiSecret = apiSecret
                that.setData({
                  userInfo: userInfo,
                  hasUserInfo: true
                })
                wx.setStorage({
                  key: 'huzan_avatarUrl',
                  data: userInfo,
                })
                wx.request({
                  url: app.globalData.http + '/mpa/wechat/' + res.data.id,
                  method: "PUT",
                  data: {
                    "nick_name": userInfo.nickName,
                    "avatar_url": userInfo.avatarUrl,
                    "gender": userInfo.gender,
                    "city": userInfo.city,
                    "province": userInfo.province,
                    "country": userInfo.country,
                    "language": userInfo.language
                  },
                  header: {
                    "Api-Key": app.globalData.apiKey,
                    "Api-Secret": app.globalData.apiSecret,
                    'Api-Ext': app.globalData.apiExt
                  },
                  complete(res) {
                  }
                })
                if (res.data.user_id) {
                  app.globalData.userId = true
                  that.setData({
                    inputVisi: true,
                    autoFocus: true
                  })            
                  // wx.setStorage({
                  //   key: 'userId',
                  //   data: true,
                  // })
                } else {
                  that.setData({
                    modalVisi:true
                  })
                }
              }
            }
          })
        },
        fail: function (res) {
        }
      })
    }
  },
  // 获取手机号
  getPhoneNumber: function (e) {
    var that = this
    that.setData({
      modalVisi:false
    })
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
                      that.setData({
                        userId: true,
                        inputVisi:true
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
  // 上拉加载
  onReachBottom: function () {
    // 评论列表数据
    var that = this
    var pages = this.data.page
    pages++
    wx.showLoading({
      title: '加载中',
    })
    // 动态列表数据
    wx.request({
      url: app.globalData.http + '/mpa/feed',
      method: 'GET',
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      data:{
        page: pages
      },
      success(res) {
        // 对评论进行截取，只保留前十条评论
        for (let i = 0; i < res.data.length; i++) {
          // 当数组长度大于10时截取
          if (res.data[i].comments.length > 10) {
            res.data[i].comments.splice(10, res.data[i].comments.length - 10);
          }
          res.data[i].time_stamp = that.getTime(res.data[i].created_at)
        }
        if (res.data.length) {
          wx.hideLoading();
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '无更多动态数据',
            icon: 'none',
            duration: 1000
          })
        }
        let newArr = that.data.trendsData.concat(res.data)
        that.setData({
          trendsData: newArr,
          page:pages
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
    wx.stopPullDownRefresh()
  }
})