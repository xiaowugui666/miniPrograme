//index.js
//获取应用实例
const mockData = [
    {
        "index":0,
        "type":"Default",
        "name":"Banner",
        "text":"轮播图",
        "template":"banner",
        "data":[
            {
                "label":"轮播图 1",
                "type":"0_0",
                "_data":[
                    136
                ],
                "data":[
                    {
                        "img_url":"https://image.51zan.com/2019/03/13/FuIWP2guOZzDFaXPETpR9aOVVuwj.png"
                    }
                ]
            }
        ],
        "isActive":false
    },
    {
        "index":10,
        "type":"CommodityCategories",
        "name":"ProductCross",
        "productType":"cross",
        "text":"商品类目",
        "template":"doubleTabColumn",
        "data":[
            {
                "label":"文字",
                "type":"1_0",
                "data":[
                    135,
                    136
                ]
            },
            {
                "label":"文字",
                "type":"1_1",
                "data":[
                    85,
                    81
                ]
            },
            {
                "label":"文字",
                "type":"1_2",
                "data":[
                    62,
                    85
                ]
            }
        ],
        "isActive":false
    },
    {
        "index":10,
        "type":"CommodityCategories",
        "name":"ProductDirection",
        "productType":"direction",
        "text":"商品类目",
        "template":"singleTabColumn",
        "data":[
            {
                "label":"文字",
                "type":"2_0",
                "data":[
                    70,
                    71
                ]
            },
            {
                "label":"文字",
                "type":"2_1",
                "data":[
                    61,
                    60
                ]
            },
            {
                "label":"文字",
                "type":"2_2",
                "data":[
                    48,
                    52
                ]
            }
        ],
        "isActive":false
	},
	{
        "index":4,
        "type":"DoubleColumn",
        "name":"DoubleColumn",
        "productType":"cross",
        "text":"双列商品",
        "template":"doubleColumn",
        "data":[
            {
                "label":"",
                "type":"3_0",
                "data":[
                    68,
                    69,
                    81
                ]
            }
        ],
        "isActive":false
    },
    {
        "index":5,
        "type":"SingleLine",
        "name":"SingleLine",
        "productType":"direction",
        "text":"单行商品",
        "template":"singleColumn",
        "data":[
            {
                "label":"",
                "type":"4_0",
                "data":[
                    62,
                    63,
                    64,
                    65,
                    66,
                    67
                ]
            }
        ],
		"isActive":true
	},
    {
        "index":11,
        "type":"SingleLine",
        "name":"ActiveProduct",
        "productType":"direction",
        "active":"pingtuan",
        "text":"拼团",
        "template":"group",
        "data":[
            {
                "label":"拼团",
                "type":"5_0",
                "data":[
                    48
                ]
            }
        ],
        "isActive":true
    },
    // {
    //     "index":13,
    //     "type":"DoubleColumn",
    //     "name":"ActiveProduct",
    //     "productType":"cross",
    //     "active":"tuijian",
    //     "text":"推荐",
    //     "template":"recommend",
    //     "data":[
    //         {
    //             "label":"推荐",
    //             "type":"4_0",
    //             "data":[
    //                 136
    //             ]
    //         }
    //     ],
    //     "isActive":false
    // },
    // {
    //     "index":12,
    //     "type":"SingleLine",
    //     "name":"ActiveProduct",
    //     "productType":"direction",
    //     "active":"tejia",
    //     "text":"特价",
    //     "template":"special",
    //     "data":[
    //         {
    //             "label":"特价",
    //             "type":"5_0",
    //             "data":[
    //                 50
    //             ]
    //         }
    //     ],
    //     "isActive":false
    // }
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
		currentSpecialPage:0,
		
        mockData: mockData,
	},
	// 获取当前数组中为商品列表模块的商品ID数据,同时进行分页处理
    getGoodListIdsData: function (data) {
        let goodListIdsData = [], postDataList = JSON.parse(JSON.stringify(data))
        data.forEach((element,index) => {
            if (
				element.template === 'singleTabColumn'
				|| element.template === 'doubleTabColumn'
				|| element.template === 'singleColumn'
				|| element.template === 'doubleColumn'
				|| element.template === 'group'
				) {
                element.currentTab = 0
                element.data.forEach((item, ind) => {
                    let currentShowData = [], currentShowIndex = 10
                    console.log('item:', item)
                    postDataList[index].data[ind].data = item.data.slice(0, currentShowIndex)
                    item.currentShowData = currentShowData
                    item.currentShowIndex = currentShowIndex
                    item.hasNextPage  = false
                    if (item.data.length > 10) {
                        item.hasNextPage = true
                    }
                })
                goodListIdsData = goodListIdsData.concat(postDataList[index].data)
            }
        });
        this.setData({
            mockData: data
        })
        return goodListIdsData
	},
	// 切换tab
	onChangeTab: function (e) {
		const clickArray = e.currentTarget.dataset.value.split("_")
		let changeArr = this.data.mockData
		changeArr[parseFloat(clickArray[0])].currentTab = parseFloat(clickArray[1])
		this.setData({
			mockData: changeArr
		})
	},
	// 页面加载
	onLoad: function (options) {
		if (options.scene) {
			var sceneId = decodeURIComponent(options.scene).split(',')[0]
			app.globalData.sceneID = sceneId
		} else if (options.scene_id) {
			app.globalData.sceneID = options.scene_id
		}
		
        let goodListIdsData = this.getGoodListIdsData(mockData)
        this.getData(goodListIdsData)
		// app.login()
		// 	.then(() => this.getData())
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
	getData: function (params) {
        const that = this
        wx.request({
            url: app.globalData.http + '/mpa/index/decoration_products',
            method: 'POST',
            header:{
                'Api-Ext': app.globalData.apiExt
            },
            data: {
                main: params
            },
            success(res) {
                if (res.statusCode === 200) {
                    let goodList = res.data.data, pageShowingArr = that.data.mockData
                    console.log('goodList:',goodList)
                    goodList.forEach(currentItem => {
                        let typeArr = currentItem.type.split('_')
                        pageShowingArr[parseFloat(typeArr[0])].data[parseFloat(typeArr[1])].currentShowData = pageShowingArr[parseFloat(typeArr[0])].data[parseFloat(typeArr[1])].currentShowData.concat(currentItem.data)
                    })
                    console.log('pageShowingArr:', pageShowingArr)
                    that.setData({
                        mockData: pageShowingArr
                    })
                }

            },
            fail: function (res) {
                console.log(res)
            }
        })
    },
	// 打开页面或下拉刷新进行的后台请求
	// getData () {
	// 	let that = this;
	// 	//获取店家描述数据
	// 	wx.request({
	// 		url: app.globalData.http + '/mpa/index',
	// 		method: 'GET',
	// 		header:{
	// 			'Api-Ext': app.globalData.apiExt
	// 		},
	// 		success(res) {
	// 			app.globalData.mobile = res.data.customer_service_mobile
	// 			app.globalData.logo_url = res.data.logo_url
	// 			app.globalData.name = res.data.name
	// 			that.setData({
	// 				description: res.data
	// 			})
	// 			app.globalData.keyword = res.data.search_default_text
	// 		 //设置title
	// 			wx.setNavigationBarTitle({
	// 				title: res.data.name,
	// 			})
	// 		},
	// 		fail: function (res) {
	// 			console.log(res)
	// 		}
	// 	})
	// 	//设备宽度
	// 	wx.getSystemInfo({
	// 		success: function (res) {
	// 			that.setData({
	// 				winWidth: res.windowWidth
	// 			});
	// 		}
	// 	});

	// 	//商品分类
	// 	wx.request({
	// 		url: app.globalData.http + '/mpa/category',
	// 		method:'get',
	// 		header: {
	// 			'Api-Ext': app.globalData.apiExt
	// 		},
	// 		success:function(res){
	// 			var cateNum = Math.ceil(res.data.length / 5)
	// 			var remain = res.data.length % 5
	// 			var cateArr=[]
	// 			for(var i=0;i<cateNum;i++){
	// 				 cateArr.push(1)
	// 			}
	// 			that.setData({
	// 				category: {
	// 					...that.data.category,
	// 					categoryList: res.data,
	// 					newCate: cateArr,
	// 					skinStyle: that.data.skinStyle
	// 				},
	// 				remain: remain
	// 			})
	// 		}
	// 	})
	// 	this.getGroupData()
	// 		.then(() => this.getRecommendData())
	// 		.then(() => this.getSpecialData())
	// 		.then(() => this.getNormalData())
	// },
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
		if (remain != 0 && scrollLeft >= (scrollWidth -width-(remain-1) * width/5)) {
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
		// wx.showLoading({
		// 	title: '加载中',
		// })
		// let currentTab = this.data.tabObject.currentTab, tabSwiperArr = this.data.tabObject.tabSwiperArr;
		// if (tabSwiperArr.length === 0) {
		// 	let newPage = this.data.currentPage
		// 	newPage++
		// 	this.setData({
		// 		currentPage: newPage
		// 	})
		// 	this.getNormalData('isConcat').then(() => wx.hideLoading())
		// } else {
		// 	let newPage
		// 	switch (tabSwiperArr[currentTab].type) {
		// 		case 1:
		// 			newPage = this.data.currentGroupPage
		// 			newPage++
		// 			this.setData({
		// 				currentGroupPage: newPage
		// 			})
		// 			this.getGroupData('isConcat').then(() => wx.hideLoading())
		// 			break
		// 		case 2:
		// 			newPage = this.data.currentRecommendPage
		// 			newPage++
		// 			this.setData({
		// 				currentRecommendPage: newPage
		// 			})
		// 			this.getRecommendData('isConcat').then(() => wx.hideLoading())
		// 			break
		// 		case 3:
		// 			newPage = this.data.currentSpecialPage
		// 			newPage++
		// 			this.setData({
		// 				currentSpecialPage: newPage
		// 			})
		// 			this.getSpecialData('isConcat').then(() => wx.hideLoading())
		// 			break
		// 		default:
		// 	}
		// }
	}
})
