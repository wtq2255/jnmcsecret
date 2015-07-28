function resize_window(){
	$("#left").height($(window).height()-102);
	$("#right_iframe").height($(window).height()-82).width($(window).width()-210);
}
$(function(){
	resize_window();
	$(window).resize(function(){
		resize_window();
	})
})
