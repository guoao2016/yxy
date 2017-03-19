angular.module('config',[])
  .config(function ($ionicConfigProvider) {
    /*配置不同移动端的兼容性问题*/
    $ionicConfigProvider.platform.android.tabs.position('buttom');
    $ionicConfigProvider.platform.ios.tabs.position('buttom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    // 取消自带动画
    $ionicConfigProvider.views.transition('none');
  });
