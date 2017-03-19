/**
 * Created by hello world on 2016/11/1.
 */
angular.module('myTravel.route',['myTravel.controller'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('myTravelList',{
      url:'/myTravelList',
      templateUrl:'html/myTravel/myTravelList.html',
      controller:'MyTravelList'
    })
    .state('myTravelDetail',{//个人和公开游记详情同一个
        url:'/myTravelDetail/:itemId',
        templateUrl:'html/myTravel/myTravelDetail.html',
        controller:'MyTravelDetail'
     })
    .state('myTravelReply',{
          url:'/myTravelReply/:itemId',
          templateUrl:'html/myTravel/myTravelReply.html',
          controller:'MyTravelReply'
    })

});
