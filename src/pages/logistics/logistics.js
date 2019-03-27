var app=getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
			list:{},
			image: 'https://image.51zan.com/',
			skinStyle: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			skinStyle: app.globalData.skinStyle
		})
		var that=this;
		var id=options.id;
		wx.request({
			url: app.globalData.http +'/mpa/order/'+id+'/express',
			method:'GET',
			dataType:'json',
			header: {
				'Api-Key': app.globalData.apiKey,
				'Api-Secret': app.globalData.apiSecret,
				'Api-Ext': app.globalData.apiExt
			},
			success:function(data){
				var datas=data.data;
				var code=data.statusCode.toString()
				if (code >= 200 && code<=300) {
					that.setData({
						list:datas
					})
				} else if(code>= 300 && code < 500){
					wx.showToast({
						title: data.data.message,
						icon:'none',
						duration:2000
					})
				}else{
					wx.showToast({
						title:"网络错误",
						icon: 'none',
						duration: 2000
					})
				}
			},
			fail:function(res){
				wx.showToast({
					title: "网络错误",
					icon: 'none',
					duration: 2000
				})
			} 
		})
	}
})