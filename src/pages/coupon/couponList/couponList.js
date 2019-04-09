const app = getApp()

Page({
    data: {
        skinStyle: '',
        currentTab: 1
    },
    onLoad: function (options) {
        this.setData({
            skinStyle: app.globalData.skinStyle
        })
    },
    handleChangeTab: function (e) {
        this.setData({
            currentTab: e.currentTarget.dataset.tab
        })
    }
})