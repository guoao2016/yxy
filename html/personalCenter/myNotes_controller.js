/**
 * Created by Administrator on 2017/1/18.
 */
var myNotes = angular.module('myNotes.controller', []);
// 自定义指令，下部弹框
// <myactionsheet token="token" travelid="id" open="open" public="public"></myactionsheet>
myNotes.directive('myactionsheet', function ($http, $state, $ionicActionSheet, $location, GlobalVariable, ShowAlertMessage) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            open: '=',
            token: '=',
            travelid: '=',
            public: '='//在公开游记列表设置为不公开也要隐藏
        },
        template: "<div class='current_user'> " +
        "<span><i class='open'></i>{{openText}}</span> " +
        "<button class='ion-ios-arrow-down'></button>" +
        "</div>",
        link: function (scope, element) {
            console.log(scope.public);
            if (scope.open) {
                scope.openText = "公开";
                element.find('i').removeClass('close');
            } else {
                scope.openText = "不公开";
                element.find('i').addClass('close');
            }
            scope.show = false;
            element.bind('click', function (e) {
                console.log('ggg');
                e.stopPropagation();
                $ionicActionSheet.show({
                    buttons: [
                        {text: '公开游记'},
                        {text: '不公开游记'},
                    ],
                    destructiveText: '删除',
                    cancelText: '完成',
                    buttonClicked: function (index) {
                        console.log(index);
                        if (index == 0) {//公开游记
                            $http({
                                method: 'POST',
                                url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/open',
                                params: {
                                    id: scope.travelid,
                                    token: scope.token,
                                    open: true
                                }
                            }).success(function (res) {
                                if (res.code == 0) {
                                    scope.openText = "公开";
                                    element.find('i').removeClass('close');
                                }
                                console.log(res)
                            }).error(function (res) {

                            })
                        } else {//不公开
                            $http({
                                method: 'POST',
                                url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/open',
                                params: {
                                    id: scope.travelid,
                                    token: scope.token,
                                    open: false
                                }
                            }).success(function (res) {
                                scope.openText = "不公开";
                                element.find('i').addClass('close');
                                if (scope.public) {
                                    element.parent().parent().css('display', 'none');
                                }
                            }).error(function (res) {

                            })
                        }
                        return true;
                    },
                    destructiveButtonClicked: function () {//点击删除选项
                        console.log('删除');
                        delet();
                        function delet() {
                            $http({
                                method: 'POST',
                                url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/delete',
                                params: {
                                    token: scope.token,
                                    id: scope.travelid
                                }
                            }).success(function (res) {
                                if (res.code == 0) {
                                    console.log(res);
                                    if (scope.public) {
                                        element.parent().parent().css('display', 'none');
                                    } else {
                                        element.parent().css('display', 'none');
                                    }
                                }
                            }).error(function (err) {

                            }).finally(function () {

                            })
                        }
                        return true;
                    }
                });
            })
        }
    }
})

