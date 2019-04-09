const app = getApp()

Page({
    data: {
        skinStyle: ''
    },
    onLoad: function (options) {
        this.setData({
            skinStyle: app.globalData.skinStyle
        })
    }
})