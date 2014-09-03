module.exports = {
    name: 'comments',
    extends: 'reprocess',

    init: function (ctxironment, replacer) {
        this.replacer = replacer;
    },

    onComment: function (comment) {
        return this.replacer(comment)
    }
};
