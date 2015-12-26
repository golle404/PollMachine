$(document).ready(function(){
	$("form").submit(function(e){
		//e.preventDefault();
		console.log($("input[name = optionId]").val());
	})
})