//app.js
App({
  onShow(options) {
    this.globalData.options = options
  },
  onLaunch: function () {
    var that=this
		this.login()
    this.globalData.apiExt = wx.getExtConfigSync().data
  },
  login:function(){
		let that = this
    wx.login({
      success(code) {
        //向后台发起请求，传code
        wx.request({
          url: that.globalData.http + '/mpa/wechat/auth',
          method: 'POST',
          data: {
            code: code.code
          },
          header: {
            'Api-Ext': that.globalData.apiExt
          },
          success: function (res) {
            //保存响应头信息
            var code = res.statusCode.toString()
            if (code >= 200 && code < 300) {
							that.globalData.user_info = res.data
              if (res.header["api-key"] && res.header["api-secret"]) {
                var apiKey = res.header["api-key"],
                  apiSecret = res.header["api-secret"];
              } else if (res.header["Api-Key"] && res.header["Api-Secret"]) {
                var apiKey = res.header["Api-Key"],
                  apiSecret = res.header["Api-Secret"];
              }
              that.globalData.apiKey = apiKey
              that.globalData.apiSecret = apiSecret
              if (res.data.avatar_url && res.data.nick_name) {
                that.globalData.userInfo = true
              }
              if (res.data.user_id) {
                that.globalData.userId = true
              }
            }
          },
          fail: function (res) {
          }
        })
      },
      fail: function (res) {
      }
    }) 
  },
  globalData: {
    userInfo: false,
		user_info: {},
		classIdx:0,
		good:[],
    address:1,
    info:'',
    keyword:'',
    userId:false,
    name:'',
    logo_url:'',
    apiExt:'',
    apiKey:'',
    apiSecret:'',
    login:false,
    timeStamp:'',
    http:'https://retail-mall.51zan.com',
		image: 'https://image.yiqixuan.com/',
    options: ''
  }
})