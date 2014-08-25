var parse5 = require('parse5'),
    request = require('request'),
    EnvironmentOperator = require('./operators/control_flow/environment');


//Monad-inspired control flow: rollback to the previous value if the new one is undefined.
function transanctional(oldValue, newValue) {
    return newValue === undefined ? oldValue : newValue;
}


//ProcessorBase
var ProcessorBase = function () {
    this.operators = [EnvironmentOperator];

    this.environment = {
        baseUrl: undefined,
        inElement: undefined,
        inBody: false
    };

    var processor = this;

    //NOTE: we don't use .bind() here because it uses quite slow .apply() internally.
    this.parser = new parse5.SimpleApiParser({
        doctype: function (name, publicId, systemId) {
            processor._onDoctype(name, publicId, systemId);
        },

        startTag: function (tagName, attrs, selfClosing) {
            processor._onStartTag(tagName, attrs, selfClosing);
        },

        endTag: function (tagName) {
            processor._onEndTag(tagName);
        },

        text: function (text) {
            processor._onText(text);
        },

        comment: function (comment) {
            processor._onComment(comment);
        }
    });
};


//Pure virtual
ProcessorBase.prototype.aggregateOperatorResults = null;


//Parser handlers
ProcessorBase.prototype._onDoctype = function (name, publicId, systemId) {
    var doctype = {
        name: name,
        publicId: publicId,
        systemId: systemId
    };

    for (var i = 0; i < this.operators.length; i++) {
        if (this.operators[i].onDoctype)
            doctype = transanctional(doctype, this.operators[i].onDoctype(doctype));
    }
};

ProcessorBase.prototype._onStartTag = function (tagName, attrs, selfClosing) {
    var startTag = {
        tagName: tagName,
        attrs: attrs,
        selfClosing: selfClosing
    };

    for (var i = 0; i < this.operators.length; i++) {
        if (this.operators[i].onStartTag)
            startTag = transanctional(startTag, this.operators[i].onStartTag(startTag));
    }
};

ProcessorBase.prototype._onEndTag = function (tagName) {
    for (var i = 0; i < this.operators.length; i++) {
        if (this.operators[i].onEndTag)
            tagName = transanctional(tagName, this.operators[i].onEndTag(tagName));
    }
};

ProcessorBase.prototype._onText = function (text) {
    for (var i = 0; i < this.operators.length; i++) {
        if (this.operators[i].onText)
            text = transanctional(text, this.operators[i].onText(text));
    }
};

ProcessorBase.prototype._onComment = function (comment) {
    for (var i = 0; i < this.operators.length; i++) {
        if (this.operators[i].onComment)
            comment = transanctional(comment, this.operators[i].onComment(comment));
    }
};


//API
ProcessorBase.prototype.fromHtml = function (html, baseUrl) {
    this.environment.baseUrl = baseUrl;
    this.environment.inElement = undefined;
    this.environment.inBody = false;

    for (var i = 0; i < this.operators.length; i++)
        this.operators[i].reset(this.environment);

    this.parser.parse(html);

    return this.aggregateOperatorResults();
};

ProcessorBase.prototype.from = function (options, callback) {
    var processor = this;

    request(options, function (err, response, body) {
        var results = null;

        if (!err) {
            //TODO decode body
            results = processor.fromHtml(body, options.url || options.uri || options);
        }

        callback(err, response, results);
    });
};
