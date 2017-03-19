/**
 * Created by hello world on 2016/12/27.
 */
angular.module('loginAll.controller',[])
    .controller('loginCtrl',function ($scope,$state,$http,GlobalVariable,ShowAlertMessage) {
        var loginUrl=GlobalVariable.SERVER_PATH+"api/mobile/user/login";/*验证码接口*/
        var wsCache = new WebStorageCache();
        var currentUrl = wsCache.get('currentUrl');/* 获取上一个页面跳转过来的url地址 */
        var re = /^1[34578]\d{9}$/;

        $scope.loginMyAccent = function (loginUserName,loginPassword) {
            var userName = re.test( $('#indexLoginUserName').val());/* 判断是否是中国大陆合法的手机号码 */
            var password = $('#indexLoginUserPassword').val().length;/* 密码框的输入长度 */

            if(!userName || password < 6){/* 判断是否正确输入 */
                ShowAlertMessage.showMessage('请输入正确的账号、密码',2000,true);
            }else {
                $http({
                    method:'POST',
                    url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/user/login',
                    params:{
                        username:loginUserName,
                        password:loginPassword
                    }
                })
                    .success(function (response) {
                        if(response.code === 0){
                            ShowAlertMessage.showMessage(response.msg,'',true);
                            console.log(response)
                            //  将token存放在localStorge中 有效时间是31天
                            wsCache.set("ZHYToken",response.data.token,{exp:2678400});/*特别注意*/
                            wsCache.set("userId",response.data.userInfo.id,{exp:2678400});
                            if(currentUrl){/* 收藏功能 评论功能都会记录其URL 如果存在，那么要重定向到记录时的页面 */
                                location.href = currentUrl;/* 重定向跳转登录前的页面 */
                            }else {
                                $state.go('tab.userCenter'); /* 到个人中心 */
                            }
                        }else {
                            ShowAlertMessage.showMessage(response.msg,'',true);
                        }
                    })
                    .error(function (err) {
                        //登录不了
                        console.log('不知道的错误！'+err)
                    })
            }
        };
        $scope.$on('$ionicView.enter',function () {
            $('#indexLoginUserPassword').val('');/* 每次进入登录页面视图，都会清空密码框*/
        })
        $scope.$on('$ionicView.afterLeave',function(){//离开时清除
            wsCache.delete('currentUrl');
        })
    })




    // 注册模块
    .controller('registerCtrl',function ($scope,$http,$timeout,$state,$interval,GlobalVariable,ShowAlertMessage) {
        var getCodeUrl=GlobalVariable.SERVER_PATH+"api/mobile/user/code/";/*验证码接口*/
        var registerUrl = GlobalVariable.SERVER_PATH+"api/mobile/user/regist";/*注册接口*/

        var verificationCode;
        $scope.showVerification = true;/*获取验证码状态*/
        $scope.showRemainTime = false;/*获取验证码过期时间状态*/
        $scope.showAgainSendTime = false;/*重新发送状态*/
        var re = /^1[34578]\d{9}$/;
        // ----- 获取验证码 ----- start -----
        $scope.getVerificationCode = function (userTelephoneNumber) {
            $('#registerGetPasswordYourCode').val('');
            var userName = re.test( $('#indexRegisterUserName').val());
            console.log(userName);
            if(!userName){
                ShowAlertMessage.showMessage('请输入正确的账号',2000,true);
            }else {
                $http({
                    method:'GET',
                    url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/user/code/'+userTelephoneNumber+'/1'
                })
                    .success(function (response) {
                        if(response.code == 0){
                            verificationCode = response.msg;/*验证码*/
                            var i = 120;
                            function changeTime() {
                                $scope.showVerification = false;
                                $scope.showAgainSendTime = false;
                                $scope.noSetMessage = true;/*在120s内不能重发验证码*/
                                $scope.remainingTime = i;
                                $scope.showRemainTime = true;
                                i--;
                                if(i <= 0){
                                    (function () {
                                        $scope.showRemainTime = false;
                                        $scope.showAgainSendTime = true;
                                        $scope.noSetMessage = false;/*在120s内能重发验证码*/
                                    })()
                                }
                            }
                            $interval(changeTime,1000,120);/*120秒钟自减*/
                        }else {
                            ShowAlertMessage.showMessage(response.msg+',请登录','',true);
                            // $timeout(function () {
                            //     $state.go('login');
                            // },1000)

                        }
                    })
                    .error(function (err) {
                        console.log(err);
                    })
            }
        };
        // ----- 获取验证码 ----- end -----

        // ----- 注册 ----- start -----
        $scope.registerUser = function (userTelephoneNumber,userPassword,userCode) {
            var userName = re.test( $('#indexRegisterUserName').val());
            var registerGetPasswordYourCode = $('#registerGetPasswordYourCode').val().length;
            var newPassword = $('#newPassword').val().length;
            if(!userName || registerGetPasswordYourCode != 6 || newPassword < 6){
                ShowAlertMessage.showMessage('请输入正确的账号、验证码、密码',2000,true);
            }else {
                $http({
                    method:'POST',
                    url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/user/regist',
                    params:{
                        username:userTelephoneNumber,
                        password:userPassword,
                        code:userCode
                    //    origin 忽略
                    }
                })
                    .success(function (response) {
                        if(response.code === 0){
                            $state.go('login');/* 跳到登录页面 */
                        }else{
                            ShowAlertMessage.showMessage(response.msg+'请重新输入...','',true)
                        }
                    })
                    .error(function (err) {
                        console.log(err)
                    })
            }
        };
        // ----- 注册 ----- end -----
    })

    // 修改密码模块
    .controller('getPasswordCtrl',function ($scope,$http,$interval,$state,GlobalVariable,ShowAlertMessage) {
        var getCodeUrl=GlobalVariable.SERVER_PATH+"api/mobile/user/code/";/*验证码接口*/
        var registerUrl = GlobalVariable.SERVER_PATH+"api/mobile/user/regist";/*注册接口*/

        var verificationCode;
        $scope.showVerification = true;/*获取验证码状态*/
        $scope.showRemainTime = false;/*获取验证码过期时间状态*/
        $scope.showAgainSendTime = false;/*重新发送状态*/
        // $scope.errorMessage = false;
        var re = /^1[34578]\d{9}$/;

        // ----- 获取验证码 ----- start -----
        $scope.getVerificationCode = function (userTelephoneNumber) {
            $('#getPasswordYourCode').val('');
            var userName = re.test( $('#getPasswordUserName').val());
            if(!userName){
                ShowAlertMessage.showMessage('请输入正确的账号',2000,true);
            }else {
                $http({
                    method:'GET',
                    url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/user/code/'+userTelephoneNumber+'/2'
                })
                    .success(function (response) {
                        console.log(response);
                        if(response.code == 0){
                            verificationCode = response.msg;/*验证码*/
                            var i = 120;
                            function changeTime() {
                                $scope.showVerification = false;
                                $scope.showAgainSendTime = false;
                                $scope.noSetMessage = true;/*在120s内不能重发验证码*/
                                $scope.remainingTime = i;
                                $scope.showRemainTime = true;
                                i--;
                                if(i <= 0){
                                    (function () {
                                        $scope.showRemainTime = false;
                                        $scope.showAgainSendTime = true;
                                        $scope.noSetMessage = false;/*在120s内能重发验证码*/
                                    })()
                                }
                            }
                            $interval(changeTime,1000,120);/*120秒钟自减*/
                        }else {
                            ShowAlertMessage.showMessage(response.msg,'',true);
                        }
                    })
                    .error(function (err) {
                        console.log(err);
                    })
            }
        };
        // ----- 获取验证码 ----- end -----

        // ----- 修改密码 ----- start -----
        $scope.registerUser = function (userTelephoneNumber,userPassword,userCode) {
            var userName = re.test( $('#getPasswordUserName').val());
            var getPasswordYourCode = $('#getPasswordYourCode').val().length;
            var getPasswordUserPassword = $('#getPasswordUserPassword').val().length;
            if(!userName || getPasswordYourCode != 6 || getPasswordUserPassword < 6 ){
                ShowAlertMessage.showMessage('请输入正确的账号、验证码、密码',2000,true);
            }else {
                $http({
                    method:'POST',
                    url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/user/findpwd/',
                    params:{
                        username:userTelephoneNumber,
                        password:userPassword,
                        code:userCode
                    }
                })
                    .success(function (response) {
                        if(response.code == 0){
                            ShowAlertMessage.showMessage(response.msg,2000,'noBackdrop')
                            $state.go('login');/*暂时到个人中心*/
                        }else{
                            ShowAlertMessage.showMessage(response.msg+',请重新输入...','',true);
                        }
                    })
                    .error(function (err) {
                        console.log(err)
                    })
            }
        };
        // ----- 修改密码 ----- start -----

    })
.controller('platformProtocolCtrl',function ($scope) {

})