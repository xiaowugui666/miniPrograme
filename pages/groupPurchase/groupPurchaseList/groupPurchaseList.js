// pages/recommend/recommend.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
		produList: [],
    image: app.globalData.image,
		groupGoods: [],
		page: 0,
		flag: true
  },
	//跳转团购商品详情
	goDetail(e){
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id
		})
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		let that = this;
    wx.showLoading({
      title: '加载中',
    })
		this.getGroupData()
  },
	/**
	* 页面相关事件处理函数--监听用户下拉动作
	*/
	onPullDownRefresh: function () {
		this.setData({page: 0})
		this.setData({flag: true})
		this.getGroupData()
		wx.stopPullDownRefresh();
	},
	//拼团商品
	getGroupData () {
		let that = this
		wx.request({
			url: app.globalData.http + '/mpa/groupon_goods?per_page=10',
			header: {
				'Api-Ext': app.globalData.apiExt
			},
			dataType: 'json',
			method: 'GET',
			success: function (data) {
				if (data.data.length>0){
					that.setData({
						groupGoods: data.data
					})
				}
				wx.hideLoading()
			}
		})
	},
	// 上拉加载
	onReachBottom: function() {
		let that = this
		if (this.data.flag) {
			this.data.page++
			wx.showLoading({
				title: '加载中',
			})
			wx.request({
        url: app.globalData.http + '/mpa/groupon_goods?per_page=10&page='+this.data.page,
				header: {
					'Api-Ext': app.globalData.apiExt
				},
				dataType: 'json',
				method: 'GET',
				success: function (data) {
					if (data.data.length>0){
						that.setData({
							groupGoods: that.data.groupGoods.concat(data.data)
						})
					} else {
						that.setData({flag: false})
					}
					wx.hideLoading()
				}
			})
		}
  },
  //返回顶部
  goTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    })
  },
})