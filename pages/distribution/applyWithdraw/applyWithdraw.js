// pages/distribution/applyWithdraw/applyWithdraw.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		amount: 5564
	},
	handleInput: function (e) {
		let value = e.detail.value
		let regExp = /^[0-9]+(.[0-9]{0,2})?$/
		console.log(regExp.test(value))
		if (!regExp.test(value)) {
			return parseFloat(value).toString().match(/^\d+(?:\.\d{0,2})?/) || ''
		}
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