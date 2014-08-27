var util = require('util'),
    Pipeline = require('pipeline'),
    SerializationPlugin = require('./plugins/serialization');


//Modifier
var Modifier = module.exports = function (availablePlugins) {
    Pipeline.call(this);

    this.plugins.push(SerializationPlugin);

    var modifier = this;

    availablePlugins.forEach(function (plugin) {
        modifier[plugin.name] = function (replacer) {
            this._enablePlugin(plugin, replacer);
            return this;
        };
    });
};


util.inherits(Modifier, Pipeline);


//Internals
Modifier.prototype._aggregatePluginResults = SerializationPlugin.getHtml;

Modifier.prototype._enablePlugin = function (plugin, replacer) {
    if (!this._isPluginEnabled(plugin)) {
        var serializationPluginIdx = this.plugins.indexOf(SerializationPlugin);

        //NOTE: SerializationPlugin should be the last in the chain
        this.plugins.splice(serializationPluginIdx, 0, plugin);
        this.pluginResetArgs[plugin] = replacer;
    }
};




