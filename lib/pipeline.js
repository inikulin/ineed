var parse5 = require('parse5'),
    request = require('request'),
    ContextPlugin = require('./plugins/context');

//Pipeline
var Pipeline = module.exports = function () {
    this.plugins = [ContextPlugin];
    this.pluginInitArgs = {};

    var pipeline = this;

    //NOTE: we don't use .bind() here because it uses quite slow .apply() internally.
    this.parser = new parse5.SimpleApiParser({
        doctype: function (name, publicId, systemId) {
            pipeline.onDoctype({
                name: name,
                publicId: publicId,
                systemId: systemId
            });
        },

        startTag: function (tagName, attrs, selfClosing) {
            pipeline.onStartTag({
                tagName: tagName,
                attrs: attrs,
                selfClosing: selfClosing
            });
        },

        endTag: function (tagName) {
            pipeline.onEndTag(tagName);
        },

        text: function (text) {
            pipeline.onText(text);
        },

        comment: function (comment) {
            pipeline.onComment(comment);
        }
    });
};


//Pure virtual
Pipeline.prototype._aggregatePluginResults = null;
Pipeline.prototype._onTokenProcessed = null;


//Internals
Pipeline.prototype._isPluginEnabled = function (plugin) {
    for (var i = 0; i < this.plugins.length; i++) {
        if (this.plugins[i].name === plugin.name)
            return true;
    }

    return false;
};

Pipeline.prototype._createCtxObj = function (baseUrl) {
    return {
        baseUrl: baseUrl || '',
        leadingStartTag: null,
        inBody: false
    };
};

//Parser handlers
//OPTIMIZATION: this handlers are quite performance-sensitive, so we don't use slow things like
//Array.prototype.forEach() here
['onDoctype', 'onStartTag', 'onEndTag', 'onText', 'onComment'].forEach(function (handlerName) {
    Pipeline.prototype[handlerName] = function (token) {
        for (var i = 0; token !== null && i < this.plugins.length; i++) {
            if (this.plugins[i][handlerName]) {
                var processed = this.plugins[i][handlerName](token);

                token = processed === void 0 ? token : processed;
            }
        }

        if (this._onTokenProcessed)
            this._onTokenProcessed();
    };
});


//API
Pipeline.prototype.fromHtml = function (html, baseUrl) {
    var pluginInitArgs = this.pluginInitArgs,
        ctx = this._createCtxObj(baseUrl);

    this.plugins.forEach(function (plugin) {
        var customArgs = pluginInitArgs[plugin.name],
            args = [ctx].concat(customArgs);

        plugin.init.apply(plugin, args);
    });

    this.parser.parse(html);

    return this._aggregatePluginResults();
};

Pipeline.prototype.from = function (options, callback) {
    var pipeline = this;

    request(options, function (err, response, body) {
        var results = null,
            baseUrl = options.url || options.uri || options;

        if (!err)
            results = pipeline.fromHtml(body.toString(), baseUrl);

        callback(err, response, results);
    });
};
