/**
 * Created by hello world on 2017/1/9.
 */
angular.module('userCenter.controller',[])
    .controller('UserCenterCtrl',function ($scope,$state,$http,$ionicPopup,$timeout,$location,GlobalVariable,ShowAlertMessage) {
        // $scope.showMessage = false;
        var wsCache = new WebStorageCache();
        var userToken = wsCache.get('ZHYToken');
        wsCache.set("currentUrl",$location.absUrl());/* 写游记返回地址*/

        //每次进入视图时，都要获取token 和 更新个人信息
        $scope.$on('$ionicView.enter',function () {
            userToken = wsCache.get('ZHYToken');
            wsCache.set("currentUrl",$location.absUrl());/*个人中心*/
            getUserFile();/* 获取用户资料 */
        })
        function getUserFile() {
            $http({
                method:'GET',
                url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/user/info/'+userToken
            })
                .success(function (response) {
                    if(response.code == 0){
                       $scope.myIcon = response.data.icon;
                       $scope.myNick = response.data.nick;
                    }else {
                        ShowAlertMessage.showMessage(response.msg,'',false);
                        $timeout(function () {
                            // $scope.showMessage = false;
                            $state.go('login')
                        },1000)
                    }
                })
                .error(function (err) {
                    console.log(err)
                })
        }


        // 退出时的确认对话框
        $scope.logout = function () {
            $ionicPopup.confirm({
                title: '你确定要退出登录吗？',
                cancelText:'取消',
                okText:'确定'
            })
                .then(function(res) {
                    if(res) {
                        // 确定退出时，跳转到首页，并且清空所有储存的数据
                        $state.go('tab.scenicRecommend');
                        wsCache.clear();
                    } else {

                    }
            });

        }
    })

    // 我的收藏
    .controller('MyCollectCtrl',function ($scope,$ionicPopup,$http,GlobalVariable,ShowAlertMessage) {
        $scope.hasMoreCollect = true;/* 显示提示信息*/
        // $scope.noMoreData = false;/* 没有更多数据状态 */
        $scope.pageNo = 0;/* http请求的开始页*/
        $scope.pageCount = 1;
        var wsCache = new WebStorageCache;
        var myToken = wsCache.get('ZHYToken');/* 获取本地储存的token*/
        $scope.collectListData = [];/* 用来接收遍历的数据 */
        var tempArray =[];

        // ----- 请求我的收藏列表数据 ----- star -----
        $scope.getMyCollectData = function () {
            $scope.pageNo++;
            $http({
                method:'GET',
                url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/collect/list',
                params:{
                    token:myToken,
                    page:$scope.pageNo,
                    type:'WECHAT'
                }
            })
                .success(function (response) {
                    if(response.code == 0){
                        if(response.data.list.length){/*返回列表数据*/
                            $scope.hasMoreData = true;
                            $scope.pageCount = response.data.pageCount;
                            angular.forEach(response.data.list,function (list,index) {
                                $scope.collectListData.push(list);/* 把后台的数据不断加载到页面显示的数组中*/
                                tempArray = $scope.collectListData;
                            })
                        }else {
                            $scope.hasMoreCollect = false;/* 没有事数据时的状态*/
                        }
                    }else {
                        $scope.hasMoreCollect = false;/* 没有数据时的状态*/
                    }
                })
                .error(function (err) {
                    console.log(err);
                })
                .finally(function () {
                    $scope.$broadcast('scroll.infiniteScrollComplete');/*停止广播*/
                })
        };
        $scope.$on('$ionicView.enter',function () {/* 页面重新进入时，重新加载收藏数据 */
            $scope.getMyCollectData();
        });
        // ----- 请求我的收藏列表数据 ----- end -----


        // ----- 删除功能 ----- star -----
        $scope.canDelete = false; /* 是否点击状态 */
        // $scope.isChoose = false;/* 是否选择状态 */
        var totalArr = [];/* 临时数组 */
        var deleteDataUrl = [];/* 临时数组 */



        // 选择删除数据 及 状态
        $scope.onItemDelete = function(item,index) {
            if(totalArr.indexOf(item) === -1){/* 临时数组中没有本条数据 */
                totalArr.push(item);/* 把要删除的数据储存在临时数组中 */
                $('.numbers-'+index).removeClass('ion-ios-circle-outline').addClass('ion-ios-circle-filled ')
            }else {
                angular.forEach(totalArr,function (value) {
                    // 数据已经储存在临时数组中，那么再次点击的话，就会在临时数组中删除
                    if(value === item){
                        totalArr.splice(totalArr.indexOf(item),1);
                        // console.log(tempArray);
                        $('.numbers-'+index).removeClass('ion-ios-circle-filled ').addClass('ion-ios-circle-outline ')
                    }
                })
            }
            $scope.chooseDeleteNum =totalArr.length ? '(' + totalArr.length + ')' : '' ;/* 判断选中的要删除的数据条数，三元运算判断 0 条时，不显示 */
        };
        // 删除数据库方法
        function remove () {
            if(totalArr.length){
                angular.forEach(totalArr,function (value) {
                    deleteDataUrl.push(value.url);/* 储存要删除的数据的url http请求*/
                    $scope.collectListData.splice($scope.collectListData.indexOf(value),1);/* 我的收藏列表数组中，删除选中要删除的数据 */
                });
                $http({
                    method:'POST',
                    url:GlobalVariable.SERVER_PATH_YXY + 'api/mobile/collect/app/delete',
                    params:{
                        url:deleteDataUrl,/* 这里是个 [] 参数*/
                        token:myToken
                    }
                })
                    .success(function (response) {
                        if(response.code === 0 ){
                            ShowAlertMessage.showMessage('成功删除','',false)
                        }else {
                            ShowAlertMessage.showMessage(response.msg,'',false)
                        }
                    })
                    .error(function (err) {
                        console.log(err)
                    })
            }else {
                return false;
            }

        }
        // 确定删除功能
        $scope.sureDelete = function () {
            if(totalArr.length){
                $ionicPopup.confirm({
                    title: '你确定要删除吗？',/*'+ $scope.chooseDeleteNum + 条收藏'*/
                    cancelText:'取消',
                    okText:'确定'
                })
                    .then(function(res) {
                        if(res) {/* 确定时，真正删除*/
                            remove ();
                            totalArr = [];/* 清空临时数组 */
                            deleteDataUrl = [];/* 清空临时数组 */
                            $scope.chooseDeleteNum =totalArr.length ? '(' + totalArr.length + ')' : '' ;/* 重新显示删除的条数 */
                        } else {
                            $scope.canDelete = !$scope.canDelete;/* 取消时，回到编辑状态*/
                            $scope.changeFooterState = false;
                            someDeleteMethod();
                        }
                    });
            }
            return false;
        };
        // ----- 删除功能 ----- end -----


        $scope.changeState = function () {
            if($scope.canDelete === true){
                $scope.changeFooterState = false;
                $('.contentList').css('margin-bottom','0');

            }else {
                $scope.changeFooterState = true;
                $('.contentList').css('margin-bottom','44px');
                someDeleteMethod();
            }
        };
        $scope.chooseAll = function () {
            if($scope.canDelete === true){
                $('.DefinitionTags').removeClass('ion-ios-circle-outline').addClass('ion-ios-circle-filled');
                angular.forEach(tempArray,function (value, index) {
                    totalArr[index] =  value;/* 重新生成totalArr对象数组，不能直接引用，否则改变整个数据结构 */
                })
                // console.log(tempArray);
                $scope.chooseDeleteNum =totalArr.length ? '(' + totalArr.length + ')' : '' ;/* 判断选中的要删除的数据条数，三元运算判断 0 条时，不显示 */

            }
        };
        $scope.cancelAll = function () {
            if($scope.canDelete === true){
                someDeleteMethod();
            }
        }
        function someDeleteMethod() {
            $('.DefinitionTags').removeClass('ion-ios-circle-filled ').addClass('ion-ios-circle-outline');
            totalArr=[];/* 让要删除的数据的全部为空 */
            $scope.chooseDeleteNum =totalArr.length ? '(' + totalArr.length + ')' : '' ;/* 判断选中的要删除的数据条数，三元运算判断 0 条时，不显示 */
        }
    })