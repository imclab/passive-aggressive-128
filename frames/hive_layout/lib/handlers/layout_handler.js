var hive_loader = require('hive-loader');
var _DEBUG = false;

module.exports = function () {

	var _mixins = {
		name:    'layout_handler',
		respond: function (params) {

			var apiary = handler.core();

			if (_DEBUG) {
				console.log('loading layout at %s', params.file_path);
			}

			var l = params.gate.latch();

			function _on_layout() {
				if (_DEBUG) console.log('on_layout handler');
				var lay = apiary.Layout(params.file_path);

				lay.init(l);
			}

			debugger;
			if (!apiary.Layout) {
				require('./../layout')(apiary, _on_layout);
			} else {
				_on_layout();
			}

		}
	};

	var handler = hive_loader.handler(_mixins, {dir: true, name_filter: /.*/i});
	return handler;
}