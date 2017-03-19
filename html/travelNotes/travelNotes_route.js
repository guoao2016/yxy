/**
 * Created by hello world on 2016/11/1.
 */
angular.module('travelNotes.route',['travelNotes.controller'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('tab.travelNotes',{
      url:'/travelNotes',
      views:{
        'tab-travelNotes':{
          templateUrl:'html/travelNotes/travelNotes.html',
          controller:'TravelNotesCtrl'
        }
      }
    })
    .state('travelDetail',{
        url:'/travelDetail/:id',
        templateUrl:'html/travelNotes/travelDetail.html',
        controller:'TravelDetailCtrl'
    })
    $urlRouterProvider.otherwise('/travelNotes')
});
