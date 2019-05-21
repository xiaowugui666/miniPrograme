var app=getApp()
//获取应用实例
Page({
	data: {
		userInfo: {},
		hasUserInfo: false,
		userId: true,
		count1:'',
		count2:'',
		count3:'',
		count4:'',
		apiExt:'',
		// messageNum:'',
		image: 'https://image.51zan.com/',
		isOpenDistribution: false,
		distributionInfo: {},
		isDistributor: false,
		skinStyle: '',
		couponTotal: 0
	},
	onShow: function () {
		this.setData({
			skinStyle: app.globalData.skinStyle
		})
		var that=this;
		app.withDistributVerifi().then(() => {
			var uerinfo = wx.getStorageSync("huzan_avatarUrl")
			if (uerinfo){
				that.setData({
					userInfo: uerinfo,
					hasUserInfo: true,
					userId: app.globalData.userId
				})
				this.getCouponTotal()
			}else{
				that.setData({
					hasUserInfo: false,
					userId: app.globalData.userId
				})
			}
			if (app.globalData.distribution.status == 1) {
				let isDistributor = false
				if (app.globalData.distributorInfo.id) {
					isDistributor = true
				}
				this.setData({
					isDistributor: isDistributor,
					isOpenDistribution: true
				})
			} else {
				this.setData({
					isOpenDistribution: false
				})
			}
			if (app.globalData.userId){
				wx.request({
					url: app.globalData.http + '/mpa/order/status/count',
					method: 'GET',
					dataType: 'json',
					header: {
						"Api-Key": app.globalData.apiKey,
						"Api-Secret": app.globalData.apiSecret,
						'Api-Ext': app.globalData.apiExt
					},
					success: function (data) {
						var datas = data.data
						that.setData({
							count1: datas[0].count,
							count2: datas[1].count,
							count3: datas[2].count,
							count4: datas[3].count,
						})
					}
				})
				// 动态模块消息中心未读消息数，动态模块已被隐藏
	
				// wx.request({
				// 	url: app.globalData.http + '/mpa/comment/unread/count',
				// 	method: 'GET',
				// 	dataType: 'json',
				// 	header: {
				// 		"Api-Key": app.globalData.apiKey,
				// 		"Api-Secret": app.globalData.apiSecret,
				// 		'Api-Ext': app.globalData.apiExt
				// 	},
				// 	success: function (data) {
				// 		var datas = data.data
				// 		that.setData({
				// 			messageNum: datas
				// 		})
				// 	}
				// })
			}
		})
	},
	getCouponTotal: function (params) {
		const that = this
		wx.request({
			url: app.globalData.http + '/mpa/coupons/total',
			method: 'GET',
			dataType: 'json',
			header: {
				"Api-Key": app.globalData.apiKey,
				"Api-Secret": app.globalData.apiSecret,
				'Api-Ext': app.globalData.apiExt
			},
			success: function (data) {
				if (data.statusCode === 200) {
					that.setData({
						couponTotal: data.data
					})
				}
			}
		})
	},
	toOrder:function(e){
		wx.navigateTo({
			url: '/pages/orders/orders?curTab=' + e.currentTarget.dataset.curtab
		})
	},
	getPhoneNumber: function (e) {
		app.publicAuth(e, this)
	},
	getInfo:function(e){
		app.publicGetUserInfo(e, this).then(userInfo => {
			this.setData({
				userInfo: userInfo
			})
		})
	}
})
