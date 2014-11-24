$(document).ready(function(){
	multiInit();
});

var multiInit = function(){
	
	$('#moduleSelect').multiSelect({
		selectableHeader: "<div class='custom-header'>Available</div>",
		selectionHeader: "<div class='custom-header'>Selected</div>"
	});
};
