/**
 * Created by hello world on 2017/1/9.
 */
angular.module('userCenter.route',['userCenter.controller','myInfo.controller','myNotes.controller'])
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('tab.userCenter',{
            url:'/userCenter',
            views:{
                'tab-userCenter':{
                    templateUrl:'html/personalCenter/userCenter.html',
                    controller:'UserCenterCtrl'
                }
            }
        })
        //修改资料
        .state('myInfo',{
            url:'/myInfo',
            templateUrl:'html/personalCenter/myInfo.html',
            controller:'MyInfoCtrl'
        })
        .state('myNick',{
            url:'/myNick',
            templateUrl:'html/personalCenter/myNick.html',
            controller:'MyNick'
        })
        .state('myCollect',{
            url:'/myCollect',
            templateUrl:'html/personalCenter/myCollect.html',
            controller:'MyCollectCtrl'
        })
        // 游记列表
        .state('myNotesList',{
            url:'/myNotesList',
            templateUrl:'html/personalCenter/myNotesList.html',
            controller:'MyNotesListCtrl'
        })
        // 游记详情
        .state('myNotesDetail',{
            url:'/myNotesDetail/:itemId',
            templateUrl:'html/personalCenter/myNotesDetail.html',
            controller:'MyNotesDetailCtrl'
        })
        // 发布游记
        .state('myNotesSend',{
            url:'/myNotesSend/:address',
            templateUrl:'html/personalCenter/myNotesSend.html',
            controller:'MyNotesSendCtrl'
        })
        // 游记编辑
        .state('myNotesEdit',{
            url:'/myNotesEdit/:itemId',
            templateUrl:'html/personalCenter/myNotesEdit.html',
            controller:'MyNotesEditCtrl'
        })

        .state('myBeans',{
            url:'/myBeans',
            templateUrl:'html/personalCenter/myBeans.html',
            controller:'UserCenterCtrl'
        })
})