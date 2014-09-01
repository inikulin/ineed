var Common = require('../../common');


module.exports = {
    name: 'texts',
    extends: 'collect',

    init: function (env) {
        this.env = env;
        this.collection = [];
    },

    onText: function (text) {
        if (Common.isPlainText(this.env.inBody, this.env.leadingStartTag, text))
            this.collection.push(text);
    },

    getCollection: function () {
        return this.collection;
    }
};
