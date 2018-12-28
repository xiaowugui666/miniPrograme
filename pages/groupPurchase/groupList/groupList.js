// pages/groupList/goupList.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rank: 2,
    data: [],
    // data: [
    //   {
    //     goods: {
    //       id: 0,
    //       name: '橄榄绿半',
    //       cover_url: '2018/12/28/Fh2Nbvs2qr4rLczlXmIvGV4PtWle.jpg'
    //     },
    //     groupon: {
    //       expire_at: '2018年12月28日11:07:16'
    //     },
    //     members: {
          
    //     },
    //     sales_count: 1,
    //     groupon_user_count: 4,
    //     created_at: '2018年12月28日11:07:47',
    //     sku_description: '橄榄绿; xs',
    //     price: 200,
    //     origin_price: 100,
    //     groupon_id: 0, 
    //   },
    //   {
    //     goods: {
    //       id: 0,
    //       name: '橄榄绿半高领复古宽松欧美风针织套头毛衣欧美风针织套头毛衣欧美风针织套头毛衣欧美风针织套头毛衣',
    //       cover_url: '2018/12/28/Fh2Nbvs2qr4rLczlXmIvGV4PtWle.jpg'
    //     },
    //     order: {
    //       id: 0,
    //     },
    //     groupon: {
    //       expire_at: '2018年12月28日11:07:16'
    //     },
    //     sales_count: 1,
    //     groupon_user_count: 4,
    //     created_at: '2018年12月28日11:07:47',
    //     sku_description: '橄榄绿; xs',
    //     price: 200,
    //     origin_price: 100,
    //     groupon_id: 0,
    //   },
    //   {
    //     goods: {
    //       id: 0,
    //       name: '橄榄绿半高领复古宽松欧美风针织套头毛衣欧美风针织套头毛衣欧美风针织套头毛衣欧美风针织套头毛衣',
    //       cover_url: '2018/12/28/Fh2Nbvs2qr4rLczlXmIvGV4PtWle.jpg'
    //     },
    //     order: {
    //       id: 0,
    //     },
    //     groupon: {
    //       expire_at: '2018年12月28日11:07:16'
    //     },
    //     sales_count: 1,
    //     groupon_user_count: 4,
    //     created_at: '2018年12月28日11:07:47',
    //     sku_description: '橄榄绿; xs',
    //     price: 200,
    //     origin_price: 100,
    //     groupon_id: 0,
    //   },
    //   {
    //     goods: {
    //       id: 0,
    //       name: '橄榄绿半高领复古宽松欧美风针织套头毛衣欧美风针织套头毛衣欧美风针织套头毛衣欧美风针织套头毛衣',
    //       cover_url: '2018/12/28/Fh2Nbvs2qr4rLczlXmIvGV4PtWle.jpg'
    //     },
    //     order: {
    //       id: 0,
    //     },
    //     groupon: {
    //       expire_at: '2018年12月28日11:07:16'
    //     },
    //     sales_count: 1,
    //     groupon_user_count: 4,
    //     created_at: '2018年12月28日11:07:47',
    //     sku_description: '橄榄绿; xs',
    //     price: 200,
    //     origin_price: 100,
    //     groupon_id: 0,
    //   }
    // ],
    x:[0,1],
    image: 'http://image.yiqixuan.com/'
  },
  // 选择不同类型订单
  bindRank (e) {
    let rank = e.currentTarget.dataset.id;
    this.setData({
      rank:rank
    })
    this.getData();
  },
  // 查看订单详情
  toOrderDetail (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?id=' + id,
    })
  },
  // 立即购买，跳转商品详情
  toDetail (e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
    })
  },
  // 获取列表数据
  getData () {
    let that = this;
    wx.request({
      url: app.globalData.http + '/mpa/groupon',
      header: {
        "Api-Key": app.globalData.apiKey,
        "Api-Secret": app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      data: {
        status: that.data.rank
      },
      method: 'GET',
      success(res) {
        wx.hideLoading();
        if (res.statusCode == 200) {
          that.setData({
            data: res.data
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的拼团',
    })
    wx.showLoading({
      title: '加载中',
    })
    this.getData();
  }
})