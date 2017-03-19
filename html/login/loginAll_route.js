/**
 * Created by hello world on 2016/12/27.
 */
angular.module('loginAll.route',['loginAll.controller'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('login',{
                url:'/login',
                templateUrl:'html/login/login.html',
                controller:'loginCtrl'
            })
            .state('register',{
                url:'/register',
                templateUrl:'html/login/register.html',
                controller:'registerCtrl'
            })
            .state('getPassword',{
                url:'/getPassword',
                templateUrl:'html/login/getPassword.html',
                controller:'getPasswordCtrl'
            })
            .state('platformProtocol',{
                url:'/platformProtocol',
                templateUrl:'html/login/platformProtocol.html',
                controller:'platformProtocolCtrl'
            })
    });