
var app=angular.module('starter', ['ionic', 'route','global','config','ionicLazyLoad']);

app.run(function($ionicPlatform) {
  /*  平台自测不用理 */
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    // if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
    //   cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    //   cordova.plugins.Keyboard.disableScroll(true);
    //
    // }
    // if (window.StatusBar) {
    //   // org.apache.cordova.statusbar required
    //   StatusBar.styleDefault();
    // }
    
  });
});

//1 -----自定义弹框服务
app.factory('ShowAlertMessage',function ($ionicLoading) {
    var ShowAlertMessage = {
      showMessage:function (showName, showTime,noBackdrop) {
        $ionicLoading.show({
          template:showName || '数据加载中...',
          duration:showTime || 1000,
          noBackdrop:noBackdrop || false
          // hideOnStateChange:true
        })
      },
      hideMessage:function () {
        $ionicLoading.hide()
      }
    };
    return ShowAlertMessage;
  });
//2 -----封装定位服务
app.factory('LocationService',function ($q) {
    var service = {};
    service.location = function(done, fail){
      var d=$q.defer();
      mapInit();
      getCurrentPosition();
      var mapObj, geolocation;
      function mapInit () {
        mapObj = new AMap.Map('iCenter');//默认定位：初始化加载地图时，center及level属性缺省，地图默认显示用户所在城市范围
      }
      function getCurrentPosition () { //调用浏览器定位服务
        mapObj.plugin('AMap.Geolocation', function () {
          geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 6000,          //超过6秒后停止定位，默认：无穷大
            maximumAge:30000,           //定位结果缓存 毫秒，默认：0
            convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: true,        //显示定位按钮，默认：true
            buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
            showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
          });
          if(geolocation.isSupported()){
            // console.log("浏览器支持定位");
            mapObj.addControl(geolocation);
            geolocation.getCurrentPosition();
            AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
            AMap.event.addListener(geolocation, 'error', onError);
          }else{
            console.log('无法定位')
          }

        });
      }
      //解析定位结果
      function onComplete (data) {
        d.resolve(data);
        // console.log(data);
      }
      function onError(){
        d.reject("定位失败");
      }
      return d.promise;
    };
    return service;
  });

/***********
 // 封装服务使用
  1.注入(LocationService)
  2.调用
    LocationService.location().then(function (data) {//正确时

    },function (data) {//错误时

    });
 ***************/

//3-----指令
app.directive('focusInput', ['$ionicScrollDelegate', '$window', '$timeout', '$ionicPosition', function ($ionicScrollDelegate, $window, $timeout, $ionicPosition) {
      return {
        restrict: 'A',
        scope: false,
        link: function ($scope, iElm, iAttrs, controller) {
          if (ionic.Platform.isIOS()||ionic.Platform.isAndroid()) {
            iElm.on('focus', function () {
              var top = $ionicScrollDelegate.getScrollPosition().top;
              var eleTop = ($ionicPosition.offset(iElm).top) / 2;
              var realTop = eleTop + top;
              $timeout(function () {
                if (!$scope.$last) {
                  $ionicScrollDelegate.scrollTo(0,realTop);
                } else {
                  try {
                    var aim = angular.element(document).find('.scroll')
                    aim.css('transform', 'translate3d(0px,' + '-' + realTop + 'px, 0px) scale(1)');
                    $timeout(function () {
                      iElm[0].focus();
                      console.log(2);
                    }, 100)
                  } catch (e) {
                  }

                }
              }, 200)
            })
          }

        }
      }
    }]);

//5---位置信息共享服务
app.factory('cityNameFty', function(){
  var service = {};//定义一个Object对象'
  var cityName;//定义一个私有化的变量保存当前城市
  var data={};//存储定位信息
  //对私有属性写getter和setter方法
  service.setCityName = function(_cityName){
    cityName = _cityName;
  };
  service.setLocationData = function(_data){
    data.address=_data.formattedAddress;//详细地址
    data.city=_data.addressComponent.city ;//城市
    data.lnglat={lng:_data.position.getLng(),lat:_data.position.getLat()};
  };
  service.getCityName = function(){
    return cityName;
  };
  service.getLocationData = function(){
    return data;
  };
  return service;//返回这个Object对象
});

//6---回复
// <reply token="token" id="item.id" nick="item.nick" content="item.content" pid="replytItem.pid"></reply>
app.directive('reply',function ($http,$state,$ionicPopup,GlobalVariable,ShowAlertMessage) {
  return {
    restrict:'AE',
    replace : true,
    scope:{
      token:'=',
      id:'=',
      nick:'=',
      content:'=',
      pid:'='
    },
    template:'<button type="button">回复</button>',
    link:function (scope,element) {
      element.bind('click',function () {
        console.log(scope.content.substring(0,scope.content.lastIndexOf("//")))
        if(scope.token){
          scope.data = {};
          // 自定义弹窗
          var myPopup = $ionicPopup.show({
            template: '<textarea rows="5" ng-model="data.wifi">',
            title: '写评论',
            cssClass:'commentPopup',
            scope: scope,
            buttons: [
              {
                text: '取消',
                type: 'button-positive',
                onTap: function(e) {
                  //关闭
                }

              }, {
                text: '发送',
                type: 'button-positive',
                onTap: function(e) {
                  if (!scope.data.wifi) {
                    //非空不发送
                    e.preventDefault();
                  } else {
                    postReply(scope.data.wifi);
                  }
                }
              }
            ]
          });
          function postReply(res){
            $http({
              method:'POST',
              url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/travel/reply/add',
              params:{
                id:scope.id,
                token:scope.token,
                text:res+'//@'+scope.nick+':'+scope.content.substring(0,scope.content.lastIndexOf("//"))
              }
            }).success(function (res) {
              if(res.code==0){
                scope.$emit('ngRepeatFinished', element);
                ShowAlertMessage.showMessage(res.msg,1000,'noBackdrop')
              }
            }).error(function (res) {
              console.log(res)
            })
          }
        }else{
          $state.go('login');
        }
      })
    }
  }

})

//7--- <input type="text" datepicker ng-model="myObject.myDateValue" />
app.directive('datepicker', function() {
  return function(scope, element, attrs) {
    element.datepicker({
      inline: true,
      dateFormat: 'dd.mm.yy',
      onSelect: function(dateText) {
        var modelPath = $(this).attr('ng-model');
        putObject(modelPath, scope, dateText);
        scope.$apply();
      }
    });
  }
});

//8---封装未读消息服务
app.factory('getUnreadCountFty',function ($http,$q,GlobalVariable) {
  var service={};

  service.getUnreadCount =function(token,type) {
    var d=$q.defer();
    $http({
        method:'GET',
        url: GlobalVariable.SERVER_PATH_YXY+'api/mobile/notify/unread/count',
        params:{
          token:token,
          type:type
        }
      }).success(function (res) {
        d.resolve(res);
    }).error(function (res) {
      d.reject(res);
    })
    return d.promise;
  }
  return service;
});

/******************
 getUnreadCountFty.getUnreadCount(token,1).then(function(data){

 },function(data){

 })
 *****************/




