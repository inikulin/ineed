module.exports = {
    name: 'title',
    extends: 'collect',

    init: function (ctx, replacer) {
        this.ctx = ctx;
        this.replacer = replacer;
    },

    onText: function (text) {
        if (!this.ctx.inBody && this.ctx.leadingStartTag === 'title')
            text = this.replacer(text);

        return text;
    }
};
