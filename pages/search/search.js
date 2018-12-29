// pages/search/search.js
var app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
	dataList:[],
	image: 'http://image.yiqixuan.com/',
	keyword:''
  },
  onLoad:function(){
	this.setData({
	  keyword: app.globalData.keyword
	})
  },
	//input事件
	searchKey:function(e){
	var that=this
	if (e.detail.value){
	  wx.request({
		url: app.globalData.http + '/mpa/goods/search/suggest',
		data: {
		  keywords: e.detail.value
		},
		header: {
		  'Api-Ext': app.globalData.apiExt
		},
		dataType: 'json',
		method: 'GET',
		success: function (data) {
		  var code = data.statusCode.toString()
		  if (code == 500) {
			that.setData({
			  dataList: []
			})
		  } else if (code.indexOf('40') > -1) {
			var tip = data.data.message.toString()
			wx.showToast({
			  title: tip,
			  icon: 'none',
			  duration: 1000
			})
		  }
		  else {
			that.setData({
			  dataList: data.data
			})
		  }
		}
	  })
	}else{
	  that.setData({
		dataList: []
	  })
	}

	},
	//清除input输入
	clearKey(){
		this.setData({
			value:"",
	  dataList:[]
		})
	},
	// //处理点击完成按钮函数
	confirmEvent:(e)=>{
	console.log(e)
	if (e.detail.value!=''){
	  wx.navigateTo({
		url: '/pages/result/result?keyword=' + e.detail.value,
	  })
	}else{
	  wx.showToast({
		title: '请输入关键词',
		icon:"none",
		duration:2000
	  })
	}
	}
})