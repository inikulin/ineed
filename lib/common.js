//Escaping regexes
var AMP_REGEX = /&/g,
    NBSP_REGEX = /\u00a0/g,
    DOUBLE_QUOTE_REGEX = /"/g,
    LT_REGEX = /</g,
    GT_REGEX = />/g;


exports.escapeHtml = function (str, attrMode) {
    str = str
        .replace(AMP_REGEX, '&amp;')
        .replace(NBSP_REGEX, '&nbsp;');

    if (attrMode)
        str = str.replace(DOUBLE_QUOTE_REGEX, '&quot;');

    else {
        str = str
            .replace(LT_REGEX, '&lt;')
            .replace(GT_REGEX, '&gt;');
    }

    return str;
};

var getAttrValue = exports.getAttrValue = function (attrs, attrName) {
    for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].name.toLowerCase() === attrName)
            return attrs[i].value;
    }

    return null;
};

exports.setAttrValue = function (attrs, attrName, value) {
    for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].name.toLowerCase() === attrName) {
            attrs[i].value = value;
            break;
        }
    }
};

exports.isStylesheet = function (startTag) {
    if (startTag.tagName === 'link') {
        var relAttr = getAttrValue(startTag.attrs, 'rel');

        return relAttr && relAttr.toLowerCase() === 'stylesheet';
    }

    return false;
};

exports.isPlainText = function (inBody, leadingStartTag, text) {
    return inBody &&
           leadingStartTag !== 'script' &&
           leadingStartTag !== 'style' &&
           text.trim().length > 0;
};

exports.toLookupTable = function (arr) {
    return arr.reduce(function (table, value) {
        table[value] = true;
        return table;
    }, {});
};
