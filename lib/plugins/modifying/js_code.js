module.exports = (function () {
    var env = null,
        op = null;

    return {
        name: 'jsCode',
        extends: 'modify',

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