//1、---- 游记列表
myNotes.controller('MyNotesListCtrl', function ($scope, $rootScope, $http, $ionicActionSheet, GlobalVariable) {
    console.log('游记列表');
    var pageCount = 1;
    var loading = false;
    $scope.travelListItems = [];//游记列表数据
    var domain = GlobalVariable.SERVER_PATH_YXY;
    var wsCache = new WebStorageCache();
    $scope.token = wsCache.get('ZHYToken');
    ;
    $scope.$on("$ionicView.enter", function () {
        $scope.token = wsCache.get('ZHYToken');
        /* 获取口令 */
    });
    $scope.$on("ngRepeatFinished", function (repeatFinishedEvent, element) {
        $('.col-33').height($('.col-33').width());
    })

    $scope.loadData = function () {
        if (loading) {
            return
        }
        loading = true;
        $http({
            method: 'GET',
            url: domain + 'api/mobile/travel/list/',
            params: {
                token: $scope.token,
                page: pageCount
            }
        }).success(function (res) {
            if (res.code == 0) {
                pageCount++;
                $scope.noMorePage = false;//分页
                angular.forEach(res.data.list, function (val, index) {
                    val.images = JSON.parse(val.images);
                });
                $scope.travelListItems = $scope.travelListItems.concat(res.data.list);

                if (res.data.list.length < 10) {//当json的数量小于10（已经确定了一页为10条数据），说明页面到底了,减少一次请求
                    $scope.noMorePage = true;
                }
            }
            loading = false;
        }).error(function (res) {
            $scope.noMorePage = true;
        }).finally(function () {/* 成功、失败都会调用这个方法 */
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
    }
    $scope.loadData();
});
//2、----游记详情
// myNotes.controller('MyNotesDetailCtrl',function ($scope,$http,$stateParams,GlobalVariable) {
//         $scope.notesId=$stateParams.itemId;
//         console.log('游记详情');
//         $scope.$on("$ionicView.enter", function(){
//
//         });
// });


///3、----发表游记--空
myNotes.controller('MyNotesSendCtrl', function ($scope, $http, LocationService, $stateParams, $state, $location, $compile, $ionicModal, $ionicHistory, $timeout, $window, $ionicPopup, ShowAlertMessage, GlobalVariable, cityNameFty, addressSelect) {
    var domain = GlobalVariable.SERVER_PATH_YXY;
    var wsCache = new WebStorageCache();
    $scope.token = wsCache.get('ZHYToken');
    /* 获取口令 */
    // var parentUrl=wsCache.get('currentUrl');//获取进入url
    $scope.locationStatus = false;
    $scope.placeholder = "定位中...";
    $scope.canSend = true;//判断是否正在上传图片
    // 上传图片input  change时调用run

    $("#fileImage").on("change", function () {
        if ($scope.canSend) {
            run(this);
            fsubmit(this);
        } else {
            ShowAlertMessage.showMessage('正在上传图片', 1000, true);
        }

    });


    //***************上传临时图片
    function fsubmit(image) {
        console.log(image.files[0])
        var fd = new FormData();
        fd.append("image", image.files[0]);
        fd.append("token", $scope.token);
        console.log(fd);
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);
        xhr.open("POST", domain + "api/mobile/file/upload/image");//修改成自己的接口
        xhr.send(fd);
    }

    function uploadProgress(evt) {
        $scope.canSend = false;
        if (evt.lengthComputable) {
            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
            $('.progressNumber span').html(percentComplete.toString() + '%');
        }
        else {
            $('.progressNumber span').html('unable to compute');
        }
    }

    function uploadComplete(evt) {
        $scope.canSend = true;
        var path = JSON.parse(evt.target.responseText).data.path;
        console.log(path);
        $("#uploadForm").append("<input id='img" + i + "' type='hidden'  name='images' value='" + path + "'>");
        //把base64换成url
        $('#images_'+(i-1)).css('background-image','url('+path+')');
        $('.progressNumber').remove();
    }

    function uploadFailed(evt) {
        alert("There was an error attempting to upload the file.");
    }

    function uploadCanceled(evt) {
        alert("The upload has been canceled by the user or the browser dropped the connection.");
    }

    //***************上传临时图片


    //图片转Base64，并显示在页面
    var i = 0;//
    function run(input_file) {
        /*input_file：文件按钮对象*/
        /*get_data: 转换成功后执行的方法*/
        // 上传临时图片
        if (typeof(FileReader) === 'undefined') {
            //show
            ShowAlertMessage.showMessage('您好,无法识别图片', 2000)
        } else {
            //循环主要是为了同时可以上传多张图片
            for (var j = 0; j < input_file.files.length; j++) {
                /*图片转Base64 核心代码*/
                var files = input_file.files[j];
                //这里我们判断下类型如果不是图片就返回 去掉就可以上传任意文件
                if (!/image\/\w+/.test(files.type)) {
                    ShowAlertMessage.showMessage('请确保文件为图片', 2000)
                    return false;
                }
                if (parseInt(input_file.files[j].size) / 1024 > 5 * 1024) {
                    ShowAlertMessage.showMessage('图片大小必须小于5M', 2000)
                    return false;
                }
                var reader = new FileReader();
                reader.onload = function () {
                    var baseData = this.result;
                    // var li = "<li id='images_" + i + "' class='weui_uploader_file' style=background-image:url(" + this.result + ")>" + "<div class='progressNumber'><span></span></div>"+
                    // "<span class='delete ion-ios-close-empty'  ng-click='delet($event)'>" +
                    // "</span></li>";
                    var li = "<li id='images_" + i + "' class='weui_uploader_file'>" + "<div class='progressNumber'><span></span></div>"+
                    "<span class='delete ion-ios-close-empty'  ng-click='delet($event)'>" +
                    "</span></li>";
                    baseData = baseData.replace(/^data:(.*);base64,/i, "");
                    var $li = $compile(li)($scope); // 编译
                    // $("#uploadForm").append("<input id='img"+i+"' type='hidden'  name='images' value='" +baseData+ "'>");
                    i++;
                    $("#preview").append($li);
                };
                reader.readAsDataURL(files);
            }
        }
    }
    var image = [];
    //删除图片
    $scope.delet = function ($event) {//绑到删除事件
        var confirmPopup = $ionicPopup.confirm({
            title: '你确定要删除图片吗？',
            cancelText: '取消',
            okText: '确定'
        });
        confirmPopup.then(function (res) {
            if (res) {
                var target = ($event.target);
                $(target).parent("li").remove();
                var str = $(target).parent("li").attr('id');
                var index = parseInt(str.substr(str.length - 1, 1))+1;
                $('#img' + index).remove();
            } else {
                // console.log('You are not sure');
            }
        });
    }
    // 定位--------start---
    //获取位置信息，没有在定位
    if (cityNameFty.getLocationData().address) {
        $scope.locationStatus = true;
        $scope.currentCity = cityNameFty.getLocationData().city;
        $scope.currentPosition = cityNameFty.getLocationData().address;
    } else {
        LocationService.location().then(function (data) {//正确时
            // 定位坐标
            $scope.locationStatus = true;
            $scope.currentCity = data.addressComponent.city;
            $scope.currentPosition = data.formattedAddress;
        }, function (data) {//错误时
            $scope.locationStatus = false;
            $scope.currentPosition = "定位失败,请手动选择";//地址选择框上部提示
            $scope.currentCity = $scope.currentCity;
            $scope.placeholder = "定位失败，请您开启定位服务或选择地点";
        });
    }

    //定位-------end-----

    // 提交游记
    $scope.btnForm = function () {
        if ($scope.canSend) {
            if ($scope.token) {
                if ($scope.locationStatus) {
                    ShowAlertMessage.showMessage('提交中...', 100000);
                    $.ajax({
                        method: 'POST',
                        url: domain + 'api/mobile/travel/publish',
                        data: $('#uploadForm').serialize(),
                        dataType: 'json',
                        success: function (res) {
                            if (res.code === 0) {
                                ShowAlertMessage.hideMessage();
                                ShowAlertMessage.showMessage(res.msg, 2000);
                                $timeout(function () {
                                    $scope.content = null;
                                    $ionicHistory.goBack();
                                }, 2000)
                            } else if (res.code === 1) {
                                ShowAlertMessage.showMessage(res.msg, 2000)
                            } else if (res.code === -1) {
                                ShowAlertMessage.showMessage(res.msg, 2000)
                            }
                        }
                    })
                } else {
                    ShowAlertMessage.showMessage('需要您选择地址才能成功发送游记', 2000)
                }
            } else {
                $state.go('login');
            }
        } else {
            ShowAlertMessage.showMessage('正在上传图片', 1000, true)
        }
    }

    //手动选择地址---------start----
    citySelect();//城市选择
    function citySelect() {
        //函数调用
        getAddressData();
        //显示模态框
        $scope.showModal = function () {
            if ($scope.modal) {
                $scope.modal.show();
            } else {
                $ionicModal.fromTemplateUrl('html/modal/chooseAddress_modal.html', {
                    scope: $scope
                }).then(function (modal) {
                    $scope.modal = modal;
                    //逻辑代码
                    $scope.modal.show();
                })
            }
        };
        $scope.hideShow = function () {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });

        function getAddressData() {
            $scope.cityChoose = addressSelect.cityChoose;
            var promise = addressSelect.getAddressSelect();
            promise.then(function (respond) {
                // console.log(respond.data.data)
                $scope.addressSelect = respond.data.data;
                /*拿到 addressSelect 服务传过来的数据*/
            })
        }

        //手动选择城市
        $scope.getTravelNotes = function (i) {/*参数不能是相同*/
            $scope.currentCity = i;
            $scope.locationStatus = true;//手动选择地址
            $scope.hideShow();//隐藏模态框
        }
    }

    //手动选择地址---------end----

});

