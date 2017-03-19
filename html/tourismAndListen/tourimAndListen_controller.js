var tourismAndListen = angular.module('tourismAndListen.controller', ['tourismAndListen.service', 'ngSanitize'])
//0.0---列表、地图父页面
tourismAndListen.controller('TourismAndListenCtrl', function ($scope, $http, $ionicModal, $ionicPopup, $state, LocationService, addressSelect, ShowAlertMessage, GlobalVariable, cityNameFty) {
    //控制地址--改变地址的方式（定位、手动选择、其他页面地址改变
    // 获取定位信息，不存在就重新定位
    $scope.showlist = true;
    $scope.showMap = function () {
        $scope.showlist = false;
        $state.go('tab.tourismAndListen.map')
    }
    $scope.showList = function () {
        $scope.showlist = true;
        $state.go('tab.tourismAndListen.list')
    }
    if (cityNameFty.getLocationData().city) {
        $scope.currentPosition = cityNameFty.getLocationData().address;//地址选择框显示定位地址
        $scope.cityName = cityNameFty.getCityName();
    } else {
        // location();
    }
    // 监听地址变化
    $scope.$watch(function () {
        return cityNameFty.getCityName();
    }, function (n) {
        if (n) {
            console.log(n);
            $scope.cityName = n;
            cityNameFty.setCityName(n);//设置加载内容城市为列表和地图页服务
        }
    });
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
            if (i == $scope.cityName) {//城市相同则不变
                return
            } else {
                $scope.cityName = i;
                cityNameFty.setCityName($scope.cityName);
            }
        }
    }

    // 定位
    function location() {
        LocationService.location().then(function (data) {//正确时
            cityNameFty.setLocationData(data);//存储定位信息
            $scope.currentPosition = cityNameFty.getLocationData().address;//地址选择框显示定位地址
            $scope.cityName = cityNameFty.getLocationData().city;//左边地址选择显示
            cityNameFty.setCityName($scope.cityName);//设置地址
        }, function (data) {//错误时
            $scope.currentPosition = "定位失败,请手动选择";
            $scope.cityName = '深圳市';
            cityNameFty.setCityName($scope.cityName);
        });
    }

});
//0.1---列表页面
tourismAndListen.controller('TourismAndListenCtrlList', function ($scope, $location, $timeout, $state, $http, $ionicModal, $ionicPopup, $ionicScrollDelegate, LocationService, addressSelect, ShowAlertMessage, GlobalVariable, cityNameFty) {
    var pageCount = 1;
    $scope.successGetData = true;
    var domain;//请求url
    var item;//城市
    var lnglat = {lng: null, lat: null};
    var addressWatch;
    $scope.items = [];
    $scope.$on("$ionicView.afterEnter", function (event, data) {
    });

    // 获取定位信息
    if (cityNameFty.getLocationData().address) {
        item = cityNameFty.getCityName();//设置加载内容城市
        if (item == cityNameFty.getLocationData().city) {//当前城市和定位城市相同有定位
            lnglat = {lng: cityNameFty.getLocationData().lnglat.lng, lat: cityNameFty.getLocationData().lnglat.lat};
            nearestScencry();
            pageCount = 1;
            loadData();
        } else {
            lnglat = {lng: cityNameFty.getLocationData().lnglat.lng, lat: cityNameFty.getLocationData().lnglat.lat};
            pageCount = 1;
            loadData();
        }

    } else {//定位失败
        item = cityNameFty.getCityName();//设置加载内容城市
        pageCount = 1;
        loadData();
    }
    $scope.$watch(function () {
        return cityNameFty.getCityName();
    }, function (newObj, oldObj) {
        if (newObj) {
            if (newObj == oldObj) {
                return;
            } else {
                $scope.scrollSmallToTop();
                $scope.items = [];//列表数据
                item = newObj;
                pageCount = 1;
                loadData();
            }

        }
    });
    // 定位成功进入时查询附近最近的景区，成功则弹出选择框
    function nearestScencry() {
        console.log('near');
        $http({
            method: 'GET',
            url: GlobalVariable.SERVER_PATH + 'api/mobile/scenic/nearscenic',
            params: {
                lat: lnglat.lat,
                lng: lnglat.lng
            }
        }).success(function (res) {
            if (res.code === 0) {
                $scope.nearestData = res.data;
                popup();
                console.log(res);
            }
        }).error(function (res) {
            console.log('失败');
        })
    }

    //弹框
    function popup() {
        $ionicPopup.confirm({
                title: '温馨提示',
                cssClass: 'tourismAndListenList',
                subTitle: '小印启奏  距探子汇报<br>陛下距离' + $scope.nearestData.title + $scope.nearestData.distance + '米，是否免费开启在线导览',
                cancelText: '取消',
                okText: '确定'
            })
            .then(function (res) {
                if (res) {
                    // 确定退出时，跳转到首页，并且清空所有储存的数据
                    $state.go('tourismAndListen_detail', {itemId: $scope.nearestData.id});
                } else {

                }
            });

    }

    //获取数据
    var loading = false;

    function loadData() {
        if (loading) {
            return
        }
        loading = true;
        getHTTP();
        function getHTTP() {
            $scope.distanceTrue = false;
            $scope.cityName = item || '深圳市';
            $http({
                method: 'GET',
                url: GlobalVariable.SERVER_PATH + 'api/mobile/scenic/aroundscenic',
                params: {
                    poi: $scope.cityName,
                    page: pageCount,
                    lat: lnglat.lat,
                    lng: lnglat.lng
                }
            }).success(function (res) {
                if (res.code == 0) {
                    if (res.data.list) {
                        pageCount++;
                        $scope.items = $scope.items.concat(res.data.list);
                        $scope.noMorePage = false;//移除滚动加载
                        $scope.successGetData = true;//隐藏没有内容页面
                    } else {
                        if (pageCount == 1) {//页码等于1，且无数据(切换城市)
                            $scope.successGetData = false;//显示没有内容页面
                        }
                        ShowAlertMessage.hideMessage();
                        $scope.noMorePage = true;//移除滚动加载
                    }
                } else {
                    $scope.noMorePage = true;//移除滚动加载
                }
                loading = false;
            }).error(function (err) {
                $scope.noMorePage = true;//移除滚动加载
                $scope.successGetData = false;//显示没有内容页面
            }).finally(function () {/* 成功、失败都会调用这个方法 */
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
    }

    $scope.loadData = loadData;//html外部调用
    // 滚动到顶部
    $scope.scrollSmallToTop = function () {
        $ionicScrollDelegate.$getByHandle('scenicList').scrollTop();
    };
    $scope.$on("$ionicView.afterLeave", function (event, data) {//离开解除监听
        // addressWatch();
        // scrollTopWatch();
    });
});
//0.1.1---首页banner进入列表页面
tourismAndListen.controller('TourismAndListenCtrlList0', function ($scope, $stateParams, $location, $timeout, $state, $http, $ionicModal, $ionicPopup, $ionicScrollDelegate, LocationService, addressSelect, ShowAlertMessage, GlobalVariable, cityNameFty) {
    console.log($stateParams.cityName);
    var pageCount = 1;
    $scope.successGetData = true;
    var domain;//请求url
    var item;//城市
    var lnglat = {lng: null, lat: null};
    var addressWatch;
    $scope.items = [];
    $scope.$on("$ionicView.afterEnter", function (event, data) {
    });
    item = $stateParams.cityName;
    cityNameFty.setCityName($stateParams.cityName);//设置加载内容城市为列表和地图页服务
    // 获取定位信息
    if (cityNameFty.getLocationData().address) {
        lnglat = {lng: cityNameFty.getLocationData().lnglat.lng, lat: cityNameFty.getLocationData().lnglat.lat};
        //nearestScencry();
    }
    $scope.$watch(function () {
        return cityNameFty.getCityName();
    }, function (newObj, oldObj) {
        if (newObj) {
            if (newObj == oldObj) {
                return;
            } else {
                $scope.scrollSmallToTop();
                $scope.items = [];//列表数据
                item = newObj;
                pageCount = 1;
                loadData();
            }

        }
    });
    loadData();
    // 定位成功进入时查询附近最近的景区，成功则弹出选择框
    function nearestScencry() {
        console.log('near');
        $http({
            method: 'GET',
            url: GlobalVariable.SERVER_PATH + 'api/mobile/scenic/nearscenic',
            params: {
                lat: lnglat.lat,
                lng: lnglat.lng
            }
        }).success(function (res) {
            if (res.code === 0) {
                $scope.nearestData = res.data;
                popup();
                console.log(res);
            }
        }).error(function (res) {
            console.log('失败');
        })
    }

    //弹框
    function popup() {
        $ionicPopup.confirm({
                title: '温馨提示',
                cssClass: 'tourismAndListenList',
                subTitle: '小印启奏  距探子汇报<br>陛下距离' + $scope.nearestData.title + $scope.nearestData.distance + '米，是否免费开启在线导览',
                cancelText: '取消',
                okText: '确定'
            })
            .then(function (res) {
                if (res) {
                    // 确定退出时，跳转到首页，并且清空所有储存的数据
                    $state.go('tourismAndListen_detail', {itemId: $scope.nearestData.id});
                } else {

                }
            });

    }

    //获取数据
    var loading = false;

    function loadData() {
        if (loading) {
            return
        }
        loading = true;
        getHTTP();
        function getHTTP() {
            $scope.distanceTrue = false;
            $scope.cityName = item || '深圳市';
            $http({
                method: 'GET',
                url: GlobalVariable.SERVER_PATH + 'api/mobile/scenic/aroundscenic',
                params: {
                    poi: $scope.cityName,
                    page: pageCount,
                    lat: lnglat.lat,
                    lng: lnglat.lng
                }
            }).success(function (res) {
                if (res.code == 0) {
                    if (res.data.list) {
                        pageCount++;
                        $scope.items = $scope.items.concat(res.data.list);
                        $scope.noMorePage = false;//移除滚动加载
                        $scope.successGetData = true;//隐藏没有内容页面
                    } else {
                        if (pageCount == 1) {//页码等于1，且无数据(切换城市)
                            $scope.successGetData = false;//显示没有内容页面
                        }
                        ShowAlertMessage.hideMessage();
                        $scope.noMorePage = true;//移除滚动加载
                    }
                } else {
                    $scope.noMorePage = true;//移除滚动加载
                }
                loading = false;
            }).error(function (err) {
                $scope.noMorePage = true;//移除滚动加载
                $scope.successGetData = false;//显示没有内容页面
            }).finally(function () {/* 成功、失败都会调用这个方法 */
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
    }

    $scope.loadData = loadData;//html外部调用

    //手动选择城市
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
            if (i == $scope.cityName) {//城市相同则不变
                return
            } else {
                $scope.cityName = i;
                cityNameFty.setCityName($scope.cityName);
            }
        }
    }

    // 滚动到顶部
    $scope.scrollSmallToTop = function () {
        $ionicScrollDelegate.$getByHandle('scenicList').scrollTop();
    };
    $scope.$on("$ionicView.beforeEnter", function (event, data) {
        citySelect();//城市选择
    });
    $scope.$on("$ionicView.afterLeave", function (event, data) {//离开解除监听
        // addressWatch();
        // scrollTopWatch();
    });
});
// 0.2---地图页面
tourismAndListen.controller('TourismAndListenCtrlMap111', function ($rootScope, $timeout, $ionicSlideBoxDelegate, $scope, $http, $stateParams, GlobalVariable, LocationService, ShowAlertMessage, cityNameFty) {

    $scope.autoHeight = {height: window.innerHeight - 44 + 'px'};//地图自适应高度
    $scope.domain = GlobalVariable.SERVER_PATH;
    var item;//加载内容城市
    var map;
    var lnglat = {lng: null, lat: null};
    var center_lat;// 地图中心设为第一个景点
    var center_lng;// 地图中心
    $scope.showCards = true;// 是否显示滑动卡片
    var markers = [];// 存放初始化的marker
    // 第一次进入
    // 获取定位信息
    if (cityNameFty.getLocationData().address) {//有定位是还要看当前城市与请求数据城市
        item = cityNameFty.getCityName();//设置加载内容城市
        if (item == cityNameFty.getLocationData().city) {
            lnglat = new AMap.LngLat(cityNameFty.getLocationData().lnglat.lng, cityNameFty.getLocationData().lnglat.lat);
            getMapDetails();
        } else {
            item = cityNameFty.getCityName();//设置加载内容城市
            getMapDetails();
        }
    } else {//定位失败
        item = cityNameFty.getCityName();//设置加载内容城市
        getMapDetails();
    }
    //监听地址变化
    $scope.$watch(function () {
        return cityNameFty.getCityName();
    }, function (newObj, oldObj) {
        if (newObj) {
            if (newObj == oldObj) {
                return;
            } else {
                if (newObj == cityNameFty.getLocationData().city) {//当前选择城市和定位城市相同
                    item = newObj;
                    getMapDetails();
                } else {
                    item = newObj;
                    getMapDetails();
                }
            }

        }
    });
    // 获取景区数据
    function getMapDetails() {
        //重新加载数据就清空
        $scope.mapAndListDatas = null;
        $scope.scenicItem = null;
        markers = [];
        ShowAlertMessage.showMessage('正在请求数据...', 10000, 'noBackdrop');
        $http({
            method: 'GET',
            url: $scope.domain + 'api/mobile/scenic/aroundscenic',
            params: {
                page: 1,
                poi: item,
                lat: lnglat.lat,
                lng: lnglat.lng
            }
        }).success(function (res) {
            if (res.code === 0) {
                ShowAlertMessage.hideMessage();
                $scope.scenicItem = res.data.list;
                $scope.scenicItem.uuid = $stateParams.itemId;
                //设置地图中心为第一个景区
                center_lat = res.data.list[0].lat;
                center_lng = res.data.list[0].lng;
                $scope.mapAndListDatas = res.data.list;
                loadMap();

                // getSpotsData();
            } else {
                ShowAlertMessage.showMessage('请求数据失败', 2000, 'noBackdrop')
            }

        })
    }

    //加载地图
    function loadMap() {
        //加载地图
        map = new AMap.Map('scenicContainer', {
            resizeEnable: true
            , zoom: 12
            , showBuildingBlock: true
            , center: [center_lng, center_lat]
            , features: ['point', 'road', 'building']
            // , features: ['road']
        });
        map.on("complete", function () {
            setMarksToMap($scope.mapAndListDatas); // 设置景区在地图上
            // $ionicSlideBoxDelegate.update(); // 更新轮播图数据
            $ionicSlideBoxDelegate.slide(0);
        });

        map.on('click', function (e) {
            $scope.$apply(function () {
                $scope.showCards = !$scope.showCards;
                $ionicSlideBoxDelegate.update();
            });
        });
        map.on("zoomchange", function () {
            // console.log("当前级别" + map.getZoom())
        });
        var center_lnglat = new AMap.LngLat(center_lng, center_lat);//开始地图中心
        var currentCenter;
        var L;
        // map.on("moveend", function () {
        //     currentCenter=map.getCenter();
        //     L=center_lnglat.distance([currentCenter.lng,currentCenter.lat]);
        //     console.log(L);
        //     if(L>1000){
        //             // $scope.scenicItem
        //             // marker
        //         //重新加载数据就清空
        //         $scope.mapAndListDatas=null;
        //         $scope.scenicItem=null;
        //         markers=[];
        //         page++;
        //         $http({
        //             method:'GET',
        //             url:httpUrl,
        //             params:{
        //                 page:2,
        //                 poi:item,
        //                 lat:lnglat.lat,
        //                 lng:lnglat.lng
        //             }
        //         }).success(function (res) {
        //             if(res.code===0){
        //                 $scope.scenicItem=res.data.list;
        //                 // console.log(res.data.list);
        //                 $scope.scenicItem.uuid=$stateParams.itemId;
        //                 //设置地图中心为第一个景区
        //                 center_lat=res.data.list[0].lat;
        //                 center_lng=res.data.list[0].lng;
        //                 $scope.mapAndListDatas = res.data.list;
        //                 loadMap();
        //             }else{
        //                 ShowAlertMessage.showMessage('请求数据失败',2000,'noBackdrop');
        //             }
        //         })
        //     }
        // });
    }

    //设置marker到地图
    function setMarksToMap(data) {
        if (data) {
            $.each(data, function (index, obj) {
                if (obj.lng && obj.lat) {//有的景点无坐标
                    var icon = new AMap.Icon({
                        image: GlobalVariable.SERVER_PATH + (obj.thumb320 ? obj.thumb320 : obj.thumbnail),
                        size: new AMap.Size(32, 32)
                    });
                    var marker = new AMap.Marker({
                        icon: icon,
                        position: [obj.lng, obj.lat],
                        offset: new AMap.Pixel(-12, -12)
                        // ,zIndex:101
                    });
                    marker.setExtData({index: index, id: obj.uuid});
                    marker.setMap(map);
                    //绑定marker点击事件
                    marker.on("click", markerClick);
                    markers.push(marker);
                }
            });
            // addMarkerGackground(markers[0])
        }
    }

    //marker点击事件 将卡片切换到对应的marker
    var marker_bg;//选中的marker的背景
    function markerClick() {
        var me = markers[this.getExtData()["index"]];
        if (map) {
            //将点击的marker设为地图的中心点
            map.panTo(me.getPosition());
            //选中对应的卡片
            $ionicSlideBoxDelegate.slide(this.getExtData()["index"]);
            //设置marker为选中状态的背景
            addMarkerGackground(me);
        }
        $scope.$apply(function () {
            $scope.showCards = true;
            $ionicSlideBoxDelegate.update();
        });
    }

    //ionic --swiper----start---
    $scope.options = {//配置项
        pagination: ''
        // loop: false,
        // effect: 'fade',
    };
    $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
        $scope.slider = data.slider;
    });
    $scope.$on("$ionicSlides.slideChangeEnd", function (event, data) {
        var index = data.slider.activeIndex;
        var me = markers[index];
        me.setTop(true);
        if (map) {
            //将点击的marker设为地图的中心点
            map.panTo(me.getPosition());
            //选中对应的卡片
            $ionicSlideBoxDelegate.slide(index);
            //设置marker为选中状态的背景
            $timeout(function () {
                addMarkerGackground(me)
            }, 50);
        }
    });
    //ionic --swiper----start---end
    //给选中的marker设置一个背景
    function addMarkerGackground(marker) {
        if (marker_bg) {
            marker_bg.setMap(null);
        }
        var icon = new AMap.Icon({
            image: "assets/img/cicle_marker.png",
            size: new AMap.Size(48, 50)
        });
        marker_bg = new AMap.Marker({
            icon: icon,
            position: marker.getPosition(),
            offset: new AMap.Pixel(-20, -15)
        });
        // console.log('add')
        marker_bg.setMap(map);
        marker.setTop(true);
    }

    // 地图移动事件监听
});

// 0.2.2---地图页面---开发中
tourismAndListen.controller('TourismAndListenCtrlMap', function ($rootScope, $timeout, $ionicSlideBoxDelegate, $scope, $http, $stateParams, GlobalVariable, LocationService, ShowAlertMessage, cityNameFty) {
    //页面效果：进来获取城市所有景区，聚合形式展示在地图上，然后取当前渲染的marker生成下部名片
    $scope.autoHeight = {height: window.innerHeight - 44 + 'px'};//地图自适应高度
    $scope.domain = GlobalVariable.SERVER_PATH;
    var item;//加载内容城市
    var map;
    var lnglat = {lng: null, lat: null};
    //$scope.showCards = true;// 是否显示滑动卡片
    var markers = [];// 存放初始化的marker
    var currentMarkersData = [];//地图显示图标数据
    var currentMarkers=[];//地图显示图标
    // 第一次进入
    // 获取定位信息
    if (cityNameFty.getLocationData().address) {//有定位是还要看当前城市与请求数据城市
        item = cityNameFty.getCityName();//设置加载内容城市
        if (item == cityNameFty.getLocationData().city) {
            lnglat = new AMap.LngLat(cityNameFty.getLocationData().lnglat.lng, cityNameFty.getLocationData().lnglat.lat);
            getScenicDatas();
        } else {
            item = cityNameFty.getCityName();//设置加载内容城市
            getScenicDatas();
        }
    } else {//定位失败
        item = cityNameFty.getCityName();//设置加载内容城市
        getScenicDatas();
    }
    //监听地址变化
    $scope.$watch(function () {
        return cityNameFty.getCityName();
    }, function (newObj, oldObj) {
        if (newObj) {
            if (newObj == oldObj) {
                return;
            } else {
                if (newObj == cityNameFty.getLocationData().city) {//当前选择城市和定位城市相同
                    item = newObj;
                    getScenicDatas();
                } else {
                    item = newObj;
                    getScenicDatas();
                }
            }

        }
    });
    //获取所有选择城市下所有景区数据
    function getScenicDatas() {
        //重新加载数据就清空
        $scope.scenicItem = null;
        $scope.showCards=false;
        markers = [];
        ShowAlertMessage.showMessage('正在请求数据...', 5000, 'noBackdrop');
        $http({
            method: 'GET',
            url: $scope.domain + 'api/mobile/scenic/nearcity',
            params: {
                poi: item,
                lat: lnglat.lat,
                lng: lnglat.lng
            }
        }).success(function (res) {
            if (res.code === 0) {
                ShowAlertMessage.hideMessage();
                $scope.markersData=res.data.list;
                //$scope.scenicItem = res.data.list;
                //$scope.scenicItem.uuid = $stateParams.itemId;
                //设置地图中心为第一个景区
                loadMap();
            } else {
                ShowAlertMessage.showMessage('请求数据失败', 2000, 'noBackdrop')
            }
        })
    }

    //加载地图
    function loadMap() {
        //加载地图
        map = new AMap.Map('scenicContainer', {
            resizeEnable: true
            , zoom: 12
            , showBuildingBlock: true
            , features: ['point', 'road', 'building']
        });
        map.on("complete", function () {
            setMarksToMap($scope.markersData); // 设置景区在地图上
            // $ionicSlideBoxDelegate.update(); // 更新轮播图数据
            $ionicSlideBoxDelegate.slide(0);
            //console.log(map.getAllOverlays());
            map.setFitView();
        });
        //map.on('click', function (e) {
        //    $scope.$apply(function () {
        //        //$scope.showCards = !$scope.showCards;
        //        $ionicSlideBoxDelegate.update();
        //    });
        //});
        //map.on("zoomchange", function () {
        //    // console.log("当前级别" + map.getZoom())
        //    console.log($('.amap-markers .amap-marker'));
        //    angular.forEach($('.amap-markers .amap-marker'), function (obj) {
        //        console.log($(obj).find('img').attr('src'));
        //        angular.forEach(markers, function (val, index) {
        //            //console.log(markers[0].getExtData().thumb320)
        //            if (($(obj).find('img').attr('src') == $scope.domain + markers[index].getExtData().thumb320) ||
        //                ($(obj).find('img').attr('src')==$scope.domain + markers[index].getExtData().thumbnail)) {
        //                console.log(val);
        //                currentMarkersData.push(val.getExtData().obj);
        //                currentMarkers.push(val);
        //            }
        //        })
        //    })
        //
        //    //if(currentMarkersData){
        //    //    $scope.$apply(function(){
        //    //        $scope.ggg=currentMarkersData;
        //    //    })
        //    //
        //    //    //console.log($scope.ggg)
        //    //}
        //    if(currentMarkers){
        //        $scope.scenicItem=currentMarkersData;
        //        //$scope.$apply(function () {
        //        //    $scope.showCards = true;
        //        //    $ionicSlideBoxDelegate.update();
        //        //});
        //    }
        //
        //
        //
        //
        //
        //    console.log( $scope.scenicItem);
        //    if($scope.scenicItem){
        //        $scope.$apply(function () {
        //            $scope.showCards = true;
        //            //$ionicSlideBoxDelegate.update();
        //        });
        //        //$scope.$digest(function(){
        //        //    $scope.showCards = true;
        //        //})
        //    }
        //
        //});
        //map.on("zoomend", function () {
        //    currentMarkers=[];
        //    currentMarkersData=[];
        //    // console.log("当前级别" + map.getZoom())
        //    //console.log($('.amap-markers .amap-marker'));
        //
        //    angular.forEach($('.amap-markers .amap-marker'), function (obj) {
        //        //console.log($(obj).find('img').attr('src'));
        //        angular.forEach(markers, function (val, index) {
        //            //console.log(markers[0].getExtData().thumb320)
        //            if (($(obj).find('img').attr('src') == $scope.domain + markers[index].getExtData().thumb320) ||
        //                ($(obj).find('img').attr('src')==$scope.domain + markers[index].getExtData().thumbnail)) {
        //                currentMarkersData.push(val.getExtData().obj);
        //                currentMarkers.push(val);
        //            }
        //        })
        //    })
        //
        //    if(currentMarkersData){
        //        $scope.scenicItem=currentMarkersData;
        //        $scope.$apply(function(){
        //            $scope.showCards=true;
        //            $scope.scenicItem=currentMarkersData;
        //            addMarkerGackground(currentMarkers[0]);
        //        })
        //        $ionicSlideBoxDelegate.update();
        //    }
        //});
        map.on("moveend", function () {
            currentMarkers=[];
            currentMarkersData=[];
            // console.log("当前级别" + map.getZoom())
            //console.log($('.amap-markers .amap-marker'));

            angular.forEach($('.amap-markers .amap-marker'), function (obj) {
                //console.log($(obj).find('img').attr('src'));
                angular.forEach(markers, function (val, index) {
                    //console.log(markers[0].getExtData().thumb320)
                    if (($(obj).find('img').attr('src') == $scope.domain + markers[index].getExtData().thumb320) ||
                        ($(obj).find('img').attr('src')==$scope.domain + markers[index].getExtData().thumbnail)) {
                        currentMarkersData.push(val.getExtData().obj);
                        currentMarkers.push(val);
                    }
                })
            })

            if(currentMarkersData){
                $scope.scenicItem=currentMarkersData;
                $scope.$apply(function(){
                    $scope.showCards=true;
                    $scope.scenicItem=currentMarkersData;
                    addMarkerGackground(currentMarkers[0]);
                })
                $ionicSlideBoxDelegate.update();
            }
        });
    }

    //设置marker到地图
    function setMarksToMap(data) {
        if (data) {
            $.each(data, function (index, obj) {
                if (obj.lng && obj.lat) {//有的景点无坐标
                    var icon = new AMap.Icon({
                        image: GlobalVariable.SERVER_PATH + (obj.thumb320 ? obj.thumb320 : obj.thumbnail),
                        size: new AMap.Size(32, 32)
                    });
                    var marker = new AMap.Marker({
                        icon: icon,
                        position: [obj.lng, obj.lat],
                        offset: new AMap.Pixel(-12, -12)
                        // ,zIndex:101
                    });
                    marker.setExtData({index: index, id: obj.id, thumb320: obj.thumb320, thumbnail: obj.thumbnail,obj:obj});
                    marker.setMap(map);
                    //绑定marker点击事件
                    marker.on("click", markerClick);
                    markers.push(marker);
                }
            });
            //城市景区数量大于10才聚合,下部不显示
            if (markers.length > 10) {
                $scope.showCards = false;
                addCluster(markers);//点聚合

            } else {
                $scope.$apply(function () {
                    $scope.showCards = true;
                    $ionicSlideBoxDelegate.update();
                });
                //addMarkerGackground(markers[0])
            }


        }
    }

    //点聚合：密集的点收起，松散的点不收起
    var cluster = null;

    function addCluster(allSpotMarkers) {
        if (cluster) {
            cluster.setMap(null);
        }
        var sts = [{
            url: "http://tourism.yxzhy.cc/assets/library/assets/images/markers.png",
            size: new AMap.Size(40, 40),
            offset: new AMap.Pixel(-16, -30),
            textColor: '#fff'//文字颜色
        }];
        map.plugin(["AMap.MarkerClusterer"], function () {
            cluster = new AMap.MarkerClusterer(map, allSpotMarkers,
                {
                    styles: sts,
                    maxZoom: 16,
                    gridSize: 80,
                    minClusterSize: 3
                });
        });

    }

    //marker点击事件 将卡片切换到对应的marker
    var marker_bg;//选中的marker的背景
    function markerClick() {
        var me = markers[this.getExtData()["index"]];
        if (map) {
            //将点击的marker设为地图的中心点
            //map.panTo(me.getPosition());
            //选中对应的卡片
            $ionicSlideBoxDelegate.slide(this.getExtData()["index"]);
            //设置marker为选中状态的背景
            addMarkerGackground(me);
        }
        $scope.$apply(function () {
            $scope.showCards = true;
            $ionicSlideBoxDelegate.update();
        });
    }


    //ionic --swiper----start---
    $scope.options = {//配置项
        pagination: ''
        // loop: false,
        // effect: 'fade',
    };
    $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
        $scope.slider = data.slider;
    });
    $scope.$on("$ionicSlides.slideChangeEnd", function (event, data) {
        var index = data.slider.activeIndex;
        var me = currentMarkers[index];
        me.setTop(true);
        if (map) {
            //将点击的marker设为地图的中心点
            //中心不动
            //map.panTo(me.getPosition());
            //选中对应的卡片
            $ionicSlideBoxDelegate.slide(index);
            addMarkerGackground(me);
            //设置marker为选中状态的背景
            //$timeout(function () {
            //    addMarkerGackground(me)
            //}, 50);
        }
    });
    //ionic --swiper----start---end
    //给选中的marker设置一个背景
    function addMarkerGackground(marker) {
        if (marker_bg) {
            marker_bg.setMap(null);
        }
        var icon = new AMap.Icon({
            image: "assets/img/cicle_marker.png",
            size: new AMap.Size(48, 50)
        });
        marker_bg = new AMap.Marker({
            icon: icon,
            position: marker.getPosition(),
            offset: new AMap.Pixel(-20, -15)
        });
        // console.log('add')
        marker_bg.setMap(map);
        marker.setTop(true);
    }

    //$scope.ggg=[1,2,3];

});


