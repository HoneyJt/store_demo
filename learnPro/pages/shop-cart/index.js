// pages/shop-cart/index.js

const api = require('../../utils/request.js')
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList:{
      saveHidden:true,
      totalPrice:0,
      totalScoreToPay:0,
      allSelect:true,
      noSelect:false,
      list:[]
    },
    delBtnWidth:120, //删除按钮宽度单位
  },
  /**
   * 获取自适应的后的实际宽度
   */
  getEleWidth:function(w){
    var real = 0;
    try{
      var res = wx.getSystemInfoSync().windowWidth;
      //75宽度 对应按钮 120
      var scale = 750/w
      real = Math.floor(res / scale)
      return real
    }catch(e){
       return false
    }
  },
  /**
   * 删除按钮宽度
   */
  initEleWidth:function(){
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth)
    this.setData({
      delBtnWidth:delBtnWidth
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initEleWidth()
  },
  /**
   * 编辑还是保存
   */
  getSaveHide:function(){
    var saveHidden = this.data.goodsList.saveHidden
    return saveHidden
  },
  /**
   * 全不选
   */
  noSelect:function(){
    var list = this.data.goodsList.list
    var noSelect = 0
    for(var i=0;i<list.length;i++){
      var curItem = list[i]
      if(!curItem.active){
        noSelect++
      }
    }
    if(noSelect == list.length){
       return true
    }else{
      return false
    }
  },
  /**
   * 全选
   */
  allSelect:function(){
    var list = this.data.goodsList.list
    var allSelect = true
    for(var i=0;i<list.length;i++){
      var curItem = list[i]
      if(!curItem.active){
        allSelect = false
        break
      }
    }
    return allSelect
  },
  /**
   * 总价和积分
   */
  totalPrice:function(){
    var list = this.data.goodsList.list
    var total = 0;
    let totalScoreToPay = 0
    for(var i=0;i<list.length;i++){
       var curItem = list[i]
       if(curItem.active){
         //parseFloat 将别的类型的转换成浮点型
         total += parseFloat(curItem.price) * curItem.number
         totalScoreToPay += curItem.score * curItem.number
       }
    }
    this.data.goodsList.totalScoreToPay = totalScoreToPay
    total = parseFloat(total.toFixed(2)) //js浮点计算bug 取两位小数点  理论上钱不能取小数点后两位
    return total
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var shopList = [];
     //获取购物车数据
    var shopCarInfoMem = wx.getStorageSync("shopCarInfo")
    if(shopCarInfoMem && shopCarInfoMem.shopList){
       shopList = shopCarInfoMem.shopList
    }
    console.log(shopList.length)
    this.data.goodsList.list = shopList
    this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),shopList);
  },
  /**
   * 设置数据
   */
  setGoodsList:function(saveHidden,total,allSelect,noSelect,list){
     this.setData({
       goodsList:{
         saveHidden:saveHidden,
         totalPrice: total,
         totalScoreToPay: this.data.goodsList.totalScoreToPay,
         allSelect: allSelect,
         noSelect: noSelect,
         list: list
       }
     })
     var shopCarInfo = {}
     var tempNumber = 0
     shopCarInfo.shopList = list
     for(var i=0;i<list.length;i++){
        //计算购物车的数量
        tempNumber = tempNumber + list[i].number
     }
     console.log(this.data.goodsList)
     shopCarInfo.shopNum = tempNumber
     wx.setStorage({
       key: 'shopCarInfo',
       data: shopCarInfo,
     })
  },
  /**
   * 去逛逛
   */
  toIndexPage:function(e){
      wx.switchTab({
        url: '/pages/index/index',
      })
  },
  /**
   * 编辑
   */
  editTap:function(e){
    var list = this.data.goodsList.list
    for(var i=0;i<list.length;i++){
      var curItem = list[i]
      curItem.active = false
    }
    this.setGoodsList(!this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list)
  },
  /**
   * 完成
   */
  saveTap:function(e){
    var list = this.data.goodsList.list
    for(var i=0;i<list.length;i++){
      var curItem = list[i]
      curItem.active = true
    }
    this.setGoodsList(!this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list)
  },
  /**
   * 选中
   */
  selectTap:function(e){
     var index = e.currentTarget.dataset.index
     var list = this.data.goodsList.list
     for(var i=0;i<list.length;i++){
       if(index == i){
         var curItem = list[index];
         curItem.active = !curItem.active
       }
     }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
  },
  /**
   * 开始点击
   */
  touchS:function(e){
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      })
    }
  },
  /**
   * 开始移动
   */
  touchM:function(e){
     var index = e.currentTarget.dataset.index;
     if(e.touches.length == 1){
       var moveX = e.touches[0].clientX
       var disX = this.data.clientX - moveX
       var delBtnWidth = this.data.delBtnWidth
       var left = ""
       if(disX <= 0){
         left = "margin-left:0px";
       }else if(disX > 0){
         left = "margin-left:-" + disX + "px"
       }else if(disX >= delBtnWidth){
         left = "margin-left:-" + delBtnWidth + "px" 
       }
       var list = this.data.goodsList.list
       if (index !== "" && index != null) {
         list[parseInt(index)].left = left
         this.setGoodsList(this.getSaveHide(), this.totalPrice, this.allSelect(), this.noSelect(), list)
       }
     }
  },
  /**
   * 结束移动
   */
  touchE:function(e){
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1){
       var endX = e.changedTouches[0].clientX
       var disX = this.data.startX - endX
       var delBtnWidth = this.data.delBtnWidth
       //如果滑动距离小于删除按钮的1/2 不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px"
      var list = this.data.goodsList.list
      if(index !== "" && index != null){
         list[parseInt(index)].left = left
         this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list)
      }
      console.log('-----------',list)
    }
  },
  /**
   * 减少数量
   */
  jianBtnTap:function(e){
    var index = e.currentTarget.dataset.index
    var list = this.data.goodsList.list
    console.log(list)
    if(index !== '' && index != null){
      if (list[parseInt(index)].number >1){
        list[parseInt(index)].number--;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },
  /**
   * 增加购买数量
   */
  jiaBtnTap:function(e){
    var that = this
    var index = e.currentTarget.dataset.index
    var list = that.data.goodsList.list
    if (index !== "" && index != null) {
      var carShopBean = list[parseInt(index)]
      var carShopBeanStores = 0;
      api.fetchRequest('/shop/goods/detail', {
        id: carShopBean.goodsId
      }).then(function (res) {
        carShopBeanStores = res.data.data.basicInfo.stores;
        if (list[parseInt(index)].number < carShopBeanStores) {
          list[parseInt(index)].number++;
          that.setGoodsList(that.getSaveHide(), that.totalPrice(), that.allSelect(), that.noSelect(), list);
        }
        that.setData({
          curTouchGoodStore: carShopBeanStores
        })
      })
    }
  },
  /**
   * 删除当前购买的产品
   */
  delItem:function(e){
     var index = e.currentTarget.dataset.index
     var list = this.data.goodsList.list
    //  splice() 方法向/从数组中添加/删除项目，然后返回被删除的项目。
     list.splice(index,1)
     this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list)
  },
  /**
   * 全选
   */
  bindAllSelect:function(e){
     var list = this.data.goodsList.list
     var allSelect = this.allSelect()
     allSelect = !allSelect
     for(var i=0;i<list.length;i++){
       var curItem = list[i]
       if(allSelect){
         curItem.active = true
       }else{
         curItem.active = false
       }
     }
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
  },
  /**
   * 结算
   */
  toPayOrder:function(e){
    wx.showLoading()
    var that = this
    if(that.data.goodsList.noSelect){
      wx.hideLoading()
      return
    }
    //重新计算价格
    var shopList = []
    var shopCarInfoMem = wx.getStorageSync("shopCarInfo")
    if(shopCarInfoMem && shopCarInfoMem.shopList){
       shopList = shopCarInfoMem.shopList.filter(function(curItem){
         return curItem.active
       })
    }
    if(shopList.length == 0){
      wx.hideLoading()
      return
    }

    var isFail = false
    var doneNumber = 0
    var needDoneNumber = shopList.length
    for(var i=0;i<shopList.length;i++){
       if(isFail){
         wx.hideLoading()
         return
       }
       let carShopBean = shopList[i]
      if (!carShopBean.propertyChildIds || carShopBean.propertyChildIds == ""){
        api.fetchRequest('/shop/goods/detail',{
          id:carShopBean.goodsId
        }).then(function(res){
          doneNumber++;
          if (res.data.data.properties){
            wx.showModal({
              title: '提示',
              content: res.data.data.basicInfo.name + '商品已失效，请重新购买',
              showCancel:false
            })
            isFail = true
            wx.hideLoading()
            return
          }
          if (res.data.data.basicInfo.stores < carShopBean.number){
             wx.showModal({
               title: '提示',
               content: res.data.data.basicInfo.name + '库存不足,请重新购买',
               showCancel:false
             })
             isFail = true
             wx.hideLoading()
             return
          }
          if (res.data.data.basicInfo.minPrice != carShopBean.price){
             wx.showModal({
               title: '提示',
               content: res.data.data.basicInfo.name + ' 价格有调整，请重新购买',
               showCancel: false
             })
             isFail = true
             wx.hideLoading()
             return
          }
          if(needDoneNumber == doneNumber){
             that.navigateToPayOrder()
          }
        })
       }else{
        api.fetchRequest('/shop/goods/price',{
          goodsId: carShopBean.goodsId,
          propertyChildIds: carShopBean.propertyChildIds
        }).then(function(res){
          if (res.data.data.stores < carShopBean.number) {
            wx.showModal({
              title: '提示',
              content: carShopBean.name + ' 库存不足，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (res.data.data.price != carShopBean.price) {
            wx.showModal({
              title: '提示',
              content: carShopBean.name + ' 价格有调整，请重新购买',
              showCancel: false
            })
            isFail = true;
            wx.hideLoading();
            return;
          }
          if (needDoneNUmber == doneNumber) {
            that.navigateToPayOrder();
          }
        })
       }
    }

  },
  /**
   * 删除 将没有选中的item删除
   */
  deleteSelected:function(e){
     var list = this.data.goodsList.list
     //filter 过滤不是选中状态的curItem
     list = list.filter(function(curItem){
       console.log(curItem,'----------')
       return !curItem.active
     })
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  /**
   * 去购买
   */
  navigateToPayOrder:function(){
     wx.hideLoading()
     wx.navigateTo({
       url: '/pages/to-pay-order/index',
     })
  }
})