```
ROOT = STATEMENT_LIST
STATEMENT_LIST = STATEMENT*
STATEMENT = 'var' ID '=' VALUE ';'
          | '{' STATEMENT_LIST '}'
          | 'while' '(' VALUE ')' STATEMENT
          | 'if' '(' VALUE ')' STATEMENT 'else' STATEMENT
          | 'if' '(' VALUE ')' STATEMENT
          | VALUE ';'
VALUE = NUM
      | ID '(' PARAMETERS ')'
      | ID '=' VALUE
      | ID
      | 'function' '(' IDS ')' '{' STATEMENT_LIST '}'
PARAMETERS = | VALUE(','VALUE)*
IDS = | ID(','ID)*
```