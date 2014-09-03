module.exports = {
    name: 'cssCode',
    extends: 'collect',

    init: function (ctx) {
        this.ctx = ctx;
        this.collection = [];
    },

    onText: function (text) {
        if (this.ctx.leadingStartTag === 'style')
            this.collection.push(text);
    },

    getCollection: function () {
        return this.collection;
    }
};
