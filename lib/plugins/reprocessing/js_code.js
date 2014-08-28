module.exports = (function () {
    var env = null,
        op = null;

    return {
        name: 'jsCode',
        extends: 'reprocess',

        reset: function (environment, operator) {
            env = environment;
            op = operator;
        },

        onText: function (text) {
            if (env.leadingStartTag === 'script')
                text = op(text);

            return text;
        }
    };
})();