var Collector = require('./collector'),
    Modifier = require('./modifier');

var ApiHost = module.exports = function (collectorPlugins, modifierPlugins) {
    this.collectorPlugins = collectorPlugins;
    this.modifierPlugins = modifierPlugins;
};

ApiHost.prototype = {
    get collect() {
        return new Collector(this.collectorPlugins);
    },

    get modify() {
        return new Modifier(this.modifierPlugins);
    }
};

ApiHost.prototype.use = function (plugin) {
    var collectorPlugins = this.collectorPlugins,
        modifierPlugins = this.modifierPlugins;

    if (plugin.extends === 'collect') {
        collectorPlugins = collectorPlugins.concat(plugin);

        if (!plugin.getCollection || typeof plugin.getCollection !== 'function')
            throw new Error('iwant: collecting plugin should have ".getCollection()" method.');
    }

    else if (plugin.extends === 'modify')
        modifierPlugins = modifierPlugins.concat(plugin);

    else
        throw new Error('iwant: plugin should have ".extends" property ' +
                        'which should be equal to "collect" or "modify".');

    //TODO check for name and duplicates


    return new ApiHost(collectorPlugins, modifierPlugins);
};