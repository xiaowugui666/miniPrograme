// pages/distribution/myCustomer/myCustomer.js
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		dataList: [],
		page: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.getData()
	},
	getData: function (params) {
		let that = this, currentPage = this.data.page
		wx.showLoading({
			title: '加载中'
		})
		wx.request({
			url: app.globalData.webHttp + '/mpa/distributor/customers',
			method: 'GET',
			dataType: 'json',
			header: {
				"Api-Key": app.globalData.apiKey,
				"Api-Secret": app.globalData.apiSecret,
				'Api-Ext': app.globalData.apiExt
			},
			data: {
				page: currentPage
			},
			success: function (response) {
				if (response.statusCode === 200) {
					if (response.data.length === 0 && params === 'isConcat') {
						let newPage = that.data.page
						newPage--
						that.setData({
							page: newPage
						})
					} else if (params === 'isConcat') {
						let tempArr = that.data.dataList
						let newArr = tempArr.concat(response.data)
						that.setData({
							dataList: newArr
						})
					} else {
						that.setData({
							dataList: response.data
						})
					}
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
		let newPage = this.data.page
		newPage++
		this.setData({
			page: newPage
		})
		this.getData('isConcat')
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})