window.onload = function() {
	var prev = document.getElementById("prevSong")
	var togg = document.getElementById("toggle")
	var next = document.getElementById("nextSong")
	var myAudio = document.getElementById("myAudio")
	var percent = document.getElementById("percent")
	var infoImg = document.getElementById("infoImg")
	var voice = document.getElementById("voice")
	var toggleVoice = document.getElementById("toggleVoice")
	var castPercent = document.getElementById("castPercent")
	var songImg = document.getElementById("songImg")
	var topName = document.getElementById("top")
	var conList = document.getElementById("containner-list")
	var listText = document.getElementsByTagName("a");
	var spanLogo = document.getElementsByTagName("span");
	var index = 0;
	//宽高
	$(".song-pic").height($(".song-pic").width());
	$(".song-pic img").height($(".song-pic>img").width());
	$("#controlList #toggle").height($("#controlList>#toggle").width() * 1.1)
	$(".left").width($("#top").height());
	$(".left img").height($("#top").height());
	$("#songControl").height($("#controlList #toggle").height());
	var conHeight = $("#containner").height() + 20;
	$("#containner-list").css("padding-top", conHeight);

	//		$("#controlList>#prevSong").height($("#controlList>#prevSong").width())
	//		$("#controlList>#nextSong").height($("#controlList>#nextSong").width())
	toggle.onclick = function() {
			if(myAudio.paused) {
				togg.style.backgroundImage = "url(images/player.png)"
				togg.style.border = "none"
				this.blur()
				myAudio.play()
			} else if(myAudio.stop) {
				myAudio.play
			} else {
				togg.style.backgroundImage = "url(images/stop.png)"
				myAudio.pause()
				this.blur()
			}
		}
		//	用计时器监听状态		
	$.ajax({
		url: "https://tourism.yxzhy.cc/api/mobile/spot/gather/0d1f4b9a-375e-417b-82b9-13a8ed22a62f",
		type: "GET",
		success: function(res) {
			var data = eval("(" + res + ")").data;
			console.log(data[5]["thumb640"]);
			var length = data.length;
			//歌曲列表			
			for(var i = 0; i < length; i++) {
				var srcU = "https://tourism.yxzhy.cc" + data[i]["thumb640"];
				console.log(srcU);
				songList = "<a id='song-list' data-num='" + i + "'><img src ='" + srcU + "'/><div class='listText'><b>" + data[i]['title'] + "</b><span class='showLogo'></span></div></a>";
				conList.innerHTML += songList;
				spanLogo[0].style.display = "block";
			}
			$(document).ready(function() {
				//
				$("#song-list").height($("#song-list").width() * 0.133);
				$(".listText").height($(".listText").width() * 0.133);
				$("#song-list img").height($("#song-list img").width());
				$(".showLogo").height($(".showLogo").width())
				$(".listText").eq(0).css("color", "#FA7823");

				for(var j = 0; j < length + 1; j++) {
					listText[j].addEventListener('click', function(e) {
						var k = this.getAttribute("data-num");

						if(index == this.getAttribute("data-num")) {
							if(myAudio.paused) {
								myAudio.play()
							} else {
								myAudio.pause()
							}
						} else {
							myAudio.stop;
							topName.innerHTML = data[k]["title"];
							songImg.src = "https://tourism.yxzhy.cc" + data[k]["thumb640"];
							myAudio.src = "https://tourism.yxzhy.cc" + data[k]["voice"];
							index = k;
							myAudio.play();
						}
					})

				}
			})

			// 切换的时候直接换掉myAudio的链接,下面两个是上一首,下一首
			next.onclick = function() {
				index++
				//index = index%length	
				if(index == length) {
					index = 0;
				}
				console.log(data[index]["title"])
				topName.innerHTML = data[index]["title"];
				songImg.src = "https://tourism.yxzhy.cc" + data[index]["thumb640"];
				myAudio.src = "https://tourism.yxzhy.cc" + data[index]["voice"];
				myAudio.play()
				this.blur();
				togg.style.backgroundImage = "url(images/player.png)"

			}
			prev.onclick = function() {
					if(index == 0) {
						index = length;
					}
					index -= 1;
					//index = index%length
					topName.innerHTML = data[index]["title"];
					songImg.src = "https://tourism.yxzhy.cc" + data[index]["thumb640"];
					myAudio.src = "https://tourism.yxzhy.cc" + data[index]["voice"];
					myAudio.play()
					this.blur();
					togg.style.backgroundImage = "url(images/player.png)"

				}
				// 改变音量
				//			voice.onmousemove = function(){
				//				myAudio.volume = voice.value
				//			}

			//	禁音切换
			//			toggleVoice.onclick = function(){				
			//				if(myAudio.volume==0){
			//					myAudio.volume = 0.5
			// 					voice.value = 0.5
			//				}else{
			//					myAudio.volume = 0
			// 					voice.value = 0;
			//				}				
			//			}

			var timer = setInterval(function() {

				var allTime = myAudio.duration;
				var second = parseInt(allTime % 60);
				var mini = parseInt(allTime / 60);
				second = second > 9 ? second : ('0' + second);
				mini = mini >= 0 ? (mini > 9 ? mini : ('0' + mini)) : 00;
				$(".allTime .allTime1").html(mini);
				$(".allTime .allTime2").html(second);
				// 这里是通过点击进度条改变当前播放时间
				castPercent.onclick = function(event) {
					var e = event || window.event
					var castListWidth = $("#castList").width();
					percent.style.width = e.offsetX + "px"
					var quickTime = myAudio.duration * e.offsetX / castListWidth;
					console.log(quickTime)
					myAudio.currentTime = quickTime
				}
				if(myAudio.paused) {
					console.log("监听paused")
					$(".song-pic img").removeAttr("class");
					togg.style.backgroundImage = "url(images/stop.png)"
				} else if(myAudio.stop) {

					console.log("监听stop")
				} else if(myAudio.play) {
					console.log("监听play")
					//图片旋转
					$(".song-pic img").attr("class", "imgRotate");
					togg.style.backgroundImage = "url(images/player.png)"
					//列表图标
					$(".showLogo").css("display", "none");
					spanLogo[index].style.display = "block";
					//列表字体
					$(".listText").css("color", "#333333");
					$(".listText").eq(index).css("color", "#FA7823");
					//	当前时间/总时长*进度条总长度=当前进度条长度,因为有半角效果,所以多用5px好看一点
					var castListWidth = $("#castList").width();
					percent.style.width = (myAudio.currentTime) / allTime * castListWidth + "px"
					$(".cricle").css("left", (myAudio.currentTime) / allTime * castListWidth + "px")
					var stimes = myAudio.currentTime + 1;
					var miniTime = parseInt(stimes / 60);
					var secTime = Math.floor(stimes % 60);
					secTime = secTime > 9 ? secTime : ('0' + secTime);
					miniTime = miniTime >= 0 ? (miniTime > 9 ? miniTime : ('0' + miniTime)) : 00;
					$(".startTime .startTime1").html(miniTime);
					$(".startTime .startTime2").html(secTime);

				}
				//	当歌曲自动播放完,进度条超过长度,要切换到下一首
				if(parseInt(percent.style.width) >=(castListWidth - 10)) {

					console.log("自动播放完了,该切歌了")
					next.onclick();
				}
			}, 1000)

			//		myAudio.addEventListener("playing",function(){
			//			console.log("即将播放")
			//		})

			//		myAudio.addEventListener("pause",function(){
			//			console.log("暂停")
			//		})			
		}
	})

}