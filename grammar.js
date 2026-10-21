module.exports = grammar({
  name: "nginx",
  extras: ($) => [/\s/, $.comment],
  externals: ($) => [],
  conflicts: ($) => [],
  rules: {
    // entrypoint (topmost rule)

    source_file: ($) => repeat($._directive),

    // structures

    _directive: ($) =>
      choice(
        // specialized
        $.directive_block_lua,
        $.directive_geoip2,
        $.directive_map,
        $.directive_if,
        $.directive_types,
        // generic fallback
        $.directive_generic,
      ),

    directive_generic: ($) =>
      seq(
        // from what I've seen in crossplane, the "directive" is quite
        // literally just a sequence of nonspace chars;
        // try aliasing them to unquoted string for now
        alias($.string_unquote, $.keyword),
        optional($._directive_args),
        choice(
          alias($._block_directive, $.block),
          $.terminator,
        ),
      ),

    _block_directive: ($) =>
      seq(
        "{",
        repeat($._directive),
        "}",
      ),

    _directive_args: ($) =>
      prec.left(repeat1($.directive_arg)),

    directive_arg: ($) =>
      choice(
        $.var,
        $.value_boolean,
        $.value_size,
        $.value_time,
        $.string
      ),

    // map block

    directive_map: ($) =>
      seq(
        alias("map", $.keyword),
        $.string,
        $.var,
        alias($._block_map, $.block)
      ),

    _block_map: ($) =>
      seq(
        "{",
        repeat1(
          choice(
            $.map_option,
            $.map_entry,
          ),
        ),
        "}",
      ),

    map_entry: ($) =>
      seq(
        // TODO: handle key regex prefix and stuff
        alias($.string, $.map_key),
        alias($.string, $.map_value),
        $.terminator,
      ),

    map_option: ($) =>
      choice(
        seq(
          alias("default", $.keyword),
          $.string,
          $.terminator,
        ),
        seq(
          alias("include", $.keyword),
          $.string,
          $.terminator,
        ),
        seq(alias("hostnames", $.keyword), $.terminator),
        seq(alias("volatile", $.keyword), $.terminator)
      ),

    // types directive
    directive_types: ($) =>
      seq(
        alias("types", $.keyword),
        alias($._block_types, $.block),
      ),

    _block_types: ($) =>
      seq(
        "{",
        repeat($.types_entry),
        "}",
      ),

    types_entry: ($) =>
      seq(
        alias($.mime_type, $.type_mime),
        repeat1($.type_ext),
        $.terminator
      ),

    type_ext: ($) => token(/[a-z0-9]+/),

    // if directive

    directive_if: ($) =>
      seq(
        alias("if", $.keyword),
        $.if_condition,
        alias($._block_directive, $.block),
      ),

    if_condition: ($) =>
      seq(
        "(",
        choice(
          $.var,
          $._if_test,
          $._if_compare,
        ),
        ")"
      ),

    _if_test: ($) =>
      seq(
        $.if_operator_test,
        alias($.if_string, $.string),
      ),

    _if_compare: ($) =>
      seq(
        $.var,
        $.if_operator_compare,
        alias($.if_string, $.string),
      ),

    if_string: ($) =>
      choice(
        $.string_dquote,
        $.string_squote,
        alias($.if_string_unquote, $.string_unquote)
      ),

    // kind of a bodge: make unquoted string in if condition not accept parenthesis
    if_string_unquote: (_) => token(prec(-1, /[^\s(){};]+/)),

    // extension directives

    // lua_block directives, these consume block as if they are string
    // and also add a lua injection site

    directive_block_lua: ($) =>
      choice(
        // set_by_lua_block: the only one that has args
        seq(
          alias("set_by_lua_block", $.keyword),
          $.var,
          alias($._block_lua, $.block)
        ),
        // regular lua_block directive
        seq(
          alias(/\w+_by_lua_block/, $.keyword),
          alias($._block_lua, $.block)
        ),
      ),

    _block_lua: ($) =>
      seq(
        "{",
        alias(repeat($._block_lua_content), $.lua_code),
        "}",
      ),

    _block_lua_content: ($) =>
      seq(
        /[^\{\}]+/,
        optional(seq("{", repeat($._block_lua_content), "}")),
      ),

    // geoip2 module from https://github.com/leev/ngx_http_geoip2_module

    directive_geoip2: ($) =>
      seq(
        alias("geoip2", $.keyword),
        $.string,
        alias($.block_geoip2_entries, $.block),
      ),

    block_geoip2_entries: ($) =>
      seq(
        "{",
        repeat1($.geoip2_entry),
        "}"
      ),

    geoip2_entry: ($) =>
      choice(
        $._geoip2_entry_setting,
        $._geoip2_entry_var,
      ),

    _geoip2_entry_setting: ($) =>
      seq(
        alias("auto_reload", $.keyword),
        $.value_time,
        $.terminator,
      ),

    _geoip2_entry_var: ($) =>
      seq(
        $.var,
        repeat1($.string),
        $.terminator
      ),

    string: ($) =>
      choice(
        $.string_dquote,
        $.string_squote,
        $.string_unquote,
      ),

    mime_type: ($) =>
      seq($._mime_type_top, "/", $._mime_type_sub),

    // terminals (or close to it)

    comment: (_) => prec.left(token(seq("#", /.*/))),
    random_value: (_) => token(prec(-1, /[^;\s]*/)), // https://github.com/tree-sitter/tree-sitter/issues/1655
    terminator: (_) => ";",

    keyword: (_) => token(/\w+/),
    var: (_) => token(seq("$", /\w+/)),
    ident: (_) => token(/[a-zA-Z]\w*/),

    string_dquote: (_) => token(seq('"', repeat(/[^"]|(\\\")/), '"')),
    string_squote: (_) => token(seq("'", repeat(/[^']|(\\\')/), "'")),
    string_unquote: (_) => token(prec(-1, /[^\s\{\};]+/)),

    value_boolean: (_) => choice("on", "off"),
    // https://nginx.org/en/docs/syntax.html
    value_size: (_) => token.immediate(seq(/\d+/, /[mkgMKG]/)),
    value_time: (_) =>
      token.immediate(
        repeat1(token(seq(/\d+/, /(ms|s|m|h|d|w|M|y)/)))
      ),

    _mime_type_top: (_) =>
      choice(
        "application", "audio", "example", "font", "haptics", "image",
        "message", "model", "multipart", "text", "video",
      ),
    _mime_type_sub: (_) => token(/[A-Za-z0-9.+-]+/),

    if_operator_test: (_) =>
      choice(
        "-f", "!-f",
        "-d", "!-d",
        "-e", "!-e",
        "-x", "!-x",
      ),

    if_operator_compare: (_) =>
      choice(
        "=", "!=",
        "~", "!~",
        "~*", "!~*"
      ),
  },
});