// 1.----地图详情页
tourismAndListen.controller('TourismAndListenCtrlDetail', function ($rootScope, $scope, $http, $stateParams, $timeout, $ionicHistory, $ionicTabsDelegate, LocationService, GlobalVariable, ShowAlertMessage, cityNameFty) {
    //------变量-----
    var map;      //地图
    var lineLngLat = null;   //景区边界数据
    var lnglatXY;//当前景区坐标
    var getCity;//根据经纬度解析城市
    $scope.domain = GlobalVariable.SERVER_PATH;//url
    $scope.slideUp = true; //景区下拉显示/隐藏

    //---调用function---
    // 获取景区地图详情页数据
    getMapDetails();//根据景区id
    //查询周边景区（当前城市景区）
    getScenicAround();//根据景区id

    // 获取景区地图详情页数据
    function getMapDetails() {
        ShowAlertMessage.showMessage('正在请求数据...', 10000, 'noBackdrop');
        $http.get(
            $scope.domain + 'api/mobile/scenic/map/details/' + $stateParams.itemId
        ).success(function (res) {
            if (res.code === 0) {
                ShowAlertMessage.hideMessage();
                $scope.scenicItem = res.data;
                $scope.vrurl = res.data.vrUrl;//传给vr页面地址
                $scope.scenicItem.uuid = $stateParams.itemId;
                $scope.scenicItem.lng = res.data.lng;
                $scope.scenicItem.lat = res.data.lat;
                lineLngLat = res.data.lineLngLat;
                lnglatXY = [res.data.lng, res.data.lat];
                getCityByLnglat(lnglatXY);//解析城市
            } else {
                ShowAlertMessage.showMessage('请求数据失败', 2000, 'noBackdrop')
            }
        })
    }

    //获取景区下景点数据
    // 根据经纬度解析当前城市,然后决定调用function
    function getCityByLnglat() {
        AMap.service('AMap.Geocoder', function () {//回调函数
            //实例化Geocoder
            geocoder = new AMap.Geocoder({
                //城市，默认：“全国”
            });
        })
        //直辖市城市为空,用省比较
        geocoder.getAddress(lnglatXY, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                if (result.regeocode.addressComponent.city) {
                    getCity = result.regeocode.addressComponent.city;
                } else {
                    getCity = result.regeocode.addressComponent.province;
                }
                if (getCity == cityNameFty.getLocationData().city) {
                    getSpotsData()
                } else {
                    getSpotsData2();
                }
            } else {
                //获取地址失败
            }
        });
    }

    // (定位城市)
    function getSpotsData() {
        $http({
            method: 'GET',
            url: GlobalVariable.SERVER_PATH + 'api/mobile/spot/gather/' + $stateParams.itemId,
            params: {
                lat: $scope.lat,
                lng: $scope.lng
            }
        }).success(function (res) {
            if (res.code == 0) {
                $scope.spotlists = res.data;
                initAMap($scope.scenicItem.mapLevel);
            }
        }).error(function (err) {
            // console.log(err)
        })
    }

    // (非定位城市)
    function getSpotsData2() {
        $http({
            method: 'GET',
            url: GlobalVariable.SERVER_PATH + 'api/mobile/spot/gather/' + $stateParams.itemId,
        }).success(function (res) {
            if (res.code == 0) {
                $scope.spotlists = res.data;
                initAMap($scope.scenicItem.mapLevel);
            }
        }).error(function (err) {
            // console.log(err)
        })
    }

    // 启动地图(之后绘制边界线)
    function initAMap(mapLevel) {
        map = new AMap.Map('container', {
            resizeEnable: true,
            zoom: mapLevel,
            // zoom:8,
            center: [$scope.scenicItem.lng, $scope.scenicItem.lat]
        });

        var allSpotMarkers = new Array();
        $.each($scope.spotlists, function (index, obj) {
            if (obj.lng && obj.lat) {
                var icon = new AMap.Icon({
                    image: 'http://tourism.yxzhy.cc/assets/library/assets/images/amap_icon_light.png ',
                    size: new AMap.Size(37, 37)//图标大小
                });
                var marker = new AMap.Marker({
                    icon: icon,
                    position: [obj.lng, obj.lat],
                    offset: new AMap.Pixel(-12, -12),
                    // map : map
                });
                marker.setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
                    offset: new AMap.Pixel(0, -28),//修改label相对于maker的位置
                    content: obj.title
                });
                marker.setMap(map);
                marker.setExtData({"parentUUid": "", "spotUuid": obj.id});
                marker.on('click', function () {
                    //用户点击之前将当前地图信息写入到hash中
                    window.location.href = "#/secnerySpot_detail/" + obj.id;
                });
                allSpotMarkers.push(marker);
            } else {
                return;
            }
        })
        addCluster(allSpotMarkers);//点聚合


        $('#container').height($(window).height() - 48)
            .width($(window).width());
        linePolygon();
        getrecommendroute();//获取推荐路线数据
        map.setFitView();
    }

    //绘制景区边界线
    function linePolygon() {
        var lnglats = lineLngLat;
        if (lnglats && lnglats.length > 0 && lnglats != "0") {
            var polygonArr = new Array();//多边形覆盖物节点坐标数组
            $.each(lnglats.split("-"), function (index, obj) {
                var arr = obj.toString().split(",");
                polygonArr.push([arr[0], arr[1]]);
            });
            var polygon = new AMap.Polygon({
                path: polygonArr,//设置多边形边界路径
                strokeColor: "#237eec", //线颜色
                strokeStyle: "dashed",
                strokeOpacity: 0.7, //线透明度
                strokeWeight: 3,    //线宽
                fillColor: "#a8d2f8", //填充色
                fillOpacity: 0.1,//填充透明度
                strokeDasharray: [5, 3]
            });
            polygon.setMap(map);
        }
    }

    //点聚合：密集的点收起，松散的点不收起
    var cluster = null;

    function addCluster(allSpotMarkers) {
        if (cluster) {
            cluster.setMap(null);
        }
        var sts = [{
            url: "http://tourism.yxzhy.cc/assets/library/assets/images/markers.png",
            size: new AMap.Size(40, 40),
            offset: new AMap.Pixel(-16, -30),
            textColor: '#fff'//文字颜色
        }];
        map.plugin(["AMap.MarkerClusterer"], function () {
            cluster = new AMap.MarkerClusterer(map, allSpotMarkers,
                {
                    styles: sts,
                    maxZoom: 16,
                    gridSize: 80,
                    minClusterSize: 3
                });
        });

    }

    //先取坐标，没有在定位(周边景区和去这里需要定位)
    if (cityNameFty.getLocationData().address) {
        $scope.lat = cityNameFty.getLocationData().lnglat.lat;
        $scope.lng = cityNameFty.getLocationData().lnglat.lng;
    } else {
        location();//定位，获取周边景区
    }

    // 去这里---调用高德url
    $scope.goHere = function () {
        if ($scope.lat && $scope.scenicItem.lat) {
            window.location.href = "http://m.amap.com/navi/?start=" + $scope.lng + "," + $scope.lat + "&dest=" + $scope.scenicItem.lng + "," + $scope.scenicItem.lat + "&destName=" + $scope.scenicItem.title + "&naviBy=walk&key=a7ae138b802953aba974d7e3e29c9bef"
        } else {
            ShowAlertMessage.showMessage('定位失败', 1000, 'noBackdrop')
        }
    };

    //查询周边景区（当前城市景区）
    function getScenicAround() {
        $http.get(
            GlobalVariable.SERVER_PATH + 'api/mobile/scenic/cityaround/' + $stateParams.itemId
        ).success(function (res) {
            $scope.scenicAroundItems = res.data;
        })
    }

    // 推荐路线---start---
    $scope.hasReco = false;
    var lines = [];

    //获取推荐路线数据
    function getrecommendroute() {
        $http.get(
            GlobalVariable.SERVER_PATH + 'api/mobile/scenic/recommendroute/' + $stateParams.itemId
        ).success(function (res) {
            if (res.code == 0) {
                $scope.recoItems = res;
                // console.log(res.data)
                // 获取推荐路线数据--生成路线
                angular.forEach(res.data, function (val, index) {
                    var lineArr = new Array();//路线里的景点数组
                    angular.forEach(val.recommendRouteList, function (obj, i) {
                        if (obj.lng && obj.lat) {
                            lineArr.push([obj.lng, obj.lat]);
                        }
                    });
                    // console.log(lineArr)
                    var line = new AMap.Polyline({
                        path: lineArr,          //设置线覆盖物路径
                        strokeColor: "#3366FF", //线颜色
                        strokeOpacity: 1,       //线透明度
                        strokeWeight: 4,        //线宽
                        strokeStyle: "solid",   //线样式
                        strokeDasharray: [10, 5] //补充线样式
                    });
                    line.setMap(map);
                    line.hide();
                    lines.push(line);
                });
                $scope.hasReco = true;
            } else if (res.code == 1) {
                $scope.hasReco = false;
                $scope.recoItems = null;
            }
        })
    }

    //推荐路线画上地图
    $scope.paintLine = function (index) {
        console.log(lines);
        angular.forEach(lines, function (obj) {
            obj.hide();
        });
        var line = lines[index].show();
        //console.log(lines);
        $scope.closeTabs();
    };
    // 推荐路线---end---

    $scope.closeTabs = function () {
        $('.weui_tab_bd_item')
            .removeClass('weui_tab_bd_item_active');
        $('.tab_bg').hide();
    };
    //定位
    function location() {
        LocationService.location().then(function (data) {//正确时
            $scope.lat = data.position.getLat();
            $scope.lng = data.position.getLng();
        }, function (data) {//错误时
            // console.log(data);
        });
    }
});

