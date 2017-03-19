
angular.module('travelNotes.controller',['ngSanitize'])/* xxx.controller 命名*/
    .controller('TravelNotesCtrl',function ($scope,$http,$ionicModal,GlobalVariable,addressSelect,ShowAlertMessage,LocationService,cityNameFty) {
    //全局变量,保存城市地址
    $scope.cityName='';
    //函数调用
    getAddressData();//获取城市数据

    //    每次进入视图，都会重新获取储存的城市，然后请求数据
    if(cityNameFty.getLocationData().address){
        $scope.currentPosition=cityNameFty.getLocationData().address;//地址选择框显示定位地址
        // $scope.cityName=cityNameFty.getLocationData().city()
    }


    $scope.$on('$ionicView.beforeEnter',function () {
        if(cityNameFty.getLocationData().address){
            if(cityNameFty.getCityName()){
                $scope.cityName = cityNameFty.getCityName();
                getHTTP();
            }
        }else {
            if(cityNameFty.getCityName()){
                $scope.cityName = cityNameFty.getCityName() || '深圳市';
                getHTTP();
            }else{
                // getLocations();
            }
        }
    });

    function getLocations() {
        //调用封装的 定位方法
        LocationService.location().then(function (data) {
                // 定位坐标
                $scope.currentPosition = data.formattedAddress;
            $scope.cityName = data.addressComponent.city;
                getHTTP();/* 定位成功调用数据 */
                cityNameFty.setLocationData(data);//存储定位信息
                cityNameFty.setCityName(data.addressComponent.city);
            },function (data){
                // console.log(data);
                $scope.cityName = '深圳市';
                getHTTP();
                cityNameFty.setCityName('深圳市');
            })
    }

    //显示模态框
    $scope.showModal = function () {
      if($scope.modal){
          $scope.modal.show();
      }else {
          $ionicModal.fromTemplateUrl('html/modal/chooseAddress_modal.html',{
              scope:$scope
          }).then(function (modal) {
              $scope.modal = modal;
              //逻辑代码
              $scope.modal.show();
          })
      }
    };
    $scope.hideShow = function () {
      $scope.modal.hide();
    }
    $scope.$on('$destroy',function () {
      $scope.modal.remove();
    })

    function getAddressData() {
          $scope.cityChoose = addressSelect.cityChoose;
          var allCityAddress = addressSelect.getAddressSelect();
          allCityAddress.then(function (respond) {
              $scope.addressSelect = respond.data.data;/*拿到 addressSelect 服务传过来的数据*/
          })
      }

    $scope.successGetData = true;
      //封装 http请求
    function getHTTP(){
      $http({
          method:'GET',
          url:GlobalVariable.SERVER_PATH+'api/mobile/strategy/list',
          params:{
              'page':1,
              'city':$scope.cityName || '深圳市'
          }
      })
          .success(function (respond) {
              if(respond.code === 0){
                  $scope.code = respond.code;
                  $scope.successGetData = true;
                  $scope.firstNotesData = respond.data[0];
                  $scope.othersNotesData = respond.data.splice(1)
              }else {
                  $scope.successGetData = false;
              }
          })
          .error(function (err) {
              console.log(err);
          });
          ShowAlertMessage.hideMessage();
  }
  //  手动选择城市
    $scope.getTravelNotes = function (manuallyChooseCity) {/*参数不能是相同*/
      $scope.cityName = manuallyChooseCity;
      cityNameFty.setCityName(manuallyChooseCity);
      getHTTP();/* 手动选择发送请求 */
      $scope.hideShow()
    }

    $scope.getWidth = function () {/* 动态获取div的width */
        return Number.parseInt(window.innerWidth - 100 - 12*2 -10 ) +'px'
    }
  })

    // 游记攻略详情模块
    .controller('TravelDetailCtrl',function ($scope,$state,$location,$timeout,$stateParams,$http,GlobalVariable,ShowAlertMessage) {
        var wsCache  = new WebStorageCache();
        var getStorageToken = null;/* 获取口令 */
        var getHttpData = Object.create(null);/* 用于储存收藏的params */
        $scope.collectState = false;/* 定义是否收藏状态*/

        // 请求数据
        getTravelDetailData();
        //  $stateParams用来接收上一个路由传过来的参
        function getTravelDetailData() {
            $http({
                url:GlobalVariable.SERVER_PATH+'api/mobile/strategy/detail/'+$stateParams.id,
                method:'GET'
            })
                .success(function (response) {
                    $scope.detailDatas = response.data;
                    getHttpData.title = response.data.title.slice(0,29);
                    getHttpData.describe = response.data.summary.slice(0,24);
                    getHttpData.url = $location.absUrl();/* 当前的url*/
                    getHttpData.image = response.data.thumb320 || response.data.thumb640 || response.data.thumbnail;/* 短路 过滤没有320小图的情况*/
                    getHttpData.id = response.data.id;
                })
                .error(function (err) {
                    console.log(err)
                })
        }

        //页面进入检查是否收藏
        var tokenIfEnabled = false;
        function  checkHasCollect() {
            getStorageToken = wsCache.get('ZHYToken');/* 获取localStorage储存的口令 */
            if(getStorageToken){
                $http({
                    method:'GET',
                    url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/collect/iscollect',
                    params:{
                        token:getStorageToken,
                        url:$location.absUrl()
                    }
                })
                    .success(function (response) {
                        if(response.code == -1){
                            tokenIfEnabled = false;/* 判断token是否有效 */
                        }else {
                            tokenIfEnabled = true;
                            if(response.data.success){
                                $scope.collectState = true;
                                //添加收藏 按钮的样式为填充色
                            }
                        }
                    })
                    .error(function (err) {
                        console.log(err)
                    })
            }
        }
        $scope.$on('$ionicView.enter',checkHasCollect);/* 每次页面都重新获取是否收藏 */


        // 点赞 ---  start  ---
        $scope.ifDot = true;/* 定义是否点赞 刚进来是默认可以点赞的*/
        $scope.judgeIfDot = function () {
            if($scope.ifDot == true){
                $scope.ifDot =false;
                $scope.detailDatas.upvoteCounts++;/* 数据驱动DOM更新 */
                postUpvote(1);/* 请求 */
                ShowAlertMessage.showMessage('点赞 +1','',true);/* 弹框 */
                $scope.dotState = true;/* 改变点赞小图片的样式*/
            }else {
                $scope.ifDot = true;
                $scope.detailDatas.upvoteCounts--;/* 数据驱动DOM更新 */
                postUpvote(0);
                ShowAlertMessage.showMessage('点赞 -1','',true);
                $scope.dotState = false;
            }
        };
        // 点赞功能
        function postUpvote(type) {
            $http({
                method:'POST',
                url:GlobalVariable.SERVER_PATH + 'api/mobile/strategy/upvote',
                params:{
                    id:getHttpData.id,
                    type:type
                }
            })
                .success(function (response) {
                    // ShowAlertMessage.showMessage(response.msg,'',true)
                })
                .error(function (err) {
                    console.log(err)
                })

        }
        // 点赞 ---  end  ---


        // ----- 收藏功能 ----- start -----
        // 添加收藏
         function collectTravel() {
             $http({
                method:'POST',
                url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/collect/add',
                params:{
                    token:getStorageToken,
                    image: GlobalVariable.SERVER_PATH + getHttpData.image,
                    title:getHttpData.title,
                    describe:getHttpData.describe,
                    url:getHttpData.url,
                    origin:'WECHAT'
                }
            })
                .success(function (response) {
                    if(response.code === 0){
                        ShowAlertMessage.showMessage(response.msg,'',true);
                        $scope.collectState = true;
                    }
                })
                .error(function (err) {
                    console.log(err)
                })
        }
        //取消收藏
        function deleteCollect() {
            $http({
                method:'POST',
                url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/collect/delete',
                params:{
                    token:getStorageToken,
                    url:$location.absUrl()
                }
            })
                .success(function (response) {
                    if(response.code === 0){
                        ShowAlertMessage.showMessage(response.msg,'',true);
                        $scope.collectState = false;
                    }
                })
                .error(function (err) {
                    console.log(err)
                })
        }
        // ----- 收藏功能 ----- end -----

       //点击收藏 按钮
        $scope.judgeIfCollect = function () {
            getStorageToken = wsCache.get('ZHYToken');/* 获取localStorage储存的口令 */
            if(!tokenIfEnabled || !getStorageToken){
                $state.go('login');/* 没有登录跳到登录页面 */
                storageCurrentUrl();/* 储存当前的页面url 便于登录完成后，直接跳回到这里 */
            }else {
                if($scope.collectState === true){
                    deleteCollect();
                }else {
                    collectTravel();
                }
            }
        };

        // !!!! 特别注意 定义储存当前的url便于跳转回来
        function storageCurrentUrl() {
            wsCache.set('currentUrl',$location.absUrl());
        }
    })


























