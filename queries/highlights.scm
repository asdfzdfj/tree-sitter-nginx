; see https://github.com/nvim-treesitter/nvim-treesitter/blob/master/CONTRIBUTING.md#highlights

(comment) @comment @spell

(directive_map (keyword) @keyword.conditional)

; TODO: unify directive types
(directive_block (keyword) @keyword)
(directive_simple (keyword) @keyword)
(directive_block_lua (keyword) @keyword)

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
