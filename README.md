# tree-sitter-nginx

## main impetus

to get more sensible nvim treesitter highlights that just didn't keel over when
encountering `_by_lua_block` directives from nginx lua module

perhaps eventually, to get a good enough tree-sitter based syntax highlight of
similar quality to what [chr4/nginx.vim](https://github.com/chr4/nginx.vim) provided

## prior arts

- <https://github.com/opa-oz/tree-sitter-nginx> what this repo forked from
- <https://gitlab.com/joncoole/tree-sitter-nginx>
- <https://github.com/dlvandenberg/nvim-treesitter-nginx> nvim related in specific
- <https://github.com/nginxinc/crossplane> probably could be used as base for parser,
  smart enough to recognize lua block directives

## TODO

- fix directive parsing where multiple args are parsed out of a single contiguous word
  e.g. `123xxxx` parsed into `(value_int) 123 (string_unquote) xxxx`
  rather than a single `(string_unquote) 123xxxx`,  
  might have to resort to handling whitespace explicitly
  like how [kdl][tree-sitter-kdl] or [clojure][tree-sitter-clojure] does

[tree-sitter-kdl]: https://github.com/tree-sitter-grammars/tree-sitter-kdl/blob/e8ff98a113e175b84b92ec2096820517c1e10a66/grammar.js#L48
[tree-sitter-clojure]: https://github.com/clj-commons/tree-sitter-clojure/blob/e43eff80d17cf34852dcd92ca5e6986d23a7040f/grammar.js#L251

## features/task list

### basic grammars

- [x] comments
- [x] generic simple directives
- [x] generic block directives
- [ ] regex injection in supported places
- [ ] location block
    - [ ] location modifier
- [x] if block
    - [x] if condition
- [x] types block
- [ ] map block
    - [x] basic map block
    - [ ] highlight regex keys
    - [ ] highlight hostname keys glob
- [ ] strings
    - [x] double quoted
    - [x] single quoted
    - [ ] unquoted
    - [ ] highlight interpolated variable
- [x] variables

### extension grammars

- nginx lua module
    - [x] `*_by_lua_block` block directive
    - [x] lua injection site for those block
- [geoip2 module](https://github.com/leev/ngx_http_geoip2_module)
    - [x] geoip2 directive

### queries

- [ ] folds
    - [ ] block fold
- [ ] highlights (the node names are currently unstable)
- [ ] injections
    - [x] lua block content
