/*
 * zxxFile.js ?轰?HTML5 ??欢涓?????蹇???? http://www.zhangxinxu.com/wordpress/?p=1923
 * by zhangxinxu 2011-09-12
*/ 
var ZXXFILE = {
	fileInput: null,				//html file?т欢
	dragDrop: null,					//???????哄?
	upButton: null,					//??氦???
	url: "",						//ajax?板?
	fileFilter: [],					//杩?护?????欢?扮?
	filter: function(files) {		//?????欢缁??杩?护?规?
		return files;	
	},
	onSelect: function() {},		//??欢?????
	onDelete: function() {},		//??欢?????
	onDragOver: function() {},		//??欢????版???????
	onDragLeave: function() {},	//??欢绂诲??版???????
	onProgress: function() {},		//??欢涓??杩?害
	onSuccess: function() {},		//??欢涓???????
	onFailure: function() {},		//??欢涓??澶辫触??,
	onComplete: function() {},		//??欢?ㄩ?涓??瀹????
	
	/* 寮?????板???疆?规????绾? */
	
	//??欢???
	funDragHover: function(e) {
		e.stopPropagation();
		e.preventDefault();
		this[e.type === "dragover"? "onDragOver": "onDragLeave"].call(e.target);
		return this;
	},
	//?峰??????欢锛?ile?т欢?????
	funGetFiles: function(e) {
		// ???榧??缁???峰?
		this.funDragHover(e);
				
		// ?峰???欢??〃瀵硅薄
		var files = e.target.files || e.dataTransfer.files;
		//缁х画娣诲???欢
		this.fileFilter = this.fileFilter.concat(this.filter(files));
		this.funDealFiles();
		return this;
	},
	
	//??腑??欢?????????
	funDealFiles: function() {
		for (var i = 0, file; file = this.fileFilter[i]; i++) {
			//澧?????绱㈠???
			file.index = i;
		}
		//?ц???????
		this.onSelect(this.fileFilter);
		return this;
	},
	
	//???瀵瑰????浠?
	funDeleteFile: function(fileDelete) {
		var arrFile = [];
		for (var i = 0, file; file = this.fileFilter[i]; i++) {
			if (file != fileDelete) {
				arrFile.push(file);
			} else {
				this.onDelete(fileDelete);	
			}
		}
		this.fileFilter = arrFile;
		return this;
	},
	
	//??欢涓??
	funUploadFile: function() {
		var self = this;	
		if (location.host.indexOf("sitepointstatic") >= 0) {
			//????规??″?涓??琛?
			return;	
		}
		for (var i = 0, file; file = this.fileFilter[i]; i++) {
			(function(file) {
				var xhr = new XMLHttpRequest();
				if (xhr.upload) {
					// 涓??涓?
					xhr.upload.addEventListener("progress", function(e) {
						self.onProgress(file, e.loaded, e.total);
					}, false);
		
					// ??欢涓????????澶辫触
					xhr.onreadystatechange = function(e) {
						if (xhr.readyState == 4) {
							if (xhr.status == 200) {
								self.onSuccess(file, xhr.responseText);
								self.funDeleteFile(file);
								if (!self.fileFilter.length) {
									//?ㄩ?瀹??
									self.onComplete();	
								}
							} else {
								self.onFailure(file, xhr.responseText);		
							}
						}
					};
		
					// 寮?濮??浼?
					xhr.open("POST", self.url, true);
					xhr.setRequestHeader("X_FILENAME", file.name);
					xhr.send(file);
				}	
			})(file);	
		}	
			
	},
	
	init: function() {
		var self = this;
		
		if (this.dragDrop) {
			this.dragDrop.addEventListener("dragover", function(e) { self.funDragHover(e); }, false);
			this.dragDrop.addEventListener("dragleave", function(e) { self.funDragHover(e); }, false);
			this.dragDrop.addEventListener("drop", function(e) { self.funGetFiles(e); }, false);
		}
		
		//??欢????т欢???
		if (this.fileInput) {
			this.fileInput.addEventListener("change", function(e) { self.funGetFiles(e); }, false);	
		}
		
		//涓???????氦
		if (this.upButton) {
			this.upButton.addEventListener("click", function(e) { self.funUploadFile(e); }, false);	
		} 
	}
};