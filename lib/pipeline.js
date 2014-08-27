var parse5 = require('parse5'),
    request = require('request'),
    EnvironmentPlugin = require('./plugins/environment');


//Monad-inspired control flow: rollback to the previous value if the new one is undefined.
//OPTIMIZATION: these utility function should not be moved out of this module, so V8 can inline it
function transanctional(oldValue, newValue) {
    return newValue === undefined ? oldValue : newValue;
}


//Pipeline
var Pipeline = module.exports = function () {
    this.plugins = [EnvironmentPlugin];
    this.pluginResetArgs = {};

    var pipeline = this;

    //NOTE: we don't use .bind() here because it uses quite slow .apply() internally.
    this.parser = new parse5.SimpleApiParser({
        doctype: function (name, publicId, systemId) {
            pipeline._onDoctype(name, publicId, systemId);
        },

        startTag: function (tagName, attrs, selfClosing) {
            pipeline._onStartTag(tagName, attrs, selfClosing);
        },

        endTag: function (tagName) {
            pipeline._onEndTag(tagName);
        },

        text: function (text) {
            pipeline._onText(text);
        },

        comment: function (comment) {
            pipeline._onComment(comment);
        }
    });
};


//Pure virtual
Pipeline.prototype._aggregatePluginResults = null;


//Internals
Pipeline.prototype._isPluginEnabled = function (plugin) {
    for (var i = 0; i < this.plugins.length; i++) {
        if (this.plugins[i].name === plugin.name)
            return true;
    }

    return false;
};

//Parser handlers
//OPTIMIZATION: this handlers are quite performance-sensitive, so we don't use slow things like
//Array.prototype.forEach() here
Pipeline.prototype._onDoctype = function (name, publicId, systemId) {
    var doctype = {
        name: name,
        publicId: publicId,
        systemId: systemId
    };

    for (var i = 0; i < this.plugins.length; i++) {
        if (this.plugins[i].onDoctype)
            doctype = transanctional(doctype, this.plugins[i].onDoctype(doctype));
    }
};

Pipeline.prototype._onStartTag = function (tagName, attrs, selfClosing) {
    var startTag = {
        tagName: tagName,
        attrs: attrs,
        selfClosing: selfClosing
    };

    for (var i = 0; i < this.plugins.length; i++) {
        if (this.plugins[i].onStartTag)
            startTag = transanctional(startTag, this.plugins[i].onStartTag(startTag));
    }
};

Pipeline.prototype._onEndTag = function (tagName) {
    for (var i = 0; i < this.plugins.length; i++) {
        if (this.plugins[i].onEndTag)
            tagName = transanctional(tagName, this.plugins[i].onEndTag(tagName));
    }
};

Pipeline.prototype._onText = function (text) {
    for (var i = 0; i < this.plugins.length; i++) {
        if (this.plugins[i].onText)
            text = transanctional(text, this.plugins[i].onText(text));
    }
};

Pipeline.prototype._onComment = function (comment) {
    for (var i = 0; i < this.plugins.length; i++) {
        if (this.plugins[i].onComment)
            comment = transanctional(comment, this.plugins[i].onComment(comment));
    }
};


//API
Pipeline.prototype.fromHtml = function (html, baseUrl) {
    var pluginResetArgs = this.pluginResetArgs,
        environment = {
            baseUrl: baseUrl || '',
            leadingStartTag: undefined,
            inBody: false
        };

    this.plugins.forEach(function (plugin) {
        var customArgs = pluginResetArgs[plugin],
            args = [environment].concat(customArgs);

        plugin.reset.apply(plugin, args);
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
