// pages/order-list/index.js

var wxpay = require('../../utils/pay.js')
var api = require('../../utils/request.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusType: ["待付款", "待发货", "待收货", "待评价", "已完成"],
    currentType:0,
    tabClass: ["", "", "", "", ""],
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
     //获取订单列表
     wx.showLoading()
     var that = this
     var postData = {
       token:wx.getStorageSync('token')
     }
     postData.status = that.data.currentType
     this.getOrderStatistics()
     api.fetchRequest('/order/list',postData).then(function(res){
       that.setData({
         orderList: [{ "amountReal": 45, "score": 1, "status": false, 'dateAdd': '2015-09-11', 'statusStr': '代付款', 'orderNumber': '212132313212', 'remark': '快点买吧', 'id': 1 }, { 'dateAdd': '2015-09-11', 'statusStr': '代付款', 'orderNumber': '212132313212', 'remark': '快点买吧', 'id': 2, "status": false, "score": 1, "amountReal": 50 }],
         goodsMap: [{ 'id': 1, "pic": 'https://cdn.it120.cc/apifactory/2019/03/19/6828c1ced4a74e11b532c8cbd864245a.png' }, { 'id': 2, "pic": 'https://cdn.it120.cc/apifactory/2019/03/07/133eb6294e3853ebe4eb8551359a26dc.png' }]
       })
     }).finally(function(res){
       wx.hideLoading()
     })
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

  },
  /**
   * 分类选择
   */
  statusTap:function(e){
    var curType = e.currentTarget.dataset.index
    this.data.currentType = curType
    this.setData({
      currentType:curType
    })
    this.onShow()
  },
  /**
   * 订单详情
   */
  orderDetail:function(e){
    var orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/order-details/index?id=' + orderId,
    })
  },
  /**
   * 取消付款
   */
  cancelOrderTap:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          api.fetchRequest('/order/close', {
            token: wx.getStorageSync('token'),
            orderId: orderId
          }).then(function (res) {
            if (res.data.code == 0) {
              that.onShow();
            }
          }).finally(function (res) {
            wx.hideLoading();
          })
        }
      }
    })
  },
  /**
   * 付款
   */
  topayTap:function(e){
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    var needScore = e.currentTarget.dataset.score;
    api.fetchRequest('/user/amount', {
      token: wx.getStorageSync('token'),
    }).then(function (res) {
      if (res.data.code == 0) {
        // res.data.data.balance
        money = money - res.data.data.balance;
        if (res.data.data.score < needScore) {
          wx.showModal({
            title: '错误',
            content: '您的积分不足，无法支付',
            showCancel: false
          })
          return;
        }
        if (money <= 0) {
          // 直接使用余额支付
          api.fetchRequest('/order/pay', {
            token: wx.getStorageSync('token'),
            orderId: orderId
          }, 'POST', 0, {
              'content-type': 'application/x-www-form-urlencoded'
            }).then(function (res) {
              that.onShow();
            })
        } else {
          wxpay.wxpay(app, money, orderId, "/pages/order-list/index");
        }
      } else {
        wx.showModal({
          title: '错误',
          content: '无法获取用户资金信息',
          showCancel: false
        })
      }
    })
  },
  /**
   * 获取订单状态
   */
  getOrderStatistics:function(){
    var that = this
    api.fetchRequest('/order/statistics',{
      token:wx.getStorageSync('token')
    }).then(function(res){
      if(res.data.code == 0){
        var tabClass = that.data.tabClass
        // 代付款
        if (res.data.data.count_id_no_pay > 0){
          tabClass[0] = "red-dot"
        }else {
          tabClass[0] = ""
        }
        // 待发货
        if (res.data.data.count_id_no_transfer > 0){
          tabClass[1] = "red-dot"
        } else {
          tabClass[1] = ""
        }
        //待收货
        if (res.data.data.count_id_no_confirm > 0){
           tabClass[2] = "red-dot"
        }else{
          tabClass[2] = ""
        }
        //待评价
        if (res.data.data.count_id_no_reputation){
          tabClass[3] = "red-dot"
        }else{
          tabClass[3] = ""
        }
        // 已完成
        that.setData({
          tabClass:tabClass
        })
      }
    }).finally(function(res){
      wx.hideLoading()
    })
  }

})