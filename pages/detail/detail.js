	// pages/detail/detail.js
	import {
		countDown
	} from "../../utils/util"
	const app = getApp();
	// var WxParse = require('../../wxParse/wxParse.js');
	Page({
		/**
		 * 页面的初始数据
		 */
		data: {
			//商品详情数据
			goods: {},
			groupInfo: {}, // 拼团商品详情
			groupMembers: [], // 拼团列表信息
			timeStampArr: [],
			image: 'http://image.yiqixuan.com/',
			//使用data数据控制类名
			chooseModal: false,
			//动态控制“-”号类名
			minusStatus: "disabled",
			minusStatuss: "normal",
			//上下架
			status: "",
			//规格选择初始数量
			num: 1,
			name: '',
			//加入购物车/立即购买flag
			flag: 1,
			//定义动画
			animationData: {},
			//商品规格数据
			spec: {}, // 商品不拼团规格
			groupSpec: {}, // 参与拼团规格
			specType: '',
			groupSpecType: '',
			chooseSpec: [],
			groupChooseSpec: [],
			// 规格详情
			skus: [],
			groupSkus: [],
			//是否已选颜色规格
			seleIdxA: -1,
			seleIdxB: -1,
			//具体规格商品
			good: {},
			goodPrice: 0,
			goodUrl: "",
			imgs: {},
			content: '',
			//是否又规格
			isSpec: '',
			current: 0,
			cartNum: 0,
			show: 2,
			//有规格的时候点击确定
			userId: false,
			hasUserInfo: false,
			clickGroupId: '',
			formId: '',
			group_id: '',
		},
		// 滑动商品图片
		changeCurrent: function(e) {
			if (e.detail.source === 'touch' || e.detail.source === 'autoplay') {
				var cur = e.detail.current
				this.setData({
					current: cur
				})
			}
		},
		// 阻止选择规格事件冒泡
		preventDefault () {},
		// 规格是否可选函数
		specOptional (skus) {
			let spec = this.data.spec;
			for (let i = 0, length = spec.length; i < length; i++) {
				// 将所有optional置为false
				for (let k = 0, le = spec[i].propertis.length; k < le; k++) {
					spec[i].propertis[k].optional = false
				}
				// 相应skus中
				for (let j = 0, len = skus.length; j < len; j++) {
					if (spec[i].name == skus[j].spec_a) {
						for (let k = 0, le = spec[i].propertis.length; k < le; k++) {
							if (spec[i].propertis[k].ite == skus[j].property_a) {
								spec[i].propertis[k].optional = true
							}
						}
					} else if (spec[i].name == skus[j].spec_b) {
						for (let k = 0, le = spec[i].propertis.length; k < le; k++) {
							if (spec[i].propertis[k].ite == skus[j].property_b) {
								spec[i].propertis[k].optional = true
							}
						}
					} else if (spec[i].name == skus[j].spec_c) {
						for (let k = 0, le = spec[i].propertis.length; k < le; k++) {      
							if (spec[i].propertis[k].ite == skus[j].property_c) {
								spec[i].propertis[k].optional = true
							}
						}
					}
				}
			}
			this.setData({
				spec: spec
			})
		},
		/* 规格选择弹出事件 */
		submit(e) {
			var that = this;
			let flag = e.currentTarget.dataset.flag || e.detail.target.dataset.flag;
			if (flag == 4) {
				that.setData({
					group_id: e.detail.target.dataset.id
				})
			}
			// 有规格
			if (that.data.isSpec) {
				let skus = that.data.skus, groupSkus = that.data.groupSkus;
				if (flag != 3 && flag != 4) { // 显示普通商品规格类型
					that.specOptional(skus)
					that.setData({
						goodPrice: that.data.goods.price_low,
						chooseSpec: []
					})
				} else { // 显示拼团商品规格类型
					that.specOptional(groupSkus)
					that.setData({
						formId: e.detail.formId,
						goodPrice: that.data.groupInfo.price_low,
						chooseSpec: []
					})
				}

				//创建一个动画实例
				var animation = wx.createAnimation({
					//动画持续事件
					duration: 500,
					//定义动画效果
					timingFunction: 'linear'
				})
				//将该变量赋值给当前动画
				that.animation = animation;
				//现在Y轴偏移，然后用step()完成一个动画
				animation.translateY(400).step();
				that.setData({
					animationData: animation.export(),
					flag: flag,
					chooseModal: true
				})
				//设置setTimeout改变Y轴偏移量
				setTimeout(function() {
					animation.translateY(0).step();
					that.setData({
						animationData: animation.export()
					})
				}, 100)
			} else {
				// 如果没有规格
				wx.request({
					url: app.globalData.http + '/mpa/goods/' + that.data.goods.id + '/skus',
					method: "GET",
					header: {
						'Api-Ext': app.globalData.apiExt
					},
					success(res) {
						var good = res.data[0]
						that.setData({
							good: good,
							goodUrl: good.cover_url,
							goodPrice: good.price
						}, function() {
							//加入购物车
							if (flag == 1) {
								//绑定手机号
								if (app.globalData.userId) {
									wx.request({
										url: app.globalData.http + '/mpa/cart',
										method: "POST",
										data: {
											goods_sku_id: that.data.good.id,
											count: 1
										},
										header: {
											'Api-Ext': app.globalData.apiExt,
											"Api-Key": app.globalData.apiKey,
											"Api-Secret": app.globalData.apiSecret
										},
										success(res) {
											var code = res.statusCode.toString()
											if (code == 500) {
												wx.showToast({
													title: '网络错误',
													icon: 'none',
													duration: 1000
												})
											} else if (code.indexOf('40') > -1) {
												var tip = res.data.message.toString()
												wx.showToast({
													title: tip,
													icon: 'none',
													duration: 1000
												})
											} else if (code.indexOf('20') > -1) {
												wx.showToast({
													title: '加入购物车成功',
													icon: "success"
												})
												wx.request({
													url: app.globalData.http + '/mpa/cart/count',
													header: {
														'Api-Ext': app.globalData.apiExt,
														"Api-Key": app.globalData.apiKey,
														"Api-Secret": app.globalData.apiSecret,
													},
													method: 'get',
													success(res) {
														that.setData({
															cartNum: res.data
														})
													}
												})
											}
										}
									})
								} else {
									var local = wx.getStorageSync('good')
									var good = that.data.good
									var cartNum = that.data.cartNum
									good.count = 1;
									good.goods_sku_id = that.data.good.id;
									good.name = that.data.name;
									good.sku_description = '';
									//本地购物车不为空
									if (local.length > 0) {
										var ishava = local.every(function(v, i) {
											return v.id != that.data.good.id
										})
										if (ishava) {
											local.push(good)
											cartNum++
										} else {
											for (var i = 0; i < local.length; i++) {
												if (local[i].id == good.goods_sku_id) {
													if (parseInt(local[i].count) >= good.stock_count) {
														wx.showToast({
															title: '库存不足',
															title: 'none'
														})
														return false
													} else {
														local[i].count = parseInt(local[i].count) + 1
													}
												}
											}
										}
										wx.setStorage({
											key: 'good',
											data: local,
										})
										that.setData({
											cartNum: cartNum
										})
									} else {
										var goods = []
										goods.push(good)
										wx.setStorage({
											key: 'good',
											data: goods,
										})
										that.setData({
											cartNum: 1
										})
									}
									wx.showToast({
										title: '加入购物车成功',
										icon: "success"
									})
								}
							} else if (flag == 2) { // 点击立即购买、单独购买
								var good = that.data.good
								good.count = 1;
								good.goods_sku_id = that.data.good.id;
								good.name = that.data.name;
								good.sku_description = 0;
								if (flag == false) {
									gloGood.push(good)
								}
								app.globalData.good = []
								app.globalData.good.push(good)
								wx.navigateTo({
									url: '/pages/surePay/surePay',
								})
							} else if(flag == 3) { // 点击一键开团
								// 赋值app.globalData
								let good = that.data.good;
								good.name = that.data.name;
								good.groupInfo_id = that.data.groupInfo.id;
								good.goods_id = that.data.goods.id;
								good.goods_sku_id = that.data.good.id;
								good.count = 1;
								good.priceLow = that.data.groupInfo.price_low;
								good.price = that.data.groupInfo.origin_price_low;
								good.buy_limit_count = that.data.groupInfo.buy_limit_count;
								good.groupFormId = e.detail.formId;

								app.globalData.good = [];
								app.globalData.good.push(good);
								wx.navigateTo({
									url: '/pages/groupPurchase/groupSurePay/groupSurePay?isjoin=0',
								})
							} else {
								// 点击立即参团
								// 点击列表立即参团
								let good = that.data.good;
								good.count = 1;
								good.goods_sku_id = that.data.good.id;
								good.name = that.data.name;
								good.groupInfo_id = that.data.groupInfo.id;
								good.goods_id = that.data.goods.id;
								good.groupFormId = e.detail.formId;
								good.group_id = that.data.group_id;
								good.priceLow = that.data.groupInfo.price_low;
								good.buy_limit_count = that.data.groupInfo.buy_limit_count;
								good.price = that.data.groupInfo.origin_price_low;

								if (that.data.chooseSpec.length == 1) {
									good.sku_description = good.spec_a + ':' + good.property_a
								} else if (that.data.chooseSpec.length == 2) {
									good.sku_description = good.spec_b + ':' + good.property_b + ',' + good.spec_a + ':' + good.property_a
								} else if (that.data.chooseSpec.length == 3) {
									good.sku_description = good.spec_b + ':' + good.property_b + ',' + good.spec_a + ':' + good.property_a + ',' + good.spec_c + ':' + good.property_c
								}
								app.globalData.good = []
								app.globalData.good.push(good)
								wx.navigateTo({
									url: '/pages/groupPurchase/groupSurePay/groupSurePay?isjoin=1',
								})
							}
						})
					}
				})
			}
		},

		//选择规格事件
		chooseSpecs(e) {
			let that = this;
			//已选择规格索引
			let aIndex = e.target.dataset.id,
				bIndex = e.target.dataset.index,
				disabled = e.target.dataset.disabled,
				chooseSpec = that.data.chooseSpec;
			if (!disabled) {
				return
			}
			let aArr = [], bArr = [], textSpec = 'chooseSpec[' + aIndex + ']';
			if (chooseSpec[aIndex] != undefined && chooseSpec[aIndex] != -1 && chooseSpec[aIndex] == bIndex) { // 已选规格再次选择，置灰
				that.setData({
					[textSpec]: -1
				})
				let lastChoose = chooseSpec.every(function(v){
					return v == -1
				})
				if (lastChoose) {
					let skus = that.data.flag == 3 || that.data.flag == 4 ? that.data.groupSkus : that.data.skus;
					that.specOptional(skus)
				}
			} else {
				that.setData({ // 未选择则为选中状态
					[textSpec]: bIndex
				})
				// 选中当前规格时，判断其他种类规格是否可选
				let spec = that.data.spec,flag = that.data.flag;
				let skus = flag == 3 || flag == 4 ? that.data.groupSkus : that.data.skus;
				let specArr = ['spec_a', 'spec_b', 'spec_c'], propertyArr = ['property_a', 'property_b','property_c'];
				// 将除当前选中种类规格外其他种类规格置灰
				for (let i = 0,leng = spec.length; i < leng; i++) {
					if (i != aIndex) {
						for (let j = 0,len = spec[i].propertis.length; j < len; j++) {
							spec[i].propertis[j].optional = false
						}
					}
				}
				that.setData({
					spec: spec
				})
				// 判断其他种类规格可选状态
				for (let i = 0, leng = spec.length; i < leng; i++) {
					if (i != aIndex) {
						for (let j = 0, len = skus.length; j < len; j++) {
							if (spec[aIndex].propertis[bIndex].ite == skus[j][propertyArr[aIndex]]) {
								for (let k = 0, le = spec[i].propertis.length; k < le; k++) {
									if (spec[i].propertis[k].ite == skus[j][propertyArr[i]]) {
										spec[i].propertis[k].optional = true
									}
								}
							}
						}
					}
				}
				that.setData({
					spec: spec
				})
				// 如果所有规格均已选择
				let chooseAll = false;
				if (chooseSpec.length == spec.length) {
					chooseAll = true;
					for (let i = 0, len = chooseSpec.length; i < len; i++) {
						if (chooseSpec[i] < 0 || chooseSpec[i] == undefined) {
							chooseAll = false
						}
					}
				}
				if (chooseAll) {
					// 重置数量选择框状态
					that.setData({
						num: 1,
						minusStatus: 'disabled',
						minusStatuss: 'normal'
					})
					// 找出选定sku
					let sku = {};
					for (let j = 0, len = skus.length; j < len; j++) {
						if (chooseSpec.length == 1) {
							if (spec[0].name == skus[j][specArr[0]] && spec[0].propertis[chooseSpec[0]].ite == skus[j][propertyArr[0]]) {
								sku = skus[j]
							}
						} else if (chooseSpec.length == 2) {
							if (
								spec[0].name == skus[j][specArr[0]] && spec[0].propertis[chooseSpec[0]].ite == skus[j][propertyArr[0]]
								&&
								spec[1].name == skus[j][specArr[1]] && spec[1].propertis[chooseSpec[1]].ite == skus[j][propertyArr[1]]
								) {
								sku = skus[j]
							}
						} else if (chooseSpec.length == 3) {
							if (
								spec[0].name == skus[j][specArr[0]] && spec[0].propertis[chooseSpec[0]].ite == skus[j][propertyArr[0]]
								&&
								spec[1].name == skus[j][specArr[1]] && spec[1].propertis[chooseSpec[1]].ite == skus[j][propertyArr[1]]
								&&
								spec[2].name == skus[j][specArr[2]] && spec[2].propertis[chooseSpec[2]].ite == skus[j][propertyArr[2]]
							) {
								sku = skus[j]
							}
						}
					}
					wx.request({
						url: app.globalData.http + '/mpa/goods_sku/' + sku.id,
						header: {
							'Api-Ext': app.globalData.apiExt
						},
						success (res) {
							sku.stock_count = res.data.stock_count;
							if (res.data.stock_count > 0) {
								that.setData({
									good: sku,
									goodUrl: sku.cover_url,
									goodPrice: sku.price
								})
							} else {
								that.setData({
									good: sku,
									goodUrl: sku.cover_url,
									goodPrice: sku.price
								})
								wx.showToast({
									title: '该规格库存不足',
									icon: 'none',
									duration: 2000
								})
							}
						}
					})
				}
			}
		},
		//点击确认，关闭弹出框
		closeModal(e) {
			let that = this;
			let spec = that.data.spec, chooseSpec = that.data.chooseSpec;
			let chooseAll = true;
			// 判断规格是否选择完整
			for (let i = 0, len = chooseSpec.length; i < len; i++) {
				if (chooseSpec[i] < 0 || chooseSpec[i] == undefined) {
					chooseAll = false
				}
			}
			if (!chooseAll || chooseSpec.length !== spec.length) {
				wx.showToast({
					title: '请选择规格',
					icon: "none"
				})
				return false
			}
			//动画效果
			var animation = wx.createAnimation({
				duration: 500,
				timingFunction: 'linear'
			})
			that.animation = animation
			animation.translateY(450).step()
			that.setData({
				animationData: animation.export()
			})
			setTimeout(function() {
				animation.translateY(0).step()
				that.setData({
					animationData: animation.export(),
					chooseModal: false
				})
			}, 500)

			//跳转页面,携带参数
			if (JSON.stringify(that.data.good) != '{}' && that.data.good.stock_count > 0) {
				//如果来源为加入购物车，即flag为1
				let flag = that.data.flag;
				if (flag == 1) {
					//已绑定手机号,加入远程购物车
					if (that.data.userId) {
						wx.request({
							url: app.globalData.http + '/mpa/cart',
							method: "POST",
							header: {
								'Api-Ext': app.globalData.apiExt,
								"Api-Key": app.globalData.apiKey,
								"Api-Secret": app.globalData.apiSecret,
							},
							data: {
								goods_sku_id: that.data.good.id,
								count: that.data.num
							},
							success(res) {
								var code = res.statusCode.toString()
								if (code >= 200 && code < 300) {
									wx.showToast({
										title: '加入购物车成功',
										icon: "success"
									})
									that.setData({
										num: 1,
										minusStatus: 'disabled',
										minusStatuss: 'normal',
										good: {}
									})
									wx.request({
										url: app.globalData.http + '/mpa/cart/count', 
										header: {
											'Api-Ext': app.globalData.apiExt,
											"Api-Key": app.globalData.apiKey,
											"Api-Secret": app.globalData.apiSecret,
										},
										method: 'get',
										success(res) {
											that.setData({
												cartNum: res.data
											})
										}
									})
								} else {
									var tip = res.data.message.toString()
									wx.showToast({
										title: tip,
										icon: 'none',
										duration: 1000
									})
								}
							}
						})
					} else { // 未绑定手机号，加入本地购物车
						var goods = that.data.good
						var local = wx.getStorageSync('good')
						var cartNum = that.data.cartNum
						goods.count = that.data.num
						goods.goods_sku_id = goods.goods_sku_id
						goods.name = that.data.goods.name
						goods.isSelect = false
						if (that.data.chooseSpec.length == 1) {
							goods.sku_description = goods.spec_a + ':' + goods.property_a
						} else if (that.data.chooseSpec.length == 2) {
							goods.sku_description = goods.spec_b + ':' + goods.property_b + ',' + goods.spec_a + ':' + goods.property_a
						} else if (that.data.chooseSpec.length == 3) {
							goods.sku_description = goods.spec_b + ':' + goods.property_b + ',' + goods.spec_a + ':' + goods.property_a + ',' + goods.spec_c + ':' + goods.property_c
						}

						if (local.length > 0) {
							var ishava = local.every(function(v, i) {
								return v.id != that.data.good.id
							})
							if (ishava) {
								local.push(goods)
								cartNum++
							} else {
								for (var i = 0; i < local.length; i++) {
									if (local[i].id == goods.goods_sku_id) {
										if ((parseInt(local[i].count) + goods.count) > goods.stock_count) {
											wx.showToast({
												title: '库存不足',
												icon: 'none'
											})
											return false
										}
										local[i].count = parseInt(local[i].count) + goods.count
									}
								}
							}
							wx.setStorage({
								key: 'good',
								data: local,
							})
							that.setData({
								cartNum: cartNum,
								num: 1,
								minusStatus: 'disabled',
								minusStatuss: 'normal'
							})
						} else {
							var goodlist = []
							goodlist.push(goods)
							wx.setStorage({
								key: 'good',
								data: goodlist,
							})
							that.setData({
								cartNum: 1,
								num: 1,
								minusStatus: 'disabled',
								minusStatuss: 'normal',
								good: {}
							})
						}
						wx.showToast({
							title: '加入购物车成功',
							icon: "success"
						})
					}
				} else if (flag == 2) { //来源为立即购买，即flag为2
					//将商品信息、数量保存到app
					let good = that.data.good;
					good.count = that.data.num;
					good.goods_sku_id = that.data.good.id;
					good.name = that.data.name;
					if (that.data.chooseSpec.length == 1) {
						good.sku_description = good.spec_a + ':' + good.property_a
					} else if (that.data.chooseSpec.length == 2) {
						good.sku_description = good.spec_b + ':' + good.property_b + ',' + good.spec_a + ':' + good.property_a
					} else if (that.data.chooseSpec.length == 3) {
						good.sku_description = good.spec_b + ':' + good.property_b + ',' + good.spec_a + ':' + good.property_a + ',' + good.spec_c + ':' + good.property_c
					}
					app.globalData.good = []
					app.globalData.good.push(good)
					that.setData({
						num: 1,
						minusStatus: 'disabled',
						minusStatuss: 'normal'
					})
					wx.navigateTo({
						url: '/pages/surePay/surePay',
					})
				} else if(flag == 3) { // 一键开团
					let good = that.data.good;
					good.count = that.data.num;
					good.goods_sku_id = that.data.good.id;
					good.name = that.data.name;
					good.groupInfo_id = that.data.groupInfo.id;
					good.goods_id = that.data.goods.id;
					good.groupFormId = that.data.formId;
					good.priceLow = good.price;
					good.buy_limit_count = that.data.groupInfo.buy_limit_count;          
					good.price = good.origin_price;

					if (that.data.chooseSpec.length == 1) {
						good.sku_description = good.spec_a + ':' + good.property_a
					} else if (that.data.chooseSpec.length == 2) {
						good.sku_description = good.spec_b + ':' + good.property_b + ',' + good.spec_a + ':' + good.property_a
					} else if (that.data.chooseSpec.length == 3) {
						good.sku_description = good.spec_b + ':' + good.property_b + ',' + good.spec_a + ':' + good.property_a + ',' + good.spec_c + ':' + good.property_c
					}
					app.globalData.good = []
					app.globalData.good.push(good)
					that.setData({
						num: 1,
						minusStatus: 'disabled',
						minusStatuss: 'normal'
					})
					wx.navigateTo({
						url: '/pages/groupPurchase/groupSurePay/groupSurePay?isjoin=0',
					})
				} else if (flag == 4) {
					// 点击列表立即参团
					let good = that.data.good;
					good.count = that.data.num;
					good.goods_sku_id = that.data.good.id;
					good.name = that.data.name;
					good.groupInfo_id = that.data.groupInfo.id;
					good.goods_id = that.data.goods.id;
					good.groupFormId = that.data.formId;
					good.group_id = that.data.group_id;
					good.priceLow = good.price;
					good.buy_limit_count = that.data.groupInfo.buy_limit_count;
					good.price = good.origin_price;

					if (that.data.chooseSpec.length == 1) {
						good.sku_description = good.spec_a + ':' + good.property_a
					} else if (that.data.chooseSpec.length == 2) {
						good.sku_description = good.spec_b + ':' + good.property_b + ',' + good.spec_a + ':' + good.property_a
					} else if (that.data.chooseSpec.length == 3) {
						good.sku_description = good.spec_b + ':' + good.property_b + ',' + good.spec_a + ':' + good.property_a + ',' + good.spec_c + ':' + good.property_c
					}
					app.globalData.good = []
					app.globalData.good.push(good)
					that.setData({
						num: 1,
						minusStatus: 'disabled',
						minusStatuss: 'normal'
					})
					wx.navigateTo({
						url: '/pages/groupPurchase/groupSurePay/groupSurePay?isjoin=1',
					})
				}
			}
		},

		// 点X，蒙层，关闭规格框
		closeTips: function () {
			var that = this
			//动画效果
			var animation = wx.createAnimation({
				duration: 500,
				timingFunction: 'linear'
			})
			that.animation = animation
			animation.translateY(450).step()
			that.setData({
				animationData: animation.export(),
				num: 1,
				minusStatus: 'disabled',
				minusStatuss: 'normal',
				good: {}
			})
			setTimeout(function () {
				animation.translateY(0).step()
				that.setData({
					animationData: animation.export(),
					chooseModal: false
				})
			}, 500)
		},

		/* 点击减号 */
		bindMinus() {
			var num = this.data.num;
			//num大于1时才做自减
			if (num > 1) {
				num--
			}
			//大于1件时为normal状态，否则为disabled状态
			var minusStatus = num <= 1 ? "disabled" : "normal";
			this.setData({
				num: num,
				minusStatus: minusStatus,
				minusStatuss: 'normal'
			})
		},

		// 增加数量，当为拼团选择数量时作限制
		bindPlus() {
			let that = this;
			let num = that.data.num;
			let flag = (that.data.flag == 3 || that.data.flag == 4) ? true : false;
			if (num >= that.data.good.stock_count) {
				var minusStatus = 'disabled'
				wx.showToast({
					title: '库存不足',
					icon: 'none'
				})
			} else if (num >= that.data.groupInfo.buy_limit_count && that.data.goods.activity_type == 1 && flag && that.data.groupInfo.buy_limit_count) {
				var minusStatus = 'disabled';
				wx.showToast({
					title: '每名用户最多拼' + that.data.groupInfo.buy_limit_count + '份商品',
					icon: 'none',
					duration: 2000
				})
			} else {
				num++
				var minusStatus = 'normal'
			}
			that.setData({
				num: num,
				minusStatus: 'normal',
				minusStatuss: minusStatus
			})
		},

		//定义分享转发
		onShareAppMessage: function(res) {
			if (res.from === "button") {}
			return {
				title: this.data.goods.description ? this.data.goods.description : this.data.goods.name,
				path: "/pages/detail/detail?id=" + this.data.goods.id,
				imageUrl: this.data.image + this.data.imgs[0].icon_url,
				success(res) {}
			}
		},

		//点击购物车
		goCart() {
			wx.navigateTo({
				url: '/pages/cart/cart',
			})
		},
		goIndex () {
			wx.switchTab({
				url: '/pages/index/index',
			})
		},
		/**
		 * 生命周期函数--监听页面加载
		 */
		onShow: function() {
			var that = this
			//获取购物车数量
			var goodlist = wx.getStorageSync('good')
			if (app.globalData.userId) {
				wx.request({
					url: app.globalData.http + '/mpa/cart/count', 
					header: {
						'Api-Ext': app.globalData.apiExt,
						"Api-Key": app.globalData.apiKey,
						"Api-Secret": app.globalData.apiSecret,
					},
					method: 'get',
					success(res) {
						that.setData({
							cartNum: res.data
						})
					}
				})
			} else {
				that.setData({
					cartNum: goodlist.length
				})
			}
		},

		onLoad: function(options) {
			let that = this;
			wx.showLoading({
				title: '加载中',
			})

			if (options.scene) {
				var scene = decodeURIComponent(options.scene)
				options.id = scene.split(',')[1]
				app.globalData.sceneID = scene.split(',')[0]
			} else if (options.scene_id) {
				app.globalData.sceneID = options.scene_id
			}
			app.login().then(() => {
				this.setData({
					userId: app.globalData.userId
				})
				//获取商品规格
				wx.request({
					url: app.globalData.http + '/mpa/goods/' + options.id + '/specs',
					header: {
						'Api-Ext': app.globalData.apiExt
					},
					success(data) {
						if (Object.prototype.toString.call(data.data) == '[object Array]') {
							that.setData({
								isSpec: false
							})
						} else {
							var specs = []
							var specType = []
							for (var key in data.data) {
								specs.push(data.data[key])
								let specArr = [];
								for (let i = 0, len = data.data[key].propertis.length; i < len; i++ ) {
									let specObj = {
										ite: '',
										optional: false
									};
									specObj.ite = data.data[key].propertis[i]
									specArr.push(specObj)
								}
								data.data[key].propertis = specArr
								specType.push(key)
							}
							var chooseSpec = []
							for (var i = 0; i < specType.length; i++) {
								chooseSpec.push(-1)
							}
							that.setData({
								spec: specs,
								specType: specType,
								chooseSpec: chooseSpec,
								isSpec: true
							})
						}
					}
				})

				// 获取商品规格详情列表
				wx.request({
					url: app.globalData.http + '/mpa/goods/' + options.id + '/skus',
					method: "GET",
					header: {
						'Api-Ext': app.globalData.apiExt
					},
					success (res) {
						that.setData({
							skus: res.data
						})
					}
				})

				//获取商品详情
				wx.request({
					url: app.globalData.http + '/mpa/goods/' + options.id,
					header: {
						'Api-Ext': app.globalData.apiExt
					},
					success(res) {
						wx.hideLoading();
						if (JSON.stringify(res.data) != '{}' && (res.statusCode >= 200 && res.statusCode < 300)) {
							that.setData({
								goods: res.data,
								goodUrl: res.data.cover_url,
								goodPrice: res.data.price,
								imgs: res.data.images,
								name: res.data.name,
								show: 1,
								status: res.data.status,
								hasUserInfo: app.globalData.user_info.nick_name || app.globalData.user_info.nickName ? true : false
							})
							if (res.data.detail) {
								that.setData({
									content: res.data.detail.content.replace(/\<img style="max-width:750.0px;"/gi, '<img style="width:100%;height:auto" ').replace(/750.0px/gi, '100%').replace(/width="\d+"/gi, '').replace(/height="\d+"/gi, '').replace(/\s+id/gi, ' class').replace(/\<img/gi, '<img style="width:100%;height:auto" ').replace(/<p/gi, '<p style="font-size:12px;line-height:16px;"'),
								})
							}


							// 如果为拼团详情，请求商品拼团信息详情
							if (res.data.activity_type == 1) {
								wx.request({
									url: app.globalData.http + '/mpa/goods/' + res.data.id + '/groupon_goods',
									header: {
										'Api-Ext': app.globalData.apiExt
									},
									success(res) {
										that.setData({
											groupInfo: res.data
										})
										countDown(that, res.data.count_down, that.data.timeStampArr, options.id)
									}
								})

								// 该商品的拼团规格详情
								wx.request({
									url: app.globalData.http + '/mpa/goods/' + that.data.goods.id + '/groupon_goods/skus',
									header: {
										'Api-Ext': app.globalData.apiExt
									},
									success (res) {
										that.setData({
											groupSkus: res.data
										})
									}
								})

								// 该商品的所有拼团
								wx.request({
									url: app.globalData.http + '/mpa/goods/' + res.data.id + '/groupons',
									header: {
										'Api-Ext': app.globalData.apiExt,
										"Api-Key": app.globalData.apiKey,
										"Api-Secret": app.globalData.apiSecret,
									},
									data: {
										per_page: 3,
										page: 0
									},
									success(res) {
										if (res.statusCode == 200) {
											// 处理返回数据
											let handleArr = res.data;
											for (let i = 0; i < handleArr.length; i ++) {
												handleArr[i].timeStampArr = []
											}
											// 处理完成后把data赋值给groupMembers
											that.setData({
												groupMembers: handleArr
											})
											// 给每条数据加上倒计时定时器
											that.countDownList(that.data.groupMembers)
										} else {
											wx.showToast({
												title: '拼团信息加载失败',
												icon: 'none',
												duration: 2000
											})
										}
									}
								})
							}
						} else {
							wx.showToast({
								title: '该商品已找不到',
								icon: 'none',
								duration: 2000
							})
						}
					},
					fail: function() {
						wx.showToast({
							title: '暂无网络',
							icon: 'none'
						})
						wx.hideLoading();
					}
				})
			})
		},
		// 图片点击放大
		viewImages (e) {
			var that = this;
			let index = e.currentTarget.dataset.index,
				ind = e.currentTarget.dataset.ind,
				tempArr = [], temp = that.data.imgs;
			for (let i = 0; i < temp.length; i++) {
				tempArr.push(that.data.image + temp[i].icon_url)
			}
			wx.previewImage({
				current: that.data.image + that.data.imgs[index].icon_url, // 当前显示图片的http链接
				urls: tempArr // 需要预览的图片http链接列表
			})
		},
		// 倒计时列表
		countDownList (arr) {
			let that = this;
			for (let i = that.data.groupMembers.length - 1; i >= 0; i--) {
				if (that.data.groupMembers.length == 0) {
					return false
				}
		setTime(i)

				that.data.groupMembers[i].timer = setInterval(function () {
			if (that.data.groupMembers.length == 0) {
				return false
			}
			setTime(i, that.data.groupMembers[i].timer)
			// 如果某一项倒计时结束
			if (arr[i].count_down <= 0) {

				let list = JSON.parse(JSON.stringify(that.data.groupMembers));
				list.splice(i, 1)
				that.setData({
					groupMembers: list
				})
				that.countDownList(that.data.groupMembers)
			}
		}, 1000);
				
			}

		function setTime(i, timer) {
			var hour = 0,
			minute = 0,
			second = 0;//时间默认值
			
			if (that.data.groupMembers[i].count_down <= 0) {
				clearInterval(timer);
			} else {
				hour = Math.floor(that.data.groupMembers[i].count_down / (60 * 60));
				minute = Math.floor(that.data.groupMembers[i].count_down / 60) - (hour * 60);
				second = Math.floor(that.data.groupMembers[i].count_down) - (hour * 60 * 60) - (minute * 60);
			}

			if (hour <= 9) hour = '0' + hour;
			if (minute <= 9) minute = '0' + minute;
			if (second <= 9) second = '0' + second;

			let tA = 'groupMembers[' + i + '].timeStampArr'
			that.setData({ [tA]: [hour, minute, second] })

			// let limit = 'grouponData['+i+'].limit_at'
			// that.setData({[limit]: --that.data.grouponData[i].limit_at})
			that.data.groupMembers[i].count_down--;
		}
		},
		// 获取用户信息
		getUserInfo: function (e) {
			var that = this;
			if (e.detail.userInfo) {
				wx.showLoading({
					title: '加载中',
					icon: 'none',
					mask: true
				})
				wx.login({
					success(code) {
						//获取用户信息，拿到userInfo
						var userInfo = e.detail.userInfo;
						//向后台发起请求，传code
						wx.request({
							url: app.globalData.http + '/mpa/wechat/auth',
							method: 'POST',
							header: {
								'Api-Ext': app.globalData.apiExt
							},
							data: {
								code: code.code
							},
							success: function (res) {
								wx.hideLoading();
								var code = res.statusCode.toString()
								if (code == 500) {
									wx.showToast({
										title: res.data.message,
										icon: 'none',
										duration: 1000
									})
								} else if (code.indexOf('40') > -1) {
									var tip = res.data.message.toString()
									wx.showToast({
										title: tip,
										icon: 'none',
										duration: 1000
									})
								}
								else {
									//保存响应头信息
									if (res.header["api-key"] && res.header["api-secret"]) {
										var apiKey = res.header["api-key"],
											apiSecret = res.header["api-secret"];
									} else if (res.header["Api-Key"] && res.header["Api-Secret"]) {
										var apiKey = res.header["Api-Key"],
											apiSecret = res.header["Api-Secret"];
									}
									//设置storage
									//获取时间戳保存storage
									// let timestamp = Date.parse(new Date());
									app.globalData.apiKey = apiKey;
									app.globalData.apiSecret = apiSecret;
									app.globalData.user_info = userInfo;
									that.setData({
										hasUserInfo: true
									})
									wx.setStorage({
										key: 'huzan_avatarUrl',
										data: userInfo,
									})
									wx.request({
										url: app.globalData.http + '/mpa/wechat/' + res.data.id,
										method: "PUT",
										data: {
											"nick_name": userInfo.nickName,
											"avatar_url": userInfo.avatarUrl,
											"gender": userInfo.gender,
											"city": userInfo.city,
											"province": userInfo.province,
											"country": userInfo.country,
											"language": userInfo.language
										},
										header: {
											"Api-Key": app.globalData.apiKey,
											"Api-Secret": app.globalData.apiSecret,
											'Api-Ext': app.globalData.apiExt
										},
										complete(res) {
										}
									})
									if (res.data.user_id) {
										app.globalData.userId = true
										// wx.setStorage({
										//   key: 'userId',
										//   data: true,
										// })
									}
								}
							}
						})
					},
					fail: function (res) {
					}
				})
			}
		},
		// 获取手机号
		getPhoneNumber: function (e) {
			app.publicAuth(e, this)
		}
	})