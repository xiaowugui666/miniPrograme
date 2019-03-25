// pages/search/search.js
var app=getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		dataList:[],
		image: 'https://image.51zan.com/',
		keyword:'',
		keyName: '',
		skinStyle: ''
	},
	onLoad:function(){
		this.setData({
			keyword: app.globalData.keyword,
			skinStyle: app.globalData.skinStyle
		})
	},
	//input事件
	searchKey:function(e){
		var that=this, keyName = e.detail.value
		if (keyName){
			wx.request({
				url: app.globalData.http + '/mpa/goods/search/suggest',
				data: {
					keywords: keyName
				},
				header: {
					'Api-Ext': app.globalData.apiExt
				},
				dataType: 'json',
				method: 'GET',
				success: function (data) {
					var code = data.statusCode.toString()
					if (code == 500) {
						that.setData({
							dataList: []
						})
					} else if (code.indexOf('40') > -1) {
						var tip = data.data.message.toString()
						wx.showToast({
							title: tip,
							icon: 'none',
							duration: 1000
						})
					} else {
						let tempArr = data.data
						tempArr.map(item => {
							let string = that.getHilightStrArray(item.name, keyName)
							item.newStringArr = string
							return item
						})
						that.setData({
							dataList: tempArr,
							keyName: keyName
						})
					}
				}
			})
		}else{
			that.setData({
				dataList: []
			})
		}
	},
	//返回一个使用key切割str后的数组，key仍在数组中
	getHilightStrArray: function(str, key) {
		return str.replace(new RegExp(`${key}`, 'g'), `%%${key}%%`).split('%%');
	},
	//清除input输入
	clearKey(){
		this.setData({
			value:"",
			dataList:[]
		})
	},
	// //处理点击完成按钮函数
	confirmEvent:(e)=>{
		if (e.detail.value!=''){
			wx.navigateTo({
				url: '/pages/result/result?keyword=' + e.detail.value,
			})
		}else{
			wx.showToast({
				title: '请输入关键词',
				icon:"none",
				duration:2000
			})
		}
	}
})