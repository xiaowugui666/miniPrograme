// pages/distribution/applyWithdraw/applyWithdraw.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		amount: 5564,
		inputValue: '',
		disabled: true
	},
	handleInput: function (e) {
		let value = e.detail.value, regExp = /^[0-9]+(.[0-9]{0,2})?$/, buttonDisable = true, amount = this.data.amount
		if (!regExp.test(value) && value) {
			value = parseFloat(value).toString().match(/^\d+(?:\.\d{0,2})?/)
			return parseFloat(value).toString().match(/^\d+(?:\.\d{0,2})?/) || ''
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
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {

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

	}
})