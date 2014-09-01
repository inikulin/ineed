module.exports = {
    name: 'comments',
    extends: 'reprocess',

    init: function (environment, replacer) {
        this.replacer = replacer;
    },

    onComment: function (comment) {
        return this.replacer(comment)
    }
};
