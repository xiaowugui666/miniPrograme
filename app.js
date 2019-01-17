App({
	onShow(options) {
		let that = this
		that.globalData.options = options
		wx.request({
			url: that.globalData.webHttp + '/mpa/distributor/info',
			method: 'GET',
			header: {
				'Api-Ext': that.globalData.apiExt,
			},
			success: function (response) {
				if (response.statusCode >=200 && response.statusCode < 300) {
					that.globalData.distribution = response.data
				}
			}
		})
	},
	onLaunch: function () {
		var that=this
		that.login()
		this.globalData.apiExt = wx.getExtConfigSync().data
	},
	login:function(){
		let that = this
		return new Promise((resolve,reject) => {
			if (!that.globalData.userId || !that.globalData.userInfo) {
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
									resolve(res)
								}
							},
							fail: function (res) {
								reject(res)
							}
						})
					},
					fail: function (res) {
						reject(res)
					}
				})
			} else {
				resolve()
			}
		}) 
	},
	onHide () {
		this.globalData.sceneID = 0
	},
	globalData: {
		userInfo: false,
		user_info: {},
		classIdx: '',
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
		http:'https://retail-mall-develop.51zan.com',
		webHttp: 'https://retail-develop.51zan.com',
		image: 'https://image.yiqixuan.com/',
		options: '',
		sceneID: 0,
		distribution: {}
	}
})