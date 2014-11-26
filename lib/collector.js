var util = require('util'),
    Pipeline = require('./pipeline');


//Collector
var Collector = module.exports = function (availablePlugins) {
    Pipeline.call(this);

    var collector = this;

    availablePlugins.forEach(function (plugin) {
        Object.defineProperty(collector, plugin.name, {
            get: function () {
                this._enablePlugin(plugin);
                return this;
            }
        });
    });
};


util.inherits(Collector, Pipeline);


//Internals
Collector.prototype._aggregatePluginResults = function () {
    var results = {};

    this.plugins.forEach(function (plugin) {
        if (plugin.extends === 'collect')
            results[plugin.name] = plugin.getCollection();
    });

    return results;
};

Collector.prototype._enablePlugin = function (plugin) {
    if (!this._isPluginEnabled(plugin))
        this.plugins.push(plugin);
};