// 2.----景区详情
tourismAndListen.controller('SceneryAreaDetail', function ($scope, $http, $ionicScrollDelegate, $stateParams, $location, $state, $sce, GlobalVariable, ShowAlertMessage) {
    $scope.areaId = $stateParams.itemId;
    $scope.url = GlobalVariable.SERVER_PATH;
    var wsCache = new WebStorageCache();
    $scope.token = wsCache.get('ZHYToken');
    /* 获取口令 */
    $scope.token = wsCache.get('ZHYToken');
    //滚动改变头部
    $scope.scrollChange = function () {
        var contentScrollTop = $ionicScrollDelegate.$getByHandle('scenicArea').getScrollPosition().top;
        /* 获取滚动的距离 */
        // 隐藏 和 显示头部
        if (contentScrollTop >= 200) {
            $('.header').removeClass('gradient-bg');
            $('.header').addClass('white_bg');
        } else {
            $('.header').removeClass('white_bg');
            $('.header').addClass('gradient-bg');
        }
    };
    $scope.$on('$ionicView.beforeEnter', function () { //进入获取评论数据
        $scope.token = wsCache.get('ZHYToken');//保证token为最新
        getCommentData();//获取评论数据
        $scope.checkLogin();//检查登录状态
    });
    // 获取评论数据
    function getCommentData() {
        $http.get(
            GlobalVariable.SERVER_PATH + 'api/mobile/comment/scenic/list/' + $stateParams.itemId,
            {
                params: {page: 1}
            }
        ).success(function (res) {
            if (res.code == 0) {
                if (res.data) {
                    $scope.commentItems = res.data.list;
                } else {
                    return;
                }
            }
        })
    }

    //景区详情数据
    getScenciDetail();
    function getScenciDetail() {
        $http.get(
            $scope.url + 'api/mobile/scenic/detail/' + $stateParams.itemId
        ).success(function (res) {
            $scope.scenicDetailItem = res.data;
            if ($scope.scenicDetailItem.voice) {
                var audioUrl = 'http://tourism.yxzhy.cc' + $scope.scenicDetailItem.voice;
                $scope.$broadcast('audiourl', audioUrl);
            } else {
            }
        })
    }


    // 点击写评论判断登录状态并跳转
    $scope.checkLogin = function () {
        if ($scope.token) {
            $scope.hasLogin = true;
            $scope.noLogin = false;

        } else {
            $scope.hasLogin = false;
            $scope.noLogin = true;
        }
    }


});

