/**
 * Created by hello world on 2016/11/1.
 */
angular.module('tourismAndListen.route', ['tourismAndListen.controller'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
        //边游边听主页
            .state('tab.tourismAndListen', {
                url: '/tourismAndListen',
                views: {
                    'tab-tourismAndListen': {
                        templateUrl: 'html/tourismAndListen/tourismAndListen.html',
                        controller: 'TourismAndListenCtrl'
                    }
                }
            })
            // 边游边听列表页
            .state('tab.tourismAndListen.list', {
                url: '/list',
                views: {
                    'tourismAndListen-list': {
                        templateUrl: 'html/tourismAndListen/tourismAndListen_list.html',
                        controller: 'TourismAndListenCtrlList'
                    }
                }
            })
            //首页入口
            .state('tab.tourismAndListen.list0', {
                url: '/list/:cityName',
                views: {
                    'tourismAndListen-list': {
                        templateUrl: 'html/tourismAndListen/tourismAndListen_list.html',
                        controller: 'TourismAndListenCtrlList0'
                    }
                }
            })
            // 边游边听地图页
            .state('tab.tourismAndListen.map', {
                url: '/map',
                views: {
                    'tourismAndListen-map': {
                        templateUrl: 'html/tourismAndListen/tourismAndListen_map.html',
                        controller: 'TourismAndListenCtrlMap'
                    }
                }
            })
            // 边游边听地图页进地图详情页
            .state('tab.tourismAndListen.map.tourismAndListen_detail', {
                url: '/tourismAndListen_detail/:itemId',
                templateUrl: 'html/tourismAndListen/tourismAndListen_detail.html',
                controller: 'TourismAndListenCtrlDetail'
            })

            //边游边听二级页面
            .state('tourismAndListen_detail', {
                url: '/tourismAndListen_detail/:itemId',
                templateUrl: 'html/tourismAndListen/tourismAndListen_detail.html',
                controller: 'TourismAndListenCtrlDetail'
            })
            //边游边听地图页面
            // .state('tourismAndListen_map',{
            //       url:'/tourismAndListen_map/:itemId',
            //       // templateUrl:'html/tourismAndListen/tourismAndListen_map.html',
            //       controller:'TourismAndListenCtrlMap'
            //   })


            //导览图
            .state('guideMap', {
                url: '/guideMap/:itemId',
                templateUrl: 'html/tourismAndListen/guide_map.html',
                controller: 'SceneryGuideMap'
            })
            .state('VR', {
                url: '/VR/:vrUrl',
                templateUrl: 'html/tourismAndListen/VR.html',
                controller: 'VR'
            })
            // 景区攻略
            .state('sceneryStrategy', {
                url: '/sceneryStrategy/:itemId',
                templateUrl: 'html/tourismAndListen/scenery_strategy.html',
                controller: 'SceneryStrategy'
            })
            // 景区攻略详情
            .state('sceneryStrategyDetail', {
                url: '/sceneryStrategyDetail/:strategyDetailId',
                templateUrl: 'html/tourismAndListen/scenery_strategy_detail.html',
                controller: 'SceneryStrategyDetail'
            })
            // 景区详情
            .state('sceneryArea_detail', {
                url: '/sceneryArea_detail/:itemId',
                templateUrl: 'html/tourismAndListen/scenery_area_detail.html',
                controller: 'SceneryAreaDetail'
            })
            //景点详情
            .state('secnerySpot_detail', {
                url: '/secnerySpot_detail/:spotId',
                templateUrl: 'html/tourismAndListen/scenery_spot_detail.html',
                controller: 'ScenerySpotDetail'
            })
            //发表评论景区
            .state('myCommentArea', {
                url: '/myComment/area/:commentId',
                templateUrl: 'html/tourismAndListen/myComment.html',
                controller: 'AreaComment'
            })
            //发布评论景点
            .state('myCommentSpot', {
                url: '/myComment/spot/:commentId',
                templateUrl: 'html/tourismAndListen/myComment.html',
                controller: 'SpotComment'
            });
        $urlRouterProvider.otherwise('tab/tourismAndListen/list');
    });
