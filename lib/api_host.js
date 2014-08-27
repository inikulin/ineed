var util = require('util'),
    Collector = require('./collector'),
    Modifier = require('./modifier');


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
var ApiHost = module.exports = function (collectorPlugins, modifierPlugins) {
    this.collectorPlugins = collectorPlugins;
    this.modifierPlugins = modifierPlugins;
};


//Error strings
ApiHost.ERR_DUPLICATE_PLUGIN_NAME = 'iwant: plugin with name "%s" that extends "%s" is already used.';
ApiHost.ERR_PLUGIN_MISSING_GET_COLLECTION_METHOD = 'iwant: collecting plugin should have ".getCollection()" method.';
ApiHost.ERR_PLUGIN_MISSING_NAME_PROPERTY = 'iwant: plugin should have ".name" property.';
ApiHost.ERR_PLUGIN_MISSING_EXTENDS_PROPERTY = 'iwant: plugin should have ".extends" property which ' +
                                              'should be equal to "collect" or "modify"';


//API
ApiHost.prototype = {
    get collect() {
        return new Collector(this.collectorPlugins);
    },

    get modify() {
        return new Modifier(this.modifierPlugins);
    }
};

ApiHost.prototype.using = function (plugin) {
    var collectorPlugins = this.collectorPlugins,
        modifierPlugins = this.modifierPlugins;

    if (plugin.extends === 'collect') {
        if (!plugin.getCollection || typeof plugin.getCollection !== 'function')
            throw new Error(ApiHost.ERR_PLUGIN_MISSING_GET_COLLECTION_METHOD);

        validatePluginName(plugin, collectorPlugins);
        collectorPlugins = collectorPlugins.concat(plugin);
    }

    else if (plugin.extends === 'modify') {
        validatePluginName(plugin, modifierPlugins);
        modifierPlugins = modifierPlugins.concat(plugin);
    }

    else
        throw new Error(ApiHost.ERR_PLUGIN_MISSING_EXTENDS_PROPERTY);

    return new ApiHost(collectorPlugins, modifierPlugins);
};


