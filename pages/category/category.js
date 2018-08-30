const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
		select:0,
    image: 'http://image.yiqixuan.com/',
		leftTapArray:[],
		//是否存在二级分类
		second:1,
		//不存在二级分类的商品详情
		goods:[],
		//存在二级分类
		category: [],
    winHeight:''
  },
	//处理左侧楼层点击事件
	leftCellTap(e){
		let that = this,
    select = e.currentTarget.dataset.idx,
    tempArr = that.data.leftTapArray,
    category = tempArr[select].children;
    app.globalData.classIdx = select
		//存在二级分类
    that.setData({
      select: select
    })
    if (category.length){      
			that.setData({
				category:category,
        second: 1
			});
		}else{
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        url: app.globalData.http +'/mpa/goods/search',
        header: {
          'Api-Ext': app.globalData.apiExt
        },
        data: {
          category_id: tempArr[select].id,
          page:0,
          order_by:"created_at desc"
        },
        success(res) {
          that.setData({
            goods: res.data,
            category: category,
            second:2
          })
          wx.hideLoading();
        }
      })
		}
	},
	//点击二级分类
	goList(e) {
		wx.navigateTo({
			url: '/pages/categoryList/categoryList?category_id=' + e.currentTarget.dataset.id + "&name=" + e.currentTarget.dataset.name,
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
    let that = this;
		wx.showLoading({
			title: '加载中',
		})
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winHeight: res.windowHeight
        });
      }
    });
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
        
        if (leftSelectedIdx > res.data.length-1){
          res.data[0].selected = true
          leftSelectedIdx = 0,
          app.globalData.classIdx=0
          that.setData({
            select:0,
          })
        }else{
          res.data[leftSelectedIdx].selected = true
        }
				that.setData({
					category:res.data[leftSelectedIdx].children,
					leftTapArray:res.data,
          second:1
				})
        if (res.data[leftSelectedIdx].children.length==0){
          wx.request({
            url: app.globalData.http + '/mpa/goods/search',
            data: {
              category_id: res.data[leftSelectedIdx].id,
            },
            header: {
              'Api-Ext': app.globalData.apiExt
            },
            success(data) {
              that.setData({
                goods: data.data,
                second:2
              })
            }
          })
        }
			},
      complete:function(){
        wx.hideLoading();
      }
		})
  }
})