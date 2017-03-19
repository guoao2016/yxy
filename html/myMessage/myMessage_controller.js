
var myMessage=angular.module('myMessage.controller',[])/* xxx.controller 命名*/
myMessage.controller('MyMessage',function ($scope,getUnreadCountFty) {
    var wsCache = new WebStorageCache();
    var token=wsCache.get('ZHYToken');
	 getunreadNoticeCount()
	 getunreadRemindCount()
	 getunreadInfoCount()
    $scope.$on("$ionicView.afterEnter", function() {
        token = wsCache.get('ZHYToken');
    });
    //调用封装获取未读消息数量
    //公告
    function getunreadNoticeCount(){
        getUnreadCountFty.getUnreadCount(token,1).then(function (res) {
            if(res.code==0){
                $scope.unreadNoticeCount=res.data;
                // $scope.unreadNoticeCount=3;
            }
        },function (res) {
            console.log(res);
        })
    }
    //提醒
    function getunreadRemindCount(){
        getUnreadCountFty.getUnreadCount(token,2).then(function (res) {
            if(res.code==0){
                $scope.unreadRemindCount=res.data;
                // $scope.unreadRemindCount=0;
            }
        },function (res) {
            console.log(res);
        })
    }
    //消息
    function getunreadInfoCount(){
        getUnreadCountFty.getUnreadCount(token,3).then(function (res) {
            if(res.code==0){
                $scope.unreadInfoCount=res.data;
                // $scope.unreadInfoCount=2;
                console.log(res.data);
            }
        },function (res) {
            console.log(res);
        })
    }
	//接受消息更新完成
	$scope.$on('information',function(res){
		console.log(res)
		getunreadInfoCount();
	})
	//接收公告更新完成
	$scope.$on('notice',function(res){
		console.log(res)
		getunreadNoticeCount();
	})
	//接收提醒更新完成
	$scope.$on('remind',function(res){
		console.log(res)
		getunreadRemindCount();
	})

})
myMessage.controller('Notice',function ($scope,$http,GlobalVariable) {
    console.log('notice');
    var loading=false;
    var pageCount=1;
    $scope.noticeItems=[];//公告数据
    var wsCache = new WebStorageCache();
    var token=wsCache.get('ZHYToken');
    var unreadNoticeCount=[];
    $scope.notice;
    $scope.$on("$ionicView.afterEnter", function() {
       token = wsCache.get('ZHYToken');
    });
    //更新未读消息
    function updateRead(){
        $http({
            method:'POST',
            url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/notify/update/read',
            params:{
                token:token,
                ids:unreadNoticeCount
            }
        }).success(function(res){
            console.log(res);
            $scope.$emit("notice", { divName: "Child", description: "向上播数据" });
        }).error(function(res){
            console.log(res);
        })
    }
    $scope.loadData=function () {
        if(loading){return}
        loading=true;
        $http({
            method:'GET',
            url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/notify/announce/list',
            params:{
                token:token,
                page:pageCount
            }
        }).success(function (res) {
            if(res.code==0){
                pageCount++;
                $scope.noMorePage=false;//分页
                //console.log(res);
                angular.forEach(res.data,function(val){
                    unreadNoticeCount.push(val.id);
                })
                //更新消息
               console.log(unreadNoticeCount);
                $scope.noticeItems = $scope.noticeItems.concat(res.data);
                if(res.data.length<10){//当json的数量小于10（已经确定了一页为10条数据），说明页面到底了,减少一次请求
                    $scope.noMorePage=true;
                }
                updateRead(unreadNoticeCount);
            }
            loading=false;
        }).error(function (res) {
            $scope.noMorePage=true;
        }).finally(function () {/* 成功、失败都会调用这个方法 */
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
    }
    $scope.loadData();
})
myMessage.controller('Information',function ($scope,$http,GlobalVariable) {
    console.log('information');
    var loading=false;
    var pageCount=1;
    $scope.infoItems=[];//信息数据
    var wsCache = new WebStorageCache();
    $scope.token=wsCache.get('ZHYToken');
    $scope.information;
    $scope.$on("$ionicView.afterEnter", function() {
        $scope.token = wsCache.get('ZHYToken');
    });
    //更新未读消息
    function updateRead(ids){
        $http({
            method:'POST',
            url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/notify/update/read',
            params:{
                token:$scope.token,
                ids:ids
            }
        }).success(function(res){
             console.log(res);
             if(res.code == 0){
             	$scope.$emit("information", { divName: "Child", description: "向上播数据" });
             }
        }).error(function(res){
            console.log(res);
        })
    }
    $scope.loadData=function () {
        if(loading){return}
        loading=true;
        $http({
            method:'GET',
            url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/notify/message/list',
            params:{
                token:$scope.token,
                page:pageCount
            }
        }).success(function (res) {
            if(res.code==0){
                pageCount++;
                $scope.noMorePage=false;//分页
                var unreadNoticeCount=[];
                angular.forEach(res.data,function(val){
                    unreadNoticeCount.push(val.uid);
                })
                console.log(unreadNoticeCount);
                //更新消息
                console.log(res);
                $scope.infoItems = $scope.infoItems.concat(res.data);
                // 测试数据
                // $scope.infoItems =[
                //     {
                //         "uid": "834659512995545088",  //消息记录Id (记录消息是否阅读的表id)
                //         "createTime": 1488934309,     //消息创建时间
                //         "sender": "小凯凯",           //消息发送人（一般是系统）
                //         "action": null,
                //         "hasRead": false,             //是否阅读
                //         "targetType": null,
                //         "id": "834659512823578624",  //消息id
                //         "priority": 2,               //消息优先级（暂时没有使用）
                //         "type": 2,                   //消息类型  1：公告 2：提醒 3:消息
                //         "content": "C回复了A的消息 2017-01-18 15:03:49",//消息内容
                //         "target": "123"              //消息接收人(用户id)
                //     },
                //     {
                //         "uid": "834659512995545088",  //消息记录Id (记录消息是否阅读的表id)
                //         "createTime": 1487833309,     //消息创建时间
                //         "sender": "天马行空",           //消息发送人（一般是系统）
                //         "action": null,
                //         "hasRead": false,             //是否阅读
                //         "targetType": null,
                //         "id": "834659512823578624",  //消息id
                //         "priority": 2,               //消息优先级（暂时没有使用）
                //         "type": 2,                   //消息类型  1：公告 2：提醒 3:消息
                //         "content": "B回复了A的消息 2017-01-18 15:01:49",//消息内容
                //         "target": "123"              //消息接收人(用户id)
                //     }
                // ]
                if(res.data.length<10){//当json的数量小于10（已经确定了一页为10条数据），说明页面到底了,减少一次请求
                    $scope.noMorePage=true;
                }
                 updateRead(unreadNoticeCount);
            }
            loading=false;
        }).error(function (res) {
            $scope.noMorePage=true;
        }).finally(function () {/* 成功、失败都会调用这个方法 */
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
    }
    $scope.loadData();
})
myMessage.controller('Remind',function ($scope,$http,GlobalVariable) {
    console.log('remind');
    var loading=false;
    var pageCount=1;
    $scope.remindItems=[];//公告数据
    var wsCache = new WebStorageCache();
    var token=wsCache.get('ZHYToken');
    $scope.remind;
    $scope.$on("$ionicView.afterEnter", function() {
        token = wsCache.get('ZHYToken');
    });
    //更新未读消息
    function updateRead(ids){
        $http({
            method:'POST',
            url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/notify/update/read',
            params:{
                token:token,
                ids:ids
            }
        }).success(function(res){
            console.log(res);
            $scope.$emit("remind", { divName: "Child", description: "向上播数据" });
        }).error(function(res){
            console.log(res);
        })
    }
    $scope.loadData=function () {
        if(loading){return}
        loading=true;
        $http({
            method:'GET',
            url:GlobalVariable.SERVER_PATH_YXY+'api/mobile/notify/remind/list',
            params:{
                token:token,
                page:pageCount
            }
        }).success(function (res) {
            if(res.code==0){
                pageCount++;
                $scope.noMorePage=false;//分页
                var unreadNoticeCount=[];
                angular.forEach(res.data,function(val){
                    unreadNoticeCount.push(val.uid);
                })
                //更新消息
                //updateRead(unreadNoticeCount);
                console.log(res);
                $scope.remindItems = $scope.remindItems.concat(res.data);
                // 测试数据
                // $scope.remindItems =[
                //     {
                //         "uid": "834659512995545088",  //消息记录Id (记录消息是否阅读的表id)
                //         "createTime": 1487834309,     //消息创建时间
                //         "sender": "小凯凯",           //消息发送人（一般是系统）
                //         "action": null,
                //         "hasRead": false,             //是否阅读
                //         "targetType": null,
                //         "id": "834659512823578624",  //消息id
                //         "priority": 2,               //消息优先级（暂时没有使用）
                //         "type": 2,                   //消息类型  1：公告 2：提醒 3:消息
                //         "content": "adminId1系统提醒A 2017-01-18 15:03:49",//消息内容
                //         "target": "123"              //消息接收人(用户id)
                //     },
                //     {
                //         "uid": "834659512995545088",  //消息记录Id (记录消息是否阅读的表id)
                //         "createTime": 1487833309,     //消息创建时间
                //         "sender": "天马行空",           //消息发送人（一般是系统）
                //         "action": null,
                //         "hasRead": false,             //是否阅读
                //         "targetType": null,
                //         "id": "834659512823578624",  //消息id
                //         "priority": 2,               //消息优先级（暂时没有使用）
                //         "type": 2,                   //消息类型  1：公告 2：提醒 3:消息
                //         "content": "adminId1系统提醒A 2017-01-18 15:01:49",//消息内容
                //         "target": "123"              //消息接收人(用户id)
                //     }
                // ]
                if(res.data.length<10){//当json的数量小于10（已经确定了一页为10条数据），说明页面到底了,减少一次请求
                    $scope.noMorePage=true;
                }
                if(unreadNoticeCount.length>0){
                    updateRead(unreadNoticeCount);
                }
            }
            loading=false;
        }).error(function (res) {
            $scope.noMorePage=true;
        }).finally(function () {/* 成功、失败都会调用这个方法 */
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
    }
    $scope.loadData();
})






























