// pages/refundDetail/refundDetail.js
var app=getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		image: 'http://image.yiqixuan.com/',
		data:'',
		id:'',
		reason:[
			'物流太慢/收货太迟',
			'发错货',
			'尺码偏小',
			'尺码偏大',
			'脏污/色差',
			'其它'
		],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that=this
		var id=options.id;
		that.setData({
			id: options.id
		})
		wx.request({
			url: app.globalData.http + '/mpa/after_sale/'+id,
			method:'GET',
			dataType:'JSON',
			header: {
				"Api-Key": app.globalData.apiKey,
				"Api-Secret": app.globalData.apiSecret,
				'Api-Ext': app.globalData.apiExt
			},
			success:function(data){
				var datas = JSON.parse(data.data)
				var code = data.statusCode.toString()
				if (code.indexOf('20') > -1) {
					that.setData({
						data:datas
					})
				}else{
					var tip = data.data.message.toString()
					wx.showToast({
						title: tip,
						icon: 'none',
						duration: 1000
					})
				}
			}
		})
	},
	cancel:function(e){
		var id=e.target.dataset.id
		var that=this
		wx.showModal({
			title: '提示',
			content: '确定要取消申请吗？',
			success: function (res) {
				if (res.confirm) {
					wx.request({
						url: app.globalData.http + '/mpa/after_sale/' +that.data.id,
						method: 'PUT',
						dataType: 'JSON',
						header: {
							"Api-Key": app.globalData.apiKey,
							"Api-Secret": app.globalData.apiSecret,
							'Api-Ext': app.globalData.apiExt
						},
						success: function (res) {
							var code=res.statusCode.toString()
							if(code.indexOf('20')>-1){
								wx.showToast({
									title: '退款申请已取消',
									icon: 'none',
									duration: 1000
								})
								setTimeout(function () {
									wx.redirectTo({
										url: '/pages/orders/orders?curTab=500'
									})
								}, 1000)
							}else{
								
								var str = JSON.parse(res.data)
								wx.showToast({
									title: str.message,
									icon: 'none',
									duration: 2000
								})
							}
						},
						fail:function(res){
							wx.showToast({
								title: '网络错误',
								icon:'none',
								duration:1000
							})
						}
					})


				} else if (res.cancel) {
					
				}
			}
		})
	}
})