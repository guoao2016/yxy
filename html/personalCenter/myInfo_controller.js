/**
 * Created by hello world on 2017/1/9.
 */
angular.module('myInfo.controller',[])

    .controller('MyInfoCtrl',function ($scope,$rootScope,$http,GlobalVariable,$timeout,$state,ShowAlertMessage,$window) {
        var wsCache  = new WebStorageCache();
        var getStorageToken = wsCache.get('ZHYToken');/* 获取口令 */
        var nick;
        $scope.$on('$ionicView.enter',function () { //进入获取评论数据
            var newStorageToken = wsCache.get('ZHYToken');/* 获取口令 */
            if(getStorageToken!=newStorageToken){
                getStorageToken=newStorageToken;
                userInfo();
            }
            // 数据
            nick=wsCache.get('nick')
            if(nick){
                $scope.nick=nick;
            }
        });
        $scope.$on("$ionicView.beforeLeave", function(){
            $('.weui-picker-container').hide();//隐藏地址选择
        });
        //获取用户基本信息
        userInfo();
        function  userInfo() {
            $http({
                method:'GET',
                url:GlobalVariable.SERVER_PATH_YXY+"api/mobile/user/info/"+getStorageToken
            })
                .success(function (response) {
                    if(response.code==0){
                        $scope.userInfo=response.data;
                        $scope.nick=response.data.nick;
                        wsCache.set('nick',$scope.nick,1000);/* 存储nick */
                        $window.oldNick=response.data.nick;
                    }else {
                        //token失效  进入登录页面
                        if(response.code==-1){
                            $state.go('login');
                            ShowAlertMessage.showMessage(response.msg,'',true)
                        }else {
                            ShowAlertMessage.showMessage(response.msg,'',true)
                        }
                    }
                })
                .error(function (err) {
                    console.log(err)
                })
        }
        //上传头像
        $("#uploadIcon").click(function () {
            //将图片序列化成base64
            $(this).on("change",function () {
                if ( typeof(FileReader) === 'undefined' ){
                    ShowAlertMessage.showMessage('请上传图片','',true)
                }else {
                    var file=this.files[0];
                    if (!/image\/\w+/.test(file.type)) {
                        ShowAlertMessage.showMessage('请确保文件为图片',2000)
                        return;
                    }
                    if (parseInt(file.size) / 1024 > 3*1024) {
                        /*layer.msg("图片大小必须小于5M")*/
                        ShowAlertMessage.showMessage('图片大小必须小于3M',2000)
                        return false;
                    }
                    var reader = new FileReader();
                    reader.onload=function () {
                        var baseData=this.result;
                        $("#icon").attr("src",baseData);
                        //替换掉 data:****;base64,
                        baseData=baseData.replace(/^data:(.*);base64,/i,"");
                        $("#base64Icon").val((baseData));
                    }
                    reader.readAsDataURL(file);
                }
            })
        });

        //更新用户信息
        $scope.token=getStorageToken;
        $scope.updateUserInfo=function () {
            ShowAlertMessage.showMessage('资料提交中,请稍后...',100000)
            $.ajax({
                url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/user/update',
                type:"post",
                dataType:"json",
                data:$("#userForm").serialize(),
                success:function (res) {
                    if(res.code===0){
                        $timeout(function () {
                            ShowAlertMessage.hideMessage();
                            $state.go('tab.userCenter');
                        },1000)
                    }else {
                        if(res.code==-1){
                            //需要调转到登陆页面
                            ShowAlertMessage.showMessage(res.msg,'',true)
                        }else {
                            ShowAlertMessage.showMessage(res.msg,'',true)
                        }
                       ShowAlertMessage.hide();
                    }
                },
                error:function (err) {
                    ShowAlertMessage.hideMessage();
                }
            });
        };


        // // 获取数据
        // $rootScope.$on('open.notice.editor', function(event, data){
        //     console.log($rootScope);
        //     console.log(data);
        // });
    })
    .controller('MyNick',function ($scope,$rootScope,$timeout,$window,$state,$ionicHistory,ShowAlertMessage) {
        var wsCache  = new WebStorageCache();
        $scope.myNick=wsCache.get('nick');
        $scope.WidthCheck=function(str, maxLenght){
            var realLength = 0;
            console.log(str);
            //（将255以外的字符替换成"aa"的做法，取长度）
            function GetLength(){
                return str.replace(/[^\x00-\xff]/g,"aa").length;
            };
            var realLength=GetLength();
            console.log(realLength);
            if(realLength>16){
               $scope.myNick = str.substr(0,10);
               return;
            }
        }//超过长度无法输入
        $scope.sendMyNick=function () {
            // 根据字符长度限制
            if($scope.myNick.length>=1){
                wsCache.set('nick',$scope.myNick,{exp : 100});/* 存储nick */
                $timeout(function () {
                    $state.go('myInfo');
                },300);
            }else{
                ShowAlertMessage.showMessage('昵称不能为空','1500','noBackdrop');
            }
           // $rootScope.$broadcast('open.notice.editor', $scope.myNick);
        }
    });
