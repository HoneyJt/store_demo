// pages/goods-details/index.js

const api = require('../../utils/request.js')
//获取全局的app实例
var app = getApp()
var WxParse = require('../../wxParse/wxParse.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    autoplay:true,
    interval:3000,
    duration:1000,
    goodsDetail:{},
    swiperCurrent:0,
    hasMoreSelect:false,
    selectSize:"选择: ",
    selectSizePrice:0,
    totalScoreToPay:0,
    shopNum:0,
    hideShopPopup:true,//隐藏底部弹出视图
    buyNumber:0,
    buyNumMin:1,
    buyNumMax:0,

    propertyChildIds:"",
    propertyChildNames:"",
    canSubmit:false,// 选中规格尺寸时候是否允许加入购物车
    shopCarInfo:{},
    shopType:"addShopCar",//购物类型 加入购物车或立即购买,默认为加入购物车
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    
    var that = this
    that.data.kjId = options.kjId
    //取出缓存的购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function(res) {
        that.setData({
          shopCarInfo:res.data,
          shopNum:res.data.shopNum
        })
      },
    })
    
    api.fetchRequest('/shop/goods/detail',{
      id:options.id
    }).then(function(res){
      console.log(res)
      var selectSizeTemp = ""
      if (res.data.data.properties){
         for(var i=0;i<res.data.data.properties.length;i++){
            selectSizeTemp = selectSizeTemp + " " + res.data.data.properties[i].name;
         }
         that.setData({
           hasMoreSelect:true,
           selectSize:that.data.selectSize + selectSizeTemp,
           selectSizePrice:res.data.data.basicInfo.minPrice,
           totalScoreToPay:res.data.data.basicInfo.minScore,
         })
      }
         /**
          * 如果包含拼团
          */
          if(res.data.data.basicInfo.pingtuan){
            that.pingtuanList(options.id)
          }
          that.data.goodsDetail = res.data.data;
          /**
           * 包含视频
           */
          if(res.data.data.basicInfo.videoId){
             that.getVideoSrc(res.data.data.basicInfo.videoId)
          }
          that.setData({
            goodsDetail:res.data.data,
            selectSizePrice:res.data.data.basicInfo.minPrice,
            totalScoreToPay:res.data.data.basicInfo.minScore,
            buyNumMax:res.data.data.basicInfo.stores,
            buyNumber:(res.data.data.basicInfo.stores > 0) ? 1:0
          })
          /**
           * 将服务端的html转换成json
           */
          WxParse.wxParse('article','html',res.data.data.content,that,5)
      })
      // 获取商品好评信息
      this.reputation(options.id)
      //去砍价
      this.getKanjiaInfo(options.id)
  },
  /**
   * 去砍价
   */
  getKanjiaInfo:function(goodsId){
    var that = this;
    if(!app.globalData.kanjiaList || app.globalData.kanjiaList.length == 0){
       that.setData({
         curGoodsKanjia:null
       });
       return;
    }
    //找到商品list中商品id === 当前商品详情的id
    let curGoodsKanjia = app.globalData.kanjiaList.find(ele =>{
       return ele.goodsId = goodsId
    })
    if(curGoodsKanjia){
      that.setData({
        curGoodsKanjia:curGoodsKanjia
      })
    }else{
      that.setData({
        curGoodsKanjia:null
      })
    }
  },

  /**
   * 商品好评信息
   */
  reputation:function(goodsId){
    var that = this;
    api.fetchRequest('/shop/goods/reputation',{
      goodsId: goodsId
    }).then(function(res){
      if(res.data.code == 0){
        that.setData({
          reputation:res.data.data
        })
      }
    })
  },
  /**
   * 获取视频信息
   */
  getVideoSrc:function(videoId){
    var that = this;
    api.fetchRequest('/media/video/detail',{
      videoId:videoId
    }).then(function(res){
      console.log(res)
      that.setData({
        videoMp4Src:res.data.data.fdMp4
      })
    })
  },
  /**
   * 拼团
   */
  pingtuanList:function(goodsId){
    var that = this;
    api.fetchRequest('/shop/goods/pingtuan/list',{
      goodsId:goodsId
    }).then(function(res){
      console.log(res)
      if(res.data.code == 0){
        that.setData({
          pingtuanList:res.data.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
     return {
       title:this.data.goodsDetail.basicInfo.name,
       path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + wx.getStorageSync('uid'),
       success:function(res){
         console.log('转发成功')
       },
       fail:function(res){

       }
     }
  },
  /**
   * 去砍价
   */
  goKanjia:function(e){
    var that = this
    if(!that.data.curGoodsKanjia){
      return;
    }
    api.fetchRequest('/shop/goods/kanjia/join',{
      kjId:this.data.curGoodsKanjia.id,
      token:wx.getStorageSync('token')
    }).then(function(res){
      if(res.data.code == 0){
        wx.navigateTo({
          url: "/pages/kanjia/index?kjId=" + res.data.data.kjId + "&joiner=" + res.data.data.uid + "&id=" + res.data.data.goodsId
        })
      } else {
        wx.showModal({
          title: '错误',
          content: res.data.msg,
          showCancel:false
        })
      }
    })


  },
  /**
   * 去拼单
   */
  toPingtuan:function(e){
    let pingtuanopenid = e.currentTarget.dataset.pingtuanopenid
    wx.navigateTo({
      url: '/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=' + pingtuanopenid,
    })
  },
  /**
   * 去购物车
   */
  goShopCar:function(e){
    wx.reLaunch({
      url: '/pages/shop-cart/index',
    })
  },

  /**
   * 加入购物车
   */
  addShopCar:function(e){
    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
      if (!this.data.canSubmit) {
        wx.showModal({
          title: '提示',
          content: '请选择商品规格',
          showCancel: false
        })
      }
      this.bindGuiGeTap()
      return
    }
    //购买数量小于1
    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0!',
        showCancel: false
      })
      return;
    }

    if (this.data.buyNumber < 1) {
      wx.showModal({
        title: '提示',
        content: '购买数量不能为0',
        showCancel: false
      })
      return;
    }

    //组建购物车信息
    var shopCarInfo = this.buildShopCanInfo();
    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    });
    //本地存储
    wx.setStorage({
      key: 'shopCarInfo',
      data: shopCarInfo,
    })
    //隐藏选择信息的弹框
    this.closePopupTap()
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
  },
  /**
   * 加入购物车 如果没有详情数据和没有选择商品规格提示 购买数量不能小于1
   */
  toAddShopCar:function(e){
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  /**
   * 购物车信息组建
   */
  buildShopCanInfo:function(){
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var shopCarInfo = this.data.shopCarInfo;
    if(!shopCarInfo.shopNum){
      shopCarInfo.shopNum = 0;
    }

    if(!shopCarInfo.shopList){
      shopCarInfo.shopList = []
    }
    var hasSameGoodsIndex = -1;
    for(var i=0;i<shopCarInfo.shopList.length;i++){
       var tmpShopCarMap = shopCarInfo.shopList[i]
       if(tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds){
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number
        break;
       }
    }
    
    //判断购物车有没有这个商品 有就+1 没有就添加
    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if(hasSameGoodsIndex > -1){
      shopCarInfo.shopList.splice(hasSameGoodsIndex,1,shopCarMap)
    }else{
      shopCarInfo.shopList.push(shopCarMap)
    }
    shopCarInfo.kjId = this.data.kjId;
    return shopCarInfo;
  },
  /**
   * 立即购买
   */
  tobuy:function(e){
    this.setData({
      shopType: "tobuy",
      selectSizePrice:this.data.goodsDetail.basicInfo.minPrice
    })
    this.bindGuiGeTap();
  },

  buyNow:function(e){
    let that = this
    let shoptype = e.currentTarget.dataset.shopType
    if(this.data.goodsDetail.properties && !this.data.canSubmit){
      if(!this.data.canSubmit){
        wx.showModal({
          title: '提示',
          content: '请选择商品规格',
          showCancel:false
        })
        this.bindGuiGeTap()
        return
      }
    }
    if(this.data.buyNumber < 1){
       wx.showModal({
         title: '提示',
         content: '购买数量不能为0!',
         showCancel:false
       })
       return
    }
    //组件立即购买的信息
    var buyNowInfo = this.buildBuyNowInfo(shoptype)

    //存储信息
    wx.setStorage({
      key: 'buyNowInfo',
      data: buyNowInfo,
    })
    this.closePopupTap();
    if (shoptype == 'toPingtuan'){
      /**
       * 去拼团
       */
      if (this.data.pingtuanopenid){
         wx.navigateTo({
           url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + this.data.pingtuanopenid
         })
      }else{
        api.fetchRequest('/shop/goods/pingtuan/open',{
          token:wx.getStorageSync('token'),
          goodsId:that.data.goodsDetail.basicInfo.id
        }).then(function(res){
          if(res.data.code != 0){
            wx.showToast({
              title: res.data.msg,
              icon:'none',
              duration:2000
            })
            return
          }
          wx.navigateTo({
            url: "/pages/to-pay-order/index?orderType=buyNow&pingtuanOpenId=" + res.data.data.id
          })
        })
      }
    }else{
      wx.navigateTo({
        url: "/pages/to-pay-order/index?orderType=buyNow"
      })
    }
  },
  /**
   * 组建立即购买的数据
   */
  buildBuyNowInfo:function(shoptype){
    var shopCarMap = {}
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    if (shoptype == 'toPingtuan'){
      shopCarMap.price = this.data.goodsDetail.basicInfo.pingtuanPrice;
    }
    shopCarMap.score = this.data.totalScoreToPay;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var buyNowInfo = {}
    if(!buyNowInfo.shopNum){
      buyNowInfo.shopNum = 0;
    }

    if(!buyNowInfo.shopList){
      buyNowInfo.shopList = []
    }

    //立即购买就是直接付款
    buyNowInfo.shopList.push(shopCarMap);
    buyNowInfo.kjId = this.data.kjId;
    return buyNowInfo;
  },
  /**
   * 隐藏尺码页面
   */
  closePopupTap:function(e){
     this.setData({
       hideShopPopup:true
     })
  },
  /**
   * 点击了某一个尺寸
   */
  labelItemTap:function(e){
     var that = this;
     /**
      * 取消当前选中分类下子类目的选中状态
      */
    var childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
    for(var i=0;i<childs.length;i++){
      that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
    }
    //设置当前选中状态
    that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
    //获取选中的尺寸和规格
    var needSelectNum = that.data.goodsDetail.properties.length;
    var curSelectNum = 0;
    var propertyChildIds = "";
    var propertyChildNames = "";
    //循环分类
    for(var i=0;i<that.data.goodsDetail.properties.length;i++){
       //遍历对应分类的尺寸和规格
       childs = that.data.goodsDetail.properties[i].childsCurGoods
       for(var j=0;j<childs.length;j++){
         if(childs[j].active){
           curSelectNum++
           propertyChildIds = propertyChildIds + that.data.goodsDetail.properties[i].id + ":" + childs[j].id + ','
           propertyChildNames = propertyChildNames + that.data.goodsDetail.properties[i].name + ":" + childs[j].name + ','
         }
       }
    }
    var canSubmit = false;
    if(needSelectNum == curSelectNum){
      canSubmit = true
    }
    //计算价格
    if(canSubmit){
      api.fetchRequest('/shop/goods/price',{
        goodsId:that.data.goodsDetail.basicInfo.id,
        propertyChildIds:propertyChildIds
      }).then(function(res){
        that.setData({
          selectSizePrice:res.data.data.price,
          totalScoreToPay:res.data.data.score,
          propertyChildIds:propertyChildIds,
          propertyChildNames:propertyChildNames,
          buyNumMax:res.data.data.stores,
          buyNumber:(res.data.data.stores > 0) ? 1:0
        })
      })
    }
    console.log(that.data.goodsDetail)
    this.setData({
      goodsDetail:that.data.goodsDetail,
      canSubmit:canSubmit
    })

  },
  /**
   * 减去购买数量
   */
  numJianTap:function(e){
    if(this.data.buyNumber > this.data.buyNumMin){
      this.setData({
        buyNumber: this.data.buyNumber - 1
      })
    }
  },
  /**
   * 增加购买数量
   */
  numJiaTap:function(e){
    if (this.data.buyNumber > this.data.buyNumMin) {
      this.setData({
        buyNumber: this.data.buyNumber + 1
      })
    } 
  },
  /**
   * banner滚动监听
   */
  swiperchange:function(e){
    this.setData({
      swiperCurrent:e.detail.current
    })
  },
  /**
   * 规格弹出框
   */
  bindGuiGeTap:function(e){
    console.log(e)
    this.setData({
      hideShopPopup:false
    })
  },
})