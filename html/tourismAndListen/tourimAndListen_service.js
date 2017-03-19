/**
 * Created by hello world on 2016/11/1.
 */
angular.module('tourismAndListen.service', [])
    // 使用  <myaudio></myaudio>
    .directive('myaudio', function ($sce, ShowAlertMessage) {
        return {
            restrict: 'AE',
            replace: false,
            templateUrl: 'html/tourismAndListen/audioTemplate.html',
            link: function (scope) {
                scope.$on('audiourl', function (event, data) {
                    scope.audiourl = data;
                    scope.sceaudiourl = $sce.trustAsResourceUrl(scope.audiourl);//信任
                })
                scope.audioPlay = false;//音频播放状态
                scope.audioBtn = function () {
                    if (audioId.paused) {
                        audioId.play();
                        scope.audioPlay = true;
                    } else {
                        audioId.pause();
                        scope.audioPlay = false;
                    }
                }
                //触摸播放
                $('html').one('touchstart', function () {
                    audioId.play();
                });
                $('#audioId').on('play', function () {
                    scope.$apply(function () {
                        scope.audioPlay = true;
                    })
                }).on('pause', function () {
                    scope.$apply(function () {
                        scope.audioPlay = false;
                    })
                }).on('ended', function () {
                    scope.$apply(function () {
                        scope.audioPlay = false;
                    })
                })
            }
        }
    })


    // 测试 <myaudio token='token' audiourl='audiourl'></myaudio>
    //   .directive('myaudio',function ($sce) {
    //     return{
    //       restrict:'AE',
    //       replace:false,
    //       scope:{
    //         token:'=',
    //         audiourl:'=',
    //       },
    //       template:"<audio   display='none' >{{token}}{{audiourl}}</audio>",
    //       //url绑定有点坑
    //       link:function (scope,element) {
    //         console.log(scope.token);
    //         console.log(scope.audiourl);
    //       }
    //     }
    //   });


    //景区点赞指令  <likescenic number="item.upvoteCounts" id="item.id"></like>
    .directive('likescenic', function ($http, GlobalVariable, ShowAlertMessage) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                number: '=',
                id: '='
            },
            template: '<a class="praise">' +
            '<div class="f-icon"></div>' +
            '<div class="p-count">{{number}}</div> ' +
            '</a>',
            link: function (scope, element) {
                //console.log(element);
                var ifDot = true;
                // 点赞功能
                function postUpvote(type) {
                    $http({
                        method: 'POST',
                        url: GlobalVariable.SERVER_PATH + 'api/mobile/scenic/upvote/',
                        params: {
                            scenicId: scope.id,
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


    //景区、景点评论点赞指令  <likesceniccomment number="item.upvoteCounts" id="item.id"></likesceniccomment>
    .directive('likesceniccomment', function ($http, GlobalVariable, ShowAlertMessage) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                number: '=',
                id: '='
            },
            template: '<a class="thumbs-up-wrap">' +
            '<span class="thumbs-up"></span><span>{{number}}</span></a>',
            link: function (scope, element) {
                var ifDot = true;
                // 点赞功能
                function postUpvote(type) {
                    $http({
                        method: 'POST',
                        url: GlobalVariable.SERVER_PATH + 'api/mobile/comment/favor/' + scope.id,
                        params: {
                            scenicId: scope.id,
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
                        postUpvote(2);
                        element.removeClass('praised');
                    }
                })
            }
        }


    })

    //景点点赞指令  <likespot number="item.upvoteCounts" id="item.id"></likespot>
    .directive('likespot', function ($http, GlobalVariable, ShowAlertMessage) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                number: '=',
                id: '='
            },
            template: '<a class="praise">' +
            '<div class="f-icon"></div>' +
            '<div class="p-count">{{number}}</div> ' +
            '</a>',
            link: function (scope, element) {
                //console.log(element);
                var ifDot = true;
                // 点赞功能
                function postUpvote(type) {
                    $http({
                        method: 'POST',
                        url: GlobalVariable.SERVER_PATH + 'api/mobile/spot/upvote',
                        params: {
                            spotId: scope.id,
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

    //收藏
    // <collectheart  token='token' img="item.icon" nick="nick" summary="summary"></collectheart>
    .directive('collectheart', function ($http, $state, $location, GlobalVariable, ShowAlertMessage) {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                token: '=',
                img: '=',
                nick: '=',
                summary: '='
            },
            template: '<a class="collect_icon ion-android-favorite ion-android-favorite-outline" ></a>',
            link: function (scope, element) {
                scope.isCollect = false;//收藏状态
                var wsCache = new WebStorageCache();

                function storageCurrentUrl() {
                    wsCache.set('currentUrl', $location.absUrl());
                }

                // 点赞功能
                scope.$watch('token', function () {
                    if (scope.token) {//登录状态下判断是否收藏
                        ifCollect();
                    } else {
                        scope.isCollect = false;//未登录状态无需判断
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
                            url: $location.absUrl()
                        }
                    }).success(function (res) {
                        if (res.code == 0) {
                            if (res.data.success) {//已收藏
                                element.removeClass('ion-android-favorite-outline');
                                scope.isCollect = true;
                            } else {
                                element.addClass('ion-android-favorite-outline');
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
                            image: GlobalVariable.SERVER_PATH + scope.img,
                            title: scope.nick,
                            describe: scope.summary,
                            url: $location.absUrl(),
                            origin: 'WECHAT'
                        }
                    }).success(function (res) {
                        if (res.code == 0) {
                            ShowAlertMessage.showMessage(res.msg, 1000, true);
                            element.removeClass('ion-android-favorite-outline');
                            scope.isCollect = true;
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
                            url: $location.absUrl()
                        }
                    }).success(function (res) {
                        ShowAlertMessage.showMessage(res.msg, 1000, true);
                        element.addClass('ion-android-favorite-outline');
                        scope.isCollect = false;
                    }).error(function (err) {

                    })
                }
            }
        }
    })

