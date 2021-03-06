const app = getApp()
Component({
    data: {
    },
    properties: {
        couponModalHid: {
            type: Boolean,
            value: true,
        },
        couponModalVisi: {
            type: Boolean,
            value: false
        },
        skinStyle: {
            type: String,
            value: ''
        },
        couponList: {
            type: Array,
            value: []
        },
        couponParams: {
            type: Object,
            value: {
                couponId: null,
                couponTemplateId: null
            }
        },
		componentFrom: {
            type: String,
            value: 'index'
        },
        hasUserInfo: {
            type: Boolean,
            value: false
        },
        userId: {
            type: Number,
            value: 0
        },
    },
    methods: {
        touchstart () {
        },
        preventDefault (e) {
        },
        handleRoute (e) {
            const { index } = e.currentTarget.dataset
            const {coupon_type, title} = this.data.couponList[index]
            wx.navigateTo({
                url: `/pages/coupon/availableGoods/availableGoods?coupon_id=${coupon_type.id}&title=${title}`
            })
        },
        handleRouteIndex (e) {
            const {coupon_type, coupon_template} = this.data.couponList[0]
            wx.navigateTo({
                url: `/pages/coupon/availableGoods/availableGoods?coupon_id=${coupon_type.id}&title=${coupon_template.title}`
            })
        },
        handleCloseCoupon () {
            const that = this
            that.setData({
                couponModalVisi: false
            }, () => {
                setTimeout(() => {
                    that.setData({
                        couponModalHid: true
                    })
                }, 300)
            })
        },
        handleReciveCoupon (e) {
            const { templateid, couponid, index } = e.currentTarget.dataset, { couponList } = this.data
            let tempArr = this.data.couponList
            if (!couponList[index].is_limit) {
                this.reciveCouponRequest(templateid, couponid).then(() => {
                    tempArr[index].is_picked = true
                    tempArr[index].is_used = false
                    this.setData({
                        couponList: tempArr
                    })
                })
            } else {
                wx.showToast({
                    title: '已达领取上限',
                    icon: 'none'
                })
            }
        },
        getUserInfo (e) {
            const { templateid, couponid } = e.currentTarget.dataset
            app.publicGetUserInfo(e, this).then(() => {
                this.reciveCouponRequest(templateid, couponid)
            })
        },
        reciveCouponRequest (templateId ,couponId) {
            const { userId } = this.data
            let requestUrl = userId === 0 ? '/mpa/coupons/wechat' : '/mpa/coupons/user'
            return new Promise((resolve, reject) => {
                wx.showLoading()
                wx.request({
                    url: app.globalData.http + requestUrl,
                    method: 'POST',
                    dataType: 'json',
                    header: {
                        "Api-Key": app.globalData.apiKey,
                        "Api-Secret": app.globalData.apiSecret,
                        'Api-Ext': app.globalData.apiExt
                    },
                    data: {
                        coupon_template_id: templateId,
                        coupon_id: couponId || 0,
                    },
                    success: function (data) {
                        if (data.statusCode === 200) {
                            resolve(data.data)
                            wx.showToast({
                                title: '领取成功',
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
                            reject(data)
                        }
                    }
                })
            })
        }
    },
    lifetimes: {
        attached () {
        },
        ready () {
        },
        detached () {},
    }
})