var util = require('util'),
    Pipeline = require('./pipeline'),
    SerializationPlugin = require('./plugins/serialization');


//Reprocessor
var Reprocessor = module.exports = function (availablePlugins) {
    Pipeline.call(this);

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




