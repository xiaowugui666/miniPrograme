const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		select:  '',
		image: 'https://image.51zan.com/',
		good: [],
		category: [],
		rank: 0,
		flag: 0,
		page: 0,
		categoryId: '',
		drawerShow: true,
		animationShow: true,
		isAll: true,
		leftTapArray: [],
		order_by: 'created_at desc',
		skinStyle: app.globalData.skinStyle
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
		let  cateArr = this.data.leftTapArray
		for (let i = 0, leng = cateArr.length; i < leng; i++) {
			cateArr[i].isSelect = false
			for (let j = 0, len = cateArr[i].children.length; j < len; j++) {
				cateArr[i].children[j].isSelect = false
			}
		}
		this.setData({
			isAll: true,
			categoryId: '',
			leftTapArray: cateArr,
			rank: 0,
			flag: 0,
			select: '',
			page: 0
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
			this.setData({
				select: '已选择二级类目'
			})
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
			categoryId: id,
			order_by: 'created_at desc',
			page: 0
		})
		this.onCloseModal()
		this.getData()
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
					page: 0,
					order_by: 'price asc',
				})
			} else if (flag == 1) {
				flag = 2
				this.setData({
					page: 0,
					order_by: 'price desc',
				})
			}
		} else if (currIndex == 1) {
			this.setData({
				page: 0,
				order_by: 'sales_count desc',
			})
			flag = 0
		} else {
			this.setData({
				page: 0,
				order_by: 'created_at desc',
			})
			flag = 0
		}
		this.setData({
			rank: currIndex,
			flag: flag
		})
		this.getData()
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
		if (this.data.select !== app.globalData.classIdx) {
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
				that.getData()
				wx.hideLoading();
			}
		})
	},
	getData (params) {
		const that = this, currentPage = this.data.page,orderBy = this.data.order_by, categoryId = this.data.categoryId;
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
				order_by: orderBy,
			},
			dataType: 'json',
			method: 'GET',
			success: function (data) {
				wx.hideLoading()
				if (data.statusCode >= 200 && data.statusCode < 300) {
					if (data.data.length === 0 && params === 'isConcat') {
						let newPage = that.data.page
						newPage--
						that.setData({
							page: newPage
						})
					} else if (params === 'isConcat') {
						let tempArr = that.data.good
						let newArr = tempArr.concat(data.data)
						that.setData({
							good:newArr
						})
					} else {
						that.setData({
							good: data.data
						})
					}
				}
			}
		})
	},
	onReachBottom: function (e) {
		let newPage = this.data.page
		newPage++
		this.setData({
			page: newPage
		})
		this.getData('isConcat')
	}
})