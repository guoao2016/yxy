
angular.module('scenicSearch.controller',[])
    .controller('scenicSearchCtrl',function ($scope,$http,$stateParams,GlobalVariable,ShowAlertMessage,$ionicScrollDelegate) {

        // 改变头部
        $scope.scrollChooseContainer = function () {
            var contentScrollTop = $ionicScrollDelegate.$getByHandle('scenicSearchList').getScrollPosition().top;/* 获取滚动的距离 */
            // 隐藏 和 显示头部
            if(contentScrollTop >= 200){
                $('#search .searchDetail').slideUp(1000);
                $('#search .scroll-content').addClass('deleteTop')
            }else {
                $('#search .searchDetail').slideDown(500);
                $('#search .scroll-content').removeClass('deleteTop').addClass('addTop')
            }
        };
        var wsCache = new WebStorageCache();

        // 获取历史记录
        getHistoryData();/* 刚进来获取历史记录 */
        function getHistoryData() {
            var historyData = wsCache.get('searchHistory');/* 获取历史记录 */
            var tempData = historyData || [];
            var tempDataLength = tempData.length;
            if(tempDataLength >= 5 ){/* 只显示6条数据*/
                $scope.historyData = tempData.slice(0,6);/* 只截取搜索记录的6条 */
            }else {
                $scope.historyData = tempData;
            }
        }

        //清除历史记录
        $scope.clearHistoryData = function () {
            wsCache.delete('searchHistory');
            $scope.historyData = [];/* 清除页面显示 */
            $scope.httpGetBackData = [];/* 清空搜索内容 */
        };

        // 设置历史
        function setHistoryData(item) {
            var searchVal = item || $scope.searchVal;
            var historyData = wsCache.get('searchHistory');/* 获取历史记录 */
            function putData() {
                historyData.unshift(searchVal);
                wsCache.set('searchHistory',historyData);
            }
            // 如何没有任何历史记录，直接储存
            if(!historyData){
                historyData = [];
                putData();
            }else {
                // 有历史记录，就遍历储存本来的历史记录，并与当前输入值比较，如果之前存在，那么删除之前的，新值直接储存；之前没有，那就直接储存
                var tempHistory = wsCache.get('searchHistory');
                var tempArr = [];
                var flag = false;
                var i = 0;
                angular.forEach( tempHistory,function (value,index) {
                    if(value == searchVal){
                        wsCache.delete('searchHistory');
                        historyData = [];
                        flag = true;
                    }else {
                        tempArr[i] = value;
                        i++;
                    }
                });
                if(!flag){
                    putData();
                }else {
                    angular.forEach(tempArr,function (value) {
                        wsCache.set('searchHistory',historyData.push(value));
                    });
                    historyData.unshift(searchVal);
                    wsCache.set('searchHistory',historyData)
                }
            }
        }


        // 封装请求
        $scope.page = 0;
        $scope.pageCount = 1;
        var isClick = false;
        var keywords;
        // 这步很重要，因为这个页面包含2个页面的搜索功能，监听$scope.searchVal值，但值改变时，必须把page变为0，
        //不然page一直累计
        $scope.$watch('searchVal',function (newVal, oldVal, scope) {
            if(newVal != oldVal){
                $scope.page = 0;
            }
        });
        $scope.allSearchData = [];

        //点击关键字查询列表数据
        $scope.clickKeywords = function (words,type) {
            $scope.allSearchData = [];
            if(type == 0){
                keywords = words;
            }else {
                keywords = $scope.searchVal;
            }
            isClick = true;
            $scope.getSearchData(keywords,false);

        }

        $scope.getSearchData = function(item,diffState) {
            if(diffState == false){
                $scope.page = 0;
                getSearchData1(keywords);
                // console.log(keywords);
            }
            if(diffState == true){
                getSearchData1(keywords);
            }
        }

        $scope.hasMoreData = true;/* 没有更多数据的弹框 */
        function getSearchData1(keywords) {
            $scope.page++;
            $http({
                method:'GET',
                url:GlobalVariable.SERVER_PATH+'api/mobile/scenic/search',
                params:{
                    page:$scope.page,
                    title:keywords
                }
            })
                .success(function (response) {
                    if(response.code == 0){
                        $scope.hasMoreData = true;
                        angular.forEach(response.data.list,function (everyList) {
                            $scope.allSearchData.push(everyList);
                        })
                        $scope.pageCount = response.data.pageCount;
                        setHistoryData(keywords);/* 请求成功时，设置历史记录 */
                        getHistoryData();/* 重新获取历史记录 */
                    }else {
                        if($scope.page > 1){
                            ShowAlertMessage.showMessage('没有更多的数据',1000,true);
                            return false
                        }else {
                            $scope.hasMoreData = false;
                        }
                    }
                    if(isClick && $scope.page == 1){
                        $scope.scrollSmallToTop();/* 回到顶部 */
                    }
                })
                .error(function (err) {
                    console.log(err);
                })
                .finally(function () {
                    $scope.$broadcast('scroll.infiniteScrollComplete')
                })
            }
        $scope.scrollSmallToTop = function() {
            $ionicScrollDelegate.$getByHandle('scenicSearchList').scrollTop();
        };
    })