module.exports = {
    name: 'jsCode',
    extends: 'collect',

    init: function (ctx) {
        this.ctx = ctx;
        this.collection = [];
    },

    onText: function (text) {
        if (this.ctx.leadingStartTag === 'script')
            this.collection.push(text);
    },

    getCollection: function () {
        return this.collection;
    }
};
