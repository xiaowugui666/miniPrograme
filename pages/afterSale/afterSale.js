var app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow:true,
    reasonID:5,
    saleArr:[],
    // apiKey:'',
    // apiSecret:'',
    orderId:'',
    image: 'http://image.yiqixuan.com/',
    info:'',
    reasonText:'其它 >',
    reason:[
      '物流太慢/收货太迟',
      '发错货',
      '尺码偏小',
      '尺码偏大',
      '脏污/色差',
      '其他'
    ],
    value:'',
    items:'',
    disabled:false,
    modalVisi: false
  },
  // 关闭模态框
  closeModal () {
    this.setData({
      modalVisi: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    var id=options.id;
    this.setData({
      orderId:id
    })
    wx.request({
      url: app.globalData.http +'/mpa/order/' + id,
      method: 'GET',
      dataType: 'json',
      header: {
        "Api-Key":app.globalData.apiKey,
        "Api-Secret":app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      success: function (data) {
        var newArr=[]
        var item = data.data.items
        var sale=[]
        for(var i=0;i<item.length;i++){
          if(item[i].is_select){
            item[i].isSelect = true
            newArr.push(item[i])
            sale.push(item[i].id)
          }
        }
        that.setData({
          items: data.data,
          info:newArr,
          saleArr:sale
        })
      }
    })

  },
  bindPickerChange:function(e){
    var id=e.detail.value
    var ids=parseInt(id) + 1
    this.setData({
      reasonID: ids,
      reasonText: this.data.reason[id] + ' >',
      isShow: true,
      disabled: false
    })
  },
  callPhone: () => {
    wx.makePhoneCall({
      phoneNumber: app.globalData.mobile
    })
  },
  select:function(event){
    var that=this
    var index=event.target.dataset.index
    var num = 'info[' + index + '].isSelect'
    var s=that.data.info[index].isSelect
    var sale = that.data.saleArr
    var newSale=[]
    if (that.data.info[index].isSelect){
      n--
    }else{
      n++
    }
    if (sale.indexOf(that.data.info[index].id)>-1){
        for(var i=0;i<sale.length;i++){
          if (sale[i] !== that.data.info[index].id) {
            newSale.push(sale[i])
          }
        }
        sale=newSale
    }else{
        sale.push(that.data.info[index].id)
    }
    that.setData({
      [num]:!s,
      saleArr:sale
    })
  },
  /*提交申请*/
  submit:function(){
    var that=this;
    if (that.data.saleArr.length==0){
      wx.showToast({
        title: '请选择退换货商品',
        icon:'none',
        duration:2000
      })
    }else{
      wx.request({
        url: app.globalData.http + '/mpa/after_sale',
        method: "POST",
        dataType: 'json',
        data: {
          order_id: that.data.orderId,
          reason: that.data.reasonID,
          remark: that.data.value,
          order_item_ids: that.data.saleArr
        },
        header: {
          "Api-Key": app.globalData.apiKey,
          "Api-Secret": app.globalData.apiSecret,
          'Api-Ext': app.globalData.apiExt
        },
        success: function (data) {
          var code = data.statusCode.toString()
          if (code.indexOf('20') > -1) {
            wx.showToast({
              title: '退款申请成功',
              icon: 'success',
              duration: 1000
            })
            setTimeout(function () {
              wx.navigateTo({
                url: '/pages/refundDetail/refundDetail?id=' + data.data.id
              })
            }, 1000)
          } else {
            var tip = data.data
            wx.showToast({
              title: tip.message,
              icon: 'none',
              duration: 1000
            })
          }
        }
      })
    }
  },
  // /*选择原因*/
  // selectReason:function(){
  //     var that=this;
  //     that.setData({
  //       isShow:false,
  //       disabled:true
  //     })
  // },
  // /*关闭选择原因*/
  // closeReason:function(){
  //     this.setData({
  //       isShow:true,
  //       disabled: false
  //     })
  // },

  remark:function(event){
    var value = event.detail.value
    this.setData({
        value:value
    })
  },
  // /*选择退货原因*/
  // chooseReason:function(event){
  //     var that=this;
  //     var id=event.target.dataset.reasonid;
  //     this.setData({
  //       reasonID:id,
  //       reasonText: that.data.reason[id-1]+' >',
  //       isShow: true,
  //       disabled: false
  //     })
  // }
})