angular.module('personalCenter.controller',[])
  .controller('PersonalCenterCtrl',function ($scope) {
   	console.log('my')
	   $(function(){
			var i=12;
			var a=100;
			var pWidth=(i/a)*100;
			$("#progress .progress-bar").css("width",pWidth+'%');
			$("#progress .circle").css("left",pWidth+'%');
			$("#progress .value").css("left",pWidth+'%');
		});
  });

/**
 * Created by hello world on 2016/11/1.
 */
angular.module('personalCenter.route',['personalCenter.controller'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('tab.personalCenter',{
      url:'/personalCenter',
      views:{
        'tab-personalCenter':{
          templateUrl:'html/personalCenter/personalCenter.html',
          controller:'PersonalCenterCtrl'
        }
      }
    })
    // 游豆说明
    .state('beansIntro',{
        url:'/beansIntro',
        // templateUrl:'html/personalCenter/beansIntro.html'
    })
});

/**
 * Created by hello world on 2016/11/1.
 */
angular.module('personalCenter.service',[])
.factory('PersonalCenterFty',function () {
  return null;
});

angular.module('scenicRecommend.controller',[])
  .controller('ScenicRecommendCtrl',function ($scope,GlobalVariable,$ionicLoading,$stateParams,$http) {
    getHeaderSliderData();
    getNavData();


    $scope.$on('$ionicView.enter',function () {
      initHeaderSlide();
      $scope.refreshScenic();
    });

    $scope.noMoreData=true;
    $scope.scenicInfo={
      pageNum:1,
      pageSize:10,
      typeNumber:''
    };

    function getHeaderSliderData() {
      $scope.headerSlideData=[
        {
          alt:'用于测试1',
          src:'assets/img/scenicRecommend/banner.jpg'
        },{
          alt:'用于测试2',
          src:'assets/img/scenicRecommend/banner.jpg'
        },{
          alt:'用于测试3',
          src:'assets/img/scenicRecommend/banner.jpg'
        }

      ]
    }
    function getNavData() {
      $scope.navData=[
        {
          url:'#/tab/tourismAndListen',
          alt:'banner-left',
          src:'assets/img/scenicRecommend/scenicRem-left.jpg'
        },{
          url:'#/tab/travelNotes',
          alt:'banner-right',
          src:'assets/img/scenicRecommend/scenicRem-right.jpg'
        }
      ]
    }
    $scope.refreshScenic = function () {
        $http.get(GlobalVariable.SERVER_PATH+'/api/mobile/scenic/recommend')
            .success(function (respond) {
                $scope.scenicRecommendData = respond.data;
                console.log($scope.scenicRecommendData)
            })
            .error(function (err) {
                console.log(err)
            })
            .finally(function () {
                $scope.$broadcast('scroll.refreshComplete');
            })
    };
    function initHeaderSlide() {
      var headerSlider=new Swiper('#headerSlider',{
        slidesPerView:1,
        paginationClickable:true,
        centeredSlides:true,
        autoplay:2000,
        autoplayDisableOnInteraction:false,
        loop:true,
        pagination:'.swiper-pagination',
        observer:true,
        observeParents:true
      })
    }
  });

/**
 * Created by hello world on 2016/11/1.
 */
angular.module('scenicRecommend.route',['scenicRecommend.controller'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('tab.scenicRecommend',{
      url:'/scenicRecommend',
      views:{
        'tab-scenicRecommend':{
          templateUrl:'html/scenicRecommend/scenicRecommend.html',
          controller:'ScenicRecommendCtrl'
        }
      }
    })
});

angular.module('scenicRecommend.service',[])
    .factory('ScenicRecommendFty',function ($http,$q,GlobalVariable) {
        return {
            getScenicData:function () {
                var deferred = $q.defer();
                $http.get(GlobalVariable.SERVER_PATH + 'front/scenic/findScenicAjax')
                    .success(function (data) {
                        deferred.resolve(data);
                        console.log(data)
                    })
                    .error(function (reason) {
                        deferred.reject(reason)
                    })
                return deferred.promise;
            }
        }
    });


