var util = require('util'),
    Pipeline = require('pipeline');


//Collector
var Collector = module.exports = function (plugins) {
    Pipeline.call(this);

    var collector = this;

    plugins.forEach(function (plugin) {
        Object.defineProperty(collector, plugin.name, {
            get: function () {
                this.plugins.push(plugin);
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
        if (plugin.getCollection)
            results[plugin.name] = plugin.getCollection();
    });

    return results;
};



