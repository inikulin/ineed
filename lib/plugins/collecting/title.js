module.exports = {
    name: 'title',
    extends: 'collect',

    init: function (env) {
        this.env = env;
        this.title = null;
    },

    onText: function (text) {
        //NOTE: where can be only one <title> in document.
        if (!this.title && !this.env.inBody && this.env.leadingStartTag === 'title')
            this.title = text;
    },

    getCollection: function () {
        return this.title || '';
    }
};
