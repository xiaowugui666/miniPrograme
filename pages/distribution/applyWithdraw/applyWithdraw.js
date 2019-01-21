// pages/distribution/applyWithdraw/applyWithdraw.js
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		amount: 0,
		inputValue: '',
		disabled: true
	},
	handleInput: function (e) {
		let value = e.detail.value, regExp = /^[0-9]+(.[0-9]{0,2})?$/, buttonDisable = true, amount = this.data.amount
		if (!regExp.test(value) && value) {
			value = parseFloat(value).toString().match(/^\d+(?:\.\d{0,2})?/)
			return value || ''
		}
		if (value <= (amount / 100) && value >= 50) {
			buttonDisable = false
		}
		this.setData({
			inputValue: value,
			disabled: buttonDisable
		})
	},
	handleDrawAll: function (e) {
		let amount = this.data.amount, buttonDisable = true
		if (amount / 100 >= 50) {
			buttonDisable = false
		}
		amount = parseFloat(amount / 100).toString().match(/^\d+(?:\.\d{0,2})?/)
		this.setData({
			inputValue: amount,
			disabled: buttonDisable
		})
	},
	handleDraw: function () {
		let disabled = this.data.disabled, value = this.data.inputValue * 100, that = this
		if (!disabled) {
			wx.showLoading({
				title: '加载中'
			})
			wx.request({
				url: app.globalData.webHttp + '/mpa/distributor/withdrawals',
				method: 'POST',
				dataType: 'json',
				header: {
					"Api-Key": app.globalData.apiKey,
					"Api-Secret": app.globalData.apiSecret,
					'Api-Ext': app.globalData.apiExt
				},
				data: {
					amount: value
				},
				success: function (response) {
					if (response.statusCode === 200) {
						wx.navigateTo({
							url: '/pages/distribution/applySuccess/applySuccess'
						})
						wx.hideLoading()
					} else {
						wx.showToast({
							title: response.data.meta.message,
							icon: 'none'
						})
					}
				},
				fail: function (response) {
					wx.showToast({
						title: response.data.meta.message,
						icon: 'none'
					})
				}
			})
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			amount: app.globalData.distributorInfo.commission_amount
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
		this.setData({inputValue: ''})
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

	}
})