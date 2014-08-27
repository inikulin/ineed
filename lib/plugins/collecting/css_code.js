module.exports = (function () {
    var env = undefined,
        collection = undefined;

    return {
        name: 'cssCode',
        extends: 'collect',

        reset: function (environment) {
            env = environment;
            collection = [];
        },

        onText: function (text) {
            if (env.leadingStartTag === 'style')
                collection.push(text);
        },

        getCollection: function () {
            return collection;
        }
    };
})();