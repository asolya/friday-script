```
ROOT = STATEMENT_LIST
STATEMENT_LIST = (STATEMENT ';')*
STATEMENT = 'var' ID '=' VALUE
          | '{' STATEMENT_LIST '}'
          | VALUE
VALUE = NUM
      | ID '(' PARAMETERS ')'
      | ID '=' VALUE
      | ID
PARAMETERS = VALUE(','VALUE)
```