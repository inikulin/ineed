module.exports = (function () {
    var env = undefined,
        collection = undefined;

    return {
        name: 'jsCode',
        extends: 'collect',

        reset: function (environment) {
            env = environment;
            collection = [];
        },

        onText: function (text) {
            if (env.leadingStartTag === 'script')
                collection.push(text);
        },

        getCollection: function () {
            return collection;
        }
    };
})();