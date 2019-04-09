const app = getApp()
Component({
    data: {
    },
    properties: {
        couponModalHid: {
            type: Boolean,
            value: false,
        },
        couponModalVisi: {
            type: Boolean,
            value: true
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
        }
    },
    lifetimes: {
        attached () {
            console.log(app.globalData)
        },
        detached () {},
    }
})