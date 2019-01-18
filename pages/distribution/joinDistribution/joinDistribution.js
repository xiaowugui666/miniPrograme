// pages/distribution/joinDistribution/joinDistribution.js
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		modalVisible: false,
		userId: false,
		hasUserInfo: false
	},
	handleClick: function () {
		this.setData({
			modalVisible: true
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
	getPhoneNumber: function (e) {}
})