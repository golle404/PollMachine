function init(){
	$("#add-option").click(function(){
		var newOption = $("li.list-group-item.new-option.template").clone();
		newOption.removeClass("template");
		var count = $("#option-list>li").length;
		newOption.find("input").attr("placeholder", "Option "+count);
		$("#option-list").append(newOption);
		newOption.find(".close-btn").click(function(e){
			$(e.currentTarget).parent().remove();
		})
	})
}









$(document).ready(function(){
	init();
})

