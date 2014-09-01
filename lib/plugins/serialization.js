var Common = require('../common');

//Const
var UNESCAPE_CONTENT = [
    'script', 'script', 'xmp', 'iframe', 'noembed', 'noframes', 'plaintext', 'noscript'
];

//Enquote doctype ID
function enquoteDoctypeId(id) {
    var quote = id.indexOf('"') !== -1 ? '\'' : '"';

    return quote + id + quote;
}

module.exports = {
    reset: function (env) {
        this.env = env;
        this.html = '';
        this.skipTextHtmlEscaping = false;
    },

    onDoctype: function (doctype) {
        if (doctype) {
            this.html += '<!DOCTYPE ' + doctype.name;

            if (doctype.publicId !== null)
                this.html += ' PUBLIC ' + enquoteDoctypeId(doctype.publicId);

            else if (doctype.systemId !== null)
                this.html += ' SYSTEM';

            if (doctype.systemId !== null)
                this.html += ' ' + enquoteDoctypeId(doctype.systemId);

            this.html += '>';
        }
    },

    onStartTag: function (startTag) {
        if (startTag) {
            this.html += '<' + startTag.tagName;

            for (var i = 0; i < startTag.attrs.length; i++) {
                var attr = startTag.attrs[i];

                this.html += ' ' + attr.name + '="' + Common.escapeHtml(attr.value, true) + '"';
            }

            this.html += startTag.selfClosing ? '/>' : '>';
        }
    },

    onEndTag: function (tagName) {
        if (tagName)
            this.html += '</' + tagName + '>';
    },

    onText: function (text) {
        if (text) {
            if (this.skipTextHtmlEscaping || UNESCAPE_CONTENT[this.env.leadingStartTag])
                this.html += text;
            else
                this.html += Common.escapeHtml(text, false);
        }

        this.skipTextHtmlEscaping = false;
    },

    onComment: function (comment) {
        if (comment)
            this.html += '<!--' + comment + '-->';
    },

    getHtml: function () {
        return this.html;
    }
};
