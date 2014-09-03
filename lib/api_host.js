var util = require('util'),
    Collector = require('./collector'),
    Reprocessor = require('./reprocessor');


//Plugin name validation
function validatePluginName(plugin, pluginList) {
    if (!plugin.name)
        throw new Error(ApiHost.ERR_PLUGIN_MISSING_NAME_PROPERTY);

    pluginList.forEach(function (collectorPlugin) {
        if (plugin.name === collectorPlugin.name) {
            var msg = util.format(ApiHost.ERR_DUPLICATE_PLUGIN_NAME, plugin.name, plugin.extends);
            throw new Error(msg);
        }
    });
}


//API host object
var ApiHost = module.exports = function (collectorPlugins, reprocessorPlugins) {
    this.collectorPlugins = collectorPlugins;
    this.reprocessorPlugins = reprocessorPlugins;
};


//Error strings
ApiHost.ERR_DUPLICATE_PLUGIN_NAME = 'ineed: plugin with name "%s" that extends "%s" is already used.';
ApiHost.ERR_PLUGIN_MISSING_GET_COLLECTION_METHOD = 'ineed: collecting plugin should have ".getCollection()" method.';
ApiHost.ERR_PLUGIN_MISSING_INIT_METHOD = 'ineed: plugin should have ".init()" method.';
ApiHost.ERR_PLUGIN_MISSING_NAME_PROPERTY = 'ineed: plugin should have ".name" property.';
ApiHost.ERR_PLUGIN_MISSING_EXTENDS_PROPERTY = 'ineed: plugin should have ".extends" property which ' +
                                              'should be equal to "collect" or "reprocess"';


//API
ApiHost.prototype = {
    get collect() {
        return new Collector(this.collectorPlugins);
    },

    get reprocess() {
        return new Reprocessor(this.reprocessorPlugins);
    }
};

ApiHost.prototype.using = function (plugin) {
    var collectorPlugins = this.collectorPlugins,
        reprocessorPlugins = this.reprocessorPlugins;

    if (!plugin.init || typeof plugin.init !== 'function')
        throw new Error(ApiHost.ERR_PLUGIN_MISSING_INIT_METHOD);

    if (plugin.extends === 'collect') {
        if (!plugin.getCollection || typeof plugin.getCollection !== 'function')
            throw new Error(ApiHost.ERR_PLUGIN_MISSING_GET_COLLECTION_METHOD);

        validatePluginName(plugin, collectorPlugins);
        collectorPlugins = collectorPlugins.concat(plugin);
    }

    else if (plugin.extends === 'reprocess') {
        validatePluginName(plugin, reprocessorPlugins);
        reprocessorPlugins = reprocessorPlugins.concat(plugin);
    }

    else
        throw new Error(ApiHost.ERR_PLUGIN_MISSING_EXTENDS_PROPERTY);

    return new ApiHost(collectorPlugins, reprocessorPlugins);
};


