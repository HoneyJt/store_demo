/**
 * 页面加载:获取banner滚动图--获取商品类别列表--获取首页商品信息--获取优惠券列表--获取中间滚动消息提示
 */

//index.js
//获取应用实例
const api = require('../../utils/request.js')
const CONFIG = require('../../config.js')
const app = getApp()

Page({
  data: {
    indicatorDots:true,
    autoplay:true,
    interval:3000,
    duration:1000,
    loadingHidden:false,//loading
    userInfo:{},
    swiperCurrent:0,
    selectCurrent:0,
    categories:[],
    circle:true,//是否轮播

    activeCategoryId:0,
    goods:[],
    scrollTop:0,
    cateScrollTop:0,//设置类别滚动

    loadingMoreHidden:true,//加载更多
    hasNoCoupons:true,
    coupons:[],
    searchInput:'',

    curPage:1,//分页
    pageSize:20 //每页20条

  },
  onLoad: function () {
    var that = this;
    //获取当前屏幕的宽高
    wx.getSystemInfo({
      success: function (res) {
         that.setData({
           screenWidth:res.screenWidth
         })
      },
    })
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    /**
     * 请求banner
     */
    api.fetchRequest('/banner/list',{
      key:'mallName'
    }).then(function(res){
      if(res.data.code == 404){
        wx.showModal({
          title: '提示',
          content: '请在后台添加 banner 轮播图',
          showCancel:false
        })
      }else{
        that.setData({
          banners:res.data.data
        })
      }
    }).catch(function(res){
      wx.showToast({
        title: res.data.msg,
        icon:'none'
      })
    })

    /**
     * 获取商品信息
     */
    api.fetchRequest('/shop/goods/category/all').then(function (res){
      var categories = [{
        id:0,
        name:'全部'
      }];
      if(res.data.code == 0){
         for(var i=0;i<res.data.data.length;i++){
            categories.push(res.data.data[i])
         }
      }
      that.setData({
        categories:categories,
        activeCategoryId:0,
        curPage:1
      });
      that.getGoodsList(0)  
    })
    that.getNotice()
    that.getCoupons()
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh:function(){
     this.setData({
       curPage:1
     })
     this.getGoodsList(this.data.activeCategoryId)
  },
  /**
   * 上拉加载更多
   */
  onReachBottom:function(){
    this.setData({
      curPage:this.data.curPage + 1
    })
    this.getGoodsList(this.data.activeCategoryId,true)
  },
  /**
   * 获取商品信息
   * categoryId:获取不同类型的商品
   * append:是不是加载更多
   */
  getGoodsList:function(categoryId,append){
     if(categoryId == 0){
       categoryId = '';
     }
     var that = this;
     wx.showLoading({
       "mask":true
     })
     api.fetchRequest('/shop/goods/list',{
       categoryId:categoryId,
       nameLike:this.data.searchInput,
       page:this.data.curPage,
       pageSize:this.data.pageSize
     }).then(function(res){
       console.log(res.data.data)
       wx.hideLoading()
       if(res.data.code == 404 || res.data.code == 700){
         let newData = {
           loadingMoreHidden:false
         }
        //  如果不是添加更多数据
        console.log('--------------------',res)
         if(!append){
           newData.goods = []
         }
         that.setData(newData)
         return
       }
       let goods = []
       if(append){
         goods = that.data.goods;
       }
       for(var i=0;i<res.data.data.length;i++){
         goods.push(res.data.data[i])
       }
       that.setData({
         loadingMoreHidden:true,
         goods:goods
       })
     })
  },
  /**
   * 获取所有的优惠券
   */
  getCoupons:function(){
    var that = this;
    api.fetchRequest('/discounts/coupons').then(function(res){
      
      if(res.data.code==0){
        that.setData({
          hasNoCoupons:false,
          coupons:res.data.data
        })
      }
    })
  },
  /**
   * 点击某一张优惠券
   */
  gitCoupon:function(e){
     var that = this;
     api.fetchRequest('/discounts/fetch',{
       id:e.currentTarget.dataset.id,
       token:wx.getStorageSync('token')
     }).then(function(res){
       if(res.data.code == 20001 || res.data.code == 20002){
          wx.showModal({
            title: '错误',
            content: '来晚了',
            showCancel:false
          })
          return;
       }
       if(res.data.code == 20003){
          wx.showModal({
            title: '错误',
            content: '您已经领过该优惠券~',
            showCancel:false
          })
          return;
       }
       if(res.data.code == 30001){
         wx.showModal({
           title: '错误',
           content: '您的积分不足',
           showCancel:false
         })
         return;
       }
       if(res.data.code == 20004){
         wx.showModal({
           title: '错误',
           content: '已过期~',
           showCancel:false
         })
         return;
       }
       if(res.data.code == 0){
         wx.showToast({
           title: '领取成功,赶紧去下单吧~',
           icon:'success',
           duration:2000
         })
       }else{
         wx.showModal({
           title: '错误',
           content: res.data.msg,
           showCancel:false
         })
       }
     })
  },
  /**
   * 获取商品打折消息提示
   */
  getNotice:function(){
    var that = this
    api.fetchRequest('/notice/list',{pageSize:5}).then(function (res){
      if(res.data.code == 0){
        that.setData({
          noticeList:res.data.data,
        })
      }
    })
  },
  /**
   * 监听轮播图滚动改变
   */
  swiperchange:function(e){
    this.setData({
      swiperCurrent:e.detail.current
    })
  },
  /**
   * 点击滚动的banner
   */
  tapBanner:function(e){
    if(e.currentTarget.dataset.id != 0){
       wx.navigateTo({
         url: '/pages/goods-details/index?id=' + e.currentTarget.dataset.id,
       })
    }
  },
  /**
   * 跳转到商品详情
   */
  toDetailTap:function(e){
    wx.navigateTo({
      url: '/pages/goods-details/index?id=' + e.currentTarget.dataset.id,
    })
  },
  /**
   * 选中某一个类别
   */
  tabClick:function(e){
    console.log(e)
    var offset = e.currentTarget.offsetLeft;
    if(offset>this.data.screenWidth/2){
      offset = offset - this.data.screenWidth / 2
    }else{
      offset = 0;
    }
    this.setData({
      activeCategoryId: e.currentTarget.id,
      curPage:1,
      cateScrollTop:offset
    })
    this.getGoodsList(this.data.activeCategoryId)
  },
  /**
   * 监听输入框输入
   */
  listenerSearchInput:function(e){
    this.setData({
      searchInput: e.detail.value,
    })
  },
  /**
   * 去搜索
   */
  toSearch:function(){
    this.setData({
      curPage:1
    })
    this.getGoodsList(this.data.activeCategoryId)
  },
  onShareAppMessage:function(){
    return {
      title:wx.getStorageSync('mallName') + '--' + CONFIG.shareProfile,
      path:'/pages/index/index',
      success:function(res){

      },
      fail:function(res){
        
      }
    }
  }
})
