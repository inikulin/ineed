module.exports = (function () {
    var rpl = null;

    return {
        name: 'comments',
        extends: 'reprocess',

        reset: function (environment, replacer) {
            rpl = replacer;
        },

        onComment: function (comment) {
            return rpl(comment)
        }
    };
})();