//4、 -----编辑游记--改
myNotes.controller('MyNotesEditCtrl', function ($scope, $compile, $http, $stateParams, $state, GlobalVariable, $timeout, ShowAlertMessage, $ionicPopup) {
    // 获取游记详情
    $scope.notesId = $stateParams.itemId;
    var wsCache = new WebStorageCache();
    $scope.token = wsCache.get('ZHYToken');
    /* 获取口令 */
    var i = 0;//
    $http.get(GlobalVariable.SERVER_PATH_YXY + '/api/mobile/travel/detail', {
        params: {
            id: $scope.notesId
        }
    }).success(function (res) {
        $scope.item = res.data;
        $scope.content = $scope.item.content;
        $scope.openMode = $scope.item.open;
        var itemImages = res.data.images;
        // console.log(itemImages);
        $.each(itemImages, function (index, val) {
            var li = "<li id='images_" + i + "' class='weui_uploader_file' style=background-image:url(" + val + ")>" +
                "<span class='delete ion-ios-close-empty'  ng-click='delet($event)'>" +
                "</span></li>";
            // baseData=baseData.replace(/^data:(.*);base64,/i,"");
            var $li = $compile(li)($scope); // 编译
            $("#uploadForm").append("<input id='img" + i + "' type='hidden'  name='images' value='" + val + "'>");
            i++;
            $("#preview").append($li);
        })
    });
    $scope.delet = function ($event) {//绑到删除事件
        var confirmPopup = $ionicPopup.confirm({
            title: '你确定要删除图片吗？',
            cancelText: '取消',
            okText: '确定'
        });
        confirmPopup.then(function (res) {
            if (res) {
                var target = ($event.target);
                $(target).parent("li").remove();
                var str = $(target).parent("li").attr('id');
                var index = str.substr(str.length - 1, 1);
                $('#img' + index).remove();
            } else {
                // console.log('You are not sure');
            }
        });
    }
    // 上传图片input  change时调用run
    $("#fileImage").on("change", function () {
        run(this);
    });

    //图片转Base64，并显示在页面
    function run(input_file) {
        /*input_file：文件按钮对象*/
        /*get_data: 转换成功后执行的方法*/
        if (typeof(FileReader) === 'undefined') {
            //show
            ShowAlertMessage.showMessage('您好,无法识别图片', 2000)
        } else {
            //循环主要是为了同时可以上传多张图片
            for (var j = 0; j < input_file.files.length; j++) {
                /*图片转Base64 核心代码*/
                var files = input_file.files[j];
                //这里我们判断下类型如果不是图片就返回 去掉就可以上传任意文件
                if (!/image\/\w+/.test(files.type)) {
                    ShowAlertMessage.showMessage('请确保文件为图片', 2000)
                    return false;
                }
                if (parseInt(input_file.files[j].size) / 1024 > 5120) {
                    ShowAlertMessage.showMessage("图片大小必须小于5M", 2000)
                    return false;
                }
                var reader = new FileReader();
                reader.onload = function () {
                    var baseData = this.result;
                    var li = "<li id='images_" + i + "' class='weui_uploader_file' style=background-image:url(" + this.result + ")>" +
                        "<span class='delete ion-ios-close-empty' ng-click='delet($event)'>" +
                        "</span></li>";
                    baseData = baseData.replace(/^data:(.*);base64,/i, "");
                    var $li = $compile(li)($scope); // 编译
                    $("#uploadForm").append("<input id='img" + i + "' type='hidden'  name='images' value='" + baseData + "'>");
                    i++;
                    $("#preview").append($li);
                };
                reader.readAsDataURL(files)
            }
        }
    }

    var image = new Array();

    // 提交
    $scope.btnForm = function () {
        ShowAlertMessage.showMessage('提交中...', 100000)
        $.ajax({
            method: 'POST',
            url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/edit',
            data: $('#uploadForm').serialize(),
            dataType: 'json',
            success: function (res) {
                if (res.code === 0) {
                    ShowAlertMessage.hideMessage();
                    ShowAlertMessage.showMessage(res.msg, 2000)
                    $timeout(function () {
                        $state.go('myNotes');//返回游记列表
                    }, 2000)
                } else if (res.code === 1) {
                    ShowAlertMessage.showMessage(res.msg, 2000)
                } else if (res.code === -1) {
                    ShowAlertMessage.showMessage(res.msg, 2000)
                }
            },
            error: function () {

            }
        })
    };

});
