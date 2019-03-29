const app=getApp();
Page({
	data: {
		//分类
		image: 'https://image.51zan.com/',
		categoryList:[],
		description: {},
		newCate:'',
		remain:"",
		current:0,
		tabSwiperArr: [],
		currentTab: 0,
		tabScrollTop: false,
		keyword:'',
		winWidth:'',
		good:[],
		currentPage: 0,
		currentGroupPage: 0,
		currentRecommendPage: 0,
		currentSpecialPage: 0,

		skinStyle: app.globalData.skinStyle,
        pageData: null,
	},
	/**
	 * 
	 * @description 店铺装修数据如果不为null,则执行店铺装修部分逻辑，否则执行之前逻辑
	 */

	// 获取当前数组中为商品列表模块的商品ID数据,同时根据不同模块的需求进行数据处理
    getGoodListIdsData: function (data) {
		let goodListIdsData = [], postDataList = JSON.parse(JSON.stringify(data)), windowHeight = this.data.windowHeight * 2
        data.forEach((element,index) => {
            if (
				element.template === 'singleTabColumn'
				|| element.template === 'doubleTabColumn'
				|| element.template === 'singleColumn'
				|| element.template === 'doubleColumn'
				|| element.template === 'group'
				|| element.template === 'recommend'
				|| element.template === 'special'
				) {
                element.currentTab = 0
                element.data.forEach((item, ind) => {
                    let currentShowData = [], currentShowIndex = 10
                    postDataList[index].data[ind].data = item.data.slice(0, currentShowIndex)
                    item.currentShowData = currentShowData
                    item.currentShowIndex = currentShowIndex
                    item.hasNextPage  = false
                    if (item.data.length > 10) {
                        item.hasNextPage = true
                    }
                })
                goodListIdsData = goodListIdsData.concat(postDataList[index].data)
            } else if (element.template === 'category') {
				let cateNum = Math.ceil(element.data.length / 5), remain = element.data.length % 5, cateArr=[]
				for(let i = 0; i < cateNum; i++){
					cateArr.push(1)
				}
				element.remain = remain
				element.newCate = cateArr
				element.skinStyle = app.globalData.skinStyle
				element.current = 0
			} else if (element.template === 'banner') {
				element.windowHeight = windowHeight
				element.currentBannerIndex = 0
				element.data.forEach(item => {
					item.windowHeight = windowHeight
				})
			} else if (element.template === 'search') {
				app.globalData.keyword = element.data[0].data[0].text
			} else if (element.template === 'photoText') {
				element.skinStyle = app.globalData.skinStyle
			}
		});
        this.setData({
            pageData: data
        })
        return goodListIdsData
	},
	// 切换tab
	onChangeTabFitment: function (e) {
		const clickArray = e.currentTarget.dataset.value.split("_")
		let changeArr = this.data.pageData
		changeArr[parseFloat(clickArray[0])].currentTab = parseFloat(clickArray[1])
		this.setData({
			pageData: changeArr
		})
	},
	onChangeTab: function (e) {
		this.setData({
			currentTab: e.currentTarget.dataset.value,
			currentPage: 0
		})
	},
	handleSeeMore: function (e) {
		const clickArray = e.currentTarget.dataset.type.split("_"), currentShowData = this.data.pageData
		let selectArr = currentShowData[clickArray[0]].data[clickArray[1]]
		let nextShowIndex = selectArr.currentShowIndex + 10
		if (selectArr.data.length <= nextShowIndex) {
			selectArr.hasNextPage = false
		}
		selectArr.currentShowIndex = nextShowIndex
		this.getNextPageData(selectArr)
	},
	getNextPageData: function (nextPageObj) {
		let copyNextObj = JSON.parse(JSON.stringify(nextPageObj)), requestArray = []
		copyNextObj.data = nextPageObj.data.slice(nextPageObj.currentShowIndex - 10, nextPageObj.currentShowIndex)
		requestArray.push(copyNextObj)
		const that = this
		wx.request({
			url: app.globalData.http + '/mpa/index/decoration_products',
            method: 'POST',
            header:{
                'Api-Ext': app.globalData.apiExt
            },
            data: {
                main: requestArray
			},
			success: (res) => {
				if (res.statusCode === 200) {
                    let goodList = res.data.data, pageShowingArr = that.data.pageData
                    goodList.forEach(currentItem => {
                        let typeArr = currentItem.type.split('_'), i = parseFloat(typeArr[0]), j = parseFloat(typeArr[1])
						pageShowingArr[i].data[j].currentShowData = pageShowingArr[i].data[j].currentShowData.concat(currentItem.data)
						pageShowingArr[i].data[j].hasNextPage = nextPageObj.hasNextPage
                    })
                    that.setData({
                        pageData: pageShowingArr
                    })
                }
			}
		})
	},
	getInitData: function (params) {
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
					let goodList = res.data.data, pageShowingArr = that.data.pageData
                    goodList.forEach(currentItem => {
						let typeArr = currentItem.type.split('_'), i = parseFloat(typeArr[0]), j = parseFloat(typeArr[1])
                        pageShowingArr[i].data[j].currentShowData = pageShowingArr[i].data[j].currentShowData.concat(currentItem.data)
					})
                    that.setData({
                        pageData: pageShowingArr
                    })
                }

            },
            fail: function (res) {
                console.log(res)
            }
        })
	},
	getInitElement: function () {
		const that = this
		return new Promise((resolve, reject) => {
			wx.request({
				url: app.globalData.http + '/mpa/index/decoration',
				method: 'GET',
				header:{
					'Api-Ext': app.globalData.apiExt
				},
				success(res) {
					if (res.statusCode === 200) {
						if (res.data === null) {
							that.setData({
								pageData: res.data
							})
							resolve(res.data)
						} else {
							that.setData({
								pageData: res.data.data
							})
							resolve(res.data.data)
						}
					} else {
						reject(res)
					}
	
				},
				fail: function (res) {
					reject(res)
				}
			})
		})
	},
	// 页面加载
	onLoad: function (options) {
		const that = this
		if (options.scene) {
			var sceneId = decodeURIComponent(options.scene).split(',')[0]
			app.globalData.sceneID = sceneId
		} else if (options.scene_id) {
			app.globalData.sceneID = options.scene_id
		}
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
					winWidth: res.windowWidth,
					windowHeight: res.windowHeight
				});
			}
		});
		app.getAppSkinStyle().then((data) => {
			app.setTabBar(data, this)
			this.getInitElement().then((data) => {
				if (data === null ) {
					this.getData()
				} else {
					let goodListIdsData = this.getGoodListIdsData(data)
					this.getInitData(goodListIdsData)
				}
				app.login()
			})
		})
	},
	getData () {
		let that = this;
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
					categoryList: res.data,
					newCate: cateArr,
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
							let tempArr = that.data.tabSwiperArr;
							tempArr.map(item => {
								if (item.type === 1) {
									item.data = item.data.concat(data.data)
								}
								return item
							});
							that.setData({
								tabSwiperArr: tempArr
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
								tabSwiperArr: tempArr
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
							let tempArr = that.data.tabSwiperArr;
							tempArr.map(item => {
								if (item.type === 2) {
									item.data = item.data.concat(res.data)									
								}
								return item
							});
							that.setData({
								tabSwiperArr: tempArr
							})
						} else if (params === 'isConcat') {
							let newPage = that.data.currentRecommendPage
							newPage--
							that.setData({
								currentRecommendPage: newPage
							})
						} else if (res.data.length > 0) {
							let tempArr = that.data.tabSwiperArr, hasCurrentData = false
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
								tabSwiperArr: tempArr,
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
							let tempArr = that.data.tabSwiperArr;
							tempArr.map(item => {
								if (item.type === 3) {
									item.data = item.data.concat(data.data)
								}
								return item
							});
							that.setData({
								tabSwiperArr: tempArr
							})
						} else if (params === 'isConcat') {
							let newPage = that.data.currentSpecialPage
							newPage--
							that.setData({
								currentSpecialPage: newPage
							})
						} else if (res.data.length > 0) {
							let tempArr = that.data.tabSwiperArr, hasCurrentData = false
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
								tabSwiperArr: tempArr,
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
	//下拉刷新
	onPullDownRefresh: function () {
		app.getAppSkinStyle().then((data) => {
			app.setTabBar(data, this)
			this.getInitElement().then((data) => {
				if (data === null ) {
					this.setData({
						tabSwiperArr: [],
						good: [],
						currentPage: 0,
						currentGroupPage: 0,
						currentRecommendPage: 0,
						currentSpecialPage: 0,
						currentTab: 0
					})
			
					this.getData()
				} else {
					let goodListIdsData = this.getGoodListIdsData(data)
					this.getInitData(goodListIdsData)
				}
			}).then(() => {
				wx.stopPullDownRefresh()
			})
		})
	},
	phoneCall: function (e) {
		const phoneNumber = e.currentTarget.dataset.phonenumber || app.globalData.mobile
		wx.makePhoneCall({
			phoneNumber: phoneNumber
		})	  
	},
	//一级分类滚动
	scrollCategoryFitment:function(e){
		const scrollTypeArr = e.currentTarget.dataset.type.split('_'), i = scrollTypeArr[0]
		let changedPageArr = this.data.pageData
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
			changedPageArr[i].current = cur
			that.setData({
				pageData: changedPageArr
			})
		}else{
			changedPageArr[i].current = cur
			that.setData({
				pageData: changedPageArr
			})
		}
	},
	scrollCategory:function(e){
		//宽度
		var scrollWidth = parseInt(e.detail.scrollWidth)
		//滚动的距离
		var scrollLeft = parseInt(e.detail.scrollLeft)
		//屏幕的宽度
		var width = parseInt(this.data.winWidth)
		//剩余的分类
		var remain = parseInt(this.data.remain)
		var cur = Math.floor(scrollLeft / width)
		if (cur < 0) {
			cur = 0
		}
		var cateNum = Math.floor(scrollWidth / width)
		if (remain != 0 && scrollLeft >= (scrollWidth -width-(remain-1) * width/5)) {
			cur++
			this.setData({
				current: cur
			})
		}else{
			this.setData({
				current: cur
			})
		}
	},
	//跳转商品详情页
	bindDetail(e){
		if (e.currentTarget.dataset.id) {
			wx.navigateTo({
				url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
			})
		}
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
		//当前点击id,保存到globalData
		var idx = e.currentTarget.dataset.idx;
		app.globalData.classIdx =idx
		wx.switchTab({
			url: '/pages/category/category',
		})
	},
	onReachBottom: function (e) {
		const pageData = this.data.pageData
		if (pageData !== null) return
		wx.showLoading({
			title: '加载中',
		})
		let currentTab = this.data.currentTab, tabSwiperArr = this.data.tabSwiperArr;
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
