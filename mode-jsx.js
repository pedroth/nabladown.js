define("ace/mode/doc_comment_highlight_rules", [
  "require",
  "exports",
  "module",
  "ace/lib/oop",
  "ace/mode/text_highlight_rules"
], function (e, t, n) {
  "use strict";
  var i = e("../lib/oop"),
    o = e("./text_highlight_rules").TextHighlightRules,
    r = function () {
      this.$rules = {
        start: [
          { token: "comment.doc.tag", regex: "@[\\w\\d_]+" },
          r.getTagRule(),
          { defaultToken: "comment.doc", caseInsensitive: !0 }
        ]
      };
    };
  i.inherits(r, o),
    (r.getTagRule = function (e) {
      return {
        token: "comment.doc.tag.storage.type",
        regex: "\\b(?:TODO|FIXME|XXX|HACK)\\b"
      };
    }),
    (r.getStartRule = function (e) {
      return { token: "comment.doc", regex: "\\/\\*(?=\\*)", next: e };
    }),
    (r.getEndRule = function (e) {
      return { token: "comment.doc", regex: "\\*\\/", next: e };
    }),
    (t.DocCommentHighlightRules = r);
}),
  define("ace/mode/jsx_highlight_rules", [
    "require",
    "exports",
    "module",
    "ace/lib/oop",
    "ace/lib/lang",
    "ace/mode/doc_comment_highlight_rules",
    "ace/mode/text_highlight_rules"
  ], function (e, t, n) {
    function i() {
      var t = r.arrayToMap(
          "break|do|instanceof|typeof|case|else|new|var|catch|finally|return|void|continue|for|switch|default|while|function|this|if|throw|delete|in|try|class|extends|super|import|from|into|implements|interface|static|mixin|override|abstract|final|number|int|string|boolean|variant|log|assert".split(
            "|"
          )
        ),
        n = r.arrayToMap(
          "null|true|false|NaN|Infinity|__FILE__|__LINE__|undefined".split("|")
        ),
        i = r.arrayToMap(
          "debugger|with|const|export|let|private|public|yield|protected|extern|native|as|operator|__fake__|__readonly__".split(
            "|"
          )
        ),
        e = "[a-zA-Z_][a-zA-Z0-9_]*\\b";
      (this.$rules = {
        start: [
          { token: "comment", regex: "\\/\\/.*$" },
          a.getStartRule("doc-start"),
          { token: "comment", regex: "\\/\\*", next: "comment" },
          {
            token: "string.regexp",
            regex:
              "[/](?:(?:\\[(?:\\\\]|[^\\]])+\\])|(?:\\\\/|[^\\]/]))*[/]\\w*\\s*(?=[).,;]|$)"
          },
          { token: "string", regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]' },
          { token: "string", regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']" },
          { token: "constant.numeric", regex: "0[xX][0-9a-fA-F]+\\b" },
          {
            token: "constant.numeric",
            regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
          },
          { token: "constant.language.boolean", regex: "(?:true|false)\\b" },
          {
            token: ["storage.type", "text", "entity.name.function"],
            regex: "(function)(\\s+)(" + e + ")"
          },
          {
            token: function (e) {
              return "this" == e
                ? "variable.language"
                : "function" == e
                ? "storage.type"
                : t.hasOwnProperty(e) || i.hasOwnProperty(e)
                ? "keyword"
                : n.hasOwnProperty(e)
                ? "constant.language"
                : /^_?[A-Z][a-zA-Z0-9_]*$/.test(e)
                ? "language.support.class"
                : "identifier";
            },
            regex: e
          },
          {
            token: "keyword.operator",
            regex:
              "!|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|==|=|!=|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"
          },
          { token: "punctuation.operator", regex: "\\?|\\:|\\,|\\;|\\." },
          { token: "paren.lparen", regex: "[[({<]" },
          { token: "paren.rparen", regex: "[\\])}>]" },
          { token: "text", regex: "\\s+" }
        ],
        comment: [
          { token: "comment", regex: "\\*\\/", next: "start" },
          { defaultToken: "comment" }
        ]
      }),
        this.embedRules(a, "doc-", [a.getEndRule("start")]);
    }
    var o = e("../lib/oop"),
      r = e("../lib/lang"),
      a = e("./doc_comment_highlight_rules").DocCommentHighlightRules,
      s = e("./text_highlight_rules").TextHighlightRules;
    o.inherits(i, s), (t.JsxHighlightRules = i);
  }),
  define("ace/mode/matching_brace_outdent", [
    "require",
    "exports",
    "module",
    "ace/range"
  ], function (e, t, n) {
    "use strict";
    function i() {}
    var a = e("../range").Range;
    (function () {
      (this.checkOutdent = function (e, t) {
        return !!/^\s+$/.test(e) && /^\s*\}/.test(t);
      }),
        (this.autoOutdent = function (e, t) {
          var n = e.getLine(t).match(/^(\s*\})/);
          if (!n) return 0;
          var i = n[1].length,
            o = e.findMatchingBracket({ row: t, column: i });
          if (!o || o.row == t) return 0;
          var r = this.$getIndent(e.getLine(o.row));
          e.replace(new a(t, 0, t, i - 1), r);
        }),
        (this.$getIndent = function (e) {
          return e.match(/^\s*/)[0];
        });
    }.call(i.prototype),
      (t.MatchingBraceOutdent = i));
  }),
  define("ace/mode/folding/cstyle", [
    "require",
    "exports",
    "module",
    "ace/lib/oop",
    "ace/range",
    "ace/mode/folding/fold_mode"
  ], function (e, t, n) {
    "use strict";
    var i = e("../../lib/oop"),
      c = e("../../range").Range,
      o = e("./fold_mode").FoldMode,
      r = (t.FoldMode = function (e) {
        e &&
          ((this.foldingStartMarker = new RegExp(
            this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + e.start)
          )),
          (this.foldingStopMarker = new RegExp(
            this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + e.end)
          )));
      });
    i.inherits(r, o),
      function () {
        (this.foldingStartMarker = /([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/),
          (this.foldingStopMarker = /^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/),
          (this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/),
          (this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/),
          (this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/),
          (this._getFoldWidgetBase = this.getFoldWidget),
          (this.getFoldWidget = function (e, t, n) {
            var i = e.getLine(n);
            if (
              this.singleLineBlockCommentRe.test(i) &&
              !this.startRegionRe.test(i) &&
              !this.tripleStarBlockCommentRe.test(i)
            )
              return "";
            var o = this._getFoldWidgetBase(e, t, n);
            return !o && this.startRegionRe.test(i) ? "start" : o;
          }),
          (this.getFoldWidgetRange = function (e, t, n, i) {
            var o = e.getLine(n);
            if (this.startRegionRe.test(o))
              return this.getCommentRegionBlock(e, o, n);
            var r = o.match(this.foldingStartMarker);
            if (r) {
              var a = r.index;
              if (r[1]) return this.openingBracketBlock(e, r[1], n, a);
              var s = e.getCommentFoldRange(n, a + r[0].length, 1);
              return (
                s &&
                  !s.isMultiLine() &&
                  (i
                    ? (s = this.getSectionRange(e, n))
                    : "all" != t && (s = null)),
                s
              );
            }
            if ("markbegin" !== t && (r = o.match(this.foldingStopMarker))) {
              a = r.index + r[0].length;
              return r[1]
                ? this.closingBracketBlock(e, r[1], n, a)
                : e.getCommentFoldRange(n, a, -1);
            }
          }),
          (this.getSectionRange = function (e, t) {
            for (
              var n = e.getLine(t),
                i = n.search(/\S/),
                o = t,
                r = n.length,
                a = (t += 1),
                s = e.getLength();
              ++t < s;

            ) {
              var g = (n = e.getLine(t)).search(/\S/);
              if (-1 !== g) {
                if (g < i) break;
                var l = this.getFoldWidgetRange(e, "all", t);
                if (l) {
                  if (l.start.row <= o) break;
                  if (l.isMultiLine()) t = l.end.row;
                  else if (i == g) break;
                }
                a = t;
              }
            }
            return new c(o, r, a, e.getLine(a).length);
          }),
          (this.getCommentRegionBlock = function (e, t, n) {
            for (
              var i = t.search(/\s*$/),
                o = e.getLength(),
                r = n,
                a = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/,
                s = 1;
              ++n < o;

            ) {
              t = e.getLine(n);
              var g = a.exec(t);
              if (g && (g[1] ? s-- : s++, !s)) break;
            }
            if (r < n) return new c(r, i, n, t.length);
          });
      }.call(r.prototype);
  }),
  define("ace/mode/jsx", [
    "require",
    "exports",
    "module",
    "ace/lib/oop",
    "ace/mode/text",
    "ace/mode/jsx_highlight_rules",
    "ace/mode/matching_brace_outdent",
    "ace/mode/behaviour/cstyle",
    "ace/mode/folding/cstyle"
  ], function (e, t, n) {
    "use strict";
    function i() {
      (this.HighlightRules = a),
        (this.$outdent = new s()),
        (this.$behaviour = new g()),
        (this.foldingRules = new l());
    }
    var o = e("../lib/oop"),
      r = e("./text").Mode,
      a = e("./jsx_highlight_rules").JsxHighlightRules,
      s = e("./matching_brace_outdent").MatchingBraceOutdent,
      g = e("./behaviour/cstyle").CstyleBehaviour,
      l = e("./folding/cstyle").FoldMode;
    o.inherits(i, r),
      function () {
        (this.lineCommentStart = "//"),
          (this.blockComment = { start: "/*", end: "*/" }),
          (this.getNextLineIndent = function (e, t, n) {
            var i = this.$getIndent(t),
              o = this.getTokenizer().getLineTokens(t, e).tokens;
            return (
              (o.length && "comment" == o[o.length - 1].type) ||
                ("start" == e && t.match(/^.*[\{\(\[]\s*$/) && (i += n)),
              i
            );
          }),
          (this.checkOutdent = function (e, t, n) {
            return this.$outdent.checkOutdent(t, n);
          }),
          (this.autoOutdent = function (e, t, n) {
            this.$outdent.autoOutdent(t, n);
          }),
          (this.$id = "ace/mode/jsx");
      }.call(i.prototype),
      (t.Mode = i);
  }),
  window.require(["ace/mode/jsx"], function (e) {
    "object" == typeof module &&
      "object" == typeof exports &&
      module &&
      (module.exports = e);
  });