// pages/trends/trends.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    image: 'https://image.yiqixuan.com/',
    type: 1,
    messages: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    comments: [1],
    trendsData: [],
    userId:false,
    hasUserInfo:false,
    userInfo: {},
    name: '',
    inputVisi: true,
    inputValue: '',
    voted: false,
    autoFocus: false,
    value: '',
    logo_url:'',
    commentId: '',
    comments:[],
    content: '',
    timestamp:'',
    page:0
  },
  // 阻止事件冒泡
  catchPreventDefault () {
  },
  // 动态点赞
  vote(e) {
    if (app.globalData.userId && app.globalData.userInfo){
      var that = this
      wx.request({
        url: app.globalData.http + '/mpa/feed/' + that.data.commentId + '/vote',
        method: 'POST',
        header: {
          'Api-Key': app.globalData.apiKey,
          'Api-Secret': app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            var voteCount = that.data.trendsData.pv_vote;
            voteCount++
            var vote = 'trendsData.pv_vote'
            that.setData({
              voted: true,
              [vote]: voteCount
            })
            wx.showToast({
              title: '点赞成功',
              icon: 'success',
              duration: 1000
            })
          }
        }
      })
    }else{
      wx.showToast({
        title: '请完成微信和手机号授权',
        icon:'none',
        duration:2000
      })
    }
    
  },
  // 动态取消点赞
  cancledVote(e) {
    var that=this
    wx.request({
      url: app.globalData.http + '/mpa/feed/' + that.data.commentId+ '/unvote',
      method: 'POST',
      header: {
        'Api-Key': app.globalData.apiKey,
        'Api-Secret': app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          var voteCount = that.data.trendsData.pv_vote;
          voteCount--
          var vote ='trendsData.pv_vote'
          that.setData({
            voted: false,
            [vote]: voteCount
          })
          wx.showToast({
            title: '取消点赞',
            icon: 'success',
            duration: 1000
          })
        }
      }
    })
  },
  // input输入值改变
  userInput(e) {
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
  // 图片预览
  viewImages(e) {
    var that = this;
    let ind = e.currentTarget.dataset.ind,
      tempArr = [], temp = that.data.trendsData.images;
    for (let i = 0; i < temp.length; i++) {
      tempArr.push(that.data.image + temp[i].img_url)
    }
    wx.previewImage({
      current: that.data.image + that.data.trendsData.images[ind].img_url, // 当前显示图片的http链接
      urls: tempArr // 需要预览的图片http链接列表
    })
  },
  // 动态评论
  comment(e) {
    let that = this;    
    if (app.globalData.userId && app.globalData.userInfo) {
      if (that.data.value) {
        that.setData({
          autoFocus: false
        })
        wx.request({
          url: app.globalData.http + '/mpa/feed/' + that.data.commentId + '/comment',
          method: 'POST',
          header: {
            'Api-Key': app.globalData.apiKey,
            'Api-Secret': app.globalData.apiSecret,
            'Api-Ext': app.globalData.apiExt
          },
          data: {
            content: that.data.value
          },
          success(res) {
            that.setData({
              value: ''
            })
            var code = res.statusCode.toString()
            if (code >= 200 && code < 300) {
              wx.showToast({
                title: '评论已提交，需商家审核',
                icon: 'none',
                duration: 1000
              })
            }
          }
        })
      }
    } else {
      wx.showToast({
        title: '请完成微信和手机号授权',
        icon: 'none',
        duration: 2000
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  getTime: function (value)  {
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
      var time = '昨天' + value.substring(11,16)
    } else {
      var time = value
    }
    return time
  },
  time:function(value){
    var timestamp = value.replace(/-/gi, '/')
    timestamp = new Date(timestamp).getTime()
    var nowTime = new Date().getTime()
    var disTime = nowTime - timestamp;
    if (disTime < 24 * 60 * 60 * 1000) {
      time = value.substring(11,16)
    }else {
      var time = value.substring(5, 16)
    }
    return time
  },
  // 页面加载
  onLoad: function (options) {
    let that = this;
    if (wx.getStorageSync('huzan_avatarUrl')) {
      app.globalData.userInfo = wx.getStorageSync('huzan_avatarUrl')
    }
    that.setData({
      hasUserInfo: app.globalData.userInfo,
      userId: app.globalData.userId
    })
    // 动态列表数据
    wx.request({
      url: app.globalData.http + '/mpa/feed/'+options.id,
      method: 'GET',
      header: {
        'Api-Key': app.globalData.apiKey,
        'Api-Secret': app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300){
          var nodes = res.data.content.replace(/<img/gi, '<img style="width:100%;"')
            .replace(/<p/gi, '<p style="font-size:24rpx;"');
          var timestamp = that.getTime(res.data.created_at);

          if (!res.data.vote){
            that.setData({
              trendsData: res.data,
              name: app.globalData.name,
              logo_url: app.globalData.logo_url,
              content: nodes,
              timestamp: timestamp,
              commentId: options.id,
              voted:false
            })
          }else{
            that.setData({
              trendsData: res.data,
              name: app.globalData.name,
              logo_url: app.globalData.logo_url,    
              content: nodes,
              timestamp: timestamp,
              commentId: options.id,
              voted: true
            })            
          }  
          // 评论列表数据
          wx.request({
            url: app.globalData.http + '/mpa/comment',
            method: 'GET',
            data: {
              feed_id: options.id
            },
            header: {
              'Api-Ext': app.globalData.apiExt
            },
            success(res) {
              var comment = res.data
              comment.forEach(function (v) {
                var time = that.time(v.created_at)
                v.time = time
              })
              that.setData({
                comments: comment
              })
            }
          })
        } else {
          wx.showToast({
            title: '该动态已被删除',
            duration: 2000,
            icon: 'none'
          })
        }
      }
    })
  },
  // 获取用户信息
  getUserInfo(e) {
    var that = this;
    if (e.detail.userInfo) {
      that.setData({
        userInfo: e.detail.userInfo
      })
      console.log(e.detail.userInfo)
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
                    modalVisi: true
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
      modalVisi: false
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
                        inputVisi: true
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
  onReachBottom: function () {
    // 评论列表数据
    var that = this
    var pages = this.data.page
    pages++
    wx.request({
      url: app.globalData.http + '/mpa/comment',
      method: 'GET',
      data: {
        feed_id: that.data.commentId,
        page: pages
      },
      header: {
        'Api-Ext': app.globalData.apiExt,
        'Api-Key': app.globalData.apiKey,
        'Api-Secret': app.globalData.apiSecret,
      },
      success(res) {
        if (res.data.length > 0) {
          var comment = res.data
          var com = that.data.comments.concat(comment)
          comment.forEach(function (v) {
            var time = that.time(v.created_at)
            v.time = time
          })
          that.setData({
            comments: com,
            page: pages
          })
        }
      }
    })
  }
})