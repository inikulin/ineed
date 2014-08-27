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
        //TODO
    ]
);