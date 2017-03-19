angular.module('myTravel.controller', [])/* xxx.controller 命名*/
// 点赞指令
// <like number="item.upvoteCounts" id="item.id"></like>
    .directive('like', function ($http, GlobalVariable, ShowAlertMessage) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                number: '=',
                id: '='
            },
            template: '<span class="praise"><i></i>{{number>0?number:""}}</span>',
            link: function (scope, element) {
                var ifDot = true;
                // 点赞功能
                function postUpvote(type) {
                    $http({
                        method: 'POST',
                        url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/upvote',
                        params: {
                            id: scope.id,
                            type: type
                        }
                    }).success(function (res) {

                    }).error(function (err) {

                    })
                }

                element.bind('click', function (e) {
                    e.stopPropagation();
                    if (ifDot) {
                        ifDot = false;
                        scope.$apply(
                            scope.number++
                        )
                        ShowAlertMessage.showMessage('点赞 +1', 800, true);
                        postUpvote(1);
                        element.addClass('praised');
                    } else {
                        ifDot = true;
                        scope.$apply(
                            scope.number--
                        )
                        ShowAlertMessage.showMessage('点赞 -1', 800, true);
                        postUpvote(0);
                        element.removeClass('praised');
                    }
                })
            }
        }


    })

    // 删除自己的评论指令(后台删除，页面元素隐藏)
    // <deletcomment token="token" id="item.id"></deletcomment>
    .directive('deletecomment', function ($http, $ionicPopup, GlobalVariable, ShowAlertMessage) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                token: '=',
                id: '='
            },
            template: ' <button type="button">删除</button>',
            link: function (scope, element) {
                // 点赞功能
                function postDelet() {
                    $http({
                        method: 'POST',
                        url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/comment/delete',
                        params: {
                            id: scope.id,
                            token: scope.token
                        }
                    }).success(function (res) {
                        ShowAlertMessage.showMessage(res.msg, 1000, 'onBackdrop')
                    }).error(function (err) {

                    })
                }

                element.bind('click', function () {
                    // console.log(element.parent().parent().parent().parent());
                    $ionicPopup.confirm({
                        title: '你确定要删除吗？',
                        cancelText: '取消',
                        okText: '确定'
                    }).then(function (res) {
                        if (res) {
                            element.parent().parent().parent().parent().remove();
                            postDelet();
                            // scope.$emit('deleteFinished', element);  //广播
                        } else {

                        }
                    });

                })

            }
        }


    })

    // 删除自己的评论回复指令(后台删除，页面元素隐藏)
    // <deletreply token="token" id="item.id"></deletreply>
    .directive('deletereply', function ($http, $ionicPopup, GlobalVariable, ShowAlertMessage) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                token: '=',
                id: '='
            },
            template: ' <button type="button">删除</button>',
            link: function (scope, element) {
                // 点赞功能
                function postDelet() {
                    $http({
                        method: 'POST',
                        url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/comment/delete',
                        params: {
                            id: scope.id,
                            token: scope.token
                        }
                    }).success(function (res) {
                        ShowAlertMessage.showMessage(res.msg, 1000, 'onBackdrop')
                    }).error(function (err) {

                    })
                }

                element.bind('click', function () {
                    console.log(element.parent().parent().parent().parent());
                    $ionicPopup.confirm({
                        title: '你确定要删除吗？',
                        cancelText: '取消',
                        okText: '确定'
                    }).then(function (res) {
                        if (res) {
                            element.parent().parent().parent().parent().remove();
                            postDelet();
                            // scope.$emit('deleteFinished', element);  //广播
                        } else {

                        }
                    });

                })

            }
        }


    })

    // 进来可以点赞，再次点提示已点赞
    //  <likelite number="commentItem.favor" id="commentItem.id"></likelite>

    .directive('likelite', function ($http, GlobalVariable, ShowAlertMessage) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                number: '=',
                id: '='
            },
            template: '<span class="praise"><i></i>{{number>0?number:" "}}</span>',
            link: function (scope, element) {
                var ifDot = true;//一进来可以点赞
                // 点赞功能
                function postUpvote() {
                    $http({
                        method: 'POST',
                        url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/favor',
                        params: {
                            id: scope.id,
                            type: 2
                        }
                    }).success(function (res) {
                    }).error(function (err) {

                    })
                }

                element.bind('click', function (e) {
                    e.stopPropagation();
                    if (ifDot) {
                        ifDot = false;
                        scope.$apply(
                            scope.number++
                        )
                        ShowAlertMessage.showMessage('点赞 +1', 800, true);
                        postUpvote();
                        element.addClass('praised');

                    } else {
                        ShowAlertMessage.showMessage('您已点赞', 800, true);
                    }
                })
            }
        }


    })
    //收藏
    // <collect  token='token' id="item.id" img="item.icon" nick="nick" content="content"></collent>
    .directive('collect', function ($http, $state, $location, GlobalVariable, ShowAlertMessage) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                token: '=',
                id: '=',
                img: '=',
                nick: '=',
                content: '='
            },
            templateUrl: 'html/myTravel/collectTemplate.html',
            link: function (scope, element) {
                scope.isCollect = false;//收藏状态
                var wsCache = new WebStorageCache();

                function storageCurrentUrl() {
                    wsCache.set('currentUrl', $location.absUrl());
                }

                // 点赞功能
                scope.text = '收藏';
                scope.$watch('token', function () {
                    if (scope.token) {//登录状态下判断是否收藏
                        ifCollect();
                    } else {
                        scope.isCollect = false;//未登录状态无需判断
                        scope.text = '收藏';
                    }
                })

                element.bind('click', function (e) {
                    e.stopPropagation();
                    if (scope.token) {
                        ifCollect();
                        if (scope.isCollect) {
                            deleteCollect();
                        } else {
                            doCollect();
                        }
                    } else {
                        storageCurrentUrl();
                        $state.go('login');//未登录跳转到登录页面
                    }
                })

                function ifCollect() {
                    $http({
                        method: 'GET',
                        url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/collect/iscollect',
                        params: {
                            token: scope.token,
                            url: 'http://ionic.yxzhy.cc/#/myTravelDetail/' + scope.id
                        }
                    }).success(function (res) {
                        if (res.code == 0) {
                            if (res.data.success) {//已收藏
                                scope.text = '已收藏';
                                scope.isCollect = true;
                            } else {
                                scope.text = '收藏';
                                scope.isCollect = false;
                            }
                        }
                    }).error(function (err) {

                    })
                }

                // 收藏
                function doCollect() {
                    console.log('收藏');
                    $http({
                        method: 'POST',
                        url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/collect/add',
                        params: {
                            token: scope.token,
                            image: scope.img,
                            title: scope.nick,
                            describe: scope.content.slice(0, 24),
                            url: 'http://ionic.yxzhy.cc/#/myTravelDetail/' + scope.id,
                            origin: 'WECHAT'
                        }
                    }).success(function (res) {
                        if (res.code == 0) {
                            ShowAlertMessage.showMessage(res.msg, '', true);
                            scope.isCollect = true;
                            scope.text = '已收藏';
                        }
                    }).error(function (err) {

                    })
                }

                // 取消收藏
                function deleteCollect() {
                    console.log('取消收藏');
                    $http({
                        method: 'POST',
                        url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/collect/delete',
                        params: {
                            token: scope.token,
                            url: 'http://ionic.yxzhy.cc/#/myTravelDetail/' + scope.id
                        }
                    }).success(function (res) {
                        ShowAlertMessage.showMessage(res.msg, '', true);
                        scope.isCollect = false;
                        scope.text = '收藏';
                    }).error(function (err) {

                    })
                }
            }
        }
    })
    //ng-repeat染完成事件
    .directive('onRepeatFinishedRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        //这里element, 就是ng-repeat渲染的最后一个元素
                        scope.$emit('ngRepeatFinished', element);//向父控制器广播
                    });
                }
            }
        };
    })
    .controller('MyTravelList', function ($http, $scope, $state, $ionicPopup, $location, $ionicModal, cityNameFty, addressSelect, GlobalVariable, ShowAlertMessage) {
        var wsCache = new WebStorageCache();
        var pageCount = 1;
        var loading = false;
        $scope.cityName = '全部';
        $scope.showSelect = false;
        $scope.public = true;//判断公开列表页
        $scope.openTravelNotes = [];
        $scope.$on("$ionicView.beforeEnter", function () {
            $scope.token = wsCache.get('ZHYToken');
            /* 获取口令 */
            $scope.getuserId = wsCache.get('userId');
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
                url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/opened/list',
                params: {
                    city: $scope.cityName,
                    page: pageCount
                }
            }).success(function (res) {
                if (res.code == 0) {
                    pageCount++;
                    $scope.noMorePage = false;//分页
                    angular.forEach(res.data.list, function (val, index) {
                        val.images = JSON.parse(val.images);
                    });
                    $scope.openTravelNotes = $scope.openTravelNotes.concat(res.data.list);
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
        //暂时不定位城市，显示全部（有些城市无游记）
        //if (cityNameFty.getLocationData().city) {
        //    $scope.cityName = cityNameFty.getLocationData().city;
        //
        //    $scope.currentPosition = cityNameFty.getLocationData().address;//地址选择框显示定位地址
        //    $scope.openTravelNotes = [];
        //    pageCount = 1;
        //    $scope.loadData();
        //} else {
        //    $scope.loadData();
        //}

        //$scope.$watch(function () {
        //    return cityNameFty.getCityName();
        //}, function (n) {
        //    if (n) {
        //        $scope.cityName = n;
        //        cityNameFty.setCityName(n);//设置加载内容城市为列表和地图页服务
        //        $scope.openTravelNotes = [];
        //        pageCount = 1;
        //        $scope.loadData();
        //    }
        //});
        $scope.allCity = function () {//全部城市游记列表
            $scope.showSelect = false;
            $scope.cityName = '全部';
            $scope.openTravelNotes = [];
            pageCount = 1;
            $scope.loadData();
        }
        $scope.allCity();
        //手动选择城市
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
                $scope.cityChoose = addressSelect.cityChoose;//热门城市
                var promise = addressSelect.getAddressSelect();
                promise.then(function (respond) {
                    $scope.addressSelect = respond.data.data;
                    /*拿到 addressSelect 服务传过来的数据*/
                })
            }

            //手动选择城市  ---为城市绑定事件
            $scope.getTravelNotes = function (i) {
                $scope.hideShow();//隐藏模态框
                $scope.showSelect = false;
                if (i == $scope.cityName) {//城市相同则不变
                    return
                } else {

                    $scope.cityName = i;
                    $scope.openTravelNotes = [];
                    pageCount = 1;
                    $scope.loadData();
                    cityNameFty.setCityName($scope.cityName);
                }
            }
        }

        // 举报确认对话框
        $scope.report = function ($event) {
            $event.stopPropagation();
            $ionicPopup.confirm({
                title: '你确定要举报吗？',
                cancelText: '取消',
                okText: '确定'
            })
                .then(function (res) {
                    if (res) {
                        ShowAlertMessage.showMessage('举报成功', 1000, 'noBackdrop')
                    } else {

                    }
                });

        }

        // 写游记按钮
        $scope.writeNotes = function () {
            if ($scope.token) {
                $state.go('myNotesSend')
            } else {
                $state.go('login');
            }
        }
    })
    .controller('MyTravelDetail', function ($http, $scope, $stateParams, $state, $ionicPopup, $location, ShowAlertMessage, GlobalVariable) {
        var wsCache = new WebStorageCache();
        $scope.id = $stateParams.itemId;//传给指令
        $scope.public = true;//判断公开列表页
        $scope.$on("$ionicView.beforeEnter", function () {
            $scope.token = wsCache.get('ZHYToken');
            /* 获取口令 */
            $scope.userId = wsCache.get('userId');
            /* 获取口令 */
        });
        // 游记详情数据
        $http({
            method: 'GET',
            url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/detail',
            params: {
                id: $stateParams.itemId
            }
        }).success(function (res) {
            if (res.code == 0) {
                $scope.item = res.data;
            }
        }).error(function (res) {
            console.log(res)

        })
        // 评论数据
        getComment();
        function getComment() {
            $http({
                method: 'GET',
                url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/comment/list/' + $stateParams.itemId,
            }).success(function (res) {
                if (res.code == 0) {
                    $scope.commentItems = res.data.list;
                }
            }).error(function (res) {
                console.log(res)
            })
        }

        // $scope.$on("deleteFinished", function (repeatFinishedEvent, element){
        //     console.log('finished');
        //     getComment();
        // })
        // 举报确认对话框
        $scope.report = function ($event) {
            $event.stopPropagation();
            $ionicPopup.confirm({
                title: '你确定要举报吗？',
                cancelText: '取消',
                okText: '确定'
            })
                .then(function (res) {
                    if (res) {
                        ShowAlertMessage.showMessage('举报成功', 1000, 'noBackdrop')
                    } else {

                    }
                });

        }
        // 写评论弹框
        // 触发一个按钮点击，或一些其他目标
        $scope.writeComment = function () {
            if ($scope.token) {
                $scope.data = {}
                // 一个精心制作的自定义弹窗
                var myPopup = $ionicPopup.show({
                    template: '<textarea rows="5" ng-model="data.wifi">',
                    title: '写评论',
                    cssClass: 'commentPopup',
                    scope: $scope,
                    buttons: [
                        {
                            text: '取消',
                            type: 'button-positive',
                            onTap: function (e) {
                                //关闭
                            }

                        }, {
                            text: '发送',
                            type: 'button-positive',
                            onTap: function (e) {
                                if (!$scope.data.wifi) {
                                    //非空不发送
                                    e.preventDefault();
                                } else {
                                    return $scope.data.wifi;
                                }
                            }
                        }
                    ]
                });
                myPopup.then(function (res) {
                    $http({
                        method: 'POST',
                        url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/comment/add',
                        params: {
                            id: $stateParams.itemId,
                            token: $scope.token,
                            text: res
                        }
                    }).success(function (res) {
                        if (res.code == 0) {
                            getComment();
                            ShowAlertMessage.showMessage(res.msg, 1000, 'noBackdrop')
                        }
                    }).error(function (res) {
                        console.log(res)

                    })
                });
                $scope.$on("$ionicView.beforeLeave", function (event, data) {
                    myPopup.close();
                });
            } else {
                $state.go('login');
                wsCache.set('currentUrl', $location.absUrl());
            }
        }
    })
    .controller('MyTravelReply', function ($http, $scope, $state, $stateParams, $ionicPopup, ShowAlertMessage, GlobalVariable) {
        var wsCache = new WebStorageCache();
        $scope.id = $stateParams.itemId;//传给指令
        $scope.$on("$ionicView.afterEnter", function () {
            $scope.token = wsCache.get('ZHYToken');
            /* 获取口令 */
            $scope.userId = wsCache.get('userId');
            /* 获取口令 */
        });
        // 获取上部游记评论
        getComment();
        function getComment() {
            $http({
                method: 'GET',
                url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/comment/detail',
                params: {
                    id: $stateParams.itemId,
                }
            }).success(function (res) {
                if (res.code == 0) {
                    $scope.commentItem = res.data;
                    console.log(res.data);
                }
            }).error(function (res) {
                console.log(res);

            })
        }

        //上下点赞同步
        $scope.ifDot = true;//一进来可以点赞
        $scope.thumbUp = function ($event) {
            $event.stopPropagation();
            $scope.thumb = true;
            if ($scope.ifDot) {
                $scope.ifDot = false;
                $scope.commentItem.favor++;
                ShowAlertMessage.showMessage('点赞 +1', 800, true);
                postUpvote();
            } else {
                ShowAlertMessage.showMessage('您已点赞', 800, true);
            }

            // 点赞功能
            function postUpvote() {
                $http({
                    method: 'POST',
                    url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/favor',
                    params: {
                        id: $stateParams.itemId,
                        type: 2
                    }
                }).success(function (res) {

                }).error(function (err) {

                })
            }
        }
        getReplyList();
        function getReplyList() {
            $http({
                method: 'GET',
                url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/reply/list',
                params: {
                    id: $stateParams.itemId,
                    page: 1
                }
            }).success(function (res) {
                if (res.code == 0) {
                    $scope.replyItems = res.data.list;
                    console.log(res.data.list);
                }
            }).error(function (res) {
                console.log(res);

            })
        }

        $scope.$on("ngRepeatFinished", function (repeatFinishedEvent, element) {
            getReplyList();
        })
        // 举报确认对话框
        $scope.report = function ($event) {
            $event.stopPropagation();
            $ionicPopup.confirm({
                title: '你确定要举报吗？',
                cancelText: '取消',
                okText: '确定'
            })
                .then(function (res) {
                    if (res) {
                        ShowAlertMessage.showMessage('举报成功', 1000, 'noBackdrop')
                    } else {

                    }
                });

        }
        // 发送评论的评论
        function postReply(res) {
            $http({
                method: 'POST',
                url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/travel/reply/add',
                params: {
                    id: $stateParams.itemId,
                    token: $scope.token,
                    text: res
                }
            }).success(function (res) {
                if (res.code == 0) {
                    getReplyList();
                    ShowAlertMessage.showMessage(res.msg, 1000, 'noBackdrop')
                }
            }).error(function (res) {
                console.log(res)

            })
        }

        // 写评论弹框
        // 触发一个按钮点击，或一些其他目标
        $scope.writeComment = function () {
            if ($scope.token) {
                $scope.data = {}
                var myPopup = $ionicPopup.show({
                    template: '<textarea rows="5" ng-model="data.wifi">',
                    title: '写评论',
                    cssClass: 'commentPopup',
                    scope: $scope,
                    buttons: [
                        {
                            text: '取消',
                            type: 'button-positive',
                            onTap: function (e) {
                                //关闭
                            }

                        }, {
                            text: '发送',
                            type: 'button-positive',
                            onTap: function (e) {
                                if (!$scope.data.wifi) {
                                    //非空不发送
                                    e.preventDefault();
                                } else {
                                    postReply($scope.data.wifi);
                                }
                            }
                        }
                    ]
                });

            } else {
                $state.go('login');
            }


        }
    })




























