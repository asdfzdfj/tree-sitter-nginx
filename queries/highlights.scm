; see https://github.com/nvim-treesitter/nvim-treesitter/blob/master/CONTRIBUTING.md#highlights

(comment) @comment @spell

(directive_map (keyword) @keyword.conditional)

; TODO: unify directive types
(directive_block (keyword) @function)
(directive_simple (keyword) @function)
(directive_block_lua (keyword) @function)
(directive_geoip2 (keyword) @function)
(directive_types (keyword) @function)

(value_boolean) @boolean

[
  (string_dquote)
  (string_squote)
] @string

(var) @variable

(terminator) @punctuation.delimiter
[
  "{"
  "}"
] @punctuation.bracket
