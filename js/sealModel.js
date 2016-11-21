var PREVIEWSIZE = 280;	//预览区域的宽，目前是正方形
var CENTER_X = PREVIEWSIZE / 2;	//印模预览图片的中心x坐标，280为预览区域的宽
var CENTER_Y = PREVIEWSIZE / 2;	//印模预览图片的中心y坐标，280为预览区域的高

//印模的数据结构，衡量大小的单位皆为px
var sealModel = {
	type:		"oval",		//oval椭圆,square矩形,diamond菱形,triangle三角形
	w:			120,		//外框宽
	h:			100,		//外框高
	colorFg:	"#FF0000",	//前景色
	colorBg:	"#FFFFFF",	//背景色
	ratio:		1,			//分辨率，值越大分辨率越高，用于替代安真通的单位dpi
	penWidth:	8,			//外边框画笔宽
	hasNeiKuang:false,		//有无内框
	penWidth2:	3,			//内边框画笔宽
	w2:			90,			//内框宽
	h2:			90,			//内框高
	picChar:	"",			//内图
	picPath:	"",			//安真通中表示内图图片，但为了保持一致，图片以base64存放在picChar中
	picW:		20,			//内图大小
	picOffset:	0,			//内图下移
	texts:		[/*{
		text：	"",
		font:	"SimSun",
		height:	20,		//文字大小
		bold:	1,			//0极细，1标准，2极粗
		angels:	160,		//占用角度
		offset:	2.00,		//文字内移
		interval:0,			//附加字距
	},{},{},{},{},{}*/],//前两个为上下弦文，后四个为横文，默认结构为空
	templateImg:"",
	md5:		"",
	extend:		""
}

