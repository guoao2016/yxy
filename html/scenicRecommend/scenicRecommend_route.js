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
