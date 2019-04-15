const app = getApp()

Page({
    data: {
        skinStyle: '',
        currentTab: 1,
        couponList: []
    },
    onLoad: function (options) {
        const status = this.data.currentTab
        this.setData({
            skinStyle: app.globalData.skinStyle
        })
        this.getPageData(status)
    },
    getPageData: function (params) {
        wx.showLoading()
        wx.request({
			url: app.globalData.http + '/mpa/coupons',
			method: 'GET',
			dataType: 'json',
			header: {
				"Api-Key": app.globalData.apiKey,
				"Api-Secret": app.globalData.apiSecret,
				'Api-Ext': app.globalData.apiExt
            },
            data: {
                status: params
            },
			success: function (data) {
				if (data.statusCode === 200) {
                    console.log(data)
                    wx.hideLoading()
				}
			}
		})
    },
    handleChangeTab: function (e) {
        const status = e.currentTarget.dataset.tab
        this.setData({
            currentTab: status
        })
        this.getPageData(status)
    },
    handleUseCoupon: function (e) {
        wx.navigateTo({
            url: '/pages/coupon/availableGoods/availableGoods?coupon_id=5'
        })
    }
})