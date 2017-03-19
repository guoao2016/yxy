angular.module('route',['tab.route','scenicRecommend.route','tourismAndListen.route','travelNotes.route','userCenter.route','search.route','loginAll.route','myTravel.route','myMessage.route','audioPlay.route'])
  .config(function ($stateProvider, $urlRouterProvider,$locationProvider) {
    $urlRouterProvider.otherwise('/tab/scenicRecommend');/*route手动输入不正确是，自动跳回home主页*/
  });
