module.exports = {
    name: 'cssCode',
    extends: 'collect',

    init: function (env) {
        this.env = env;
        this.collection = [];
    },

    onText: function (text) {
        if (this.env.leadingStartTag === 'style')
            this.collection.push(text);
    },

    getCollection: function () {
        return this.collection;
    }
};
