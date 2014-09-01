//Escaping regexes
var AMP_REGEX = /&/g,
    NBSP_REGEX = /\u00a0/g,
    DOUBLE_QUOTE_REGEX = /"/g;

//Escape string
function escapeAttr(str) {
    return str
        .replace(AMP_REGEX, '&amp;')
        .replace(NBSP_REGEX, '&nbsp;')
        .replace(DOUBLE_QUOTE_REGEX, '&quot;');
}

//Enquote doctype ID
function enquoteDoctypeId(id) {
    var quote = id.indexOf('"') !== -1 ? '\'' : '"';

    return quote + id + quote;
}

module.exports = (function () {
    var html = null;

    return {
        reset: function () {
            html = '';
        },

        onDoctype: function (doctype) {
            if (doctype) {
                html += '<!DOCTYPE ' + doctype.name;

                if (doctype.publicId !== null)
                    html += ' PUBLIC ' + enquoteDoctypeId(doctype.publicId);

                else if (doctype.systemId !== null)
                    html += ' SYSTEM';

                if (doctype.systemId !== null)
                    html += ' ' + enquoteDoctypeId(doctype.systemId);

                html += '>';
            }
        },

        onStartTag: function (startTag) {
            if (startTag) {
                html += '<' + startTag.tagName;

                for (var i = 0; i < startTag.attrs.length; i++) {
                    var attr = startTag.attrs[i];

                    html += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
                }

                html += startTag.selfClosing ? '/>' : '>';
            }
        },

        onEndTag: function (tagName) {
            if (tagName)
                html += '</' + tagName + '>';
        },

        onText: function (text) {
            if (text)
                html += text;
        },

        onComment: function (comment) {
            if (comment)
                html += '<!--' + comment + '-->';
        },

        getHtml: function () {
            return html;
        }
    };
})();