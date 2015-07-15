var acquireAction = $('#acquire-image');
var imagetemplate = '<img src="{{ url }}" alt=""/>'
var shade = $('.shade');
acquireAction.on('click', function () {
	shade.show();
	$.post('/', {acquire: true}, function (data) {
		var temp = '';
		data.map(function (v) {
			temp = temp + imagetemplate.replace('{{ url }}', v) + ' ';
		})
		$(temp).prependTo($('.image-list'));
		acquireAction.hide();
		shade.hide();
	});
})