$(function() {
	init();
	//绑定事件
	$("#shape").change(function(){//印章模板
		sealModel.type = $(this).val();
		draw();
	});
	$("#size").change(function(){//印章规格
		if($(this).val() != "customsize")
		{
			$("#customeH").attr("disabled",true);//置灰
			$("#customeW").attr("disabled",true);
			var wh = $(this).val().split("*");
			sealModel.w = wh[0] * sealModel.ratio;
			sealModel.h = wh[1]==undefined?sealModel.w:wh[1]*sealModel.ratio;
			draw();
		}
		else
		{
			$("#customeH").attr("disabled",false);//启动编辑
			$("#customeW").attr("disabled",false);
			$("#customeW").val(sealModel.w * sealModel.ratio);//设置之前选择的宽
			$("#customeH").val(sealModel.h * sealModel.ratio);//设置之前选择的高
		}
		inLineChange($("#hasInLine")[0].checked);
	});
	$("#customeH").change(function(){//自定义印章高度
		if($(this).val()*1+sealModel.penWidth*1 < CENTER_Y){
			sealModel.h = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	$("#customeW").change(function(){//自定义印章宽度
		if($(this).val()*1+sealModel.penWidth*1 < CENTER_X){
			sealModel.w = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	//前景色颜色板插件
	$("#frontColor").change(function(){
		sealModel.colorFg = $(this).val();
		draw();
	});
	//背景色颜色板插件
	$("#backgroundColor").change(function(){
		sealModel.colorBg = $(this).val();
		draw();
	});
	$("#ratio").change(function(){
    	ratioChange();
		draw();
	});
	$("#outLW").change(function(){//外框线宽
		if(sealModel.w*1+$(this).val()*1 < CENTER_X){
			sealModel.penWidth = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	//是否有内框
	$("#hasInLine").click(function(){
		inLineChange($(this)[0].checked);
	});
	//内框线宽
	$("#inLW").change(function(){
		if($(this).val()*1+sealModel.h2*1 < CENTER_X){
			sealModel.penWidth2 = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	//内框高度
	$("#inHeight").change(function(){
		if($(this).val()*1+sealModel.penWidth2*1 < CENTER_Y){
			sealModel.h2 = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	//内框宽度
	$("#inWidth").change(function(){
		if($(this).val()*1+sealModel.penWidth2*1 < CENTER_X){
			sealModel.w2 = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	//是否有内图
	$("#hasIcon").click(function(){
		if($(this)[0].checked){
			sealModel.picChar = $("#innerIconV").val();
			$("#innerIcon").attr("checked","checked");
		}else{
			sealModel.picChar = "";
			$("[name='iconType']").attr("checked",false);
		}
		draw();
	});
	//选哪种内图类型
	$("[name='iconType']").change(function(){
		var valueId = $(this).filter(":checked").attr("id")+"V";
		sealModel.picChar = $("#"+valueId).val();
		draw();
	});
	//内图值变化
	$(".iconValue").change(function(){
		var typeId = $(this).attr("id").substring(0, $(this).attr("id").length-1);
		if($("#"+typeId)[0].checked){
			sealModel.picChar = $(this).val();
			draw();
		}
	});
	//内图大小
	$("#iconSize").change(function(){
		sealModel.picW = $(this).val() * sealModel.ratio;
		draw();
	});
	//内图内移
	$("#iconIngression").change(function(){
		if($(this).val() < CENTER_Y){
			sealModel.picOffset = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	//内图图片
	$("#selectImg").change(function(){
		var reader = new FileReader();
        reader.onload = function (event) {
			sealModel.picChar = event.target.result;
        	draw();
        };
        if(this.files[0] != undefined){
        	reader.readAsDataURL(this.files[0]);
        }else{
        	sealModel.picChar = "";
        }
	});
	//上、下弦文文字内容
	$(".quarter").change(function(){
		var index = $(this).attr("id").substring(7);
		if(sealModel.texts[index] == undefined){
			sealModel.texts[index] = {};
			sealModel.texts[index].font = "SimSun";
			sealModel.texts[index].angles = 160;
			if(index == 0){
				sealModel.texts[index].height = 15 * sealModel.ratio;
				sealModel.texts[index].bold = "bold";
				sealModel.texts[index].offset = 15 * sealModel.ratio;
			}else{
				sealModel.texts[index].height = 10 * sealModel.ratio;
				sealModel.texts[index].bold = "normal";
				sealModel.texts[index].offset = 10 * sealModel.ratio;
			}
		}
		if(index == 0){
			sealModel.texts[index].text = $("#quarterReverse"+index)[0].checked ? reverse($(this).val()) : $(this).val();
		}else{
			sealModel.texts[index].text = !$("#quarterReverse"+index)[0].checked ? reverse($(this).val()) : $(this).val();
		}
		draw();
	});
	//上、下弦文文字大小
	$(".quarterSize").change(function(){
		var index = $(this).attr("id").substring(11);
		if(sealModel.texts[index] != undefined){
			sealModel.texts[index].height = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	//上、下弦文文字粗细
	$(".quarterBold").change(function(){
		var index = $(this).attr("id").substring(11);
		if(sealModel.texts[index] != undefined){
			sealModel.texts[index].bold = $(this).val();
			draw();
		}
	});
	//上、下弦文字体类型
	$(".quarterType").change(function(){
		var index = $(this).attr("id").substring(11);
		if(sealModel.texts[index] != undefined){
			sealModel.texts[index].font = $(this).val();
			draw();
		}
	});
	//上、下弦文文字角度
	$(".quarterAngle").change(function(){
		var index = $(this).attr("id").substring(12);
		if(sealModel.texts[index] != undefined){
			sealModel.texts[index].angles = $(this).val();
			draw();
		}
	});
	//上、下弦文文字内移距离
	$(".quarterIngression").change(function(){
		var index = $(this).attr("id").substring(17);
		if(sealModel.texts[index] != undefined){
			sealModel.texts[index].offset = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	//上、下弦文文字反序
	$(".quarterReverse").change(function(){
		var index = $(this).attr("id").substring(14);
		if(sealModel.texts[index] != undefined){
			sealModel.texts[index].text = reverse(sealModel.texts[index].text);
			draw();
		}
	});
	//横向文
	$(".horizonWord").change(function(){
		var index = $(this).attr("id").substring(11)*1+2;
		if(sealModel.texts[index] == undefined){//初始化横向文2\3\4
			sealModel.texts[index] = {};
			sealModel.texts[index].bold = "normal";
			sealModel.texts[index].height = 10 * sealModel.ratio;
			sealModel.texts[index].font = "SimSun";
			sealModel.texts[index].offset = 5 * sealModel.ratio;
			sealModel.texts[index].interval = 0;
		}
		if($(this).val().length < CENTER_X/sealModel.texts[index].height*1.5){
			sealModel.texts[index].text  = $(this).val();
			draw();
		}
	});
	//横向文字体大小
	$(".fontSize").change(function(){
		var index = $(this).attr("id").substring(8)*1+2;
		if(sealModel.texts[index] != undefined){
			sealModel.texts[index].height  = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	//横向文粗细
	$(".isBold").change(function(){
		var index = $(this).attr("id").substring(6)*1+2;
		if(sealModel.texts[index] != undefined){
			sealModel.texts[index].bold  = $(this).val();
			draw();
		}
	});
	//横向文字体类型
	$(".fontType").change(function(){
		var index = $(this).attr("id").substring(8)*1+2;
		if(sealModel.texts[index] != undefined){
			sealModel.texts[index].font  = $(this).val();
			draw();
		}
	});
	//横向文字间距
	$(".horizonOffset").change(function(){
		var index = $(this).attr("id").substring(13)*1+2;
		if(sealModel.texts[index] != undefined){
			sealModel.texts[index].interval  = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	//横向文文字内移距离
	$(".horizonIngression").change(function(){
		var index = $(this).attr("id").substring(17)*1+2;
		if(sealModel.texts[index] != undefined){
			sealModel.texts[index].offset = $(this).val() * sealModel.ratio;
			draw();
		}
	});
	
	//画图
    draw();
});

/*************************以下为公开API***************************/
var SEALMODEL = {
	/**
	 * 设置用于绘制印模的json 
	 * @param {Object} smJson
	 */
	setSealModel : function(smJson){
		sealModel = JSON.parse(smJson);
	},
	/**
	 * 获取用于绘制印模的json 
	 * @param {Object} smJson
	 */
	getSealModel : function(){
		return JSON.stringify(sealModel);
	},
	/**
	 * 将当前画板的“中间内容部分”保存为base64编码的图片，并返回base64编码 
	 * @param {Object} smJson
	 */
	toBase64Img : function(){
		var image = new Image();
		image.src = $("#can")[0].toDataURL("image/png");
		var newW = (sealModel.w + sealModel.penWidth)*2;
		var newH = (sealModel.h + sealModel.penWidth)*2;
		var newCanvas = $('<canvas width="'+newW+'" height="'+newH+'"></canvas>')[0];
		newCanvas.getContext("2d").drawImage(image,(PREVIEWSIZE * sealModel.ratio-newW)/2,(PREVIEWSIZE * sealModel.ratio-newH)/2,newW,newH,0,0,newW,newH);
		return newCanvas.toDataURL("image/png");
	}
};
/*************************以上为公开API***************************/


/*************************以下为私有函数***************************/
function draw(){
    var cans = $("#can")[0].getContext('2d');
    //清空从坐标（0，0）开始宽800px，高800px的区域，此坐标是can元素的相对坐标，不是基于屏幕也不是基于浏览器
    cans.clearRect(0, 0, PREVIEWSIZE * sealModel.ratio + 10, PREVIEWSIZE * sealModel.ratio);
	cans.fillStyle = sealModel.colorBg;		//背景色
	cans.strokeStyle = sealModel.colorFg;	//边框颜色
    
    switch(sealModel.type)
    {
    	case 'square' : drawSquareSeal(cans); break;
    	case 'diamond': drawDiamondSeal(cans); break;
    	case 'triangle': drawTriangleSeal(cans); break;
    	default:		drawCycleSeal(cans); break;
    }
}

function drawCycleSeal(cans){
	//外框
	drawCycle(cans, sealModel.penWidth, sealModel.w, sealModel.h);
    //内框
    if(sealModel.hasNeiKuang){
    	drawCycle(cans, sealModel.penWidth2, sealModel.w2, sealModel.h2);
    }
    //内图
    drawIcon(cans);
    //横向文
    drawHorizonWord(cans);
    //上下弦文
    drawQuater(cans);
}

function drawSquareSeal(cans){
	//外框
	drawSquare(cans, sealModel.penWidth, sealModel.w, sealModel.h);
    //内框
    if(sealModel.hasNeiKuang){
    	drawSquare(cans, sealModel.penWidth2, sealModel.w2, sealModel.h2);
    }
    //内图
    drawIcon(cans);
    //横向文
    drawHorizonWord(cans);
}

function drawDiamondSeal(cans){
	//外框
	drawDiamond(cans, sealModel.penWidth, sealModel.w, sealModel.h);
    //内框
    if(sealModel.hasNeiKuang){
    	drawDiamond(cans, sealModel.penWidth2, sealModel.w2, sealModel.h2);
    }
    //内图
    drawIcon(cans);    
    //横向文
    drawHorizonWord(cans);
}

function drawTriangleSeal(cans){
	//外框
	drawTriangle(cans, sealModel.penWidth, sealModel.w, sealModel.h);
    //内框
    if(sealModel.hasNeiKuang){
    	drawTriangle(cans, sealModel.penWidth2, sealModel.w2, sealModel.h2);
    }
    //内图
    drawIcon(cans);    
    //横向文
    drawHorizonWord(cans);
}

function drawCycle(cans, lineWidth, width, height){
    cans.lineWidth = lineWidth;    		//线粗
    //如下方法既可画圆，也可画椭圆
	cans.save();
    var r = (height > width) ? height : width;
    var ratioX = width / r;
    var ratioY = height / r;
    cans.scale(ratioX, ratioY);
    cans.beginPath();
    cans.arc(CENTER_X / ratioX, CENTER_Y / ratioY, r, 0, 2 * Math.PI, false);
    cans.closePath();
    cans.restore();
    cans.stroke();
    cans.fill();
}

function drawSquare(cans, lineWidth, w, h){
	cans.lineWidth = lineWidth;	//线粗
	cans.beginPath();
	cans.fillRect(CENTER_X - w, CENTER_Y - h, w * 2, h * 2);  //填充颜色 x y坐标 宽 高
	cans.strokeRect(CENTER_X - w, CENTER_Y - h, w * 2, h * 2);  //填充边框 x y坐标 宽 高
    cans.closePath();//显示成环
}

function drawDiamond(cans, lineWidth, w, h){
    cans.lineWidth = lineWidth;    //线粗
    cans.beginPath();
    cans.moveTo(CENTER_X, CENTER_Y - h);//上顶点
    cans.lineTo(CENTER_X - w, CENTER_Y);//左顶点
    cans.lineTo(CENTER_X, CENTER_Y + h*1);//下顶点，js的+默认为字符拼接，需要*1表示后面为数字
    cans.lineTo(CENTER_X + w*1, CENTER_Y);//右订点
    cans.closePath();//画出最后一个坐标到第一个坐标的线
    cans.stroke();	//描边
    cans.fill();	//填充
}

function drawTriangle(cans, lineWidth, w, h){
    cans.lineWidth = lineWidth;    //线粗
	cans.beginPath();
	cans.moveTo(CENTER_X, CENTER_Y - Math.floor(4 * h / 3)); //从此等腰三角形的顶点坐标开始
	cans.lineTo((CENTER_X - w), CENTER_Y + Math.floor(2 * h / 3));//画到等腰三角形的左脚，
	cans.lineTo(CENTER_X + w*1, CENTER_Y + Math.floor(2 * h / 3)); //再从左脚画到右脚，结束
    cans.closePath();
    cans.stroke();
	cans.fill(); //闭合形状并且以填充方式绘制出来
}

//画内图
function drawIcon(cans){
	if($.trim(sealModel.picChar) != ""){
		if(sealModel.picChar.startsWith("data:image")){//内图是图片
            var img = new Image();
            img.src = sealModel.picChar;
			cans.drawImage(img,CENTER_X-sealModel.picW, CENTER_Y-sealModel.picW+sealModel.picOffset*1-10, sealModel.picW, sealModel.picW);
		}else{
			cans.font = "normal "+sealModel.picW+"px SimSun";
			cans.fillStyle = sealModel.colorFg;
			cans.fillText(sealModel.picChar, CENTER_X-sealModel.picW/2, CENTER_Y+sealModel.picOffset*1-10);
		}
	}
}

//画横向文
function drawHorizonWord(cans){
	for(var i = 2; i < sealModel.texts.length; i++){
		var word = sealModel.texts[i];
		if(word != undefined && word.text != undefined && $.trim(word.text) != ""){
			cans.font = word.bold + " " + word.height + "px " + word.font;
			cans.fillStyle = sealModel.colorFg;
			if(sealModel.texts[2] == undefined){
				var heightOffSet = 5 * sealModel.ratio;
			}else{
				var heightOffSet = sealModel.texts[2].offset*1;
			}
			for(var j = 3; j <= i; j++){
				if(sealModel.texts[j] != undefined){
					heightOffSet += (sealModel.texts[j].offset*1 + sealModel.texts[j].height*1);
				}
			}
			var w = cans.measureText(word.text).width;
			var u = w/word.text.length;
			cans.save();
			cans.translate(CENTER_X-(w+word.interval*(word.text.length-1))/2, CENTER_Y+word.height/2+heightOffSet);
			for(var j = 0; j < word.text.length; j++){
				cans.fillText(word.text[j], j*(u+word.interval*1), 0);
			}
			cans.restore();
		}
	}
}

//画上下弦文
function drawQuater(cans){
	for(var j = 0; j < 2; j++){
		if(sealModel.texts[j] == undefined || $.trim(sealModel.texts[j].text) == ""){
			continue;
		}
		
		var cnt = sealModel.texts[j].text.length;
		var size = sealModel.texts[j].height;
		var w = sealModel.w - sealModel.texts[j].offset;
		var h = sealModel.h - sealModel.texts[j].offset;
		if(sealModel.hasNeiKuang){
			w = sealModel.w2 - sealModel.texts[j].offset;
			h = sealModel.h2 - sealModel.texts[j].offset;
		}
		var wordArc = Math.asin(size/(h*2));//半个字的弧度
		if(cnt != 1){
			var offset = (sealModel.texts[j].angles/180*Math.PI-2*wordArc*cnt)/(cnt-1);//字与字之间夹角弧度
		}{
			offset = 0;
		}
		var mid = Math.floor(cnt/2);
		var x=0,y=0,angle=0;
		cans.font = sealModel.texts[j].bold + " " + size + "px " + sealModel.texts[j].font;
		cans.fillStyle = sealModel.colorFg;
		
		if(cnt%2 == 0){//文字个数为偶数
			for(var i=0;i<cnt;i++){
				if(j == 0){//上弦文
					angle = (i-mid)*(offset+2*wordArc)+offset/2;
					x = CENTER_X + w * Math.sin(angle);
					y = CENTER_Y - h * Math.cos(angle);
				}else{//下弦文
					angle = (mid-1-i)*(offset+2*wordArc)+offset/2;
					x = CENTER_X + w*Math.sin(angle);
					y = CENTER_Y + h*Math.cos(angle);
				}
				cans.translate(x, y);
				cans.rotate((2*i-2*mid+1)*(offset/2+wordArc));
				cans.fillText(sealModel.texts[j].text[i], 0, 0);
				cans.setTransform(1,0,0,1,0,0);
			}
		}
		else{//文字个数为奇数
			for(var i=0;i<cnt;i++){//奇数时，最中间的字因为没有旋转，所以和其他字看起来样式不同，此bug可能要为中间文字单独设css，估计解决不了
				if(j == 0){
					angle = (i-mid)*(offset+2*wordArc)-wordArc;
					x = CENTER_X + w * Math.sin(angle);
					y = CENTER_Y - h * Math.cos(angle);
				}else{
					angle = (mid-i)*(offset+wordArc*2)-wordArc;
					x = CENTER_X + w*Math.sin(angle);
					y = CENTER_Y + h*Math.cos(angle);
				}
				cans.translate(x, y);
				cans.rotate((i-mid)*(offset+2*wordArc));
				cans.fillText(sealModel.texts[j].text[i], 0, 0);
				cans.setTransform(1,0,0,1,0,0);
			}
		}	
	}
}

function init(){
	$("#ratio").val(sealModel.ratio);
	var date = new Date();
	$("#makeDate").val(date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate());
	ratioChange();
}
//根据显示比例改变所有size大小
function ratioChange(){
	var old = sealModel.ratio;
	var ratio = $("#ratio").val();
	$("#can").attr("width", PREVIEWSIZE * ratio);
	$("#can").attr("height", PREVIEWSIZE * ratio);
    CENTER_X = PREVIEWSIZE * ratio / 2;
    CENTER_Y = PREVIEWSIZE * ratio / 2;
	if(ratio == old){
		return;
	}
	
	sealModel.ratio = ratio;
	ratio /= old;
    sealModel.w *= ratio;
    sealModel.h *= ratio;
    sealModel.w2 *= ratio;
    sealModel.h2 *= ratio;
    sealModel.penWidth *= ratio;
    sealModel.penWidth2 *= ratio;
    sealModel.picW *= ratio;
    sealModel.picOffset *= ratio;
    for(var i=0; i<sealModel.texts.length; i++){
    	if(sealModel.texts[i] != undefined){
   			sealModel.texts[i].height *= ratio;
			sealModel.texts[i].offset *= ratio;
			sealModel.texts[i].interval *= ratio;
    	}
    }
}
//改变内框大小及控件内容
function inLineChange(hasInline){
	sealModel.hasNeiKuang = hasInline;
	if(sealModel.hasNeiKuang){
		sealModel.w2 = sealModel.w - 10;
		sealModel.h2 = sealModel.h - 10;
		$("#inWidth").val(sealModel.w2);
		$("#inHeight").val(sealModel.h2);
		$("#inWidth").attr("disabled", false);
		$("#inHeight").attr("disabled", false);
		$("#inLW").attr("disabled", false);
	}else{
		$("#inWidth").attr("disabled", true);
		$("#inHeight").attr("disabled", true);
		$("#inLW").attr("disabled", true);
	}
	draw();
}
//文字倒序
function reverse(String){
	var tmp = "";
	var len = String.length;
	for(var i = 0; i < len; i++){
		tmp += String[len-1-i];
	}
	return tmp;
}