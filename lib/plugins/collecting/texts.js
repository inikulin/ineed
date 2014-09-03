var Common = require('../../common');


module.exports = {
    name: 'texts',
    extends: 'collect',

    init: function (ctx) {
        this.ctx = ctx;
        this.collection = [];
    },

    onText: function (text) {
        if (Common.isPlainText(this.ctx.inBody, this.ctx.leadingStartTag, text))
            this.collection.push(text);
    },

    getCollection: function () {
        return this.collection;
    }
};
