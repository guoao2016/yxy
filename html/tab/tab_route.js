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
