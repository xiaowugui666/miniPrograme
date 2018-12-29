const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		select:0,
		image: 'http://image.yiqixuan.com/',
		good: [],
		category: [],
		rank: 0,
		flag: 0,
		page: 0,
		categoryId: '',
		drawerShow: false,
		animationShow: false,
		isAll: true,
		leftTapArray: []
	},
	onTouchMove () {},
	onDetail (e) {
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id
		})
	},
	onOpenModal () {
		this.setData({
			drawerShow: true,
			animationShow: true
		})
	},
	onCloseModal () {
		const that = this;
		that.setData({
			animationShow: false
		}, function () {
			setTimeout(() => {
				that.setData({
					drawerShow: false
				})
			}, 300);
		})
	},
	selectAll () {
		this.setData({
			isAll: true,
			categoryId: '',
			rank: 0,
			flag: 0
		})
		app.globalData.classIdx = ''
		this.onCloseModal()
		this.getData()
	},
	selectCategory (e) {
		const tempObj = e.currentTarget.dataset, id = e.currentTarget.dataset.id
		let parentIndex = tempObj.parentcateindex, cateArr = this.data.leftTapArray
		if (tempObj.hasOwnProperty('childcateindex')) {
			let childcateindex = tempObj.childcateindex
			for (let i = 0, leng = cateArr.length; i < leng; i++) {
				cateArr[i].isSelect = false
				for (let j = 0, len = cateArr[i].children.length; j < len; j++) {
					cateArr[i].children[j].isSelect = false
				}
			}
			cateArr[parentIndex].children[childcateindex].isSelect = true
		} else {
			for (let i = 0, leng = cateArr.length; i < leng; i++) {
				cateArr[i].isSelect = false
				for (let j = 0, len = cateArr[i].children.length; j < len; j++) {
					cateArr[i].children[j].isSelect = false
				}
			}
			cateArr[parentIndex].isSelect = true
		}
		this.setData({
			leftTapArray: cateArr,
			isAll: false,
			rank: 0,
			flag: 0,
			categoryId: id
		})
		this.onCloseModal()
		this.getData({
			order_by: 'created_at desc',
		})
	},
	// //排序方式点击
	bindRank(e) {
		//当前所点击排序方式
		var currIndex = e.currentTarget.dataset.id;
		var flag = this.data.flag;
		//判断价格排序方式
		if (currIndex == 2) {
			if (flag == 0 || flag == 2) {
				flag = 1
				this.setData({
					page: 0
				})
				this.getData({
					order_by: 'price desc',
				})
			} else if (flag == 1) {
				flag = 2
				this.setData({
					page: 0
				})
				this.getData({
					order_by: 'price asc',
				})
			}
		} else if (currIndex == 1) {
			this.setData({
				page: 0
			})
			flag = 0
			this.getData({
				order_by: 'sales_count desc',
			})
		} else {
			this.setData({
				page: 0
			})
			flag = 0
			this.getData({
				order_by: 'created_at desc',
			})
		}
		this.setData({
			rank: currIndex,
			flag: flag
		})
	},
	//点击商品跳转商品详情
	goDetail(e){
		wx.navigateTo({
			url: '/pages/detail/detail?id='+e.currentTarget.dataset.id,
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onShow: function () {
		if (this.data.select != app.globalData.classIdx) {
			this.onLoad()
		}
	},
	onLoad: function () {
		let that = this;
		wx.showLoading({
			title: '加载中',
		})
		that.setData({
			select: app.globalData.classIdx,
			keyword: app.globalData.keyword,
			leftTapArray:[]
		})
		//请求一级分类，设置data数据
		wx.request({
			url: app.globalData.http + '/mpa/category',
			header: {
				'Api-Ext': app.globalData.apiExt
			},
			success(res){
				let leftSelectedIdx = app.globalData.classIdx;
				if (leftSelectedIdx > res.data.length - 1 || leftSelectedIdx === '') {
					app.globalData.classIdx = ''
					that.setData({
						isAll: true,
						categoryId: ''
					})
				} else {
					res.data[leftSelectedIdx].isSelect = true
					that.setData({
						isAll: false,
						categoryId: res.data[leftSelectedIdx].id
					})
				}
				that.setData({
					leftTapArray:res.data,
				})
			},
			complete:function(){
				that.getData({
					order_by: 'created_at desc'
				})
				wx.hideLoading();
			}
		})
	},
	onReady: function (option) {
		
	},
	getData (params) {
		const that = this, currentPage = this.data.page, categoryId = this.data.categoryId;
		wx.showLoading({
			title: '加载中'
		})
		//所有商品
		wx.request({
			url: app.globalData.http + '/mpa/goods/search',
			header: {
				'Api-Ext': app.globalData.apiExt
			},
			data: {
				page: currentPage,
				category_id: categoryId,
				...params,
			},
			dataType: 'json',
			method: 'GET',
			success: function (data) {
				wx.hideLoading()
				that.setData({
					good:data.data
				})
			}
		})
	},
	onReachBottom: function (e) {
		console.log('分类页触底加载更多功能尚未完成')
	}
})