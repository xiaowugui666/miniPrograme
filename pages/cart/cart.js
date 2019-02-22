// pages/shoppingCar/shoppingCar.js
var app = getApp()
var util = require('../../utils/util.js')
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isshow: 1,
		selectAll: false,
		image: 'https://image.51zan.com/',
		totalPrice: 0.00,
		page: 0,
		//远程购物车
		session: false,
		datalist: [],
		//本地购物车
		local: false,
		locallist: [],
		userId: false,
		touchStartX: 0,
		touchStartY: 0,
		btnwidth: 128
	},
	//点击结算
	balance() {
		var that = this
		//如果没有选择商品,总价格为0，提示
		if (that.data.totalPrice == '0.00') {
			wx.showToast({
				title: '请选择商品',
				icon: "none"
			})
		} else {
			//购物车商品信息
			let good = that.data.datalist;
			var local = that.data.locallist
			//已选择商品数组
			var seleArr = [];
			//本地购物车已选中的商品
			var localArr = [];
			for (var i = 0; i < good.length; i++) {
				if (good[i].isSelect) {
					seleArr.push(good[i])
				}
			}
			for (var i = 0; i < local.length; i++) {
				if (local[i].isSelect) {
					localArr.push(local[i])
				}
			}

			if (seleArr.length > 0) {
				app.globalData.good = seleArr;
			} else if (localArr.length > 0) {
				app.globalData.good = localArr;
			}
			// app.globalData.good = seleArr;
			// app.globalData.localArr = localArr;
			wx.navigateTo({
				url: '/pages/surePay/surePay?fromCart=1',
			})
		}
	},
	//跳转首页
	goIndex() {
		wx.switchTab({
			url: '/pages/index/index',
		})
	},
	handleDetail: function (e) {
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
		})
	},
	/*减少数量  远程购物车*/
	subtraction(e) {
		var _this = this;
		var index = e.target.dataset.index;
		var total = _this.data.totalPrice;
		var id = e.target.dataset.id;
		var num = 'datalist[' + index + '].count';
		//当删除数量不小于1时，调用PUT接口减少数量
		if (parseInt(_this.data.datalist[index].count) > 1) {
			var newNum = parseInt(_this.data.datalist[index].count) - 1;
			//PUT，用户修改购物车数量
			wx.request({
				url: app.globalData.http + '/mpa/cart/' + id,
				method: "PUT",
				data: {
					count: newNum
				},
				header: {
					"Api-Key": app.globalData.apiKey,
					"Api-Secret": app.globalData.apiSecret,
					'Api-Ext': app.globalData.apiExt
				},
				success(res) {

					if (res.statusCode == 200) {
						var num = 'datalist[' + index + '].count';
						_this.setData({
							[num]: newNum
						})
						//计算合计金额，单选情况
						if (_this.data.datalist[index].isSelect) {
							total -= _this.data.datalist[index].price
							_this.setData({
								totalPrice: total
							})
						}
					}
				}
			})
		}

	},
	/*减少数量 本地购物车*/
	subLocal(e) {
		var _this = this;
		var index = e.target.dataset.index;
		var total = _this.data.totalPrice;
		var id = e.target.dataset.id;
		var num = 'locallist[' + index + '].count';
		//当删除数量不小于1时，调用PUT接口减少数量
		if (parseInt(_this.data.locallist[index].count) > 1) {
			var newNum = parseInt(_this.data.locallist[index].count) - 1;
			if (_this.data.locallist[index].isSelect) {
				total -= _this.data.locallist[index].price
			}
			_this.setData({
				[num]: newNum,
				totalPrice: total
			},function(){
					wx.setStorage({
						key: 'good',
						data: _this.data.locallist,
					})
			})

		}
	},
	/*增加数量 远程购物车*/
	add(e) {
		var _this = this;
		var index = e.target.dataset.index;
		var total = _this.data.totalPrice;
		var id = e.target.dataset.id;
		var newNum = parseInt(_this.data.datalist[index].count) + 1;
		//PUT，用户修改购物车数量
		wx.request({
			url: app.globalData.http + '/mpa/cart/' + id,
			method: "PUT",
			data: {
				count: newNum
			},
			header: {
				"Api-Key": app.globalData.apiKey,
				"Api-Secret": app.globalData.apiSecret,
				'Api-Ext': app.globalData.apiExt
			},
			success(res) {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					var num = 'datalist[' + index + '].count';
					_this.setData({
						[num]: newNum
					})
					//计算合计金额
					if (_this.data.datalist[index].isSelect) {
						total += _this.data.datalist[index].price
						_this.setData({
							totalPrice: total
						})
					}
				} else {
					wx.showToast({
						title: res.data.message,
						icon: 'none',
						duration: 2000
					})
				}
			}
		})
	},
	addLocal(e) {
		var _this = this;
		var index = e.target.dataset.index;
		var total = _this.data.totalPrice;
		var id = e.target.dataset.id;
		var newNum = parseInt(_this.data.locallist[index].count) + 1;
		//PUT，用户修改购物车数量
		wx.request({
			url: app.globalData.http + '/mpa/goods_sku/' + id,
			method: "GET",
			header: {
				"Api-Key": app.globalData.apiKey,
				"Api-Secret": app.globalData.apiSecret,
				'Api-Ext': app.globalData.apiExt
			},
			success(res) {
				var count = res.data.stock_count
				if (newNum <= count) {
					var num = 'locallist[' + index + '].count';
					_this.setData({
						[num]: newNum
					}, function () {
						wx.setStorage({
							key: 'good',
							data: _this.data.locallist,
						})
					})
					//计算合计金额
					if (_this.data.locallist[index].isSelect) {
						total += _this.data.locallist[index].price
						_this.setData({
							totalPrice: total
						})
					}

				} else {
					wx.showToast({
						title: '商品库存不足',
						icon: 'none',
						duration: 2000
					})
				}
			}
		})
	},
	//远程购物车选中事件
	selSession(e) {
		var _this = this;
		var total = _this.data.totalPrice;
		var index = e.currentTarget.dataset.index
		var num = 'datalist[' + index + '].isSelect';
		//改变选中状态
		var newNum = !_this.data.datalist[index].isSelect;
		_this.setData({
			[num]: newNum
		})
		//计算合计金额
		if (_this.data.datalist[index].isSelect) {
			total += (_this.data.datalist[index].price) * (_this.data.datalist[index].count)
		} else {
			total -= (_this.data.datalist[index].price) * (_this.data.datalist[index].count)
		}
		//遍历每一项，确定是否全选
		var selectAll = this.data.selectAll;
		//远程购物车
		var seleArr1 = this.data.datalist.every(function (item, index, arr) {
			return item.isSelect;
		})
		//本地购物车
		var seleArr2 = this.data.locallist.every(function (item, index, arr) {
			return item.isSelect;
		})

		if (seleArr1 && seleArr2) {
			selectAll = true
		} else {
			selectAll = false
		}
		_this.setData({
			selectAll: selectAll,
			totalPrice: total
		})
	},
	//本地购物车选中事件
	selLocal(e) {
		var _this = this;
		var total = _this.data.totalPrice;
		var index = e.currentTarget.dataset.index
		var num = 'locallist[' + index + '].isSelect';
		//改变选中状态
		var newNum = !_this.data.locallist[index].isSelect;
		_this.setData({
			[num]: newNum
		})
		//计算合计金额
		if (_this.data.locallist[index].isSelect) {
			total += (_this.data.locallist[index].price) * (_this.data.locallist[index].count)
		} else {
			total -= (_this.data.locallist[index].price) * (_this.data.locallist[index].count)
		}
		//遍历每一项，确定是否全选
		var selectAll = this.data.selectAll;
		//远程购物车
		var seleArr1 = this.data.datalist.every(function (item, index, arr) {
			return item.isSelect;
		})
		//本地购物车
		var seleArr2 = this.data.locallist.every(function (item, index, arr) {
			return item.isSelect;
		})

		if (seleArr1 && seleArr2) {
			selectAll = true
		} else {
			selectAll = false
		}
		_this.setData({
			selectAll: selectAll,
			totalPrice: total
		})
	},
	//点击全选
	selectAll(e) {
		var selectAll = this.data.selectAll;
		var total = 0,
			tempArr2 = this.data.locallist,
			tempArr1 = this.data.datalist;
		if (!selectAll) {
			//将每一项的isSelect置为true
			tempArr1.forEach(function (item) {
				item.isSelect = true;
				total += item.price * item.count
			})
			tempArr2.forEach(function (item) {
				item.isSelect = true;
				total += item.price * item.count
			})
			selectAll = true;
		} else {
			//将每一项的isSelect置为false
			tempArr1.forEach(function (item) {
				item.isSelect = false;
			})
			tempArr2.forEach(function (item) {
				item.isSelect = false;
			})
			selectAll = false;
			total = 0.00;
		}
		this.setData({
			selectAll: selectAll,
			datalist: tempArr1,
			locallist: tempArr2,
			totalPrice: total
		})
	},
	touchStart: function (e){
		var index = e.currentTarget.dataset.index;
		var touchStartX = e.touches[0].pageX;
		var touchStartY = e.touches[0].pageY;
		this.setData({
		  index: index,
		  touchStartX: touchStartX,
		  touchStartY: touchStartY
		})
	},
	touchMove: function (e) {
		var index = this.data.index;
		var btnwidth = this.data.btnwidth;
		var touchEndX = e.changedTouches[0].pageX;
		var touchEndY = e.changedTouches[0].pageY;
		var tmX = touchEndX - this.data.touchStartX;
		var tmY = touchEndY - this.data.touchStartY;
		var isLocalShoppingCar = this.data.datalist.length == 0 ? true : false;
		var datalist = isLocalShoppingCar ? this.data.locallist : this.data.datalist;
		var item = datalist[index];
		if (Math.abs(tmX) > Math.abs(tmY)) {
			if (tmX < 0) {
				var len = Math.abs(tmX) > btnwidth ? btnwidth : Math.abs(tmX); 
				datalist.forEach(function (v, k) {
					if (index == k) {
						v.transrpx = -len;
						v.isdelete = true;
					} else {
						v.transrpx = 0;
						v.isdelete = false;
					}
				})
			} else {
					item.transrpx = 0;
					item.isdelete = false;
			}
			if (isLocalShoppingCar) {
				this.setData({
					locallist: datalist
				})
			} else {
				this.setData({
					datalist: datalist
				})
			}
		}
	  },
	touchEnd: function (e) {
		var index = this.data.index;
		var btnwidth = this.data.btnwidth;
		var touchEndX = e.changedTouches[0].pageX;
		var touchEndY = e.changedTouches[0].pageY;
		var tmX = touchEndX - this.data.touchStartX;
		var tmY = touchEndY - this.data.touchStartY;
		var isLocalShoppingCar = this.data.datalist.length == 0 ? true : false;
		var datalist = isLocalShoppingCar ? this.data.locallist : this.data.datalist;
		var item = datalist[index];
		if (Math.abs(tmX) > Math.abs(tmY)) {
			if (tmX < 0) {
				if (Math.abs(tmX) >= (btnwidth / 2)){
					datalist.forEach(function (v, k) {
						if (index == k) {
							v.transrpx = -btnwidth;
							v.isdelete = true;
						} else {
							v.transrpx = 0;
							v.isdelete = false;
						}
					})
				} else {
					datalist.forEach(function (v, k) {
						v.transrpx = 0;
						v.isdelete = false;
					})
				}
			} else {
				item.transrpx = 0;
				item.isdelete = false;
			}
			if (isLocalShoppingCar) {
				this.setData({
					locallist: datalist
				})
			} else {
				this.setData({
					datalist: datalist
				})
			}
		}
	},
	del: function (e) {
		var id = e.currentTarget.dataset.id,
			index = e.currentTarget.dataset.index,
			type = e.currentTarget.dataset.type,
			nowArr1 = this.data.datalist,
			nowArr2 = this.data.locallist,
			that = this;
		wx.showModal({
			// title: '删除',
			content: '是否确认删除此商品？',
			success(res) {
				if (res.confirm) {
					//删除远程购物车
					if (type == 'origin') {
						wx.request({
							url: app.globalData.http + '/mpa/cart/' + id,
							method: "DELETE",
							header: {
								"Api-Key": app.globalData.apiKey,
								"Api-Secret": app.globalData.apiSecret,
								'Api-Ext': app.globalData.apiExt
							},
							success(res) {
								if (res.statusCode >= 200 && res.statusCode < 300) {
									let totalPrice = 0
									nowArr1.splice(index, 1)
									nowArr2.splice(index, 1)
									nowArr1.forEach(item => {
										if (item.isSelect) {
											totalPrice += item.price * item.count
										}
									})
									nowArr2.forEach(item => {
										if (item.isSelect) {
											totalPrice += item.price * item.count
										}
									})
									that.setData({
										datalist: nowArr1,
										totalPrice: totalPrice,
									})
									wx.setStorage({
										key: 'good',
										data: nowArr2,
									})
									if (nowArr1.length == 0) {
										that.setData({
											session: false,
										})
									}
									if (nowArr2.length == 0) {
										that.setData({
											local: false,
										})
									}
								}
							}
						})
					} else {
						let totalPrice = 0
						nowArr2.splice(index, 1)
						nowArr2.forEach(item => {
							if (item.isSelect) {
								totalPrice += item.price * item.count
							}
						})
						wx.setStorage({
							key: 'good',
							data: nowArr2,
						})
						that.setData({
							totalPrice: totalPrice,
							locallist: nowArr2
						})
						if (nowArr2.length == 0) {
							that.setData({
								local: false
							})
						}
					}
				}
			}
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	getData: function () {
		var that = this
		var pages = this.data.page;
		pages = pages + 1
		wx.showLoading({
			title: '加载中',
		})
		//获取用户购物车列表
		wx.request({
			url: app.globalData.http + '/mpa/cart',
			data: {
				page: pages
			},
			header: {
				"Api-Key": app.globalData.apiKey,
				"Api-Secret": app.globalData.apiSecret,
				'Api-Ext': app.globalData.apiExt
			},
			success(res) {
				if (res.data.length > 0) {
					var list = []
					for (var z = 0; z < res.data.length; z++) {
						res.data[z].isSelect = false;
						res.data[z].isTouchMove = false
						list.push(res.data[z])
					}
					var datalists = that.data.datalist.concat(list)
					that.setData({
						datalist: datalists,
						page: pages
					})
				} else {
					pages = pages - 1
					that.setData({
						page: pages
					})
				}
				wx.hideLoading();
			},
			fail: function () {
				wx.hideLoading();
			}
		})
	},
	getPhoneNumber: function (e) {
		app.publicAuth(e, this)		
	},
	onShow: function (options) {
		let that = this;
		var goodlist = wx.getStorageSync('good')
		if (goodlist && goodlist.length > 0) {
			goodlist.forEach(item => {
				item.isSelect = false
			})
		}
		this.setData({
			selectAll: false
		})
		if (app.globalData.userId) {
			wx.showLoading({
				title: '加载中',
			})
			this.setData({
				page: 0,
				userId: true,
				locallist: [],
				selectAll: false,
				totalPrice: 0.00
			})
			//获取用户购物车列表
			wx.request({
				url: app.globalData.http + '/mpa/cart',
				data: {
					page: 0
				},
				header: {
					"Api-Key": app.globalData.apiKey,
					"Api-Secret": app.globalData.apiSecret,
					'Api-Ext': app.globalData.apiExt
				},
				success(res) {
					var code = res.statusCode.toString()
					if (code.indexOf('20') > -1) {
						if (res.data.length != 0) {
							var list = []
							for (var z = 0; z < res.data.length; z++) {
								res.data[z].isSelect = false;
								list.push(res.data[z])
							}
							that.setData({
								datalist: list,
								session: true
							})
						} else {
							that.setData({
								session: false
							})
						}
					} else {
						var tip = res.data.message.toString()
						wx.showToast({
							title: tip,
							icon: 'none',
							duration: 2000
						})
					}
				},
				complete: function () {
					wx.hideLoading();
				}
			})
			if (goodlist.length > 0) {
				var cart = []
				goodlist.forEach(function (v, i) {
					var ob = new Object()
					ob.goods_sku_id = v.id
					ob.count = v.count
					cart.push(ob)
				})
				wx.request({
					url: app.globalData.http + '/mpa/cart/batch',
					method: "POST",
					dataType: 'json',
					header: {
						"Api-Key": app.globalData.apiKey,
						"Api-Secret": app.globalData.apiSecret,
						'Api-Ext': app.globalData.apiExt
					},
					data: {
						goods_skus: cart
					},
					success: function (res) {
						if (res.statusCode >= 200 && res.statusCode < 300) {
							that.setData({
								datalist: that.data.datalist.concat(goodlist),
								local: true
							})
							wx.setStorage({
								key: 'good',
								data: [],
							})
						}
					}
				})
			}
		} else {
			if (goodlist.length > 0) {
				that.setData({
					locallist: goodlist,
					local: true,
					userId: app.globalData.userId
				})
			} else {
				that.setData({
					locallist: [],
					local: false,
					userId: app.globalData.userId
				})
			}
		}
	},
	/*
 * 页面上拉触底事件的处理函数
 */
	onReachBottom: function () {
		if (app.globalData.user_info.user_id && this.data.datalist.length) {
			this.getData()
		}
	}
})