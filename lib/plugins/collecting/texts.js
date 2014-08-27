module.exports = (function () {
    var env = undefined,
        collection = undefined;

    return {
        name: 'texts',
        extends: 'collect',

        reset: function (environment) {
            env = environment;
            collection = [];
        },

        onText: function (text) {
            if (env.inBody &&
                env.leadingStartTag !== 'script' &&
                env.leadingStartTag !== 'style' &&
                text.trim().length > 0) {
                collection.push(text);
            }
        },

        getCollection: function () {
            return collection;
        }
    };
})();