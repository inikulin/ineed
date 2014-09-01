module.exports = {
    name: 'cssCode',
    extends: 'reprocess',

    init: function (env, replacer) {
        this.env = env;
        this.replacer = replacer;
    },

    onText: function (text) {
        if (this.env.leadingStartTag === 'style')
            text = this.replacer(text);

        return text;
    }
};
