module.exports = (function () {
    var env = null,
        rpl = null;

    return {
        name: 'jsCode',
        extends: 'reprocess',

        reset: function (environment, replacer) {
            env = environment;
            rpl = replacer;
        },

        onText: function (text) {
            if (env.leadingStartTag === 'script')
                text = rpl(text);

            return text;
        }
    };
})();