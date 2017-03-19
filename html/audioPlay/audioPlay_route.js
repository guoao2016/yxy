/**
 * Created by hello world on 2016/11/1.
 */
angular.module('audioPlay.route',['audioPlay.controller'])
.config(function ($stateProvider) {
  $stateProvider
    .state('audioPlay',{
      url:'/audioPlay/:itemId',
      templateUrl:'html/audioPlay/audioPlay.html',
      controller:'audioPlay'
    })

});
