//点击显示（YYYY年MM月DD日）格式
$(function () {
	//测试setSealModel接口
	SEALMODEL.setSealModel('{"type":"oval","w":240,"h":200,"colorFg":"#FF0000","colorBg":"#FFFFFF","ratio":"2","penWidth":16,"hasNeiKuang":false,"penWidth2":6,"w2":180,"h2":180,"picChar":"★","picPath":"","picW":40,"picOffset":0,"texts":[{"font":"SimSun","angles":160,"height":52,"bold":"bold","offset":30,"text":"阿斯蒂芬加上","interval":null},{"font":"SimSun","angles":160,"height":32,"bold":"normal","offset":20,"text":"发32的事没啊","interval":null},{"bold":"normal","height":20,"font":"SimSun","offset":10,"interval":0,"text":"ask大佛"},{"bold":"normal","height":20,"font":"SimSun","offset":10,"interval":0,"text":"asdjfi"},{"bold":"normal","height":20,"font":"SimSun","offset":10,"interval":0,"text":"美丽说对方"}],"templateImg":"","md5":"","extend":""}');
	//SEALMODEL.draw();无需手动调用，sealModel.js自动绘制
	//测试toBase64Img接口
	console.log(SEALMODEL.toBase64Img());
	
    $(".card_title span").on("click", function () {
        $(".card_title span").eq($(this).index()).addClass("bg").siblings().removeClass('bg');
        $(".card_des form").hide().eq($(this).index()).show();
    })
})