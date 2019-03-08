//index.js
//获取应用实例
const data = [
	{
		name: 'banner',
		wxTemplate: 'banner', // 轮播图模块
		data: [
			'asjhdgajhdghahg', // 图片相对上传地址路径数组
		]
	},
	{
		name: 'search',
		wxTemplate: 'search', // 搜索模块
		data: {
			default_text: 'xxxx', // 搜索组件，默认搜索框文字
		}
	},
	{
		name: 'category',
		wxTemplate: 'category', // 分类模块
		data: [
			{
				name: '我是类目名称',
				icon_url: 'xxxxxx', // 类目图片相对上传地址相对路径
			}
		]
	},
	{
		name: 'contact',
		wxTemplate: 'contact', // 小程序端联系店家模块组件
		data: {
			logo_url: 'xxxx',
			name: '',
			id: ''
		}
	},
	{
		name: 'singleLine',
		wxTemplate: 'singleLine', // 单行文本
		data: {
			text: 'xxxx'
		}
	}
]
const app=getApp();
Page({
	data: {
		//分类
		image: 'https://image.51zan.com/',
		category: {
			categoryList:[],
			newCate:'',
			current:0,
			skinStyle: 'default'
		},
		singleLineText: '海马毛蝙蝠袖竖织宽松套头毛衣百搭马卡龙',
		paragraphText: '机洗会导致填充棉膨胀，形成气囊浮出甩干桶之外， 造成衣物与洗衣剂的损伤， 干洗会导致填充棉变脆从衣缝里钻出，即跑毛。',
		description: {},
		remain:"",
		tabObject: {
			tabSwiperArr: [],
			currentTab: 0,
		},
		tabScrollTop: false,
		keyword:'',
		winWidth:'',
		good:[],
		currentPage: 0,
		skinStyle: app.globalData.skinStyle,
		currentGroupPage: 0,
		currentRecommendPage: 0,
		currentSpecialPage:0
	},
	// 页面加载
	onLoad: function (options) {
		if (options.scene) {
			var sceneId = decodeURIComponent(options.scene).split(',')[0]
			app.globalData.sceneID = sceneId
		} else if (options.scene_id) {
			app.globalData.sceneID = options.scene_id
		}
		app.login().then(() => this.getData())
	},
	//下拉刷新
	onPullDownRefresh: function () {
		this.setData({
			tabObject: {
				currentTab: 0,
				tabSwiperArr: [],
			},
			good: [],
			currentPage: 0,
			currentGroupPage: 0,
			currentRecommendPage: 0,
			currentSpecialPage:0
		})
		this.getData()
		wx.stopPullDownRefresh()
	},
	phoneCall: function () {
		wx.makePhoneCall({
			phoneNumber: app.globalData.mobile
		})	  
	},
	// 打开页面或下拉刷新进行的后台请求
	getData () {
		let that = this;
		//获取店家描述数据
		wx.request({
			url: app.globalData.http + '/mpa/index',
			method: 'GET',
			header:{
				'Api-Ext': app.globalData.apiExt
			},
			success(res) {
				app.globalData.mobile = res.data.customer_service_mobile
				app.globalData.logo_url = res.data.logo_url
				app.globalData.name = res.data.name
				that.setData({
					description: res.data
				})
				app.globalData.keyword = res.data.search_default_text
			 //设置title
				wx.setNavigationBarTitle({
					title: res.data.name,
				})
			},
			fail: function (res) {
				console.log(res)
			}
		})
		//设备宽度
		wx.getSystemInfo({
			success: function (res) {
				that.setData({
					winWidth: res.windowWidth
				});
			}
		});

		//商品分类
		wx.request({
			url: app.globalData.http + '/mpa/category',
			method:'get',
			header: {
				'Api-Ext': app.globalData.apiExt
			},
			success:function(res){
				var cateNum = Math.ceil(res.data.length / 5)
				var remain = res.data.length % 5
				var cateArr=[]
				for(var i=0;i<cateNum;i++){
					 cateArr.push(1)
				}
				that.setData({
					category: {
						...that.data.category,
						categoryList: res.data,
						newCate: cateArr,
						skinStyle: that.data.skinStyle
					},
					remain: remain
				})
			}
		})
		this.getGroupData()
			.then(() => this.getRecommendData())
			.then(() => this.getSpecialData())
			.then(() => this.getNormalData())
	},
	// 获取商品列表
	getNormalData: function (params) {
		let that = this, page = this.data.currentPage;
		return new Promise((resolve, reject) => {
			wx.request({
				url: app.globalData.http + '/mpa/goods/search',
				header: {
					'Api-Ext': app.globalData.apiExt
				},
				data: {
					page: page
				},
				dataType: 'json',
				method: 'GET',
				success: function (data) {
					if (data.statusCode >= 200 && data.statusCode < 300) {
						if (params === 'isConcat' && data.data.length > 0) {
							let tempArr = that.data.good
							let newArr = tempArr.concat(data.data)
							that.setData({
								good: newArr
							})
						} else if (params === 'isConcat' &&  data.data.length == 0) {
							let newPage = that.data.currentPage
							newPage--
							that.setData({
								currentPage: newPage
							})
						} else {
							that.setData({
								good:data.data
							})
						}
						resolve()
					} else {
						reject()
					}
				},
				fail: function (data) {
					reject()
				}
			})
		})
	},
	getGroupData: function (params) {
		let that = this, page = this.data.currentGroupPage;
		return new Promise((resolve, reject) => {
			wx.request({
				url: app.globalData.http + '/mpa/groupon_goods',
				header: {
					'Api-Ext': app.globalData.apiExt
				},
				data: {
					page: page
				},
				dataType: 'json',
				method: 'GET',
				success: function (data) {
					if (data.statusCode >= 200 && data.statusCode < 300) {
						if (data.data && data.data.length > 0 && params === 'isConcat') {
							let tempArr = that.data.tabObject.tabSwiperArr;
							tempArr.map(item => {
								if (item.type === 1) {
									item.data = item.data.concat(data.data)
								}
								return item
							});
							that.setData({
								tabObject: {
									...that.data.tabObject,
									tabSwiperArr: tempArr
								}
							})
						} else if (data.data && params === 'isConcat') {
							let newPage = that.data.currentGroupPage
							newPage--
							that.setData({
								currentGroupPage: newPage
							})
						} else if (data.data && data.data.length > 0) {
							let tempArr = []
							tempArr.push({
								type: 1,
								label: '超值拼团',
								data: data.data
							})
							that.setData({
								tabObject: {
									...that.data.tabObject,
									tabSwiperArr: tempArr
								}
							})
						}
						resolve()
					} else {
						reject()
					}
				},
				fail: function (res) {
					reject()
				},
			})
		})
	},
	getRecommendData: function (params) {
		let that = this, page = this.data.currentRecommendPage;		
		return new Promise((resolve, reject) => {
			wx.request({
				url: app.globalData.http + '/mpa/goods/recommend',
				method: 'GET',
				header:{
					'Api-Ext': app.globalData.apiExt
				},
				data: {
					page: page
				},
				success(res) {
					var code = res.statusCode.toString()
					if (code.indexOf('20')>-1) {
						if (res.data.length > 0 && params === 'isConcat') {
							let tempArr = that.data.tabObject.tabSwiperArr;
							tempArr.map(item => {
								if (item.type === 2) {
									item.data = item.data.concat(res.data)									
								}
								return item
							});
							that.setData({
								tabObject: {
									...that.data.tabObject,
									tabSwiperArr: tempArr
								}
							})
						} else if (params === 'isConcat') {
							let newPage = that.data.currentRecommendPage
							newPage--
							that.setData({
								currentRecommendPage: newPage
							})
						} else if (res.data.length > 0) {
							let tempArr = that.data.tabObject.tabSwiperArr, hasCurrentData = false
							for (let i = 0, leng = tempArr.length; i < leng; i++) {
								if (tempArr[i].type == 2) {
									hasCurrentData = true
								}
							}
							if (tempArr.length == 0 || !hasCurrentData) {
								tempArr.push({
									type: 2,
									label: '好物推荐',
									data: res.data
								})
							}
							that.setData({
								tabObject: {
									...that.data.tabObject,
									tabSwiperArr: tempArr
								}
							})
						}
						resolve()
					} else {
						reject()
					}
				},
				fail: function (res) {
					reject()
				},
			})
		})
	},
	getSpecialData: function (params) {
		let that = this, page = this.data.currentSpecialPage;		
		return new Promise((resolve, reject) => {
			wx.request({
				url: app.globalData.http + '/mpa/goods/special',
				method: 'GET',
				header:{
					'Api-Ext':app.globalData.apiExt
				},
				data: {
					page: page
				},
				success(res) {
					if (res.statusCode >= 200 && res.statusCode < 300) {
						if (res.data.length >0 && params === 'isConcat') {
							let tempArr = that.data.tabObject.tabSwiperArr;
							tempArr.map(item => {
								if (item.type === 3) {
									item.data = item.data.concat(res.data)
								}
								return item
							});
							that.setData({
								tabObject: {
									...that.data.tabObject,
									tabSwiperArr: tempArr
								}
							})
						} else if (params === 'isConcat') {
							let newPage = that.data.currentSpecialPage
							newPage--
							that.setData({
								currentSpecialPage: newPage
							})
						} else if (res.data.length > 0) {
							let tempArr = that.data.tabObject.tabSwiperArr, hasCurrentData = false
							for (let i = 0, leng = tempArr.length; i < leng; i++) {
								if (tempArr[i].type == 3) {
									hasCurrentData = true
								}
							}
							if (tempArr.length == 0 || !hasCurrentData) {
								tempArr.push({
									type: 3,
									label: '精选特价',
									data: res.data
								})
							}
							that.setData({
								tabObject: {
									...that.data.tabObject,
									tabSwiperArr: tempArr
								}
							})
						}
						resolve()
					} else {
						reject()
					}
				},
				fail: function (res) {
					reject()
				},
			})
		})
	},
	//一级分类滚动
	scrollCategory:function(e){
		var that = this
		//宽度
		var scrollWidth = parseInt(e.detail.scrollWidth)
		//滚动的距离
		var scrollLeft = parseInt(e.detail.scrollLeft)
		//屏幕的宽度
		var width = parseInt(that.data.winWidth)
		//剩余的分类
		var remain = parseInt(that.data.remain)
		var cur = Math.floor(scrollLeft / width)
		if (cur < 0) {
			cur = 0
		}
		var cateNum = Math.floor(scrollWidth / width)
		if (remain != 0 && scrollLeft >= (scrollWidth -width-(remain) * width/5)) {
			cur++
			that.setData({
				category: {
					...that.data.category,
					current: cur
				}
			})
		}else{
			that.setData({
				category: {
					...that.data.category,
					current: cur
				}
			})
		}
	},
	// 切换tab
	onChangeTab: function (e) {
		this.setData({
			tabObject: {
				...this.data.tabObject,
				currentTab: e.currentTarget.dataset.value,
			},
			currentPage: 0
		})
	},
	onChangeSwiperItem: function (e) {
		if (e.detail.source === 'touch') {
			this.setData({
				tabObject: {
					...this.data.tabObject,
					currentTab: e.detail.current
				},
			})
		}
	},
	//跳转商品详情页
	bindDetail(e){
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
		})
	},
	//定义分享转发
	onShareAppMessage: function (res) {
		if (res.from === "button") {
		}
		if (this.data.description.share_logo_url){
			var url = this.data.image + this.data.description.share_logo_url
		}else{
			var url = this.data.image + this.data.description.logo_url
		}
		return {
			title: this.data.description.share_text,
			path: "/pages/index/index",
			imageUrl: url,
			success(res) {
			}
		}
	},
	// 点击分类跳转分类页面
	switchCate(e){
		//当前点击索引,保存到globalData
		var idx = e.currentTarget.dataset.idx;
		app.globalData.classIdx =idx
		wx.switchTab({
			url: '/pages/category/category',
		})
	},
	//点击跳转到新页面
	goNavigator(e){
		var path = e.currentTarget.dataset.type;
		wx.navigateTo({
			url: '/pages'+path,
		})
	},
	onPageScroll: function () {
		const that = this
		const query = wx.createSelectorQuery()
		query.select('#marketing-tab').boundingClientRect()
		query.selectViewport().scrollOffset()
		query.exec(function (res) {
			if (res[0] != null) {
				if(res[0].top <= 0) {
					that.setData({
						tabScrollTop: true
					})
				} else {
					that.setData({
						tabScrollTop: false
					})
				}
			}
		})
	},
	onReachBottom: function (e) {
		wx.showLoading({
			title: '加载中',
		})
		let currentTab = this.data.tabObject.currentTab, tabSwiperArr = this.data.tabObject.tabSwiperArr;
		if (tabSwiperArr.length === 0) {
			let newPage = this.data.currentPage
			newPage++
			this.setData({
				currentPage: newPage
			})
			this.getNormalData('isConcat').then(() => wx.hideLoading())
		} else {
			let newPage
			switch (tabSwiperArr[currentTab].type) {
				case 1:
					newPage = this.data.currentGroupPage
					newPage++
					this.setData({
						currentGroupPage: newPage
					})
					this.getGroupData('isConcat').then(() => wx.hideLoading())
					break
				case 2:
					newPage = this.data.currentRecommendPage
					newPage++
					this.setData({
						currentRecommendPage: newPage
					})
					this.getRecommendData('isConcat').then(() => wx.hideLoading())
					break
				case 3:
					newPage = this.data.currentSpecialPage
					newPage++
					this.setData({
						currentSpecialPage: newPage
					})
					this.getSpecialData('isConcat').then(() => wx.hideLoading())
					break
				default:
			}
		}
	}
})
