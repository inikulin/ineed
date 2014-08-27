module.exports = (function () {
    var env = null,
        title = null;

    return {
        name: 'title',
        extends: 'collect',

        reset: function (environment) {
            env = environment;
            title = null;
        },

        onText: function (text) {
            //NOTE: where can be only one <title> in document.
            if (!title && !env.inBody && env.leadingStartTag === 'title')
                title = text;
        },

        getCollection: function () {
            return title || '';
        }
    };
})();