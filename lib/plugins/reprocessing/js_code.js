module.exports = {
    name: 'jsCode',
    extends: 'reprocess',

    init: function (env, replacer) {
        this.env = env;
        this.replacer = replacer;
    },

    onText: function (text) {
        if (this.env.leadingStartTag === 'script')
            text = this.replacer(text);

        return text;
    }
};
