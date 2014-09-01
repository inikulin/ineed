module.exports = {
    name: 'jsCode',
    extends: 'collect',

    init: function (env) {
        this.env = env;
        this.collection = [];
    },

    onText: function (text) {
        if (this.env.leadingStartTag === 'script')
            this.collection.push(text);
    },

    getCollection: function () {
        return this.collection;
    }
};
