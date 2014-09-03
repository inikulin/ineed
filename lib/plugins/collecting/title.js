module.exports = {
    name: 'title',
    extends: 'collect',

    init: function (ctx) {
        this.ctx = ctx;
        this.title = null;
    },

    onText: function (text) {
        //NOTE: where can be only one <title> in document.
        if (!this.title && !this.ctx.inBody && this.ctx.leadingStartTag === 'title')
            this.title = text;
    },

    getCollection: function () {
        return this.title || '';
    }
};
