import {countDown} from "../../../utils/util"
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
		showPage:false,
		produList: [],
    image: app.globalData.image,
		remainingTime: 0,
		timeStampArr: [],
    groupid: '', // 拼团id
    goodsgrouponid: '',// 拼团商品id
		groupData: {},
		goodsData: {},
    puerchaseInfo: {},
    groupPerson: [],
		groupMembers: [],
		groupGoodsList: [],
		groupFull: false, // 团是否满员
		purchased: false, // 是否已参团
		user_info: {},
    hasUserInfo: false,
		// 选择商品规格弹窗
    chooseModal: false,
    //定义动画
    animationData: {},
    //商品规格数据
    spec: [],// 商品规格
    specType: '',
    num:1,
    groupSpecType:'',
    chooseSpec: [],
    //具体规格商品
    goodsid:'', // 商品id
    good:{},
    goodPrice: 0,
    goodUrl: "",
    imgs: {},
    description: '',
    isSharePage: '',
    content:'',
    //是否有规格
    isSpec: false,
    spec: [],
    skus:[],
    specType: '',
    chooseSpec: [],
    current: 0,
    cartNum: 0,
    show: 2,
    stockShown: 1,
    //有规格的时候点击确定
    userId:false,
    flag: 1,
    formId:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		let that = this;
		this.setData({
      user_info: app.globalData.user_info,
      hasUserInfo: app.globalData.user_info.nickName || app.globalData.user_info.nick_name ? true : false,
      userId: app.globalData.userId,
      goodsid: options.goodsid,
      groupid: options.groupid
    })

    // 如果为分享的页面
    if (app.globalData.options.path == 'pages/groupPurchase/groupShareDetails/groupShareDetails' && (app.globalData.options.scene == 1007 || app.globalData.options.scene == 1008 || app.globalData.options.scene == 1044)) {
      //获取店家描述数据
      wx.request({
        url: app.globalData.http + '/mpa/index',
        method: 'GET',
        header: {
          'Api-Ext': app.globalData.apiExt
        },
        success(res) {
          app.globalData.mobile = res.data.customer_service_mobile
          app.globalData.logo_url = res.data.logo_url
          app.globalData.name = res.data.name
          that.setData({
            description: res.data,
            isSharePage: true
          })
          app.globalData.keyword = res.data.search_default_text
        },
        fail: function (res) {
          console.log(res)
        }
      })
    }

    //获取商品规格
    wx.request({
      url: app.globalData.http + '/mpa/goods/' + options.goodsid + '/specs',
      header: {
        'Api-Ext': app.globalData.apiExt
      },
      success(data) {
        if (data.statusCode == 200) {
          if (Object.prototype.toString.call(data.data) == '[object Array]') {
            that.setData({
              isSpec: false
            })
          } else {
            var specs = []
            var specType = []
            for (var key in data.data) {
              specs.push(data.data[key])
              let specArr = [];
              for (let i = 0, len = data.data[key].propertis.length; i < len; i++) {
                let specObj = {
                  ite: '',
                  optional: false
                };
                specObj.ite = data.data[key].propertis[i]
                specArr.push(specObj)
              }
              data.data[key].propertis = specArr
              specType.push(key)
            }
            var chooseSpec = []
            for (var i = 0; i < specType.length; i++) {
              chooseSpec.push(-1)
            }
            that.setData({
              spec: specs,
              specType: specType,
              chooseSpec: chooseSpec,
              isSpec: true
            })
          }
        } else {
          wx.showToast({
            title: '规格信息加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })

    // 获取商品规格详情列表
    wx.request({
      url: app.globalData.http + '/mpa/goods/' + options.goodsid + '/groupon_goods/skus',
      header: {
        'Api-Ext': app.globalData.apiExt
      },
      success(res) {
        if (res.statusCode == 200) {
          that.setData({
            skus: res.data
          })
        } else {
          wx.showToast({
            title: '数据加载失败',
            icon: 'none'
          })
        }
      }
    })
		
    if (JSON.stringify(this.data.user_info) == "{}") {
      const getUser = this.getUserInfo()
      getUser.then((res) => {
        that.setData({
          user_info: res.data,
          hasUserInfo: res.data.nickName || res.data.nick_name ? true : false,
          userId: res.data.user_id ? true : false
        })
        // 获取拼团详情
        this.getGroupData(options.groupid) // options.groupid
      }).then(() => {
        this.setData({showPage:true})
      }).catch(err => {
        wx.showToast({
          title: '授权请求失败，请稍后重试',
          icon: 'none'
        })
      })
    } else {
      // 获取拼团详情
      this.getGroupData(options.groupid) // options.groupid

      this.setData({showPage:true})
    }

  },
	// 获取拼团商品数据
	getGroupData (groupid) {
		let that = this
    wx.showLoading({
      title: '加载中'
    })
    // 请求当前拼团团成员
    wx.request({
      url: app.globalData.http + '/mpa/groupon/' + groupid + '/members',
      header: {
        'Api-Key': app.globalData.apiKey,
        'Api-Secret': app.globalData.apiSecret,
        'Api-Ext': app.globalData.apiExt
      },
      method: 'GET',
      success(res) {
        if (res.statusCode == 200) {
          let tempArr = res.data;

          wx.request({
            url: app.globalData.http + '/mpa/groupon/' + groupid,
            header: {
              'Api-Key': app.globalData.apiKey,
              'Api-Secret': app.globalData.apiSecret,
              'Api-Ext': app.globalData.apiExt
            },
            dataType: 'json',
            method: 'GET',
            success: function (data) {
              wx.hideLoading();
              if (data.statusCode == 200) {
                let dataHandle = data.data
                if (dataHandle) {
                  that.setData({
                    goodsData: dataHandle,
                    goodPrice: dataHandle.groupon_goods.price_low,
                    goodUrl: dataHandle.goods.cover_url,
                    stockShown: dataHandle.goods.stock_shown
                  })
                  if (dataHandle.count_down > 0 && dataHandle.status != 4) {
                    that.setData({
                      groupFull: dataHandle.remain_user_count <= 0,
                      remainingTime: dataHandle.count_down,
                      purchased: dataHandle.join && dataHandle.join.id && dataHandle.join.status > 1 ? true : false
                    })

                    countDown(that, that.data.remainingTime, that.data.timeStampArr)

                    // 对groupPerson数组进行处理
                    let personArr = JSON.parse(JSON.stringify(tempArr));
                    if (dataHandle.remain_user_count > 0 && dataHandle.join_count > 4) { // 团未满,并且参团人数大于4
                      if (dataHandle.join) { // 用户已参团
                        let tempItem = '', firstItem = personArr.splice(0, 1);
                        for (let i = personArr.length - 1; i >= 0; i--) {
                          if (personArr[i].user_id == dataHandle.join.user_id) {
                            tempItem = personArr.splice(i, 1);
                          }
                        }
                        if (tempItem != '') {
                          personArr.unshift(tempItem[0]);
                        }
                        personArr.unshift(firstItem[0]);
                      }

                      personArr.splice(4,personArr.length - 4);
                    } else if (dataHandle.remain_user_count <= 0 && dataHandle.join_count > 5) { //团已满，且参团人数大于5
                      if (dataHandle.join) {
                        let tempItem = '', firstItem = personArr.splice(0, 1);
                        for (let i = personArr.length - 1; i >= 0; i--) {
                          if (personArr[i].user_id == dataHandle.join.user_id) {
                            tempItem = personArr.splice(i, 1);
                          }
                        }
                        if (tempItem != '') {
                          personArr.unshift(tempItem[0]);
                        }
                        personArr.unshift(firstItem[0]);
                      }
                      personArr.splice(5,personArr.length - 5);
                    }
                    that.setData({
                      groupPerson: personArr
                    })

                    // 如果此用户已购买
                    if (dataHandle.join) {
                      that.setData({
                        puerchaseInfo: dataHandle.join
                      })
                    }
                    // 如果团已满，请求其他团的列表
                    if (that.data.groupFull) {
                      that.grouponData(that.data.goodsid)
                    }
                  } else {
                    // 若结束时间等于0，请求团购商品列表
                    wx.request({
                      url: app.globalData.http + '/mpa/groupon_goods?per_page=5',
                      header: {
                        'Api-Key': app.globalData.apiKey,
                        'Api-Secret': app.globalData.apiSecret,
                        'Api-Ext': app.globalData.apiExt
                      },
                      dataType: 'json',
                      method: 'GET',
                      success: function (res) {
                        if (res.statusCode == 200) {
                          let data = res.data
                          if (data && data.length > 0) {
                            that.setData({ groupGoodsList: data })
                          }
                        }
                      }
                    })
                  }
                  // 把获取的后台数据赋值给groupData
                  that.setData({
                    groupData: dataHandle
                  })
                }
              } else {
                if (data.statusCode == 404) {
                  wx.showToast({
                    title: '未找到该团',
                    icon: 'none',
                    duration: 2000
                  })
                } else {
                  wx.showToast({
                    title: '请求失败',
                    icon: 'none',
                    duration: 2000
                  })
                }
              }
            },  
            fail(res) {
            }
          })
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      }
    })
	},
	// 获取此商品拼团列表
	grouponData (id) {
		let that = this
		wx.request({
			url: app.globalData.http + '/mpa/goods/'+id+'/groupons?per_page=3&page=0',
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
						// 处理完成后把data赋值给groupMembers
						that.setData({
							groupMembers: dataHandle
						})
						// 给每条数据加上倒计时定时器
						that.countDownList(that.data.groupMembers)
					}
				} else {
					wx.showToast({
            title: '获取拼团列表失败',
            icon: 'none',
            duration: 2000
          })
				}
			}
		})
	},
	// 添加定时器，剩余时间倒计时
  countDownList (arr) {
    let that = this;
    for (let i = that.data.groupMembers.length - 1; i >= 0; i--) {
      if (that.data.groupMembers.length == 0) {
        return false
      }
      setTime(i)

      that.data.groupMembers[i].timer = setInterval(function () {
        if (that.data.groupMembers.length == 0) {
          return false
        }
        setTime(i, that.data.groupMembers[i].timer)
        // 如果某一项倒计时结束
        if (arr[i].count_down <= 0) {

          let list = JSON.parse(JSON.stringify(that.data.groupMembers));
          list.splice(i, 1)
          that.setData({
            groupMembers: list
          })
          that.countDownList(that.data.groupMembers)
        }
      }, 1000);

    }

    function setTime(i, timer) {
      var hour = 0,
        minute = 0,
        second = 0;//时间默认值

      if (that.data.groupMembers[i].count_down < 0) {
        clearInterval(timer);
      } else {
        hour = Math.floor(that.data.groupMembers[i].count_down / (60 * 60));
        minute = Math.floor(that.data.groupMembers[i].count_down / 60) - (hour * 60);
        second = Math.floor(that.data.groupMembers[i].count_down) - (hour * 60 * 60) - (minute * 60);
      }

      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;

      let tA = 'groupMembers[' + i + '].timeStampArr'
      that.setData({ [tA]: [hour, minute, second] })

      // let limit = 'grouponData['+i+'].limit_at'
      // that.setData({[limit]: --that.data.grouponData[i].limit_at})
      that.data.groupMembers[i].count_down--;
    }
  },
	// 若user_info为空，则请求信息接口
	getUserInfo () {
		const pro = new Promise((resolve, reject) => {
			let that = this
			wx.login({
				success(code) {
					//向后台发起请求，传code
					wx.request({
						url: app.globalData.http + '/mpa/wechat/auth',
						method: 'POST',
						data: {
							code: code.code
						},
						header: {
							'Api-Ext': app.globalData.apiExt
						},
						success: function (res) {
							//保存响应头信息
							var code = res.statusCode
							if (code >= 200 && code < 300) {
                if (res.header["api-key"] && res.header["api-secret"]) {
                  var apiKey = res.header["api-key"],
                    apiSecret = res.header["api-secret"];
                } else if (res.header["Api-Key"] && res.header["Api-Secret"]) {
                  var apiKey = res.header["Api-Key"],
                    apiSecret = res.header["Api-Secret"];
                }
                //设置storage
                //获取时间戳保存storage
                // let timestamp = Date.parse(new Date());
                app.globalData.apiKey = apiKey
                app.globalData.apiSecret = apiSecret
								resolve(res)
							}
						},
						fail: function (res) {
              reject(res)
						}
					})
				},
				fail: function (res) {
          reject(res)
				}
			})
		})
		return pro
	},
  // 规格是否可选函数
  specOptional(skus) {
    let spec = this.data.spec;
    for (let i = 0, length = spec.length; i < length; i++) {
      // 将所有optional置为false
      for (let k = 0, le = spec[i].propertis.length; k < le; k++) {
        spec[i].propertis[k].optional = false
      }
      // 相应skus中
      for (let j = 0, len = skus.length; j < len; j++) {
        if (spec[i].name == skus[j].spec_a) {
          for (let k = 0, le = spec[i].propertis.length; k < le; k++) {
            if (spec[i].propertis[k].ite == skus[j].property_a) {
              spec[i].propertis[k].optional = true
            }
          }
        } else if (spec[i].name == skus[j].spec_b) {
          for (let k = 0, le = spec[i].propertis.length; k < le; k++) {
            if (spec[i].propertis[k].ite == skus[j].property_b) {
              spec[i].propertis[k].optional = true
            }
          }
        } else if (spec[i].name == skus[j].spec_c) {
          for (let k = 0, le = spec[i].propertis.length; k < le; k++) {
            if (spec[i].propertis[k].ite == skus[j].property_c) {
              spec[i].propertis[k].optional = true
            }
          }
        }
      }
    }
    this.setData({
      spec: spec
    })
  },
	/* 规格选择弹出事件 */
	submit(e) {
		var that = this;
    that.setData({
      flag: e.detail.target.dataset.flag,
      joinGroupId: e.detail.target.dataset.groupid || that.data.goodsData.id
    })
    let unPay = e.detail.target.dataset.detail;
    if (that.data.goodsData.join) {
      if (unPay == '1' && that.data.goodsData.join.status == 1) {
        wx.showToast({
          title: '您有未支付的参团订单，无法继续参团。请前往完成支付~',
          icon: 'none',
          duration: 5000
        })
        return false;
      }
    }
		// 有规格
		if (that.data.isSpec) {
      let skus = that.data.skus;
      that.specOptional(skus)
      that.setData({
        formId: e.detail.formId,
        goodPrice: that.data.goodsData.groupon_goods.price_low,
        chooseSpec: []
      })

      //创建一个动画实例
      var animation = wx.createAnimation({
        //动画持续事件
        duration: 500,
        //定义动画效果
        timingFunction: 'linear'
      })
      //将该变量赋值给当前动画
      that.animation = animation;
      //现在Y轴偏移，然后用step()完成一个动画
      animation.translateY(400).step();
      that.setData({
        animationData: animation.export(),
        chooseModal: true
      })
      //设置setTimeout改变Y轴偏移量
      setTimeout(function () {
        animation.translateY(0).step();
        that.setData({
          animationData: animation.export()
        })
      }, 100)
		}
		else {
			wx.request({
				url: app.globalData.http + '/mpa/goods/' + that.data.goodsData.goods_id + '/skus',
				method: "GET",
				header: {
					'Api-Ext': app.globalData.apiExt
				},
				success(res) {
					var good = res.data[0]
					that.setData({
						good: good,
						goodUrl: good.cover_url,
						goodPrice: good.price
					}, function () {
						// 点击一键开团
						// 赋值app.globalData
						let good = that.data.good;
						good.name = that.data.goodsData.goods.name;
            good.priceLow = that.data.goodsData.groupon_goods.price_low;
						good.goods_id = that.data.goodsData.goods_id;
						good.goods_sku_id = that.data.good.id;
            good.group_id = that.data.joinGroupId;
            good.groupInfo_id = that.data.goodsData.groupon_goods.id;
						good.count = 1;
						good.groupFormId = e.detail.formId;
            good.buy_limit_count = that.data.goodsData.buy_limit_count;
            good.price = that.data.goodsData.groupon_goods.origin_price_low;

						app.globalData.good = [];
						app.globalData.good.push(good);
            let urlParam = that.data.flag == 1 ? '0' : '1'
            wx.navigateTo({
              url: '/pages/groupPurchase/groupSurePay/groupSurePay?isjoin=' + urlParam,
            })
					})
				}
			})
		}
	},

  //选择规格事件
  chooseSpecs(e) {
    let that = this;
    //已选择规格索引
    let aIndex = e.target.dataset.id,
      bIndex = e.target.dataset.index,
      disabled = e.target.dataset.disabled,
      chooseSpec = that.data.chooseSpec;
    if (!disabled) {
      return
    }
    let aArr = [], bArr = [], textSpec = 'chooseSpec[' + aIndex + ']';
    if (chooseSpec[aIndex] != undefined && chooseSpec[aIndex] != -1 && chooseSpec[aIndex] == bIndex) { // 已选规格再次选择，置灰
      that.setData({
        [textSpec]: -1,
        good: {}
      })
      let lastChoose = chooseSpec.every(function (v) {
        return v == -1
      })
      if (lastChoose) {
        let skus = that.data.skus;
        that.specOptional(skus)
      }
    } else {
      that.setData({ // 未选择则为选中状态
        [textSpec]: bIndex
      })
      // 选中当前规格时，判断其他种类规格是否可选
      let spec = that.data.spec;
      let skus = that.data.skus;
      let specArr = ['spec_a', 'spec_b', 'spec_c'], propertyArr = ['property_a', 'property_b', 'property_c'];
      // 将除当前选中种类规格外其他种类规格置灰
      for (let i = 0, leng = spec.length; i < leng; i++) {
        if (i != aIndex) {
          for (let j = 0, len = spec[i].propertis.length; j < len; j++) {
            spec[i].propertis[j].optional = false
          }
        }
      }
      that.setData({
        spec: spec
      })
      // 判断其他种类规格可选状态
      for (let i = 0, leng = spec.length; i < leng; i++) {
        if (i != aIndex) {
          for (let j = 0, len = skus.length; j < len; j++) {
            if (spec[aIndex].propertis[bIndex].ite == skus[j][propertyArr[aIndex]]) {
              for (let k = 0, le = spec[i].propertis.length; k < le; k++) {
                if (spec[i].propertis[k].ite == skus[j][propertyArr[i]]) {
                  spec[i].propertis[k].optional = true
                }
              }
            }
          }
        }
      }
      that.setData({
        spec: spec
      })
      // 如果所有规格均已选择
      let chooseAll = false;
      if (chooseSpec.length == spec.length) {
        chooseAll = true;
        for (let i = 0, len = chooseSpec.length; i < len; i++) {
          if (chooseSpec[i] < 0 || chooseSpec[i] == undefined) {
            chooseAll = false
          }
        }
      }
      if (chooseAll) {
        // 重置数量选择框状态
        that.setData({
          num: 1,
          minusStatus: 'disabled'
        })
        // 找出选定sku
        let sku = {};
        for (let j = 0, len = skus.length; j < len; j++) {
          if (chooseSpec.length == 1) {
            if (spec[0].name == skus[j][specArr[0]] && spec[0].propertis[chooseSpec[0]].ite == skus[j][propertyArr[0]]) {
              sku = skus[j]
            }
          } else if (chooseSpec.length == 2) {
            if (
              spec[0].name == skus[j][specArr[0]] && spec[0].propertis[chooseSpec[0]].ite == skus[j][propertyArr[0]]
              &&
              spec[1].name == skus[j][specArr[1]] && spec[1].propertis[chooseSpec[1]].ite == skus[j][propertyArr[1]]
            ) {
              sku = skus[j]
            }
          } else if (chooseSpec.length == 3) {
            if (
              spec[0].name == skus[j][specArr[0]] && spec[0].propertis[chooseSpec[0]].ite == skus[j][propertyArr[0]]
              &&
              spec[1].name == skus[j][specArr[1]] && spec[1].propertis[chooseSpec[1]].ite == skus[j][propertyArr[1]]
              &&
              spec[2].name == skus[j][specArr[2]] && spec[2].propertis[chooseSpec[2]].ite == skus[j][propertyArr[2]]
            ) {
              sku = skus[j]
            }
          }
        }
        wx.request({
          url: app.globalData.http + '/mpa/goods_sku/' + sku.id,
          header: {
            'Api-Ext': app.globalData.apiExt
          },
          success(res) {
            sku.stock_count = res.data.stock_count;
            if (res.data.stock_count > 0) {
              that.setData({
                good: sku,
                goodUrl: sku.cover_url,
                goodPrice: sku.price
              })
            } else {
              that.setData({
                good: sku,
                goodUrl: sku.cover_url,
                goodPrice: sku.price
              })
              wx.showToast({
                title: '该规格库存不足',
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }
    }
  },
  // 关闭规格选择框
	closeTips: function () {
		var that = this
		//动画效果
		var animation = wx.createAnimation({
			duration: 500,
			timingFunction: 'linear'
		})
		that.animation = animation
		animation.translateY(450).step()
		that.setData({
			animationData: animation.export()
		})
		setTimeout(function () {
			animation.translateY(0).step()
			that.setData({
				animationData: animation.export(),
				chooseModal: false
			})
		}, 500)
	},
  //点击确认，关闭弹出框
  closeModal(e) {
    let that = this;
    let spec = that.data.spec, chooseSpec = that.data.chooseSpec;
    let chooseAll = true;
    // 判断规格是否选择完整
    for (let i = 0, len = chooseSpec.length; i < len; i++) {
      if (chooseSpec[i] < 0 || chooseSpec[i] == undefined) {
        chooseAll = false
      }
    }
    if (!chooseAll || chooseSpec.length !== spec.length) {
      wx.showToast({
        title: '请选择规格',
        icon: "none"
      })
      return false
    }

    //动画效果
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(450).step()
    that.setData({
      animationData: animation.export()
    })
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        chooseModal: false
      })
    }, 500)
    //跳转页面,携带参数
    let clickId = e.currentTarget.dataset.id;

    if(JSON.stringify(that.data.good)!='{}' && that.data.good.stock_count > 0){
      let good = that.data.good;
      good.count = that.data.num;
      good.goods_sku_id = that.data.good.id;
      good.name = that.data.goodsData.goods.name;
      good.groupInfo_id = that.data.goodsData.groupon_goods.id;
      good.goods_id = that.data.goodsData.goods.id;
      good.groupFormId = that.data.formId;
      good.group_id = that.data.joinGroupId;
      good.buy_limit_count = that.data.goodsData.buy_limit_count;      
      good.priceLow = good.price;
      good.price = good.origin_price;

      if (that.data.chooseSpec.length == 1) {
        good.sku_description = good.spec_a + ':' + good.property_a
      } else if (that.data.chooseSpec.length == 2) {
        good.sku_description = good.spec_b + ':' + good.property_b + ',' + good.spec_a + ':' + good.property_a
      } else if (that.data.chooseSpec.length == 3) {
        good.sku_description = good.spec_b + ':' + good.property_b + ',' + good.spec_a + ':' + good.property_a + ',' + good.spec_c + ':' + good.property_c
      }
      app.globalData.good = []
      app.globalData.good.push(good)
      let urlParam = that.data.flag == 1 ? '0' : '1'  
      wx.navigateTo({
        url: '/pages/groupPurchase/groupSurePay/groupSurePay?isjoin=' + urlParam,
      })
    }
  },
  /* 点击减号 */
  bindMinus() {
    var num = this.data.num;
    //num大于1时才做自减
    if (num > 1) {
      num--
    }
    //大于1件时为normal状态，否则为disabled状态
    var minusStatus = num <= 1 ? "disabled" : "normal";
    this.setData({
      num: num,
      minusStatus: minusStatus,
      minusStatuss: 'normal'
    })
  },
  bindPlus() {
    var num = this.data.num;
    if (num >= this.data.goodsData.stock_count) {
      var minusStatus = 'disabled'
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
    } else if (num >= this.data.goodsData.buy_limit_count && this.data.goodsData.buy_limit_count) {
      minusStatus = 'disabled';
      let that = this;
      wx.showToast({
        title: '每名用户最多拼' + that.data.goodsData.buy_limit_count + '份商品',
        icon: 'none',
        duration: 2000
      })
    } else {
      num++
      minusStatus = 'normal'

    }
    this.setData({
      num: num,
      minusStatus: 'normal',
      minusStatuss: minusStatus
    })
  },
  // 获取用户信息
  getInfo: function (e) {
    let that = this
    if (e.detail.userInfo) {
      var userInfo = e.detail.userInfo;
      if (!that.data.user_info.nick_name) {
        app.globalData.avatar_url = userInfo.avatarUrl
        app.globalData.nick_name = userInfo.nick_name
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        wx.login({
          success(code) {
            //获取用户信息，拿到userInfo
            //向后台发起请求，传code
            wx.request({
              url: app.globalData.http + '/mpa/wechat/auth',
              method: 'POST',
              header: {
                'Api-Ext': app.globalData.apiExt
              },
              data: {
                code: code.code
              },
              success: function (res) {
                wx.hideLoading();                
                var code = res.statusCode.toString()
                if (code == 500) {
                  wx.showToast({
                    title: '网络错误',
                    icon: 'none',
                    duration: 1000
                  })
                } else if (code.indexOf('40') > -1) {
                  var tip = res.data.message.toString()
                  wx.showToast({
                    title: tip,
                    icon: 'none',
                    duration: 1000
                  })
                }
                else {
                  //保存响应头信息
                  if (res.header["api-key"] && res.header["api-secret"]) {
                    var apiKey = res.header["api-key"],
                      apiSecret = res.header["api-secret"];
                  } else if (res.header["Api-Key"] && res.header["Api-Secret"]) {
                    var apiKey = res.header["Api-Key"],
                      apiSecret = res.header["Api-Secret"];
                  }
                  //设置storage
                  //获取时间戳保存storage
                  // let timestamp = Date.parse(new Date());
                  app.globalData.apiKey = apiKey
                  app.globalData.apiSecret = apiSecret
                  that.setData({
                    user_info: userInfo,
                    hasUserInfo: true
                  })
                  wx.setStorage({
                    key: 'huzan_avatarUrl',
                    data: userInfo,
                  })
                  wx.request({
                    url: app.globalData.http + '/mpa/wechat/' + res.data.id,
                    method: "PUT",
                    data: {
                      "nick_name": userInfo.nickName,
                      "avatar_url": userInfo.avatarUrl,
                      "gender": userInfo.gender,
                      "city": userInfo.city,
                      "province": userInfo.province,
                      "country": userInfo.country,
                      "language": userInfo.language
                    },
                    header: {
                      "Api-Key": app.globalData.apiKey,
                      "Api-Secret": app.globalData.apiSecret,
                      'Api-Ext': app.globalData.apiExt
                    },
                    complete(res) {
                    }
                  })
                  if (res.data.user_id) {
                    app.globalData.userId = true
                    that.setData({
                      userId: true
                    })
                  }
                }
              }
            })
          },
          fail: function (res) {
          }
        })
        this.setData({
        })
      } else {
        // 如果已经有授权，
      }
    }
  },
  // 获取用户手机号
  getPhoneNum: function (e) {
    let that = this
    if (e.detail.encryptedData && e.detail.iv) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.login({
        success(code) {
          wx.request({
            url: app.globalData.http + '/mpa/wechat/auth',
            method: 'POST',
            header: {
              'Api-Ext': app.globalData.apiExt
            },
            data: {
              code: code.code
            },
            success: function (res) {
              var codes = res.statusCode.toString()
              if (codes >= 200 && codes < 300) {
                //保存响应头信息
                if (res.header["api-key"] && res.header["api-secret"]) {
                  var apiKey = res.header["api-key"],
                    apiSecret = res.header["api-secret"];
                } else if (res.header["Api-Key"] && res.header["Api-Secret"]) {
                  var apiKey = res.header["Api-Key"],
                    apiSecret = res.header["Api-Secret"];
                }
                app.globalData.apiKey = apiKey
                app.globalData.apiSecret = apiSecret
                wx.request({
                  url: app.globalData.http + '/mpa/user/login',
                  method: 'post',
                  data: {
                    encrypted: e.detail.encryptedData,
                    iv: e.detail.iv
                  },
                  dataType: 'json',
                  header: {
                    "Api-Key": apiKey,
                    "Api-Secret": apiSecret,
                    'Api-Ext': app.globalData.apiExt
                  },
                  success: function (data) {
                    wx.hideLoading();
                    var datas = data.statusCode.toString()
                    if (datas >= 200 && datas < 300) {
                      app.globalData.user_info = res.data
                      if (data.header["api-key"] && data.header["api-secret"]) {
                        var apiKey = data.header["api-key"],
                          apiSecret = data.header["api-secret"];
                      } else if (data.header["Api-Key"] && data.header["Api-Secret"]) {
                        var apiKey = data.header["Api-Key"],
                          apiSecret = data.header["Api-Secret"];
                      }
                      app.globalData.apiKey = apiKey
                      app.globalData.apiSecret = apiSecret
                      var timestamp = new Date().getTime()
                      wx.setStorage({
                        key: 'timestamp',
                        data: timestamp,
                      })
                      wx.setStorage({
                        key: 'apiKey',
                        data: apiKey,
                      })
                      wx.setStorage({
                        key: 'apiSecret',
                        data: apiSecret,
                      })
                      wx.setStorage({
                        key: 'userId',
                        data: true,
                      })
                      app.globalData.userId = true
                      that.setData({
                        userId: true
                      })
                    } else {
                      var tip = data.data.message.toString()
                      wx.showToast({
                        title: tip,
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  }
                })
              } else {
                wx.hideLoading();
                var tip = res.data.message.toString()
                wx.showToast({
                  title: tip,
                  icon: 'none',
                  duration: 2000
                })
              }
            }
          })
        }
      })
    }
  },
	//跳转团购商品详情
	goDetail(e){
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id
		})
	},
	// 分享信息
	onShareAppMessage(options) {
    let that = this;
		return {
      title: that.data.groupData.goods.description || that.data.groupData.goods.name,
			path: '/pages/groupPurchase/groupShareDetails/groupShareDetails?groupid='+that.data.groupid+'&goodsid='+that.data.goodsid,
      imageUrl: that.data.image + that.data.groupData.goods.cover_url
		}
	},
})