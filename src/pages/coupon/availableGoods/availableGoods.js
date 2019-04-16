const app = getApp()

Page({
    data: {
        skinStyle: '',
        goodsList: [],
        currentPage: 0
    },
    onLoad: function (options) {
        console.log(options)
        const { coupon_id } = options
        this.setData({
            skinStyle: app.globalData.skinStyle,
            couponId: coupon_id
        })
        this.getPageData()
    },
    handleDetail: function (e) {
        wx.navigateTo({
            url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
        })
    },
    getPageData: function (params) {
        const that = this, { currentPage, couponId } = this.data
        wx.showLoading()
        wx.request({
			url: app.globalData.http + `/mpa/coupons/${couponId}/coupon_goods`,
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
			success: function (data) {
                if (data.statusCode >= 200 && data.statusCode < 300) {
                    wx.hideLoading()
                    if (params === 'isConcat' && data.data.length > 0) {
                        let tempArr = that.data.goodsList
                        let newArr = tempArr.concat(data.data)
                        that.setData({
                            goodsList: newArr
                        })
                    } else if (params === 'isConcat' &&  data.data.length == 0) {
                        let newPage = that.data.currentPage
                        newPage--
                        that.setData({
                            currentPage: newPage
                        })
                    } else {
                        that.setData({
                            goodsList:data.data
                        })
                    }
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
    onReachBottom: function () {
        let newPage = this.data.currentPage
        newPage++
        this.setData({
            currentPage: newPage
        })
        this.getPageData('isConcat')
    }
})