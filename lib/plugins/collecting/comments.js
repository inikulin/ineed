module.exports = (function () {
    var env = undefined,
        collection = undefined;

    return {
        name: 'comments',
        extends: 'collect',

        reset: function (environment) {
            env = environment;
            collection = [];
        },

        onComment: function (comment) {
            collection.push(comment);
        },

        getCollection: function () {
            return collection;
        }
    };
})();