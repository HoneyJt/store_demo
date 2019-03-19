// pages/my/index.js
const app = getApp()
const api = require('../../utils/request.js')
const CONFIG = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    balance:0,
    freeze:0,
    score:0,
    score_sign_continuous:0
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    let userInfo = wx.getStorageSync('userInfo')
    console.log(userInfo)
    if(!userInfo){
      app.goLoginPageTimeOut()
    }else{
      that.setData({
        userInfo:userInfo,
        version:CONFIG.version
      })
    }
    this.getUserApiInfo()
    this.getUserAmount()
    this.checkScoreSign()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 充值
   */
  recharge:function(e){
    wx.navigateTo({
      url: '/pages/recharge/index',
    })
  },
  /**
   * 提现
   */
  withdraw:function(e){
    wx.navigateTo({
      url: '/pages/withdraw/index',
    })
  },
  /**
   * 获取手机号
   */
  getPhoneNumber:function(e){
    if(!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok"){
       wx.showModal({
         title: '提示',
         content: '无法获取手机号码',
         showCancel:false
       })
       return;
    }
    var that = this
    api.fetchRequest('/user/wxapp/bindMobile',{
      token:wx.getStorageSync('token'),
      encryptedData:e.detail.encryptedData,
      iv:e.detail.iv
    }).then(function(res){
      if(res.data.code ==0){
        wx.showToast({
          title: '绑定成功',
          icon:'success',
          duration:2000
        })
        that.getUserApiInfo()
      }else {
        wx.showModal({
          title: '提示',
          content: '绑定失败',
          showCancel:false
        })
      }
    })
  },
  /**
   * 关于我们
   */
  aboutUs:function(){
    wx.showModal({
      title: '关于我们',
      content: '本系统基于开源小程序商城系统 https://github.com/EastWorld/wechat-app-mall 搭建，祝大家使用愉快！',
      showCancel:false
    })
  },
  /**
   * 重新授权登录
   */
  relogin:function(e){
     app.goLoginPageTimeOut()
  },
  /**
   * 获取用户信息
   */
  getUserApiInfo:function(){
    var that = this;
    api.fetchRequest('/user/detail',{
      token:wx.getStorageSync('token'),
    }).then(function(res){
      if(res.data.code ==0){
        let _data = {}
        _data.apiUserInfoMap = res.data.data
        if(res.data.data.base.mobile){
          _data.userMobile = res.data.data.base.mobile
        }
        that.setData(_data)
      }
    })
  },
  /**
   * 获取积分
   */
  getUserAmount:function(){
    var that = this;
    api.fetchRequest('/user/amount',{
      token:wx.getStorageSync('token'),
    }).then(function(res){
      if(res.data.code == 0){
        that.setData({
          balance:res.data.data.balance,
          freeze:res.data.data.freeze,
          score:res.data.data.score
        })
      }
    })
  },
  /**
   * 签到次数
   */
  checkScoreSign:function(){
    var that = this
    api.fetchRequest('/score/today-signed',{
      token:wx.getStorageSync('token'),
    }).then(function(res){
      if(res.data.code == 0){
        that.setData({
          score_sign_continuous: res.data.data.continuous
        })
      }
    })
  },
  /**
   * 每日签到
   */
  scoresign:function(e){
    var that = this
    api.fetchRequest('/score/sign',{
      token:wx.getStorageSync('token')
    }).then(function(res){
      if(res.data.code == 0){
        that.getUserAmount();
        that.checkScoreSign()
      } else {
        wx.showModal({
          title: '错误',
          content: res.data.msg,
          showCancel:false
        })
      }
    })
  }
})