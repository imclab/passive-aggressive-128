var hive_loader = require('hive-loader');
var layout_file_handler = require('./../handlers/layout_file_handler');
var layout_config_handler = require('./../handlers/layout_config_handler');
var _DEBUG = false;
var util = require('util');
var mvc = require('hive-mvc');

module.exports = function(layout){
    if (_DEBUG)	console.log('layout_loader: looking for layouts in layout root %s ', layout.get_config('root'));
    var apiary = layout.get_config('apiary');

    var resources_handler = mvc.handlers.resources;

    var loader = hive_loader.loader({}, {
        handlers: [layout_file_handler(), layout_config_handler(), resources_handler()],
        root: layout.get_config('root'),
        target: layout
    });

    return loader;
};