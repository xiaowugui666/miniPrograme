// import {countDown} from "../../../utils/util.js"
const app=getApp();
Page({
	data: {
		image: app.globalData.image,
		skinStyle: ''
	},
	onLoad:function () {
		this.setData({
			skinStyle: app.globalData.skinStyle
		})
	}
})