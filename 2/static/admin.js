function resize_window(){
	$("#right_iframe1").height($(window).height()-40);
	$("#right_iframe2").height($(window).height()-40);
	$("#right_iframe3").height($(window).height()-40);
	$("#right_iframe4").height($(window).height()-40);
	$("#right_iframe5").height($(window).height()-40);
	$("#sidebar").css("height",$(window).height());
};
$(function(){
	resize_window();
	$(window).resize(function(){
		resize_window();
	});
	
});

function cfm()
{
	if(confirm("确定要删除数据吗？"))
	{
		return true;
	}else{
		return false;
	}
}
