module.exports = (function () {
    var env = null,
        collection = null;

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