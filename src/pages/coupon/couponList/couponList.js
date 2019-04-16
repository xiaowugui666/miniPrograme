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
        const that = this
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
                    that.setData({
                        couponList: data.data
                    })
                    wx.hideLoading()
				} else if (data.statusCode >= 400 || data.statusCode <= 500) {
                    let tips = data.data === "Unauthorized." ? '未授权' : data.data
                    wx.showToast({
                        title: tips,
                        icon: 'none',
                        duration: 2000
                    })
                } else {
                    const tip = data.data.message.toString()
                    wx.showToast({
                        title: tip,
                        icon: 'none',
                        duration: 2000
                    })
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
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/coupon/availableGoods/availableGoods?coupon_id' + id
        })
    }
})