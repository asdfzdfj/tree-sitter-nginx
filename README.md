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

## features/task list

### basic grammars

- [x] comments
- [x] generic simple directives
- [x] generic block directives
- [ ] regex injection in supported places
- [ ] location block
    - [ ] location modifier
- [ ] if block
    - [ ] if condition
- [ ] types block
- [ ] map block
    - [x] basic map block
    - [ ] highlight regex keys
    - [ ] highlight hostnames glob
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
