var Common = require('../common');

//Const
var TAGS_WITH_UNESCAPED_CONTENT = Common.toLookupTable([
    'script', 'style', 'xmp', 'iframe', 'noembed', 'noframes', 'plaintext', 'noscript'
]);

//Enquote doctype ID
function enquoteDoctypeId(id) {
    var quote = id.indexOf('"') !== -1 ? '\'' : '"';

    return quote + id + quote;
}

module.exports = {
    init: function (ctx) {
        this.ctx = ctx;
        this.html = '';
        this.escapeHtml = true;
    },

    onDoctype: function (doctype) {
        this.html += '<!DOCTYPE ' + doctype.name;

        if (doctype.publicId !== null)
            this.html += ' PUBLIC ' + enquoteDoctypeId(doctype.publicId);

        else if (doctype.systemId !== null)
            this.html += ' SYSTEM';

        if (doctype.systemId !== null)
            this.html += ' ' + enquoteDoctypeId(doctype.systemId);

        this.html += '>';
    },

    onStartTag: function (startTag) {
        this.html += '<' + startTag.tagName;

        for (var i = 0; i < startTag.attrs.length; i++) {
            var attr = startTag.attrs[i];

            this.html += ' ' + attr.name + '="' + Common.escapeHtml(attr.value, true) + '"';
        }

        this.html += startTag.selfClosing ? '/>' : '>';
    },

    onEndTag: function (tagName) {
        this.html += '</' + tagName + '>';
    },

    onText: function (text) {
        if (!this.escapeHtml || TAGS_WITH_UNESCAPED_CONTENT[this.ctx.leadingStartTag])
            this.html += text;
        else
            this.html += Common.escapeHtml(text, false);
    },

    onComment: function (comment) {
        this.html += '<!--' + comment + '-->';
    },

    getHtml: function () {
        return this.html;
    }
};
