// pages/special/special.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
		produList: [],
    image: 'http://image.yiqixuan.com/'
  },
	//跳转商品详情
	goDetail(e){
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + "&name=" + e.currentTarget.dataset.name,
		})
	},
  //返回顶部
  goTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		let that = this;
		wx.request({
      url: app.globalData.http + '/mpa/goods/special',
			data: {
				page: 0,
				pre_page: 20
			},
      header:{
        'Api-Ext': app.globalData.apiExt
      },
			method: "GET",
			success(res) {
				that.setData({
					produList: res.data
				})
			}
		})
		wx.setNavigationBarTitle({
			title: '特价',
		})
  },
  onPullDownRefresh: function () {
    let that = this;
    wx.request({
      url: app.globalData.http + '/mpa/goods/special',
      data: {
        page: 0,
        pre_page: 20
      },
      header: {
        'Api-Ext': app.globalData.apiExt
      },
      method: "GET",
      success(res) {
        wx.stopPullDownRefresh()
        that.setData({
          produList: res.data
        })
      }
    })
  }
})
 