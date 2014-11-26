var util = require('util'),
    Pipeline = require('./pipeline'),
    SerializationPlugin = require('./plugins/serialization');

//Reprocessor
var Reprocessor = module.exports = function (availablePlugins) {
    Pipeline.call(this);

    this.tokensToEmit = [];
    this.plugins.push(SerializationPlugin);

    var reprocessor = this;

    availablePlugins.forEach(function (plugin) {
        reprocessor[plugin.name] = function () {
            this._enablePlugin(plugin, arguments);
            return this;
        };
    });
};


util.inherits(Reprocessor, Pipeline);


//Internals
Reprocessor.prototype._onTokenProcessed = function () {
    while (this.tokensToEmit.length) {
        var entry = this.tokensToEmit.shift();

        this[entry.handlerName](entry.token);
    }
};

Reprocessor.prototype._createCtxObj = function (baseUrl) {
    var emitMethods = {
            'doctype': 'onDoctype',
            'startTag': 'onStartTag',
            'endTag': 'onEndTag',
            'text': 'onText',
            'comment': 'onComment'
        },
        tokensToEmit = this.tokensToEmit,
        ctx = Pipeline.prototype._createCtxObj.call(this, baseUrl);

    ctx.emit = {};

    Object.keys(emitMethods).forEach(function (method) {
        ctx.emit[method] = function (token) {
            tokensToEmit.push({handlerName: emitMethods[method], token: token});
        };
    });

    return ctx;
};

Reprocessor.prototype._aggregatePluginResults = function () {
    return SerializationPlugin.getHtml();
};

Reprocessor.prototype._enablePlugin = function (plugin, pluginArgs) {
    if (!this._isPluginEnabled(plugin)) {
        var serializationPluginIdx = this.plugins.indexOf(SerializationPlugin);

        //NOTE: SerializationPlugin should be the last in the chain
        this.plugins.splice(serializationPluginIdx, 0, plugin);
        this.pluginInitArgs[plugin.name] = Array.prototype.slice.call(pluginArgs);
    }
};
