/**
 * Created by hello world on 2016/12/12.
 */
angular.module('search.route',['travelNotesSearch.controller','scenicSearch.controller'])
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('travelNotesSearch',{
            url:'/travelNotesSearch',
            templateUrl:'html/search/travelNotesSearch.html',
            controller:'travelNotesSearchCtrl'
        })
        .state('scenicSearch',{
            url:'/scenicSearch',
            templateUrl:'html/search/scenicSearch.html',
            controller:'scenicSearchCtrl'
        })
})