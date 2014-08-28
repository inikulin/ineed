module.exports = (function () {
    var op = null;

    return {
        name: 'comments',
        extends: 'reprocess',

        reset: function (environment, operator) {
            op = operator;
        },

        onComment: function (comment) {
            return op(comment)
        }
    };
})();