import {environment} from './config/environment.js'
import blueTabBarItem from './utils/blueTabBarItem'
import defaultTabBarItem from './utils/defaultTabBarItem'

App({
	onShow(options) {
		let that = this
		that.globalData.options = options
	},
	onLaunch: function () {
		this.globalData.apiExt = wx.getExtConfigSync().data
	},
	setTabBar: function (data, _this) {
		const { type } = data
		this.globalData.skinStyle = type
		_this.setData({
			skinStyle: type
		})
		if (type === 'blue') {
			blueTabBarItem.forEach((element, index) => {
				wx.setTabBarItem({
					index: index,
					...element
				})
				wx.setTabBarStyle({
					color: '#9EA8B1',
					selectedColor: '#253A4E'
				})
			})
		} else {
			defaultTabBarItem.forEach((element, index) => {
				wx.setTabBarItem({
					index: index,
					...element
				})
				wx.setTabBarStyle({
					color: '#999999',
					selectedColor: '#fb5d5d'
				})
			})
		}
	},
	getAppSkinStyle: function () {
		let that = this
		return new Promise((resolve, reject) => {
			wx.request({
				url: that.globalData.http + '/mpa/index/decoration_tpl_current',
				method: 'GET',
				dataType: 'json',
				header: {
					'Api-Ext': that.globalData.apiExt
				},
				success: function (response) {
					if (response.statusCode === 200) {
						resolve(response.data.data[0])
					} else {
						reject(response)
					}
				},
				fail: function (response) {
					reject(response)
				}
			})
		})
	},
	withDistributVerifi: function () {
		let that = this
		return new Promise((resolve, reject) => {
			that.withDistributInfo().then(() => {
				if (that.globalData.distributorInfo.id || that.globalData.distribution.status === 2) {
					resolve()
				} else {
					wx.request({
						url: that.globalData.http + '/mpa/distributor/distributors/me',
						method: 'GET',
						dataType: 'json',
						header: {
							"Api-Key": that.globalData.apiKey,
							"Api-Secret": that.globalData.apiSecret,
							'Api-Ext': that.globalData.apiExt
						},
						success: function (response) {
							if (response.statusCode === 200) {
								that.globalData.distributorInfo = response.data
							}
							resolve()
						},
						fail: function (response) {
							reject(response)
						}
					})
				}
			})
		})
	},
	withDistributInfo: function () {
		let that = this
		return new Promise((resolve, reject) => {
			that.login().then(() => {
				if (that.globalData.distribution.id) {
					resolve()
				} else {
					wx.request({
						url: that.globalData.http + '/mpa/distributor/info',
						method: 'GET',
						header: {
							'Api-Ext': that.globalData.apiExt,
						},
						success: function (response) {
							if (response.statusCode >=200 && response.statusCode < 300) {
								that.globalData.distribution = response.data
							}
							resolve()
						},
						fail: function (response) {
							reject(response)
						}
					})
				}
			})
		})
	},
	login: function () {
		let that = this
		return new Promise((resolve,reject) => {
			if (!that.globalData.userId && !that.globalData.userInfo) {
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
								reject(res)
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
	publicAuth: function (e, env) {
		var that = env, _this = this
		return new Promise((resolve, reject) => {
			if (e.detail.encryptedData && e.detail.iv) {
				wx.showLoading({
					title: '加载中',
					icon: 'none',
					mask: true
				})
				wx.login({
					success(code) {
						wx.request({
							url: _this.globalData.http + '/mpa/wechat/auth',
							method: 'POST',
							header: {
								'Api-Ext': _this.globalData.apiExt
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
									_this.globalData.apiKey = apiKey
									_this.globalData.apiSecret = apiSecret
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
										url: _this.globalData.http + '/mpa/user/login',
										method: 'post',
										data: {
											encrypted: e.detail.encryptedData,
											iv: e.detail.iv
										},
										dataType: 'json',
										header: {
											"Api-Key": _this.globalData.apiKey,
											"Api-Secret": _this.globalData.apiSecret,
											'Api-Ext': _this.globalData.apiExt
										},
										success: function (data) {
											wx.hideLoading();
											var datas = data.statusCode.toString()
											if (datas >= 200 && datas < 300) {
												if (data.header["api-key"] && data.header["api-secret"]) {
													var apiKey = data.header["api-key"],
														apiSecret = data.header["api-secret"];
												} else if (data.header["Api-Key"] && data.header["Api-Secret"]) {
													var apiKey = data.header["Api-Key"],
														apiSecret = data.header["Api-Secret"];
												}
												_this.globalData.apiKey = apiKey
												_this.globalData.apiSecret = apiSecret
												_this.globalData.userId = true
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
												resolve(e)
											} else {
												var tip = data.data.message.toString()
												wx.showToast({
													title: tip,
													icon: 'none',
													duration: 2000
												})
												reject()
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
									reject()
								}
							}
						})
					}
				})
			}
		})
	},
	publicGetUserInfo: function (e, env) {
		let that = env, _this = this
		return new Promise((resolve, reject) => {
			if (e.detail.userInfo) {
				wx.showLoading({
					title: '加载中',
					icon: 'none',
					mask: true
				})
				wx.login({
					success(code) {
						//获取用户信息，拿到userInfo
						var userInfo = e.detail.userInfo;
						//向后台发起请求，传code
						wx.request({
							url: _this.globalData.http + '/mpa/wechat/auth',
							method: 'POST',
							header: {
								'Api-Ext': _this.globalData.apiExt
							},
							data: {
								code: code.code
							},
							success: function (res) {
								wx.hideLoading();
								var code = res.statusCode.toString()
								if (code == 500) {
									wx.showToast({
										title: res.data.message,
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
									_this.globalData.apiKey = apiKey;
									_this.globalData.apiSecret = apiSecret;
									_this.globalData.user_info = userInfo;
									that.setData({
										hasUserInfo: true
									})
									wx.setStorage({
										key: 'huzan_avatarUrl',
										data: userInfo,
									})
									resolve(userInfo)
									wx.request({
										url: _this.globalData.http + '/mpa/wechat/' + res.data.id,
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
											"Api-Key": _this.globalData.apiKey,
											"Api-Secret": _this.globalData.apiSecret,
											'Api-Ext': _this.globalData.apiExt
										},
										complete(res) {
										}
									})
									if (res.data.user_id) {
										_this.globalData.userId = true
										// wx.setStorage({
										//   key: 'userId',
										//   data: true,
										// })
									}
								}
							}
						})
					},
					fail: function (res) {
					}
				})
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
		http: environment.env,
		image: 'https://image.51zan.com/',
		options: '',
		sceneID: 0,
		distribution: {},
		distributorInfo: {},
		skinStyle: 'default'
	}
})