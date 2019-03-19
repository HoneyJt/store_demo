// pages/start/inde.js

const api = require('../../utils/request.js')

var app = getApp();

/**
 * 判断用户是否登录该小程序app或者是否登录状态过期 如果过期或者没有登录跳转到登录授权页面
 */

Page({

  /**
   * 页面的初始数据
   */
  data: {
    remind:'加载中',
    angle:0,
    userInfo:{}
  },

  /**
   * 点击进入店铺
   */
  goToIndex:function(e){
    api.fetchRequest('/template-msg/wxa/formId',{
      token:wx.getStorageSync("token"),
      type:"form",
      formId:e.detail.formId
    })
    if(app.globalData.isConnected){
       wx.switchTab({
         url: '/pages/index/index',
       })
    } else{
      wx.showToast({
        title: '当前无网络',
        icon:'none',
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName'),
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    setTimeout(function(){
      that.setData({
        remind:''
      })
    },1000);
    wx.onAccelerometerChange(function(res){
      var angle = -(res.x*30).toFixed(1)
      if(angle>14){angle=14;}
      else if(angle<-14){angle=-14;}
      if(that.data.angle !== angle){
        that.setData({
          angle:angle
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    let userInfo = wx.getStorageSync('userInfo')
    if(!userInfo){
      app.goLoginPageTimeOut()
    } else {
      that.setData({
        userInfo:userInfo
      })
    }
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
    wx.stopAccelerometer({
           
    })
  },


})