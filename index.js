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
        require('./lib/plugins/modifying/comments'),
        require('./lib/plugins/modifying/css_code'),
        require('./lib/plugins/modifying/hyperlinks'),
        require('./lib/plugins/modifying/images'),
        require('./lib/plugins/modifying/js_code'),
        require('./lib/plugins/modifying/scripts'),
        require('./lib/plugins/modifying/stylesheets'),
        require('./lib/plugins/modifying/texts'),
        require('./lib/plugins/modifying/title')
    ]
);