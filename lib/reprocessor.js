var util = require('util'),
    Pipeline = require('./pipeline'),
    SerializationPlugin = require('./plugins/serialization');


//Reprocessor
var Reprocessor = module.exports = function (availablePlugins) {
    Pipeline.call(this);

    this.plugins.push(SerializationPlugin);

    var reprocessor = this;

    availablePlugins.forEach(function (plugin) {
        reprocessor[plugin.name] = function (op) {
            this._enablePlugin(plugin, op);
            return this;
        };
    });
};


util.inherits(Reprocessor, Pipeline);


//Internals
Reprocessor.prototype._aggregatePluginResults = SerializationPlugin.getHtml;

Reprocessor.prototype._enablePlugin = function (plugin, replacer) {
    if (!this._isPluginEnabled(plugin)) {
        var serializationPluginIdx = this.plugins.indexOf(SerializationPlugin);

        //NOTE: SerializationPlugin should be the last in the chain
        this.plugins.splice(serializationPluginIdx, 0, plugin);
        this.pluginResetArgs[plugin] = replacer;
    }
};




