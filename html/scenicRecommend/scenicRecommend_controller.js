angular.module('scenicRecommend.controller', [])
    .controller('ScenicRecommendCtrl', function ($scope, $timeout, $http, $ionicSlideBoxDelegate, GlobalVariable, ShowAlertMessage, LocationService, cityNameFty) {

        //ionic --swiper----start---
        $(document).ready(function () {
            var headerSlider = new Swiper('.swiper-container', {
                slidesPerView: 1,
                paginationClickable: true,
                centeredSlides: true,
                autoplay: 2000,
                autoplayDisableOnInteraction: false,
                loop: true,
                // 如果需要分页器
                pagination: '.swiper-pagination',
                // 改变自动更新
                observer: true,
                observeParents: true
            });
        })
        $scope.options = {//配置项
            loop: true,
            speed: 800,
            //effect: 'fade'
        };
        $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
            $scope.slider = data.slider;
        });
        $timeout(function () {
            $ionicSlideBoxDelegate.start();
        }, 100)

        $scope.sliderItems = [
            {
                uiSref: 'tab.tourismAndListen.list0({cityName:"桂林市"})',
                ngSrc: 'assets/img/scenicRecommend/banner-1.jpg'
            },
            //{
            //    uiSref: 'tab.tourismAndListen.list0({cityName:"丽江市"})',
            //    ngSrc: 'assets/img/scenicRecommend/banner-2.jpg'
            //},
            {
                uiSref: 'tab.tourismAndListen.list0({cityName:"杭州市"})',
                ngSrc: 'assets/img/scenicRecommend/banner-3.jpg'
            },
            {
                uiSref: 'tab.tourismAndListen.list0({cityName:"南平市"})',
                ngSrc: 'assets/img/scenicRecommend/banner-4.jpg'
            },
            {
                uiSref: 'tab.tourismAndListen.list0({cityName:"三亚市"})',
                ngSrc: 'assets/img/scenicRecommend/banner-5.jpg'
            },
            {
                uiSref: 'tab.tourismAndListen.list0({cityName:"舟山市"})',
                ngSrc: 'assets/img/scenicRecommend/banner-6.jpg'
            },
            {
                uiSref: 'tab.tourismAndListen.list0({cityName:"重庆市"})',
                ngSrc: 'assets/img/scenicRecommend/banner-7.jpg'
            }
        ]
        //ionic --swiper----end---

        // 左右2个导航图片
        $scope.navData = [
            {
                state: 'tab.tourismAndListen',
                alt: 'this is banner',
                src: 'assets/img/scenicRecommend/scenicRem-left.jpg'
            }, {
                state: 'myTravelList',
                alt: 'this is banner',
                src: 'assets/img/scenicRecommend/scenicRem-right.jpg'
            }
        ];

        // 加载数据
        var page = 1;
        $scope.scenicRecommendData = [];
        $scope.noMoreData = false;
        /* 声明是否有更多数据 */
        $scope.DomainName = GlobalVariable.SERVER_PATH;
        /* 声明域名 */
        $scope.loadMoreScenicRecommendData = function () {
            ShowAlertMessage.showMessage('', 3000);
            /*调用弹框*/
            $http({
                method: 'GET',
                url: GlobalVariable.SERVER_PATH + '/api/mobile/scenic/recommend',
                params: {
                    page: page
                }
            })
                .success(function (respond) {
                    ShowAlertMessage.hideMessage();
                    /* 数据请求成功 隐藏弹框 */
                    if (respond.code == 0) {
                        page++;
                        angular.forEach(respond.data, function (list) {
                            $scope.scenicRecommendData.push(list);
                        });
                        // console.log(respond.data)
                    } else {
                        $scope.noMoreData = true;
                    }
                })
                .error(function (err) {
                    console.log(err);
                })
                .finally(function () {/* 成功、失败都会调用这个方法 */
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                })
        };
        $scope.loadMoreScenicRecommendData();

        //获取最近景区
        $scope.hasNearscenic = false;
        function getNearscenic(lat, lng) {
            $http({
                method: 'GET',
                url: $scope.DomainName + 'api/mobile/scenic/nearscenic',
                params: {
                    lat: lat,
                    lng: lng
                }
            }).success(function (res) {
                //console.log(res)
                if (res.code == 0) {
                    $scope.hasNearscenic = true;
                    $scope.nearscenicItem = res.data;
                }
            }).error(function () {

            })
        }

        // 隐式定位--为后面页面服务
        LocationService.location()
            .then(function (data) {//正确时
                cityNameFty.setLocationData(data);//存储定位信息
                cityNameFty.setCityName(data.addressComponent.city);
                getNearscenic(cityNameFty.getLocationData().lnglat.lat, cityNameFty.getLocationData().lnglat.lng)

            })
            .catch(function (err) {/* 捕获全部可能的错误 promise 原生API*/
                cityNameFty.setCityName('深圳市');
                console.log(err)
            })
    });
