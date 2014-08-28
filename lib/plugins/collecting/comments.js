module.exports = (function () {
    var collection = null;

    return {
        name: 'comments',
        extends: 'collect',

        reset: function () {
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