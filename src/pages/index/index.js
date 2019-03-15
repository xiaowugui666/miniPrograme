//index.js
//获取应用实例
const app=getApp();
Page({
	data: {
		//分类
		image: 'https://image.51zan.com/',
		description: {},
		remain:"",
		keyword:'',
		winWidth:'',
		skinStyle: app.globalData.skinStyle,
        pageData: [],
	},
	// 获取当前数组中为商品列表模块的商品ID数据,同时根据不同模块的需求进行数据处理
    getGoodListIdsData: function (data) {
        let goodListIdsData = [], postDataList = JSON.parse(JSON.stringify(data))
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
			}
		});
        this.setData({
            pageData: data
        })
        return goodListIdsData
	},
	// 切换tab
	onChangeTab: function (e) {
		const clickArray = e.currentTarget.dataset.value.split("_")
		let changeArr = this.data.pageData
		changeArr[parseFloat(clickArray[0])].currentTab = parseFloat(clickArray[1])
		this.setData({
			pageData: changeArr
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
		this.getInitElement().then((data) => {
			let goodListIdsData = this.getGoodListIdsData(data)
			this.getInitData(goodListIdsData)
			app.login()
		})
	},
	//下拉刷新
	onPullDownRefresh: function () {
		this.getInitElement().then((data) => {
			let goodListIdsData = this.getGoodListIdsData(data)
			this.getInitData(goodListIdsData)
		}).then(() => {
			wx.stopPullDownRefresh()
		})
		
	},
	phoneCall: function (e) {
		const phoneNumber = e.currentTarget.dataset.phonenumber
		wx.makePhoneCall({
			phoneNumber: phoneNumber
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
						that.setData({
							pageData: res.data.data
						})
						resolve(res.data.data)
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
	//一级分类滚动
	scrollCategory:function(e){
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
		var cur = Math.floor(scrollLeft / (width / 2))
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
		//当前点击id,保存到globalData
		var idx = e.currentTarget.dataset.idx;
		app.globalData.classIdx =idx
		wx.switchTab({
			url: '/pages/category/category',
		})
	},
})
