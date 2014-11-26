module.exports = {
    name: 'comments',
    extends: 'reprocess',

    init: function (ctx, replacer) {
        this.replacer = replacer;
    },

    onComment: function (comment) {
        return this.replacer(comment)
    }
};
