// pages/select-address/index.js
const app = getApp()
const api = require('../../utils/request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [{'id':1, 'linkMan': '啊哈哈哈', 'mobile': '18502567443', 'address': '江苏省南京市建邺区', 'isDefault': true }, {'id':2, 'linkMan': '啊哈哈哈', 'mobile': '18502567443', 'address': '江苏省南京市建邺区', 'isDefault': false }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 选中
   */
  selectTap:function(e){
    var id = e.currentTarget.dataset.id
    api.fetchRequest('/user/shipping-address/update',{
      token:wx.getStorageSync('token'),
      id:id,
      isDefault:'true'
    }).then(function(res){
      wx.navigateBack({
      })
    })
  },
  /**
   * 编辑收货地址
   */
  editAddress:function(e){
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id,
    })
  },
  /**
   * 新增收货地址
   */
  addAddress:function(){
    wx.navigateTo({
      url:"/pages/address-add/index",
    })
  },
  /**
   * 获取收货地址
   */
  initShipingAddress:function(){
    var that = this
    api.fetchRequest("/user/shipping-address/list",{
      token:wx.getStorageSync('token')
    }).then(function(res){
      if(res.data.code == 0){
        that.setData({
          addAddress:res.data.data
        })
      }else if(res.data.code == 700){
        that.setData({
          addressList:null
        })
      }
    })
  }
})