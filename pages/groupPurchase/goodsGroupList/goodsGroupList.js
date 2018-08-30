import {countDown} from "../../../utils/util"
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
		goodsId: 0,
		produList: [],
    image: app.globalData.image,
    grouponData: [],
		pageTimer: {},
		timeNum: 0,
		page: 0,
		flag: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		let that = this;
		// this.setData({goodsId: options.id})
		// console.log(options)
		this.grouponData(0, 14)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function (options) {
		console.log(options)
		// 清除定时器
		for (var key in this.data.pageTimer) {
			clearInterval(this.data.pageTimer[key]);
		}
		// 重置定时器
		this.setData({pageTimer: {}})
		this.setData({timeNum: 0})
		// 重置上拉加载的数据
		this.setData({page: 0})
		this.setData({flag: true})
		// 请求数据
		this.grouponData(0, 14)
		// 关闭下拉动画
		wx.stopPullDownRefresh();
  },
	// 上拉加载
	onReachBottom: function(options) {
		if (this.data.flag) {
		let that = this
		// loading
		that.data.page++
		wx.showLoading({
			title: '加载中',
		})
		wx.request({
			url: app.globalData.http + '/mpa/goods/'+14+'/groupons?per_page=8&page=' + that.data.page,
			header: {
				'Api-Ext': app.globalData.apiExt
			},
			dataType: 'json',
			method: 'GET',
			success: function (data) {
				if (data.statusCode == 200) {
					if (data.data.length>0){
						let dataHandle = data.data
						// 处理返回的data数据
						for (let i=0;i<dataHandle.length;i++) {
							dataHandle[i].timeStampArr = []
						}
						// 处理完成后把data赋值给grouponData
						that.setData({
							grouponData: that.data.grouponData.concat(dataHandle)
						})
						// 给每条数据加上倒计时定时器
						for (var key in that.data.pageTimer) {
							clearInterval(that.data.pageTimer[key]);
						}
						that.setData({pageTimer: {}})
						that.setData({timeNum: 0})
						that.countDownList(that.data.grouponData)
					} else {
						that.setData({flag: false})
					}
					wx.hideLoading()
				}
			}
		})
		}
	},
	// 调用接口获取数据
	grouponData (page, id) {
		let that = this
		wx.request({
			url: app.globalData.http + '/mpa/goods/'+id+'/groupons?per_page=8&page=' + page,
			header: {
				'Api-Ext': app.globalData.apiExt
			},
			dataType: 'json',
			method: 'GET',
			success: function (data) {
				if (data.statusCode == 200) {
					if (data.data.length>0){
						let dataHandle = data.data
						// 处理返回的data数据
						for (let i=0;i<dataHandle.length;i++) {
							// dataHandle[i].limit_at = 1
							dataHandle[i].timeStampArr = []
						}
						// 处理完成后把data赋值给grouponData
						that.setData({
							grouponData: dataHandle
						})
						// 给每条数据加上倒计时定时器
						that.countDownList(that.data.grouponData)
					}
				} else {
					wx.showLoading()
				}
			}
		})
	},
	// 添加定时器，剩余时间倒计时
	countDownList (arr) {
		let that = this;
		for (let i=0;i<that.data.grouponData.length;i++) {
			setTime(i)
			
			that.data.pageTimer['timer' + (that.data.timeNum++)] = setInterval(function(){
				setTime(i,that.data.pageTimer['timer' + (that.data.timeNum++)])
			},1000);
			if(arr[i].limit_at<0){
				clearInterval(that.data.pageTimer['timer' + (that.data.timeNum++)]);
			}
		}
			
		function setTime (i,timer) {
			var hour=0,
				minute=0,
				second=0;//时间默认值
					
			if(that.data.grouponData[i].limit_at < 0){
				clearInterval(timer);
			} else {
				hour = Math.floor(that.data.grouponData[i].limit_at / (60 * 60));
				minute = Math.floor(that.data.grouponData[i].limit_at / 60) - (hour * 60);
				second = Math.floor(that.data.grouponData[i].limit_at) - (hour * 60 * 60) - (minute * 60);
			}
			
			if (hour <= 9) hour = '0' + hour;
			if (minute <= 9) minute = '0' + minute;
			if (second <= 9) second = '0' + second;
			
			let tA = 'grouponData['+i+'].timeStampArr'
			that.setData({[tA]: [hour,minute,second]})
			
			// let limit = 'grouponData['+i+'].limit_at'
			// that.setData({[limit]: --that.data.grouponData[i].limit_at})
			that.data.grouponData[i].limit_at--;
		}
	},
  //返回顶部
  goTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    })
  },
	//跳转团购商品详情
	goDetail(e){
		wx.navigateTo({
			url: '/pages/groupShareDetails/groupShareDetails?id=' + e.currentTarget.dataset.id
		})
	},
})