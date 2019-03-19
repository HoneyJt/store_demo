// pages/to-pay-order/index.js

const api = require('../../utils/request.js')
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalScoreToPay:100,
    goodsList:[],
    isNeedLogistics: 2, // 是否需要物流信息
    allGoodsPrice:20,
    yunPrice:10,
    allGoodsAndYunPrice:50,
    goodsJsonStr:"",
    orderType: "",//订单类型，购物车下单或立即支付下单，默认是购物车，
    pingtuanOpenId:undefined,//拼团记录id

    hasNoCoupons:true,
    coupons:[],
    youhuijine: 0, //优惠券金额
    curCoupon: null // 当前选择使用的优惠券
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isNeedLogistics:1,
      orderType:options.orderType,
      pingtuanOpenId:options.pingtuanOpenId
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    var shopList = []
    //立即下单
    if("buyNow"==that.data.orderType){
       var buyNowInfoMem = wx.getStorageSync('buyNowInfo')
       that.data.kjId = buyNowInfoMem.kjId
       if(buyNowInfoMem && buyNowInfoMem.shopList){
         shopList = buyNowInfoMem.shopList
       }
    }else{
      //购物车下单
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo')
      that.data.kjId = shopCarInfoMem.kjId
      if(shopCarInfoMem && shopCarInfoMem.shopList){
        shopList = shopCarInfoMem.shopList.filter(function(curItem){
          return curItem.active
        })
      }
    }
    that.setData({
      goodsList:shopList
    })
    that.initShippingAddress()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 新增收货地址
   */
  addAddress:function(e){
     wx.navigateTo({
       url: '/pages/address-add/index',
     })
  },
  /**
   * 选择收货地址
   */
  selectAddress:function(){
    wx.navigateTo({
      url: '/pages/select-address/index',
    })
  },
  /**
   * 选择优惠券
   */
  bindChangeCoupon:function(e){
    const selIndex = e.detail.value[0] - 1;
    if(selIndex == -1){
      this.setData({
        youhuijine:0,
        curCoupon:null
      })
      return;
    }
    this.setData({
      youhuijine:this.data.coupons[selIndex].money,
      curCoupon:this.data.coupons[selIndex]
    })
  },
  /**
   * 初始化收货地址
   */
  initShippingAddress:function(){
    var that = this
    api.fetchRequest('/user/shipping-address/default',{
      token: wx.getStorageSync('token')
    }).then(function(res){
      if(res.data.code == 0){
        that.setData({
          curAddressData:res.data.data
        })
      } else {
        that.setData({
          curAddressData:null
        })
      }
      that.processYunfei();
    })
  },
  /**
   * 计算运费
   */
  processYunfei:function(){
    var that = this
    var goodsList = this.data.goodsList
    var goodsJsonStr = "["
    var isNeedLogistics = 0;
    var allGoodsPrice = 0

    for(let i=0;i < goodsList.length;i++){
      let carShopBean = goodsList[i];
      if (carShopBean.logistics){
        isNeedLogistics = 1
      }
      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = ''
      if(i>0){
        goodsJsonStrTmp = ',';
      }

      let inviter_id = 0
      let inviter_id_storge = wx.getStorageSync('inviter_id_' + carShopBean.goodsId)
      if(inviter_id_storge){
         inviter_id = inviter_id_storge
      }

      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"propertyChildIds":"' + carShopBean.propertyChildIds + '","logisticsType":0, "inviter_id":' + inviter_id + '}';
      goodsJsonStr += goodsJsonStrTmp;

      goodsJsonStr += "]"

      that.setData({
        isNeedLogistics:isNeedLogistics,
        goodsJsonStr:goodsJsonStr
      })

      that.createOrder()
    } 
  },
  /**
   * 创建订单
   */
  createOrder:function(e){
    wx.showLoading()
    var that = this
    //用户登录 token
    var loginToken = wx.getStorageSync('token')
    //备注信息
    var remark = "";
    if(e){
      remark = e.detail.value.remark
    }

    var postData = {
      token:loginToken,
      goodsJsonStr:that.data.goodsJsonStr,
      remark:remark
    };
    if(that.data.kjId){
      postData.kjId = that.data.kjId
    }

    if(that.data.pingtuanOpenId){
      postData.pingtuanOpenId = that.data.pingtuanOpenId
    }

    if(that.data.isNeedLogistics > 0){
      if(!that.data.curAddressData){
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: '请先设置您的收货地址',
          showCancel:false
        })
        return
      }
      postData.provinceId = that.data.curAddressData.provinceId
      postData.cityId = that.data.curAddressData.cityId
      if (that.data.curAddressData.districtId) {
        postData.districtId = that.data.curAddressData.districtId
      }
      postData.address = that.data.curAddressData.address
      postData.linkMan = that.data.curAddressData.linkMan
      postData.mobile = that.data.curAddressData.mobile
      postData.code = that.data.curAddressData.code
    }
    if(that.data.curCoupon){
      postData.couponId = that.data.curCoupon.id
    }

    if(!e){
      postData.calculate = "true"
    }
    api.fetchRequest('/order/create',postData,'POST',0,{
      'content-type': 'application/x-www-form-urlencoded'
    }).then(function(res){
      if(res.data.code != 0){
         wx.showModal({
           title: '错误',
           content: res.data.msg,
           showCancel:false
         })
         return
      }
      //购买成功 清空购物车
      if(e && "buyNow" != that.data.orderType){
        wx.removeStorageSync('shopCarInfo')
      }
      if(!e){
        that.setData({
          totalScoreToPay:res.data.data.score,
          isNeedLogistics:res.data.data.isNeedLogistics,
          allGoodsPrice: res.data.data.amountTotle,
          allGoodsAndYunPrice: res.data.data.amountLogistics + res.data.data.amountTotle,
          yunPrice:res.data.data.amountLogistics
        })
        that.getMyCoupons()
        return
      }

      api.fetchRequest('/template-msg/wxa/formId',{
        token:wx.getStorageSync('token'),
        type:'form',
        formId:e.detail.formId
      })
      //配置模板消息
      var postJsonString = {}
      postJsonString.keyword1 = { value: res.data.data.dateAdd, color: '#173177' }
      postJsonString.keyword2 = { value: res.data.data.amountReal + '元', color: '#173177' }
      postJsonString.keyword3 = { value: res.data.data.orderNumber, color: '#173177' }
      postJsonString.keyword4 = { value: '订单已关闭', color: '#173177' }
      postJsonString.keyword5 = { value: '您可以重新下单，请在30分钟内完成支付', color: '#173177' }
      app.sendTempleMsg(res.data.data.id, -1,
        'mGVFc31MYNMoR9Z-A9yeVVYLIVGphUVcK2-S2UdZHmg', '',
        'pages/index/index', JSON.stringify(postJsonString));
      postJsonString = {};
      postJsonString.keyword1 = { value: '您的订单已发货，请注意查收', color: '#173177' }
      postJsonString.keyword2 = { value: res.data.data.orderNumber, color: '#173177' }
      postJsonString.keyword3 = { value: res.data.data.dateAdd, color: '#173177' }
      //sendTempleMsg 小程序推送消息
      app.sendTempleMsg(res.data.data.id, 2,
        'Arm2aS1rsklRuJSrfz-QVoyUzLVmU2vEMn_HgMxuegw', '',
        'pages/order-details/index?id=' + res.data.data.id, JSON.stringify(postJsonString));
      
      wx.redirectTo({
        url: '/pages/order-list/index',
      })
    }).finally(function(){
      wx.hideLoading()
    })
  },
  getMyCoupons:function(){
     var that = this
    api.fetchRequest('/discounts/my',{
      token:wx.getStorageSync('token'),
      status:0
    }).then(function(res){
      if(res.data.code ==0){
        var coupons = res.data.data.filter(function(res){
          return res.moneyHreshold <= that.data.allGoodsAndYunPrice;
        })
        if(coupons.length > 0){
          that.setData({
            hasNoCoupons:false,
            coupons:coupons
          })
        }
      }
    })
  }
})