// 3.----景点详情
tourismAndListen.controller('ScenerySpotDetail', function ($scope, $http, $ionicScrollDelegate, $stateParams, GlobalVariable, $sce, $location, ShowAlertMessage, $timeout, $state, $ionicHistory) {
    // 景点详情
    $scope.spotId = $stateParams.spotId;//景点id
    $scope.url = GlobalVariable.SERVER_PATH;
    var wsCache = new WebStorageCache();
    $scope.token = wsCache.get('ZHYToken');

    //滚动改变头部
    $scope.scrollChange = function () {
        var contentScrollTop = $ionicScrollDelegate.$getByHandle('scenicSpot').getScrollPosition().top;
        /* 获取滚动的距离 */
        // 隐藏 和 显示头部
        if (contentScrollTop >= 200) {
            $('.header').removeClass('gradient-bg');
            $('.header').addClass('white_bg');
        } else {
            $('.header').removeClass('white_bg');
            $('.header').addClass('gradient-bg');
        }
    };
    /* 获取口令 */
    $scope.$on('$ionicView.enter', function () {
        $scope.token = wsCache.get('ZHYToken');
        /* 每次进入重新获取口令,防止登录成功后未及时获取*/
        getCommentData();//获取评论数据
        $scope.checkLogin();//检查登录状态
    });
    getSpotDetail();
    function getSpotDetail() {
        $http.get(
            GlobalVariable.SERVER_PATH + 'api/mobile/spot/detail/' + $stateParams.spotId
        ).success(function (res) {
            $scope.spotlist = res.data;
            $scope.orderByAreaId = res.data.scenicId;//景点所属景区id
            if ($scope.spotlist.voice) {
                var audioUrl = 'http://tourism.yxzhy.cc' + $scope.spotlist.voice;
                $scope.$broadcast('audiourl', audioUrl);
            } else {
            }
        }).error(function (err) {
            // console.log(err)
        })
    }

    // 获取评论
    function getCommentData() {
        $http.get(
            GlobalVariable.SERVER_PATH + 'api/mobile/comment/spot/list/' + $stateParams.spotId,
            {
                params: {page: 1}
            }
        ).success(function (res) {
            if (res.code == 0) {
                if (res.data) {
                    $scope.commentItems = res.data.list;
                    console.log(res.data.list);
                } else {
                    return;
                }
            }
            ;
        })
    }


    // 点击写评论判断登录状态并跳转
    $scope.checkLogin = function () {
        if ($scope.token) {
            $scope.hasLogin = true;
            $scope.noLogin = false;
        } else {
            $scope.hasLogin = false;
            $scope.noLogin = true;
        }
    }
});

