#include "tree_sitter/parser.h"
#include "tree_sitter/alloc.h"
#include "tree_sitter/array.h"

enum TokenType {
    KV_BEGIN,
    IMMEDIATE_EQ,

    ERROR_SENTINEL
};

typedef struct {
} Scanner;

// helpers

static inline void advance(TSLexer *lexer) {
    lexer->advance(lexer, false);
}

static inline void skip(TSLexer *lexer) {
    lexer->advance(lexer, true);
}

static bool is_whitespace_char(int32_t c) {
    switch (c) {
        case ' ':
        case '\t':
        case '\n':
        case '\r':
            return true;

        default:
            return false;
    }
}
static bool is_nginx_important_char(int32_t c) {
    switch (c) {
        case '{':
        case '}':
        case ';':
            return true;

        default:
            return false;
    }
}

bool tree_sitter_nginx_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
    if (valid_symbols[ERROR_SENTINEL]) {
        return false;
    }

    // $._ext_kv_begin

    if (valid_symbols[KV_BEGIN]) {
        /*
        // skips whitespace?
        while (is_whitespace_char(lexer->lookahead)) {
            skip(lexer);
        }
        */

        lexer->mark_end(lexer);

        // seek past what seems like a kv key identifier
        int32_t c = lexer->lookahead;
        int32_t kv_key_len = 0;
        while (
            ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9')
            || (c == '_')
        ) {
            advance(lexer);
            c = lexer->lookahead;
            kv_key_len += 1;
        }
        // assert future $.kv_key will have some length
        // (prevents `=404` from being parsed as an erroneous kv)
        if (kv_key_len < 1) {
            return false;
        }

        // assert equal sign
        if (c != '=') {
            return false;
        }

        advance(lexer);
        c = lexer->lookahead;

        // assert what comes after equal sign can still be parsed as a string
        if (is_whitespace_char(c) || is_nginx_important_char(c)) {
            return false;
        }

        lexer->result_symbol = KV_BEGIN;

        return true;
    }

    // $._ext_immediate_eq

    if (valid_symbols[IMMEDIATE_EQ]) {
        int32_t first_char = lexer->lookahead;
        if (first_char != '=') {
            return false;
        }

        // consume "=", assert next char is not whitespace
        advance(lexer);
        int32_t next_char = lexer->lookahead;
        if (is_whitespace_char(next_char)) {
            return false;
        }

        lexer->result_symbol = IMMEDIATE_EQ;
        return true;
    }

    return false;
}

// scanner state object init/destroy

void *tree_sitter_nginx_external_scanner_create() {
    return NULL;
}

void tree_sitter_nginx_external_scanner_destroy(void *payload) {
    return;
}

// scanner state (de)serialize

unsigned tree_sitter_nginx_external_scanner_serialize(void *payload, char *buffer) {
    return 0;
}

void tree_sitter_nginx_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
    return;
}
