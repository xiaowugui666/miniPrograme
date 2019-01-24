// pages/distribution/joinDistribution/joinDistribution.js
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		modalVisible: false,
		userId: false,
		hasUserInfo: false,
		tips: '亲爱的，你还不符合申请资格哦~',
		distributionPlan: ''
	},
	handleClick: function () {
		this.appliForMember().then((res) => {
			if (res.statusCode === 400) {
				this.setData({
					modalVisible: true,
					tips: res.data.meta.message
				})
				wx.hideLoading()
			} else if (res.statusCode === 200) {
				app.globalData.distributorInfo = res.data
				wx.showToast({
					title: '申请成功！',
					icon: 'success',
					duration: 1000
				})
				setTimeout(() => {
					wx.redirectTo({
						url: '/pages/distribution/distributionCenter/distributionCenter'
					})
				}, 1200);
			}
		}).catch((err) => {
			wx.showToast({
				title: err.data.meta.message,
				icon: 'none'
			})
		})
	},
	handleCloseModal: function () {
		this.setData({
			modalVisible: false
		})
	},
	// 阻止蒙层事件冒泡
	handleTouchmove: function () {},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that=this;
		that.setData({
			distributionPlan: app.globalData.distribution.recruitment_plan
		})
		var uerinfo = wx.getStorageSync("huzan_avatarUrl")
		if (uerinfo) {
			that.setData({
				userInfo: uerinfo,
				hasUserInfo: true,
				userId: app.globalData.userId
			})
		} else {
			that.setData({
				hasUserInfo: false,
				userId: app.globalData.userId
			})
		}
	},
	appliForMember: function () {
		return new Promise((resolve, reject) => {
			wx.showLoading({
				title: '加载中',
			})
			wx.request({
				url: app.globalData.http + '/mpa/distributor/distributors',
				method: 'POST',
				header: {
					"Api-Key": app.globalData.apiKey,
					"Api-Secret": app.globalData.apiSecret,
					'Api-Ext': app.globalData.apiExt
				},
				success: function (res) {
					if (res.statusCode === 200 || res.statusCode === 400) {
						resolve(res)
					} else {
						reject(res)
					}
				},
				fail: function (res) {
					wx.showToast({
						title: res.data.meta.message,
						icon: 'none'
					})
					reject()
				}
			})
		})
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},
	getPhoneNumber: function (e) {
		app.publicAuth(e, this).then(() => {
			this.appliForMember().then((res) => {
				if (res.statusCode === 400) {
					this.setData({
						modalVisible: true,
						tips: res.data.meta.message
					})
				} else if (res.statusCode === 200) {
					app.globalData.distributorInfo = res.data
					wx.showToast({
						title: '申请成功！',
						icon: 'success',
						duration: 1500
					})
					setTimeout(() => {
						wx.redirectTo({
							url: '/pages/distribution/distributionCenter/distributionCenter'
						})
					}, 2000);
				}
				wx.hideLoading()
			}).catch((err) => {
				wx.showToast({
					title: err.data.meta.message,
					icon: 'none'
				})
			})
		})
	}
})