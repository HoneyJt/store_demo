const CONFIG = require('../config.js') //导入config.js
const REQUEST_CACHE = []
const BASE_URL = 'https://api.it120.cc'

/**
 * 封装请求
 * url:请求地址
 * data:请求的数据
 * method:请求方法 get or post
 * cache:缓存时间   
 * 整个流程 如果从缓存中取 生成承诺函数---> 判断缓存是否过期 ---->没有过期直接返回缓存值 ----> 没有缓存直接请求数据---->缓存数据
 */

function FetchRequest(url,data,method='GET',cache = 0,header = {},noSubDomain = false){
  var request_key = GetStorageKey(url,method)
  if(cache){
    return new Promise(Storage);
  }else{
    return new Promise(Request)
  }

  /**
   * 缓存相关
  */
  function Storage(resolve,reject){
    wx.getStorage({
      key: request_key,
      success: StorageSuccess,
      fail: StorageError
    })

    /**
     * 获取缓存成功回调
     */
    function StorageSuccess(store){
      //如果缓存数据没有过期 直接返回 过期重新请求
      if(CheckCache(store.data)){
        resolve(store.data)
      }else{
        Request(resolve,reject)
      }
    }

    /**
     * 异常处理
     */
    function StorageError(err){
       Request(resolve,reject)
    }
  }

  /**
   * 请求接口
   */
  function Request(resolve,reject){
    /**
     * 请求成功回调
     */
    SaveRequest(request_key);
    let _url = BASE_URL + '/' + CONFIG.subDomain + url
    if(noSubDomain){
      _url = BASE_URL + url
    }
    wx.request({
      url: _url,
      data: data,
      header: header,
      method: method.toUpperCase(),
      success: FetchSuccess,
      fail: FetchError,
      complete: RequestOver,
    })
    function FetchSuccess(res) {
       //请求成功 缓存数据
       SaveCache(res);
       if(res.statusCode >= 200 && res.statusCode <300){
          resolve(res);
       }else{
         FetchError(res.data);
         switch(res.statusCode){
           case 403:
           //提示请求url不存在
           break
         }
       }
    }

    /**
     * 请求失败处理
     */
    function FetchError(err) {
      if (err) {
        wx.showToast({
          title: err.errMsg || err.message,
          icon: '',
          duration: 3000
        })
      }
      reject(err)
    }
  }

  /**
   *  保存缓存信息  接口调用成功才保存缓存信息
   */
  function SaveCache(res){
    if(cache > 0 && res.statusCode >= 200 && res.statusCode < 300){
      res.timestamp = Date.parse(new Date()) + cache * 1000;
      wx.setStorage({
        key: "",
        data: '',
      })
    }
  }

  /**
   * 验证缓存是否过期
   */
  function CheckCache(data){
     return data.timestamp < Date.parse(new Date());
  }
  
  function RequestOver(){
    RemoveRequest(request_key);
  }
}

/**
 * 并发请求
 * 不做缓存等处理
 */
function FetchRequestsAll(data){
  return new Promise(function (resolve, reject){
    Promise.all(data).then(res => {
      resolve(res)
    })
  })
}

function CheckRequest(key){
  return REQUEST_CACHE.indexOf(key) >= 0;
}

function SaveRequest(key){
  var index = REQUEST_CACHE.indexOf(key);
  if(index <= 0){
    REQUEST_CACHE.push(key);
  }
}

function RemoveRequest(key){
   var index = REQUEST_CACHE.indexOf(key)
   if(index >= 0){
     REQUEST_CACHE.splice(index,1);
   }
}

function GetStorageKey(url,method){
  return `${method.toUpperCase()}:${url.toUpperCase()}`
}

/**
 * 小程序的promise没有finally方法,自己扩展
 */
Promise.prototype.finally = function (callback){
  var Promise = this.constructor;
  return this.then(
    function (value){
      Promise.resolve(callback()).then(
        function (){
          return value;
        }
      )
    }
  ),
  function (reason){
    Promise.resolve(callback()).then(
      function (){
        throw reason;
      }
    )
  }
}

module.exports = {
  fetchRequest:FetchRequest,
  cacheTime:1800,
  fetchRequestAll:FetchRequestsAll
}
