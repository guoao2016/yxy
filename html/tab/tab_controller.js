angular.module('tab.controller',[])
.controller('TabCtrl',function ($scope,$rootScope,$state,$http,$interval,GlobalVariable) {
    var wsCache  = new WebStorageCache();
    var token = wsCache.get('ZHYToken');
    $rootScope.unreadCount=0;//消息数量
      // 当不登录的时候，跳到登录页面
    $scope.judgeUserLogin = function () {
        var getToken = wsCache.get('ZHYToken');/* 每次登录点击都检查 getToken */
        if(getToken){
          $state.go('tab.userCenter');
        }else {
          $state.go('login');
        }
      };
    $scope.$on("$ionicView.afterEnter", function() {
      token = wsCache.get('ZHYToken');
    });

    getUnreadNum();
    function getUnreadNum(){//查询未读消息数量
      if(token){
          $http({
              method:'GET',
              url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/notify/unread/count',
              params:{
                  token:token,
                  type:0
              }
          }).success(function (res) {
              if(res.code==0){
                  // console.log(res);
                  $rootScope.unreadCount=res.data;
                  // $rootScope.unreadCount=0;
              }
          }).error(function (res) {

          })
      }

    }
    //$interval(getUnreadNum,10000);
})

.factory('addressSelect',function ($http,GlobalVariable) {
  return{
    getAddressSelect :function() {
      return $http.get(GlobalVariable.SERVER_PATH+'api/mobile/area/all')
    },
    cityChoose : [
    {name:'桂林市'},
    {name:'重庆市'},
    {name:'杭州市'},
    {name:'舟山市'},
    {name:'南平市'},
    {name:'三亚市'},
    {name:'北京市'},
    {name:'深圳市'}
  ]
  }
});
