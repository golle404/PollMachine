function init(){
	$("#add-option").click(function(){
		var newOption = $(".input-group.template").clone();
		newOption.removeClass("template");
		var count = $("input[name=options]").length;
		newOption.find("input").attr("placeholder", "Option "+count);
		$(newOption).insertBefore(".input-group.template");
		newOption.find(".btn-close").click(function(e){
			$(e.currentTarget).parent().remove();
			$("input[name=options]").each(function(i,el){
				console.log(el)
				el.setAttribute("placeholder", "Option " + (i+1));
			})
		})
	})
	$("#private").change(function(e){
		if(e.target.checked){
			$("#key").attr("required", true);
		}else{
			$("#key").attr("required", false);
		}
	})
}









$(document).ready(function(){
	init();
})

