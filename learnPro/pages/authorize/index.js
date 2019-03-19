// pages/authorize/index.js

const api = require('../../utils/request.js')
var app = getApp();

/**
 * 登录流程:1.判断token是否存在,如果存在---->检查token是否过期 过期过期直接返回 没有过期直接调用登录接口 token不存在 直接调用登录接口
 * 2.首先调用wx.login获取code 调用服务器登录接口 如果当前账号在服务端没有注册code === 10000 调用去注册接口
 * 
 * 3.去注册 先wx.login 获取code 然后调用wx.getUserInfo获取当前用户的用户信息用于注册 注册成功调用登录接口
 */

Page({

  /**
   * 页面的初始数据
   */
  data: {

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
   * 获取授权信息
   */
  bindgetuserinfo:function(e){
    if(!e.detail.userInfo){
      return;
    }
    if (app.globalData.isConnected){
      wx.setStorageSync('userInfo', e.detail.userInfo)
      //登录
      this.login()
    }else {
      wx.showToast({
        title: '当前无网络',
      })
    }
    
  },
  login:function(){
    let that = this;
    let token = wx.getStorageSync('token');
    console.log(token)
    if(token){
      console.log('---------自定义登录')
      api.fetchRequest('/user/check-token').then(function(res){
         if(res.data.code !=0){
           //移除旧的token
           wx.removeStorageSync('token')
           console.log('wx----login----before')
           that.login()
         }else{
           //检查token失败
           console.log('----------失败')
           app.navigateToLogin = false
           wx.navigateBack()
         }
      })
      return;
    }
    wx.login({
      success: function(res) {
        console.log(res, 'wx----login----after')
        api.fetchRequest('/user/wxapp/login',{
          code:res.code
        }).then(function(res){
          console.log(res,'--------')
          if(res.data.code == 1000){
            //去注册
            return;
          }
          //登录异常
          if(res.data.code != 0){
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: '登录异常,请重试',
              showCancel:false
            })
            return;
          }
          //登录成功 存储token
          wx.setStorageSync('token', res.data.data.token)
          wx.setStorageSync('uid', res.data.data.uid)
          //app 返回
          app.navigateToLogin = false
          app.navigateBack()
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  registerUser:function(){
    let that = this;
    wx.login({
      success: function(res) {
        let code = res.code;
        wx.getUserInfo({
          success: function(res) {
            let iv = res.iv;
            let encryptedData = res.encryptedData;
            let referrer = '' //推荐人
            let referrer_storage = wx.getStorageSync('referrer');
            if(referrer_storage){
              referrer = referrer_storage
            }
            api.fetchRequest('/user/wxapp/register/complex',{
              code:code,
              encryptedData:encryptedData,
              iv:iv,
              referrer:referrer
            }).then(function(res){
              wx.hideLoading()
              that.login()
            })
          },
          fail: function(res) {},
          complete: function(res) {},
        })

      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  bindSave:function(){

  }
})