app.json:
    "pages/index/index",   首页
    "pages/category/category", 分类
    "pages/shoppingCar/shoppingCar", 购物车
    "pages/user/user", 个人中心
    "pages/search/search", 搜索
    "pages/address/address", 我的地址
    "pages/surePay/surePay", 确认支付
    "pages/detail/detail", 商品详情
    "pages/result/result", 搜索结果
    "pages/afterSale/afterSale", 申请售后
    "pages/refundDetail/refundDetail",  售后详情
    "pages/logistics/logistics", 我的物流
    "pages/orderDetail/orderDetail", 订单详情
    "pages/orders/orders", 订单列表
    "pages/cart/cart", 商品详情中的购物车
    "pages/categoryList/categoryList", 分类列表
    "pages/shareDetail/shareDetail"  分享的商品详情

util:
  method.wxs:  toFix   保留2位小数点

  util.js:   一个公共方法


wxParse:富文本编译器转换成小程序语言

小程序自定义首页数据来源data中的`template`字段数据需在新零售项目中，自行添加相应template类型。
例如：小程序段新建一个name为`banner`的模板，则需在新零售项目中shopMenu中`banner`模块对应添加`{"template": "banner"}`

增加第二套皮肤信息

  1.“默认”皮肤为`default`
  2.“男装”皮肤为`blue`

新增gulp编译less文件:
    工作区为`src`目录，文件修改或新增后命令行输入`gulp`进行编译，新增`dist`目录，为目标目录。
    用微信开发者工具打开`dist`目录进行预览、上传等。

    1.npm install

    2.gulp

    