const terminator = ";",
  softTerminator = choice(terminator),
  unicodeLetter = /\p{L}/,
  unicodeDigit = /[0-9]/;

module.exports = grammar({
  name: "nginx",
  extras: ($) => [/\s/, $.comment],
  externals: ($) => [$._newline, $._indent, $._dedent],
  conflicts: ($) => [],
  rules: {
    // entrypoint (topmost rule)

    source_file: ($) => repeat($._directive),

    // structures

    _directive: ($) =>
      choice(
        // specialized directives
        $.directive_block_lua,
        $.directive_geoip2,
        $.directive_map,
        // generic direcives
        $.directive_block,
        $.directive_simple,
      ),

    // generic simple directive
    directive_simple: ($) =>
      seq(
        $.keyword,
        optional($._directive_args),
        $.terminator,
      ),

    // generic block directive
    directive_block: ($) =>
      seq(
        $.keyword,
        optional($._directive_args),
        alias($._block_directive, $.block),
      ),

    _directive_args: ($) =>
      prec.left(repeat1($.directive_arg)),

    _block_directive: ($) =>
      seq(
        "{",
        repeat1($._directive),
        "}",
      ),

    directive_arg: ($) =>
      choice(
        $.var,
        $.value_boolean,
        $.value_size,
        $.value_time,
        $.string
      ),

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

    string: ($) =>
      choice(
        $.string_dquote,
        $.string_squote,
        $.string_unquote,
      ),

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
      choice(
        /[^\{\}]+/,
        seq("{", $._block_lua_content, "}"),
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

    // terminals (or close to it)

    comment: (_) => prec.left(token(seq("#", /.*/))),
    random_value: (_) => token(prec(-1, /[^;\s]*/)), // https://github.com/tree-sitter/tree-sitter/issues/1655
    terminator: (_) => ";",

    keyword: (_) => token(/\w+/),
    var: (_) => token(seq("$", /\w+/)),
    ident: (_) => token(/[a-zA-Z]\w*/),

    string_dquote: (_) => token(seq('"', repeat(/[^"]|(\\\")/), '"')),
    string_squote: (_) => token(seq("'", repeat(/[^']|(\\\')/), "'")),
    string_unquote: (_) => token(/[^'"\s\{;]+/),

    value_boolean: (_) => choice("on", "off"),
    // https://nginx.org/en/docs/syntax.html
    value_size: (_) => token(seq(/\d+/, /[mkgMKG]/)),
    value_time: (_) =>
      token(
        repeat1(seq(/\d+/, /(ms|s|m|h|d|w|M|y)/))
      ),
  },
});
