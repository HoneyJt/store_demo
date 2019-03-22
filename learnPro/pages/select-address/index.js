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
    console.log(e.currentTarget.dataset)
  },
  /**
   * 编辑收货地址
   */
  editAddress:function(e){
    console.log(e.currentTarget.dataset)
  },
  /**
   * 新增收货地址
   */
  addAddress:function(){
    wx.navigateTo({
      url:"/pages/address-add/index",
    })
  }
})