// 4.---景区发表评论
tourismAndListen.controller('AreaComment', function ($scope, $http, $stateParams, $timeout, $ionicHistory, GlobalVariable, $window, ShowAlertMessage) {
    $scope.url = GlobalVariable.SERVER_PATH_YXY;
    var wsCache = new WebStorageCache();
    var token = wsCache.get('ZHYToken');
    /* 获取口令 */
    //发送评论数据
    function postComment() {
        $http({
            method: 'POST',
            url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/comment/scenic/add/',
            params: {
                token: token,
                id: $stateParams.commentId,
                text: $scope.commentContent
            }
        }).success(function (res) {
            // console.log(res);
            if (res.code === 0) {
                //成功消息提示，返回
                ShowAlertMessage.showMessage(res.msg, 1500)
                $timeout(function () {
                    $ionicHistory.goBack()
                }, 1500);
            } else if (res.code === -1) {
                ShowAlertMessage.showMessage(res.msg, 2000)
            }

        })
    }

    $scope.send = function () {
        // console.log($scope.commentContent);
        if (!$scope.commentContent) {
            // 消息提示
            ShowAlertMessage.showMessage('内容不能为空', 2000)
            return;
        } else {
            postComment();//发送评论数据
        }
    }
    $scope.$on("$ionicView.beforeLeave", function (event, data) {
        // 替换当前页面url
        var stateObj = {area: "bar"};
        var host = window.location.host;
        var url = 'http://' + host + '/#/sceneryArea_detail/' + $stateParams.commentId;
        // console.log(url);
        history.replaceState(stateObj, 'page1', url);
    });
});
//5.---- 景点发表评论
tourismAndListen.controller('SpotComment', function ($scope, $http, $stateParams, $timeout, $window, $ionicHistory, GlobalVariable, ShowAlertMessage) {
    $scope.url = GlobalVariable.SERVER_PATH;
    var wsCache = new WebStorageCache();
    var token = wsCache.get('ZHYToken');
    /* 获取口令 */
    var spotUrl = wsCache.get('currentUrl');//获取进入url
    //发送评论数据
    function postComment() {
        $http({
            method: 'POST',
            url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/comment/spot/add/',
            params: {
                token: token,
                id: $stateParams.commentId,
                text: $scope.commentContent
            }
        }).success(function (res) {
            if (res.code === 0) {
                ShowAlertMessage.showMessage(res.msg, 2000)
                $timeout(function () {
                    $ionicHistory.goBack();
                }, 1500);  //回到进入写评论的地方
            } else if (res.code === -1) {
                ShowAlertMessage.showMessage(res.msg, 2000)
            }
        })
    }

    $scope.send = function () {
        // console.log($scope.commentContent);
        if (!$scope.commentContent) {
            // 消息提示
            ShowAlertMessage.showMessage('内容不能为空', 2000)
            return;
        } else {
            postComment();//发送评论数据
        }
    }
    $scope.$on("$ionicView.beforeLeave", function (event, data) {
        // 替换当前页面url
        var stateObj = {sopt: "bar"};
        var host = window.location.host;
        var url = 'http://' + host + '/#/secnerySpot_detail/' + $stateParams.commentId;
        // console.log(url);
        history.replaceState(stateObj, 'page2', url);
    });
});

