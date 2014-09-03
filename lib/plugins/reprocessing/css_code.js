module.exports = {
    name: 'cssCode',
    extends: 'reprocess',

    init: function (ctx, replacer) {
        this.ctx = ctx;
        this.replacer = replacer;
    },

    onText: function (text) {
        if (this.ctx.leadingStartTag === 'style')
            text = this.replacer(text);

        return text;
    }
};
