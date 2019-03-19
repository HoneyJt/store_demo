//app.js

const api = require('./utils/request.js')

App({
  navigateToLogin: false,
  onLaunch: function () {
    var that = this;
    /**
     * 获取网络状态
     * 没有网络的状态下根据实际情况调整
     */
    wx.getNetworkType({
      success: function(res) {
        const networkType = res.networkType
        if(networkType === 'none'){
           that.globalData.isConnected = false;
           wx.showToast({
             title: '当前无网络',
             icon:'loading',
             duration:2000
           })
        }
      },
    })

    /**
     * 监听网络状态变化
     * 根据不同的网络状态调整
     */
    wx.onNetworkStatusChange(function(res){
      if(!res.isConnected){
        that.globalData.isConnected = false;
        wx.showToast({
          title: '网络已断开',
          icon:'loading',
          duration:2000,
          complete:function(){
            that.goStartIndexPage()
          }
        })
      }else{
        that.globalData.isConnected = true;
        wx.hideToast()
      }
    });
  },
  
  /**
   * 登录超时
   */
  goLoginPageTimeOut:function(){
    if(this.navigateToLogin){
      return
    }
    this.navigateToLogin = true
    setTimeout(function(){
      wx.navigateTo({
        url: '/pages/authorize/index',
      })
    },1000)
  },
    
  /**
   * 网络断开默认重定向到起始页面
   */
  goStartIndexPage:function(){
      setTimeout(function(){
        wx.redirectTo({
          url: '/pages/start/index',
        })
      },1000)
  },

    
  globalData: {
    isConnected:true
  }
 
  
})