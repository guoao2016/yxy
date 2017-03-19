/**
 * Created by hello world on 2016/11/1.
 */
angular.module('myMessage.route',['myMessage.controller'])
.config(function ($stateProvider) {
  $stateProvider
    .state('myMessage',{
      url:'/myMessage',
      templateUrl:'html/myMessage/myMessage.html',
      controller:'MyMessage'
    })

});
