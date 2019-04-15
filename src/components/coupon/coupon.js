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
        }
    },
    methods: {
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
            console.log(e)
            const { templateid, couponid } = e.currentTarget.dataset
            console.log(couponid, templateid)
            this.reciveCouponRequest(templateid, couponid)
        },
        reciveCouponRequest (templateId ,couponId) {
            wx.request({
                url: app.globalData.http + '/mpa/coupons',
                method: 'POST',
                dataType: 'json',
                header: {
                    "Api-Key": app.globalData.apiKey,
                    "Api-Secret": app.globalData.apiSecret,
                    'Api-Ext': app.globalData.apiExt
                },
                data: {
                    coupon_template_id: templateId,
                    coupon_id: couponId || '',
                },
                success: function (data) {
                    if (data.statusCode === 200) {
                        console.log(data)
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
        }
    },
    lifetimes: {
        attached () {
            console.log(this.data)
        },
        detached () {},
    }
})