//6.----得到上一个页面的url---用于返回
tourismAndListen.controller('caseNavCtrl', function ($scope, $state, $rootScope) {
    $rootScope.$on('$stateChangeStart', function (ev, to, toParams, from, fromParams) {
        $rootScope.previousState = from; //from为前一个页面的路由信息：url,cache,views,name
        $rootScope.previousParams = fromParams; //fromParams为前一个页面的ID信息
        $rootScope.nowState = to; //to为当前页面的路由信息：url,cache,views,name，同样，toParams为当前页面的ID信息
        // console.log(from.name);
        // console.log(to);
        // console.log(fromParams)
        // console.log($rootScope.previousState.url);
        // console.log("11")
    });


});
//7.----景区攻略
tourismAndListen.controller('SceneryStrategy', function ($scope, $http, $stateParams, GlobalVariable) {
    $scope.domain = GlobalVariable.SERVER_PATH;
    $scope.successGetData = false;
    console.log('景区攻略');
    // 获取景区攻略列表数据
    $http({
        method: 'GET',
        url: GlobalVariable.SERVER_PATH + 'api/mobile/strategy/scenic/list/',
        params: {
            id: $stateParams.itemId
        }
    })
        .success(function (res) {
            if (res.code == 0) {
                $scope.items = res.data;
                console.log($scope.items);
                $scope.successGetData = false;

            } else {
                $scope.successGetData = true;
                $scope.alertMessage = res.msg;
            }

        })

});
//8、----景区攻略详情
tourismAndListen.controller('SceneryStrategyDetail', function ($scope, $state, $location, $timeout, $stateParams, $http, GlobalVariable, ShowAlertMessage) {
    var wsCache = new WebStorageCache();
    var getStorageToken;
    /*口令 */
    $scope.parentId = $stateParams.strategyDetailId;//页面跳转用
    var getHttpData = {};
    /* 用于储存收藏的params */

    $scope.collectState = false;
    /* 定义是否收藏状态*/

    $scope.ifDot = true;
    /* 定义是否点赞 */

    getTravelDetailData();
    // $scope.ifDot = false;
    //  $stateParams用来接收上一个路由传过来的参
    function getTravelDetailData() {
        // console.log($stateParams.strategyDetailId)
        $http.get(GlobalVariable.SERVER_PATH + 'api/mobile/strategy/detail/' + $stateParams.strategyDetailId)
            .success(function (response) {
                if (response.code === 0) {
                    $scope.detailDatas = response.data;
                    getHttpData.title = response.data.title.slice(0, 29);
                    getHttpData.describe = response.data.summary.slice(0, 24);
                    getHttpData.url = $location.absUrl();
                    getHttpData.image = response.data.thumb320 || response.data.thumb640 || response.data.thumbnail;
                    getHttpData.id = response.data.id;
                } else {
                    ShowAlertMessage.showMessage(response.msg, '', true)
                }

            })
            .error(function (err) {
                // console.log(err)
            })
    }

    $scope.judgeIfDot = function () {
        if ($scope.ifDot === true) {
            $scope.ifDot = false;
            $scope.detailDatas.upvoteCounts++;
            postUpvote(1);
            ShowAlertMessage.showMessage('点赞 +1', '', true);
            $scope.dotState = true;
        } else {
            $scope.ifDot = true;
            $scope.detailDatas.upvoteCounts--;
            postUpvote(0);
            ShowAlertMessage.showMessage('点赞 -1', '', true);
            $scope.dotState = false;
        }
    };
    // 点赞功能
    function postUpvote(type) {
        $http({
            method: 'POST',
            url: GlobalVariable.SERVER_PATH + 'api/mobile/strategy/upvote',
            params: {
                id: getHttpData.id,
                type: type
            }
        })
            .success(function (response) {
                // ShowAlertMessage.showMessage(response.msg,'',true)
            })
            .error(function (err) {
                // console.log(err)
            })
    }

    //定义储存当前的url便于跳转回来
    function storageCurrentUrl() {
        wsCache.set('currentUrl', $location.absUrl());
    }

    //页面进入检查是否收藏
    var loginState, tokenIfEnabled;

    function checkHasCollect() {
        if (!getStorageToken) {
            loginState = false;
            // console.log("没有登录");
            return false;
        } else {
            // console.log("登录了");
            loginState = true;
            $http({
                method: 'GET',
                url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/collect/iscollect',
                params: {
                    token: getStorageToken,
                    url: $location.absUrl()
                }
            })
                .success(function (response) {
                    // console.log(response);
                    if (response.code == -1) {
                        tokenIfEnabled = false;
                        /* 判断token是否有效 */
                    } else {
                        tokenIfEnabled = true;
                        if (response.data.success) {
                            $scope.collectState = true;
                            //添加收藏 按钮的样式为填充色
                        }
                    }
                })
                .error(function (err) {
                    // console.log(err)
                })
        }
    }

    $scope.$on('$ionicView.enter', function () {
        getStorageToken = wsCache.get('ZHYToken');
        /* 获取口令 */
        checkHasCollect();
    });


    // 添加收藏
    function collectTravel() {
        $http({
            method: 'POST',
            url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/collect/add',
            params: {
                token: getStorageToken,
                image: GlobalVariable.SERVER_PATH + getHttpData.image,
                title: getHttpData.title,
                describe: getHttpData.describe,
                url: getHttpData.url,
                origin: 'WECHAT'
            }
        })
            .success(function (response) {
                if (response.code == 0) {
                    ShowAlertMessage.showMessage(response.msg, '', true);
                    $scope.collectState = true;
                }
            })
            .error(function (err) {
                // console.log(err)
            })
    };

    //取消收藏
    function deleteCollect() {
        $http({
            method: 'POST',
            url: GlobalVariable.SERVER_PATH_YXY + 'api/mobile/collect/delete',
            params: {
                token: getStorageToken,
                url: $location.absUrl()
            }
        })
            .success(function (response) {
                if (response.code == 0) {
                    ShowAlertMessage.showMessage(response.msg, '', true);
                    $scope.collectState = false;
                }
            })
            .error(function (err) {
                // console.log(err)
            })
    }

    //点击收藏 按钮
    $scope.judgeIfCollect = function () {
        if (!loginState || !tokenIfEnabled) {
            $state.go('login');
            /* 没有登录跳到登录页面 */
            storageCurrentUrl();
        } else {
            if ($scope.collectState) {
                deleteCollect();
            } else {
                collectTravel();

            }
        }
    };
});
//9、----景区导览图
tourismAndListen.controller('SceneryGuideMap', function ($scope, $rootScope, $http, $stateParams, GlobalVariable) {
    $http.get(
        GlobalVariable.SERVER_PATH + '/api/mobile/scenic/map/details/' + $stateParams.itemId
    ).success(function (res) {
        $scope.itemMapsImage = GlobalVariable.SERVER_PATH + res.data.mapsImage;
        // console.log(res);
    })
});
//10、----VR--
tourismAndListen.controller('VR', function ($scope, $http, $sce, GlobalVariable, $stateParams) {
    $scope.successGetData = false;
    if ($stateParams.vrUrl) {
        $scope.successGetData = true;
        var vrurl = $sce.trustAsResourceUrl($stateParams.vrUrl);
        $scope.scevrurl = vrurl;
        $('#vrWrap').height(window.innerHeight - 44);
    } else {
        $scope.successGetData = false;
    }
})