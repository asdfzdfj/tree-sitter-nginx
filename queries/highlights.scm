; see https://github.com/nvim-treesitter/nvim-treesitter/blob/master/CONTRIBUTING.md#highlights
; later query applies

(comment) @comment @spell

; TODO: unify directive types
(directive_generic (keyword) @function)
(directive_block_lua (keyword) @function)
(directive_geoip2 (keyword) @function)
(directive_types (keyword) @function)

(directive_map (keyword) @keyword.conditional)
(directive_if (keyword) @keyword.conditional)

(map_option (keyword) @function)

; highlight just a few important directive as keywords
(directive_generic
  (keyword) @keyword
  (#any-of? @keyword "http" "stream" "server" "location" "upstream" "events")
)
(directive_generic
  (keyword) @keyword
  (#any-of? @keyword "listen" "server_name" "root" "internal")
)
(directive_generic
  (keyword) @keyword.import
  (#eq? @keyword.import "include")
)

(directive_generic
  (keyword) @keyword.return
  (#any-of? @keyword.return
    "return" "try_files"
    "proxy_pass" "fastcgi_pass" "scgi_pass" "uwsgi_pass" "db_pass" "grpc_pass" "memcached_pass" "redis_pass" "tunnel_pass")
)

(value_boolean) @boolean
[
  (value_time)
  (value_size)
] @number
; ugly bodge
(string
  (string_unquote) @number
  (#match? @number "^[+-]?[0-9]+(\.[0-9]*)?$")
)

[
  (string_dquote)
  (string_squote)
] @string
(string_escape) @string.escape

[
  (if_operator_test)
  (if_operator_compare)
] @operator

(var) @variable
(directive_if (if_condition (var) @variable.parameter))
(directive_map (var) @variable.parameter)
(geoip2_entry (var) @variable.member)

(types_entry (type_mime) @property)

(terminator) @punctuation.delimiter
[
  "{"
  "}"
] @punctuation.bracket

(kv (kv_key) @property)
(kv "=" @punctuation.delimiter)

; special kv key highlight for env directive
(directive_generic
  (keyword) @keyword
  (directive_arg
    [
      (kv (kv_key) @constant)
      (string (string_unquote) @constant)
    ]
  )
  (#eq? @keyword "env")
)
