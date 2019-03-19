// pages/address-add/index.js
var commonCityData = require('../../utils/city.js')
const api = require('../../utils/request.js')

var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    provinces:[],
    citys:[],
    districts:[],
    selProvince:'请选择',
    selCity:'请选择',
    selDistrict:'请选择',
    selProvinceIndex:0,
    selCityIndex:0,
    selDistrictIndex:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    this.initCityData(1);
    var id = options.id
    if(id){
      //初始化数据
      wx.showLoading()
      api.fetchRequest('/user/shipping-address/detail',{
        token:wx.getStorageSync('token'),
        id:id
      }).then(function(res){
        if(res.data.code == 0){
           that.setData({
             id:id,
             addressData:res.data.data,
             selProvince:res.data.data.provinceStr,
             selCity:res.data.data.cityStr,
             selDistrict:res.data.data.areaStr
           })
           that.setDBSaveAddressId(res.data.data)
           return;
        }else {
          wx.showModal({
            title: '提示',
            content: '无法获取收货地址数据',
            showCancel:false
          })
        }
      }).finally(function(){
        wx.hideLoading()
      })
    }
  },
  /**
   * 保存收货地址
   */
  bindSave:function(e){
    var that = this
    var linkMan = e.detail.value.linkMan;
    var address = e.detail.value.address;
    var mobile = e.detail.value.mobile;
    var code = e.detail.value.code;

    if(linkMan == ''){
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel:false
      })
      return
    }
    if(mobile == ''){
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel:false
      })
      return
    }
    if(this.data.selProvince == '请选择'){
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel:false
      })
      return
    }
    if(this.data.selCity == '请选择'){
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel:false
      })
      return
    }
    var cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id
    var districtId;
    if(this.data.selDistrict == '请选择' || !this.data.selDistrict){
      districtId = ''
    }else {
      districtId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id
    }
    if(address ==''){
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel:false
      })
      return
    }
    if(code ==''){
      wx.showModal({
        title: '填写',
        content: '请填写邮编',
        showCancel:false
      })
      return
    }
    var apiAddoRuPDATE = "add"
    var apiAddid = that.data.id
    if(apiAddid){
      apiAddoRuPDATE = 'update'
    }else{
      apiAddid = 0
    }
    api.fetchRequest(`/user/shipping-address/${apiAddoRuPDATE}`,{
      token:wx.getStorageSync('token'),
      id:apiAddid,
      provinceId:commonCityData.cityData[this.data.selProvinceIndex].id,
      cityId:cityId,
      districtId:districtId,
      linkMan:linkMan,
      address:address,
      mobile:mobile,
      code:code,
      isDefault:'true'
    }).then(function(res){
      if(res.data.code != 0){
        wx.hideLoading()
        wx.showModal({
          title: '失败',
          content: res.data.msg,
          showCancel:false
        })
        return
      }
      //跳转到结算界面
      wx.navigateBack({
      })
    })
  },
  /**
   * 选择收货城市
   */
  selectCity:function(e){

  },
  /**
   * 选择地区 省
   */
  bindPickerProvinceChange:function(e){
     var selItem = commonCityData.cityData[e.detail.value]
     console.log(selItem)
     this.setData({
       selProvince:selItem.name,
       selProvinceIndex:e.detail.value,
       selCity:'请选择',
       selCityIndex:0,
       selDistrict:'请选择',
       selDistrictIndex:0
     })
     this.initCityData(2,selItem)
  },
  /**
   * 选择地区 城市
   */
  bindPickerCityChange:function(e){
     var selItem = commonCityData.cityData[this.data.selProvinceIndex].cityList[e.detail.value]

     this.setData({
       selCity:selItem.name,
       selCityIndex:e.detail.value,
       selDistrict:'请选择',
       selDistrictIndex:0
     })
     this.initCityData(3,selItem)
  },
  /**
   * 选择 县区
   */
  bindPickerChange:function(e){
    var selItem = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[e.detail.value]

    this.setData({
      selDistrict: selItem.name,
      selDistrictIndex: e.detail.value
    })
  },
  /**
   * 从微信中读取地址
   */
  readFromWx:function(e){
    let that = this
    wx.chooseAddress({
      success:function(res){
        let provinceName = res.provinceName
        let cityName = res.cityName
        let districtName = res.countyName
        let retSelIdx = 0

        for(var i=0;i<commonCityData.cityData.length;i++){
           if(provinceName == commonCityData.cityData[i].name){
             let event = { detail:{ value:i }};
             that.bindPickerProvinceChange(event);
             that.data.selProvinceIndex = i;
             for(var j=0;j<commonCityData.cityData[i].cityList.length;j++){
               if (cityName == commonCityData.cityData[i].cityList[j].name){
                 event = { detail: { value: j } };
                 that.bindPickerCityChange(event)
                 for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                   if (diatrictName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                     eventJ = { detail: { value: k } };
                     that.bindPickerChange(eventJ);
                   }
                 }   
               }
             }
           }
        }
      }
    })
  },
  /**
   * 删除地址
   */
  deleteAddress:function(e){
    var that = this
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址么?',
      success:function(res){
        if(res.confirm){
          api.fetchRequest('/user/shipping-address/delete',{
            token:wx.getStorageSync('token'),
            id:id
          }).then(function(res){
            wx.navigateBack({
            })
          })
        }else if(res.cancel){
          console.log('------取消------')
        }
      }
    })
  },
  /**
   * 取消
   */
  bindCancel:function(e){
    wx.navigateBack({
    })
  },
  /**
   * 初始化城市数据
   */
  initCityData:function(level,obj){
    if(level == 1){
      var pinkArray = [];
      for (var i = 0; i < commonCityData.cityData.length;i++){
         pinkArray.push(commonCityData.cityData[i].name)
      }
      console.log(pinkArray)
      this.setData({
        provinces:pinkArray
      })
    }else if(level == 2){
      var pinkArray = [];
      var dataArray = obj.cityList;
      for(var i=0;i<dataArray.length;i++){
        pinkArray.push(dataArray[i].name)
      }
      this.setData({
        citys:pinkArray
      })
    }else if(level == 3){
      var pinkArray = []
      var dataArray = obj.districtList
      for(var i=0;i<dataArray.length;i++){
        pinkArray.push(dataArray[i].name)
      }
      this.setData({
        districts:pinkArray
      })
    }
  },
  /**
   * 保存收货地址
   */
  setDBSaveAddressId:function(data){
     var retSelIdx = 0
     for(var i=0; i<commonCityData.cityData.length;i++){
        if(data.provinceId == commonCityData.cityData[i].id){
          this.data.selProvinceIndex = i;
          for(var j=0;j<commonCityData.cityData[i].cityList.length;i++){
            if(data.cityId == commonCityData.cityData[i].cityList[j].id){
              this.data.selCityIndex = j;
              for(var k=0;k<commonCityData.cityData[i].cityList[j].districtList.length;k++){
                if (data.districtId == commonCityData.cityData[i].cityList[j].districtList[k].id){
                  this.data.selDistrictIndex = k;
                }
              }
            }
          }
        }
     }
  },
})