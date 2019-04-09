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

自定义首页说明： 

  约定：
    1.`template`字段与template中的name一一对应。
    2.每个data中的`type`数据数据结构为`${number}_${number}`,分割符前的数字表示该项在所有页面元素中索引，分隔符后的数字表示该项在自身data内部索引。
    3.若商家未进行过店铺装修操作，`/mpa/index/decoration`接口返回值`data`字段为`null`，则此时小程序首页逻辑执行未自定义首页逻辑。`data`为`[]`或其它，均为进行过店铺装修，则执行自定义首页逻辑，根据数据显示页面元素。
    4.轮播图和单张图片模块可以上传图片也可以选择网络图片，读取字段分别为`img_url`、`img_path`。
    5.拼团、特价、推荐三个营销活动，增加额外字段`mark`，用于标记该item下`data`中的商品id是否为普通商品。标记规则，1-拼团，2-特价，3-推荐

  小程序自定义首页数据来源data中的`template`字段数据需在新零售项目中，自行添加相应template类型。
  例如：小程序段新建一个name为`banner`的模板，则需在新零售项目中shopMenu中menuData文件下，`banner`模块对应添加`{"template": "banner"}`

增加第二套皮肤信息

  1.“默认”皮肤为`default`
  2.“男装”皮肤为`blue`

新增gulp编译less文件:

    1.npm install

    2.npm run start // 开发环境
      npm run test // 测试环境
      npm run build // 正式环境

  工作区为`src`目录，工作时命令行输入`npm run dev`进行编译，输出目录`dist`为目标目录。
    用微信开发者工具打开`dist`目录进行预览、上传等。
    <b>上传时ext.json中`extEnable`的值需为false，目前默认为`npm run dev`时打包为`true`，其它打包为`false`</b>

    