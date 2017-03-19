var myMessage = angular.module('audioPlay.controller', [])/* xxx.controller 命名*/
    .controller('audioPlay', function ($scope, $stateParams, $http, GlobalVariable) {
        $scope.domain = GlobalVariable.SERVER_PATH;
        // var myAudio = $("#myAudio");
        $scope.img;//唱盘里图片
        var currentSrc;//记录当前正在播放的音频地址
        var index = 0;//当前正在播放的歌曲索引
        $scope.dataAll;
        $scope.title;//当前正在播放的音频
        var myAudio=new Audio();

        //$("#toggle").css("background-image", "url(assets/css/images/player.png)")
        //获取音频列表数据
        $http({
            method: 'GET',
            url: GlobalVariable.SERVER_PATH + 'api/mobile/spot/audios/' + $stateParams.itemId
        }).success(function (res) {
            if (res.code == 0) {
                console.log("ddd");
                $scope.dataAll = res.data;
                $scope.title = res.data[0].title;

                $scope.itemClick(res.data[0].thumb320, res.data[0].voice, 0);
            } else {

            }


        }).error(function () {

        })


        $scope.control = function () {

            if (myAudio.paused) {
                console.log("开始播放");
                myAudio.play();
                $("#toggle").css("background-image", "url(assets/css/images/player.png)");

            } else if (myAudio.play) {
                console.log("暂停")
                myAudio.pause();
                $("#toggle").css("background-image", "url(assets/css/images/stop.png)");

            }
        }


        //音频列表项点击事件
        $scope.itemClick = function (img, voice, index) {
            console.log("ddd" + index);
            $scope.title = $scope.dataAll[index].title;
            //播放
            if (currentSrc == GlobalVariable.SERVER_PATH + voice) {//正在播放为当前列表音频
                //切音频
                // myAudio.stop;
                if (myAudio.paused) {
                    myAudio.play();
                } else {
                    myAudio.pause();
                }

            } else {//播放当前列表项
                // myAudio.stop;
                myAudio.src = "";
                playAudio(GlobalVariable.SERVER_PATH + voice, GlobalVariable.SERVER_PATH + img,index);
            }

            console.log(voice);
            //index = index;


        }

        //播放 音频
        function playAudio(voice, img,_index) {
            index=_index;
            $scope.img=img;
            myAudio.src = "";//清空上一首
            currentSrc=voice;
            // Media=null;
            myAudio = new Audio();
            myAudio.src=voice;

            myAudio.play();
            //列表图标
            $(".showLogo").css("display", "none");
            $(".showLogo").eq(index).css( "display","block");
            //列表字体
            $(".listText").css("color", "#333333");
            $(".listText").eq(index).css("color", "#FA7823");
        }

        //上一首音频
        $scope.preAudio = function () {
            var src;
            var img;
            var _index;
            if (index == 0) {
                $scope.title=$scope.dataAll[$scope.dataAll.length-1].title;
                src = GlobalVariable.SERVER_PATH+$scope.dataAll[$scope.dataAll.length-1].voice;
                img = GlobalVariable.SERVER_PATH+$scope.dataAll[$scope.dataAll.length-1].thumb320;
                _index=$scope.dataAll.length-1;
            } else {
                $scope.title=$scope.dataAll[index - 1].title;
                src = GlobalVariable.SERVER_PATH+$scope.dataAll[index - 1].voice;
                img = GlobalVariable.SERVER_PATH+$scope.dataAll[index-1].thumb320;
                _index=index-1;
            }
            playAudio(src, img,_index);
        };

        //下一首音频
        $scope.nextAudio = function () {
            var src;
            var img;
            var _index;
            if (index == $scope.dataAll.length-1 ) {
                $scope.title=$scope.dataAll[0].title;
                src = GlobalVariable.SERVER_PATH+$scope.dataAll[0].voice;
                img = GlobalVariable.SERVER_PATH+$scope.dataAll[0].thumb320;
                _index = 0;

            } else {
                $scope.title=$scope.dataAll[index + 1].title;
                src = GlobalVariable.SERVER_PATH+$scope.dataAll[index + 1].voice;
                img = GlobalVariable.SERVER_PATH+$scope.dataAll[index + 1].thumb320;
                _index=index+1;
            }

           playAudio(src, img,_index);
        };


        $scope.errorImg = function (obj) {
            $(obj).attr("ng-src", "https://static.oschina.net/uploads/user/131/263977_50.jpg");
        }


        var timer = setInterval(function() {
                var castListWidth = $("#castList").width();
                var allTime = myAudio.duration;
                var castWidth = ((myAudio.currentTime)/allTime) * castListWidth + "px";;
                var second = parseInt(allTime % 60);
                var mini = parseInt(allTime / 60);
                second = second > 9 ? second : ('0' + second);
                mini = mini >= 0 ? (mini > 9 ? mini : ('0' + mini)) : 00;
                $(".allTime .allTime1").html(mini);
                $(".allTime .allTime2").html(second);
                // 这里是通过点击进度条改变当前播放时间
                castPercent.onclick = function(event) {
                    var e = event || window.event;

                    $("#percent").css("width",(e.offsetX + "px"));
                    var quickTime = myAudio.duration * e.offsetX / castListWidth;
                    console.log(quickTime);
                    myAudio.currentTime = quickTime;
                }
                if(myAudio.paused) {
                    console.log("监听paused");
                    $("#toggle").css("background-image", "url(assets/css/images/stop.png)");
                    $(".song-pic img").removeAttr("class");
                } else if(myAudio.stop) {

                    console.log("监听stop")
                } else if(myAudio.play) {
                    console.log("监听play");
                    //开关样式
                    $("#toggle").css("background-image", "url(assets/css/images/player.png)");
                    //图片旋转
                    $(".song-pic img").attr("class", "imgRotate");
                    //列表图标
                    $(".showLogo").css("display", "none");
                    $(".showLogo").eq(index).css( "display","block");
                    //列表字体
                    $(".listText").css("color", "#333333");
                    $(".listText").eq(index).css("color", "#FA7823");

                    //	当前时间/总时长*进度条总长度=当前进度条长度,因为有半角效果,所以多用5px好看一点


                    $("#percent").css("width",castWidth);
                    $(".cricle").css("left", (myAudio.currentTime) / allTime * castListWidth + "px");
                    var stimes = myAudio.currentTime + 1;
                    var miniTime = parseInt(stimes / 60);
                    var secTime = Math.floor(stimes % 60);
                    secTime = secTime > 9 ? secTime : ('0' + secTime);
                    miniTime = miniTime >= 0 ? (miniTime > 9 ? miniTime : ('0' + miniTime)) : 00;
                    $(".startTime .startTime1").html(miniTime);
                    $(".startTime .startTime2").html(secTime);

                }
                //	当歌曲自动播放完,进度条超过长度,要切换到下一首
                if(myAudio.currentTime >=myAudio.duration) {

                    console.log("自动播放完了,该切歌了")
                    $scope.nextAudio();
                }
            }, 1000)


        $scope.$on('$ionicView.afterLeave', function () {
            //清空
            myAudio.src = "";
            clearInterval(timer);
        });
        window.onload = function () {
            var prev = document.getElementById("prevSong");
            var togg = document.getElementById("toggle");
            var next = document.getElementById("nextSong");

            var percent = document.getElementById("percent");
            var infoImg = document.getElementById("infoImg");
//	var voice = document.getElementById("voice")
            var toggleVoice = document.getElementById("toggleVoice");
            var castPercent = document.getElementById("castPercent");
            var songImg = document.getElementById("songImg");
            var topName = document.getElementById("top");
            var conList = document.getElementById("containner-list");
            var listText = document.getElementsByTagName("a");
            var spanLogo = document.getElementsByTagName("span");
            var index = 0;




        }
    })






