angular.module('tab.controller',[])
.controller('TabCtrl',function ($scope,$http,$rootScope,$ionicModal,$ionicHistory) {
  loadAddress();
  
  
  // 显示模态框
  $scope.showModal = function () {
    if($scope.modal){
      $scope.modal.show();
    }else {
      $ionicModal.fromTemplateUrl('html/modal/chooseAddress_modal.html',{
        scope:$scope
      }).then(function (modal) {
            $scope.modal = modal;
            //逻辑代码
            // $scope.down = true;
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
  function loadAddress() {
    $scope.cityChoose = [
      {name:'北京'},
      {name:'深圳'},
      {name:'广州'},
      {name:'阳朔'},
      {name:'上海'},
      {name:'内蒙古自治区'}
    ];
    $http.get('http://tourism.yxzhy.cc/api/mobile/area/all')
        .success(function (response) {
          $scope.addressSelect = response.data
        })
  }

  // 全局返回
  $rootScope.GoBack = function () {
    $ionicHistory.goBack()
}
});

angular.module('tab.route',['tab.controller'])
.config(function ($stateProvider,$urlRouterProvider) {
  $stateProvider
    .state('tab',{
      url:'/tab',
      abstract:true,
      templateUrl:'html/tab/tab.html',
      controller:'TabCtrl'
    })
});

angular.module('tourismAndListen.controller',['tourismAndListen.service'])
  .controller('TourismAndListenCtrl',function ($scope,$timeout,$http,tourismAndListenFty) {
    //  document.documentElement.style.fontSize = document.documentElement.clientWidth / 7.5 + 'px';
    // 边游边听页面
    //   $scope.items=tourismAndListenFty.all();
      $http.get('http://tourism.yxzhy.cc/api/mobile/scenic/nearCity',
          {
              params:{poi:'深圳市',page:1}
          }
        )
          .success(function(res){
              $scope.items=res.data;
              console.log( $scope.items)
          }).error(function(err){
          console.log(err)
      })


      $scope.items_more=tourismAndListenFty.more();
      // 数据处理
      console.log($scope.items);
    // for(var i=0;i<$scope.items.length;i++){
    //       $scope.items[i].distance=parseFloat(($scope.items[i].distance/1000).toFixed(1))
    //     }
    // for(var i=0;i<$scope.items_more.length;i++){
    // 	console.log(1)
    //   $scope.items_more[i].distance=parseFloat(($scope.items_more[i].distance/1000).toFixed(1))
    // }
    // console.log($scope.items);
    // console.log($scope.items_more);
        
    $scope.orderProp='distance';
    
    $scope.doRefresh=function(){
    	var data=$scope.items_more.splice(0,4);
        console.log('Refreshing!');
        console.log(data);

			if(data.length){
				$timeout( function() {
        	$scope.items=$scope.items.concat(data);
        	console.log($scope.items)
        //Stop the ion-refresher from spinning   
        	$scope.$broadcast('scroll.refreshComplete');
      	}, 500);
			}else{
				alert('数据全部加载完成')
				$scope.$broadcast('scroll.refreshComplete');
			}
      
    }
    $scope.calcDistance=function (distanceData) {
        mapInit();
        getCurrentPosition();
        var mapObj, geolocation;
        function mapInit () {
            mapObj = new AMap.Map('iCenter');    //默认定位：初始化加载地图时，center及level属性缺省，地图默认显示用户所在城市范围
        };
        function getCurrentPosition () { //调用浏览器定位服务
            mapObj.plugin('AMap.Geolocation', function () {
                geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                    convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                    showButton: true,        //显示定位按钮，默认：true
                    buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
                    showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
                    panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
                    zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                });
                //      mapObj.addControl(geolocation);
                //      AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
                //      AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
                if(geolocation.isSupported()){
                    console.log("浏览器支持定位");
                    mapObj.addControl(geolocation);
                    geolocation.getCurrentPosition();
                    AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
                }else{
                    console.log('无法定位')
                }

            });
        };
        function onComplete (data) {   //解析定位结果
            // 定位坐标
            var lnglat = new AMap.LngLat(data.position.getLng(),data.position.getLat());
            // 景区坐标
            console.log('距离：'+lnglat.distance(distanceData.lng,distanceData.lat))
        };
    }

  })

  // 详情页
  .controller('TourismAndListenCtrlDetail',function($scope,$http,$stateParams,$ionicHistory,$ionicLoading, $ionicTabsDelegate,tourismAndListenFty){
    $scope.item=tourismAndListenFty.get($stateParams.itemId);
    //
    //   $http.get('http://tourism.yxzhy.cc/api/mobile/scenic/scenicDetails/'+$stateParams.itemId
    //   ).success(function(res){
    //       $scope.items=res.data;
    //       console.log( $scope.items)
    //   }).error(function(err){
    //       console.log(err)
    //   })
    console.log($stateParams.itemId);
    console.log($scope.item);

    //启动
    $scope.$on('$ionicView.enter',function () {
        initAMap();//地图
        initMySwiper(); //轮播
        autoHeight();
        $scope.closeTabs();
     });
     //返回
    $scope.goHBack=function(){
          $ionicHistory.goBack();
      };
    //高德地图
    var initAMap=function(){
         var map=new AMap.Map('container',{
                resizeEnable: true,
                zoom:16,
                center:[113.944155,22.559628]
            });
         $('#container')
             .height($(window).height()-48)
             .width($(window).width());
        }

    //tabs滑块
    var initMySwiper=function(){
         var mySwiper = new Swiper ('.swiper-container', {

          })
    }

    var autoHeight=function(){
            $('.sub_detail_bg')
                .height($(window).height()-49);
                //.width($(window).width());
    }

    //底部tabs切换
    $scope.closeTabs=function(){
         $(".tabs-top [nav-view='active']").attr('nav-view','cached');
     };

     //景区下拉显示
    $scope.topNav=true;
    //标题三角
    $scope.slideUp=true;
    $scope.toggle = function() {
          $scope.topNav = !$scope.topNav;
          $scope.slideUp = !$scope.slideUp;

     };


    $scope.selectTabWithIndex = function(index) {
           $ionicTabsDelegate.select(index);
           $scope.closeTabs();
    };
  })


    // 景区详情
    .controller('SceneryAreaDetail',function ($scope,$http) {
        $scope.$on('$ionicView.enter',function () {
          scroll();
        });
        var scroll=function(){
            $(window).bind("scroll", function (){
                var sTop = $(window).scrollTop();
                sTop = parseInt(sTop);
                if (sTop > 100) {
                    $(".header").removeClass("gradient-bg");
                    $(".left-btns>a").removeClass("white-goback").addClass("goback");
                    $(".right-btns>a").removeClass("white-share").addClass("h-share");
                }
                else {
                    $(".header").addClass("gradient-bg");
                    $(".left-btns>a").removeClass("goback").addClass("white-goback");
                    $(".right-btns>a").removeClass("h-share").addClass("white-share");
                }
            });
        }

});

/**
 * Created by hello world on 2016/11/1.
 */
angular.module('tourismAndListen.route',['tourismAndListen.controller'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    //边游边听主页
    .state('tab.tourismAndListen',{
      url:'/tourismAndListen',
      views:{
        'tab-tourismAndListen':{
          templateUrl:'html/tourismAndListen/tourismAndListen.html',
          controller:'TourismAndListenCtrl'
        }
      }
    })

    //边游边听二级页面
    .state('tourismAndListen_detail',{
      url:'/tourismAndListen_detail/:itemId',
      templateUrl:'html/tourismAndListen/tourismAndListen_detail.html',
      controller:'TourismAndListenCtrlDetail'
    })
    // 景区详情
    .state('sceneryArea_detail',{
        url:'/sceneryArea_detail/:itemId',
        templateUrl:'html/tourismAndListen/scenery_area_detail.html',
        controller:'SceneryAreaDetail'
    });
  $urlRouterProvider.otherwise('/tourismAndListen');
});

/**
 * Created by hello world on 2016/11/1.
 */
angular.module('tourismAndListen.service',[])
  .factory('tourismAndListenFty',function () {
    //
    // $http.get('http://tourism.yxzhy.cc/api/mobile/scenic/nearCity',
    //     {
    //       params:{poi:'深圳市',page:1}
    //     }
    //   ).success(function(res){
    //       items=res.data;
    //       console.log( items);
    //   }).error(function(err){
    //       console.log(err)
    //   })



    var items= [

        {
          "enabled":true,
          "distance":1160258,
          "title":"深圳锦绣中华民俗村",
          "level":"5A",
          "thumbnail":"/upload/images/1474180247043100001.jpg",
          "address":"深圳市南山区深南大道9003号",
          "collect_counts":0,
          "name":"自然景观",
          "lng":113.988269,
          "uuid":"f7279cd6-d7a9-4995-b5a7-6294dc44abc4",
          "lat":22.531064,
          "upvote_counts":2
        },
        {
          "enabled":true,
          "distance":11297,
          "title":"深圳欢乐谷",
          "level":"5A",
          "thumbnail":"/upload/images/1474181292413100001.jpg",
          "address":"广东省深圳市南山区华侨城侨城西路",
          "collect_counts":0,
          "name":"自然景观",
          "lng":113.98104,
          "uuid":"21c4162e-5f0c-4ab6-9eb1-bda7057c0cd5",
          "lat":22.541615,
          "upvote_counts":8
        },
        {
          "enabled":true,
          "distance":12157,
          "title":"深圳世界之窗",
          "level":"5A",
          "thumbnail":"/upload/images/1474179535833100001.jpg",
          "address":"深圳南山区华侨城深南大道9037号",
          "collect_counts":0,
          "name":"人文景观",
          "lng":113.973076,
          "uuid":"dbd00aa1-2196-4531-897b-5fbeaa80b87b",
          "lat":22.534585,
          "upvote_counts":1
        },
        {
          "enabled":true,
          "distance":13368,
          "title":"深圳梧桐山风景名胜区",
          "level":"4A",
          "thumbnail":"/upload/images/1474194261346100001.jpg",
          "address":"深圳市莲塘罗沙公路2076号",
          "collect_counts":0,
          "name":"自然景观",
          "lng":114.215734,
          "uuid":"e5bb50e5-5182-46a8-9396-2914d6149cad",
          "lat":22.577551,
          "upvote_counts":2
        },
        {
          "enabled":true,
          "distance":18974,
          "title":"深圳观澜山水田园旅游文化园",
          "level":"4A",
          "thumbnail":"/upload/images/1474192785428100001.jpg",
          "address":"广东省深圳市观澜镇",
          "collect_counts":0,
          "name":"自然景观",
          "lng":114.10731,
          "uuid":"90d26b68-2ebf-4b72-8c71-c65be3374c7e",
          "lat":22.714139,
          "upvote_counts":3
        },
        {
          "enabled":true,
          "distance":22230,
          "title":"深圳东部华侨城",
          "level":"5A",
          "thumbnail":"/upload/images/1472810936248.jpg",
          "address":"广东省深圳市盐田区大梅沙东部华侨东",
          "collect_counts":0,
          "name":"自然景观",
          "lng":114.287757,
          "uuid":"ea967fcc-7f42-41d2-871b-839d1890754e",
          "lat":22.626657,
          "upvote_counts":35
        },
        {
          "enabled":true,
          "distance":39203,
          "title":"深圳市西部海上田园旅游区",
          "level":"4A",
          "thumbnail":"/upload/images/1474193051928100001.jpg",
          "address":" 广东省深圳市宝安区沙井镇民主村民主大道海上田园风景区",
          "collect_counts":0,
          "name":"人文景观",
          "lng":113.771186,
          "uuid":"c394a6b7-6fa2-4ae9-8dd9-8867df919f38",
          "lat":22.736115,
          "upvote_counts":1
        }
      ];
    var items_more=[
      {
        "enabled":true,
        "distance":11110,
        "title":"上海金山城市沙滩",
        "level":"4A",
        "thumbnail":"/upload/images/1476002255801100001.jpg",
        "address":"上海市金山区石化街道新城路5号(南康路口)",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.349807,
        "uuid":"b568f791-94bf-43c3-a95b-be23f3673c10",
        "lat":30.709384,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1165813,
        "title":"上海大观园",
        "level":"4A",
        "thumbnail":"/upload/images/1476163050011100001.jpg",
        "address":"上海市青浦区金商公路701号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":120.909779,
        "uuid":"4b83f1e4-dbc3-4bea-a9c7-84eb68904aed",
        "lat":31.07473,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1167569,
        "title":"陈云故居暨青浦革命历史纪念馆",
        "level":"4A",
        "thumbnail":"/upload/images/1475228784206100001.jpg",
        "address":"上海青浦区朱枫公路3516号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.043962,
        "uuid":"a836ad41-e9d2-447c-96d0-f856b94b39b8",
        "lat":31.006907,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1171884,
        "title":"上海太阳岛旅游度假区",
        "level":"4A",
        "thumbnail":"/upload/images/1476002264203100001.jpg",
        "address":"上海市青浦区朱家角镇沈太路2588号太阳岛内(近别墅区)",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.074754,
        "uuid":"8b637855-30ce-41bd-9cc5-d7dc0ffb91a9",
        "lat":31.035596,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1174110,
        "title":"上海市青少年校外活动营地－东方绿舟",
        "level":"4A",
        "thumbnail":"/upload/images/1476002262597100001.jpg",
        "address":"上海市青浦区淀山湖畔",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.011528,
        "uuid":"b7ecd5b0-5642-4512-ae60-06aade2a190b",
        "lat":31.102493,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1177367,
        "title":"上海朱家角古镇旅游区",
        "level":"4A",
        "thumbnail":"/upload/images/1476002268174100001.jpg",
        "address":"上海市青浦区朱家角镇美周路36号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.05459,
        "uuid":"27505251-62b5-4cdc-bb65-2ec85f6b92d3",
        "lat":31.111271,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1179342,
        "title":"方塔园",
        "level":"4A",
        "thumbnail":"/upload/images/1475892954704100001.jpg",
        "address":"上海市松江区松江中山东路235号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.246479,
        "uuid":"dfe5c6c7-78b7-4244-99a1-537d847c2245",
        "lat":31.004335,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1184215,
        "title":"上海佘山国家森林公园",
        "level":"4A",
        "thumbnail":"/upload/images/1476002256754100001.jpg",
        "address":"上海市西郊古城松江区境内",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.197005,
        "uuid":"86195f31-90d9-4458-a4ad-26f3fb8e124a",
        "lat":31.094097,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1194191,
        "title":"上海海湾国家森林公园",
        "level":"4A",
        "thumbnail":"/upload/images/1476163055093100001.jpg",
        "address":"上海市奉贤区海湾镇随塘河路1677号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.688764,
        "uuid":"80e76655-99f2-472e-a420-377c6d8ea241",
        "lat":30.861002,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1202614,
        "title":"上海市动物园",
        "level":"4A",
        "thumbnail":"/upload/images/1476002260354100001.jpg",
        "address":"上海市长宁区虹桥路2381号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.36303,
        "uuid":"3bb089ff-b430-4484-bdfa-5abb7479444b",
        "lat":31.192627,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1208548,
        "title":"上海古猗园",
        "level":"4A",
        "thumbnail":"/upload/images/1476163053524100001.jpg",
        "address":"上海市嘉定区南翔镇沪宜公路218号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.316666,
        "uuid":"4ee4f6fa-c067-4174-a1d4-cc466bec49ab",
        "lat":31.291827,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1211751,
        "title":"上海中国航海博物馆",
        "level":"4A",
        "thumbnail":"/upload/images/1476002267105100001.jpg",
        "address":"上海市浦东新区临港新城申港大道197号（近滴水湖）",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.919586,
        "uuid":"c7264d26-b533-48b5-ad4a-789631029e12",
        "lat":30.896432,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1212443,
        "title":"上海博物馆",
        "level":"4A",
        "thumbnail":"/upload/images/1476002251944100001.jpg",
        "address":"上海市黄浦区人民大道201号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.475489,
        "uuid":"38c661d0-89a0-4b1f-8c54-75a1bec4c92a",
        "lat":31.228506,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1212659,
        "title":"上海野生动物园",
        "level":"5A",
        "thumbnail":"/upload/images/1469427681207.jpg",
        "address":"上海市浦东南汇区南六公路178号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.722614,
        "uuid":"7069f28c-7ca1-484f-ad0e-c47a883b0795",
        "lat":31.055167,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1212716,
        "title":"上海城市规划展示馆",
        "level":"4A",
        "thumbnail":"/upload/images/1476002253174100001.jpg",
        "address":"上海市黄浦区市政府大厦的东侧",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.475713,
        "uuid":"0f0c1b8a-9fa5-40cb-864f-3044702f46a2",
        "lat":31.23151,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1213312,
        "title":"上海豫园",
        "level":"4A",
        "thumbnail":"/upload/images/1476002265143100001.jpg",
        "address":"上海市黄浦区安仁街137号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.49201,
        "uuid":"1801733d-5dcf-42d3-b335-7f3c8d15d735",
        "lat":31.227032,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1214854,
        "title":"上海金茂大厦88层观光厅",
        "level":"4A",
        "thumbnail":"/upload/images/1476002254602100001.jpg",
        "address":"上海市浦东新区浦东世纪大道88号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.505746,
        "uuid":"86d2b40c-d3c5-444a-867b-ccc942dde1e9",
        "lat":31.235278,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1215684,
        "title":"上海科技馆",
        "level":"5A",
        "thumbnail":"/upload/images/1469605389612.jpg",
        "address":"上海市浦东新区世纪大道2000号(近二号线上海科技馆站)",
        "collect_counts":0,
        "name":"主题公园",
        "lng":121.54248,
        "uuid":"bdd158c2-e680-4c1d-b5ca-6b433eb1be5a",
        "lat":31.219155,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1216026,
        "title":"上海世纪公园",
        "level":"4A",
        "thumbnail":"/upload/images/1476002258799100001.jpg",
        "address":"上海市浦东新区锦绣路1001号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.55284,
        "uuid":"95fb8b9f-bf3c-4125-9b87-793c34faebe1",
        "lat":31.215835,
        "upvote_counts":0
      },
      {
        "enabled":true,
        "distance":1224848,
        "title":"上海共青森林公园",
        "level":"4A",
        "thumbnail":"/upload/images/1476163051775100001.jpg",
        "address":"上海市东北部杨浦区军工路2000号",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.551407,
        "uuid":"03707866-ad44-4acd-9aea-85569cdb790a",
        "lat":31.319012,
        "upvote_counts":1
      },
      {
        "enabled":true,
        "distance":1252598,
        "title":"东平国家森林公园",
        "level":"4A",
        "thumbnail":"/upload/images/1475892919529100001.jpg",
        "address":"上海市崇明县崇明岛",
        "collect_counts":0,
        "name":"自然景观",
        "lng":121.481269,
        "uuid":"d0da33f1-6bdd-413d-a6c3-6aca9b5ebcfa",
        "lat":31.683786,
        "upvote_counts":0
      }
    ];

    return {
      all: function () {
        return items;
      },
      remove: function (item) {
        items.splice(items.indexOf(item), 1);
      },
      get: function (itemId) {
        for (var i = 0; i < items.length; i++) {
          if (items[i].uuid === itemId) {
            return items[i];
          }
        }
        return null;
      },
      more:function(){
        return items_more;
      }
    };
});


angular.module('travelNotes.controller',[])/* xxx.controller 命名*/
  .controller('TravelNotesCtrl',function ($scope,$ionicModal,$http,GlobalVariable) {/*大驼峰命名*/
    $scope.firstNotes = {};
    $scope.othersNotes =[];
  })
