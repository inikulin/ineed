module.exports = {
    name: 'jsCode',
    extends: 'reprocess',

    init: function (ctx, replacer) {
        this.ctx = ctx;
        this.replacer = replacer;
    },

    onText: function (text) {
        if (this.ctx.leadingStartTag === 'script')
            text = this.replacer(text);

        return text;
    }
};
