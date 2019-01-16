const countDown = function (_this,timeStamp,timeStampArr, id) {
	setTime()
  var timer=null;
	timer=setInterval(function(){
		setTime()
	},1000);
	if(timeStamp<=0){
		clearInterval(timer);
    _this.onload({'id': id})
	}
	function setTime () {
		var day = 0,
			hour = 0,
			minute = 0,
			second = 0;//时间默认值
		if(timeStamp > 0){
			day = Math.floor(timeStamp / (60 * 60 * 24))
			hour = Math.floor(timeStamp % (60 * 60 * 24) / (60 * 60));
			minute = Math.floor(timeStamp % (60 * 60) / 60);
			second = Math.floor(timeStamp % (60));
		}
		if (day <= 9) day = '0' + day;
		if (hour <= 9) hour = '0' + hour;
		if (minute <= 9) minute = '0' + minute;
		if (second <= 9) second = '0' + second;
		
		timeStamp--;
		
		_this.setData({timeStampArr: [day,hour,minute,second]})
	}
}

export {countDown}