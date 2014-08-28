var ApiHost = require('./lib/api_host');

module.exports = new ApiHost(
    [
        require('./lib/plugins/collecting/comments'),
        require('./lib/plugins/collecting/css_code'),
        require('./lib/plugins/collecting/hyperlinks'),
        require('./lib/plugins/collecting/images'),
        require('./lib/plugins/collecting/js_code'),
        require('./lib/plugins/collecting/scripts'),
        require('./lib/plugins/collecting/stylesheets'),
        require('./lib/plugins/collecting/texts'),
        require('./lib/plugins/collecting/title')
    ],
    [
        require('./lib/plugins/reprocessing/comments'),
        require('./lib/plugins/reprocessing/css_code'),
        require('./lib/plugins/reprocessing/hyperlinks'),
        require('./lib/plugins/reprocessing/images'),
        require('./lib/plugins/reprocessing/js_code'),
        require('./lib/plugins/reprocessing/scripts'),
        require('./lib/plugins/reprocessing/stylesheets'),
        require('./lib/plugins/reprocessing/texts'),
        require('./lib/plugins/reprocessing/title')
    ]
);