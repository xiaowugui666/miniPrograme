var app = getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		address: 1,
		dataList: [],
		// 商品数量改变
		count: '',
		buyLimitCount: 0,
		stock_count: 0,
		price: '',
		groupPrice: '',
		plusStatu: false,
		carriage: 0,
		totalMoney: '0.00',
		totalOrder: '0.00',
		sku_ids: {},
		image: 'https://image.51zan.com/',
		sku_idd: [],
		local: [],
		cart_item_ids: [],
		// 是否从购物车跳转
		fromCart: false,
		isJoin: false,
		// apiSecret:'',
		// apiKey:'',
		disabled: false,
		groupId: '',
		skinStyle: '',
		couponModalHid: true,
		couponModalVisi: false,
		couponCurrentChoose: '',
		availableCoupon: [],
		notUseCoupon: false
	},
	handleCloseCoupon: function () {
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
	haddleOpenCoupon: function () {
		this.setData({
			couponModalVisi: true,
			couponModalHid: false
		})
	},
	handleChangeCoupon: function (e) {
		const { index } = e.currentTarget.dataset, availableCoupon = this.data.availableCoupon
		availableCoupon.forEach(element => {
			element.selected = false
		})
		if (index != undefined) {
			availableCoupon[index].selected = true
			let couponPrice = availableCoupon[index].coupon_type.reduce_amount
			this.setData({
				availableCoupon: availableCoupon,
				notUseCoupon: false,
				couponCurrentChoose: couponPrice,
				totalOrder: parseFloat(this.data.carriage) + parseFloat(this.data.totalMoney) - parseFloat(couponPrice)
			})
		} else {
			this.setData({
				availableCoupon: availableCoupon,
				notUseCoupon: true,
				couponCurrentChoose: '',
				totalOrder: parseFloat(this.data.carriage) + parseFloat(this.data.totalMoney)
			})
		}
	},
	getCouponInfo: function () {
		const that = this
		let goodsObj = {}
		if (that.data.fromCart) {
			goodsObj = that.data.sku_ids
		} else {
			let id = that.data.dataList[0].goods_sku_id,count = that.data.count;
			goodsObj = {
				[id]: count
			}
		}
		wx.request({
			url: app.globalData.http + '/mpa/coupons/order_coupons',
			method: 'POST',
			dataType: 'json',
			header: {
				"Api-Key": app.globalData.apiKey,
				"Api-Secret": app.globalData.apiSecret,
				'Api-Ext': app.globalData.apiExt
			},
			data: {
				goods_skus: goodsObj,
				is_groupon: 1
			},
			success: function (data) {
				if (data.statusCode === 200) {
					let tempArr = data.data, highestReduce = 0
					tempArr.forEach(element => {
						element.selected = false
					})
					tempArr.sort(function(a, b) {
						if (a.coupon_type.reduce_amount < b.coupon_type.reduce_amount) return 1
						if (a.coupon_type.reduce_amount > b.coupon_type.reduce_amount) return -1
					})
					if (data.data.length > 0) {
						tempArr[0].selected = true
						highestReduce = tempArr[0].coupon_type.reduce_amount
					}
					that.setData({
						availableCoupon: tempArr,
						couponCurrentChoose: highestReduce,
						totalOrder: parseFloat(that.data.carriage) + parseFloat(that.data.totalMoney) - parseFloat(highestReduce),
						notUseCoupon: false
					})
				} else {
					const tip = data.data.message.toString()
					wx.showToast({
						title: tip,
						icon: 'none',
						duration: 2000
					})
				}
			},
			fail: function (res) {
			}
		})
	},
	// 减少数量
	bindminus() {
		let that = this;
		if (Object.prototype.toString.call(that.data.address) == '[object Number]') {
			wx.showToast({
				title: '请添加地址',
				icon: 'none',
				duration: 1000
			})
			return false
		}
		let num = that.data.count,
			flag = false,
			carriage = that.data.carriage,
			price = that.data.price,
			groupPrice = that.data.groupPrice;
		if (num > 1) {
			num--
		}
		if (num <= 1) {
			flag = true
		}
		let tempArr = Object.keys(that.data.sku_ids)
		let newObj = {
			[tempArr[0]]: num
		}
		that.setData({
			count: num,
			plusStatu: false,
			sku_ids: newObj,
			totalMoney: groupPrice * num,
			totalOrder: groupPrice * num + carriage
		}, function () {
			that.getCarriage().then(() => {
				that.getCouponInfo()
			})
		})
	},
	// 增加数量
	bindplus(e) {
		let that = this;
		if (Object.prototype.toString.call(that.data.address) == '[object Number]') {
			wx.showToast({
				title: '请添加地址',
				icon: 'none',
				duration: 1000
			})
			return false
		}
		let num = that.data.count,
			flag = false,
			stock_count = that.data.stock_count,
			limitCount = that.data.buyLimitCount,
			carriage = that.data.carriage,
			price = that.data.price,
			groupPrice = that.data.groupPrice;
		if (num >= stock_count) {
			wx.showToast({
				title: '库存不足',
				icon: 'none'
			})
		} else if (num >= limitCount && limitCount) {
			wx.showToast({
				title: '每名用户最多拼' + limitCount + '份商品',
				icon: 'none',
				duration: 2000
			})
			flag = true
		} else {
			num++;
		}
		let temp = Object.keys(that.data.sku_ids)
		let newObj = {
			[temp[0]]: num
		}
		that.setData({
			count: num,
			plusStatu: flag,
			sku_ids: newObj,
			totalMoney: groupPrice * num,
			totalOrder: groupPrice * num + carriage
		},function(){
			that.getCarriage().then(() => {
				that.getCouponInfo()
			})
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			skinStyle: app.globalData.skinStyle
		})
		// 如果从购物车跳转，无法改变数量
		if (options.fromCart) {
			this.setData({
				fromCart: true
			})
		}
		let data = app.globalData.good;
		// 如果为来源为参团
		if (options.isjoin == 1) {
			this.setData({
				isJoin: true,
				groupId: data[0].group_id
			})
		}
		// var local = app.globalData.localArr
		// app.globalData.localArr=[]
		// var total = data.concat(local)
		var sku_id = {}
		var sku_idss = [], cart_item_ids = [], count = 0, price = '', groupPrice = '', buyLimitCount = 0, stock_count = 0;
		var that = this
		var groupSum = 0;
		for (var i = 0; i < data.length; i++) {
			count = data[i].count;
			price = data[i].price;
			stock_count = data[i].stock_count;
			buyLimitCount = data[i].buy_limit_count;
			groupPrice = data[i].priceLow;
			groupSum += parseFloat(data[i].priceLow) * parseFloat(data[i].count)
			sku_id[[data[i].goods_sku_id]] = data[i].count
			sku_idss.push(data[i].goods_sku_id)
			cart_item_ids.push(data[i].id)
		}

		that.setData({
			count: count,
			price: price,
			stock_count: stock_count,
			buyLimitCount: buyLimitCount,
			groupPrice: groupPrice,
			sku_ids: sku_id,
			sku_idd: sku_idss,
			minusStatu: count > 1 ? false : true,      
			cart_item_ids: cart_item_ids
		})
		wx.request({
			url: app.globalData.http + '/mpa/address',
			method: 'get',
			dataType: 'json',
			header: {
				"Api-Key": app.globalData.apiKey,
				"Api-Secret": app.globalData.apiSecret,
				'Api-Ext': app.globalData.apiExt
			},
			success: function (data) {
				var code = data.statusCode.toString()
				if (code.indexOf('20') > -1) {
					if (data.data.length > 0) {
						if (data.data[0].status === 2 && data.data.length > 0) {
							that.setData({
								address: data.data[0]
							}, function () {
								that.getCarriage()
							})

						}
					}
				} else {
					var tip = data.data.message.toString();
					wx.showToast({
						title: tip,
						icon: 'none',
						duration: 2000
					})
				}
			}
		})
		that.setData({
			dataList: data,
			totalMoney: groupSum,
			totalOrder: groupSum,
		}, () => {
			if (that.data.address.id) {
				that.getCarriage().then(() => {
					that.getCouponInfo()
				})
			}
		})
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		var that = this;
		if (app.globalData.address !== 1) {
			this.setData({
				address: app.globalData.address
			}, function () {
				that.getCarriage().then(() => {
					that.getCouponInfo()
				})
			})
		}
	},
	/* 查询支付状态*/
	checkPay: function (id) {
		var that = this
		var t = 90;
		wx.showLoading({
			title: '加载中',
		})
		var time = setInterval(function () {
			t--
			if (t > 1) {
				wx.request({
					url: app.globalData.http + '/mpa/order/' + id + '/status',
					method: "get",
					dataType: 'json',
					header: {
						"Api-Key": app.globalData.apiKey,
						"Api-Secret": app.globalData.apiSecret,
						'Api-Ext': app.globalData.apiExt
					},
					success: function (data) {
						if (data.statusCode >= 200 && data.statusCode < 300) {
							var code = data.data.status
							if (code == 255 || code == 205) {
								clearInterval(time)
								wx.hideLoading()
								wx.showToast({
									title: '支付成功',
									icon: 'success',
									duration: 1000
								})
								setTimeout(function () {
									wx.navigateTo({
										url: '/pages/groupPurchase/groupShareDetails/groupShareDetails?groupid=' + that.data.groupId + '&goodsid=' + that.data.dataList[0].goods_id,
									})
								}, 1000)
							} else if (code == 207) {
								clearInterval(time)
								wx.hideLoading()
								wx.showToast({
									title: '团成员出错',
									duration: 1000
								})
							}
						}
					},
					fail: function (res) {
						wx.hideLoading()
						wx.showToast({
							title: '支付失败',
							icon: 'none',
							duration: 1000
						})
						clearInterval(time)
						that.setData({
							disabled: false
						})
						setTimeout(function () {
							wx.navigateTo({
								url: '/pages/orderDetail/orderDetail?id=' + id,
							})
						}, 1000)
					}
				})
			} else {
				wx.hideLoading()
				wx.showToast({
					title: '支付失败',
					icon: 'none',
					duration: 1000
				})
				clearInterval(time)
				that.setData({
					disabled: false
				})
			}
		}, 1000)
	},
	// 立即支付
	submit: function (e) {
		var that = this
		if (Object.prototype.toString.call(that.data.address) == '[object Number]') {
			wx.showToast({
				title: '请添加地址',
				icon: 'none',
				duration: 1000
			})
			return false
		}
		that.setData({
			disabled: true
		})
		let newArr = [];
		let id = that.data.dataList[0].goods_sku_id, count = that.data.count;
		let skuObj = {
			[id]: count
		}
		let requestUrl, data, sceneID = app.globalData.sceneID ? app.globalData.sceneID : '', couponTemplateId, { availableCoupon } = that.data;
		if (that.data.notUseCoupon || availableCoupon.length === 0) {
			couponTemplateId = 0
		} else {
			availableCoupon.forEach(element => {
				if (element.selected) {
					couponTemplateId = element.id
				}
			})
		}
		// 定义不同接口所需参数
		if (that.data.isJoin) {
			requestUrl = app.globalData.http + '/mpa/groupon/' + that.data.groupId + '/join';
			data = {
				groupon_id: that.data.groupId,
				goods_id: that.data.dataList[0].goods_id,
				goods_sku_arr: skuObj,
				activity_form_id: that.data.dataList[0].groupFormId,
				address_id: that.data.address.id,
				form_id: e.detail.formId,
				scene: sceneID,
				coupon_id: couponTemplateId
			}
		} else {
			requestUrl = app.globalData.http + '/mpa/groupon';
			data = {
				groupon_goods_id: that.data.dataList[0].groupInfo_id,
				goods_id: that.data.dataList[0].goods_id,
				goods_sku_arr: skuObj,
				activity_form_id: that.data.dataList[0].groupFormId,
				address_id: that.data.address.id,
				form_id: e.detail.formId,
				scene: sceneID,
				coupon_id: couponTemplateId
			}
		}
		// 直接支付
		wx.request({
			url: requestUrl,
			header: {
				"Api-Key": app.globalData.apiKey,
				"Api-Secret": app.globalData.apiSecret,
				'Api-Ext': app.globalData.apiExt
			},
			method: 'POST',
			dataType: 'json',
			data: data,
			success(data) {
				var code = data.statusCode.toString()
				if (code >= 200 && code < 300) {
					that.setData({
						groupId: data.data.groupon_id
					})
					wx.request({
						url: app.globalData.http + '/mpa/payment/payment',
						method: "post",
						dataType: 'json',
						data: {
							order_id: data.data.order_id
						},
						header: {
							"Api-Key": app.globalData.apiKey,
							"Api-Secret": app.globalData.apiSecret,
							'Api-Ext': app.globalData.apiExt
						},
						success: function (res) {
							let storageArr = wx.getStorageSync('good'), tempArr = JSON.parse(JSON.stringify(storageArr))
							if (storageArr.length > 0) {
								for (let i = storageArr.length - 1; i >= 0; i--) {
									for (let key in goodsObj) {
										if (storageArr[i].id == key) {
											tempArr.splice(i, 1)
										}
									}
								}
								wx.setStorage({
									key: 'good',
									data: tempArr
								})
							}
							var codes = res.statusCode.toString()
							if (codes >= 200 && codes < 300) {
								var time = res.data.timeStamp.toString()
								wx.requestPayment({
									'timeStamp': time,
									'nonceStr': res.data.result.nonce_str,
									'package': 'prepay_id=' + res.data.result.prepay_id,
									'signType': 'MD5',
									'paySign': res.data.paySign,
									'success': function (datas) {
										that.checkPay(data.data.order_id)
									},
									'fail': function (datas) {
										that.setData({
											disabled: false
										})
									}
								})
							}
							else {
								var tip = res.data.message.toString()
								wx.showToast({
									title: tip,
									icon: 'none',
									duration: 2000
								})
								that.setData({
									disabled: false
								})
							}
						},
						fail: function (res) {
							wx.showToast({
								title: '下单失败',
								icon: 'none',
								duration: 2000
							})
							that.setData({
								disabled: false
							})
						}
					})
				} else {
					var tip = data.data.message.toString()
					wx.showToast({
						title: tip,
						icon: 'none',
						duration: 2000
					})
					that.setData({
						disabled: false
					})
				}
			}
		})
	},

	/*获取运费*/
	getCarriage: function () {
		return new Promise((resolve,reject) => {
			var that=this;
			wx.request({
				url: app.globalData.http +'/mpa/order/express/fee',
				method:"post",
				dataType:'json',
				data:{
					address_id:this.data.address.id,
					goods: this.data.sku_ids
				},
				header: {
					"Api-Key": app.globalData.apiKey,
					"Api-Secret": app.globalData.apiSecret,
					'Api-Ext': app.globalData.apiExt
				},
				success:function(data){
					var code = data.statusCode.toString()
					if (code >= 200 && code < 300) {
						that.setData({
							carriage: data.data.express_fee,
							totalOrder: parseFloat(data.data.express_fee) + parseFloat(that.data.totalMoney)
						})
					} else {
						var tip = data.data.message.toString()
						wx.showToast({
							title: tip,
							icon: 'none',
							duration: 2000
						})
					}
					resolve()
				},
				fail: function(res) {
					reject(res)
				}
			})
		})
	}
})