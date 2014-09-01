module.exports = {
    name: 'title',
    extends: 'collect',

    init: function (env, replacer) {
        this.env = env;
        this.replacer = replacer;
    },

    onText: function (text) {
        if (!this.env.inBody && this.env.leadingStartTag === 'title')
            text = this.replacer(text);

        return text;
    }
};
