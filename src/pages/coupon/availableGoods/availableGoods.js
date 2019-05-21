const app = getApp()

Page({
    data: {
        skinStyle: '',
        goodsList: [],
        currentPage: 0,
        couponTitle: ''
    },
    onLoad: function (options) {
        const { coupon_id, title } = options
        this.setData({
            skinStyle: app.globalData.skinStyle,
            couponId: coupon_id,
            couponTitle: title
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
                } else if (data.statusCode >= 400 || data.statusCode <= 500) {
                    let tips = data.data === "Unauthorized." ? '未授权' : data.data
                    wx.showToast({
                        title: tips,
                        icon: 'none',
                        duration: 2000
                    })
                } else {
                    const tip = data.data.meta.message.toString()
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