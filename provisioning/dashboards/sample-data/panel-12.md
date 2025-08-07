| id            | parent_id     | name            | value | timestamp                | operator                      |
| ------------- | ------------- | --------------- | ----- | ------------------------ | ----------------------------- |
| '22e62b1a...' | NULL          | 'output'        | TRUE  | '2025-01-01 00:00+00:00' | 'and'                         |
| '400ca2a5...' | '22e62b1a...' | NULL            | TRUE  |                          | 'or'                          |
| 'e771a4ee...' | '400ca2a5...' | 'my_comparison' | TRUE  |                          | 'is greater than or equal to' |
| '93b3398a...' | 'e771a4ee...' | NULL            | 9     |                          | 'times'                       |
| '7835c554...' | '93b3398a...' | 'my_sum'        | 3     |                          | 'plus'                        |
| 'e660104d...' | '7835c554...' | 'a'             | 1     |                          | NULL                          |
| 'ae1628aa...' | '7835c554...' | 'b'             | 2     |                          | NULL                          |
| '15dbc677...' | '93b3398a...' | 'c'             | 3     |                          | NULL                          |
| 'da26a44b...' | 'e771a4ee...' | NULL            | 3.8   |                          | 'plus'                        |
| '3ff90605...' | 'da26a44b...' | 'd'             | 4     |                          | NULL                          |
| '8861f456...' | 'da26a44b...' | NULL            | -0.2  |                          | 'negative'                    |
| '84766f0d...' | '8861f456...' | NULL            | 0.2   |                          | 'inverse'                     |
| '239d8b28...' | '84766f0d...' | 'f'             | 5     |                          | NULL                          |
| '76d1f6c3...' | '400ca2a5...' | 'g'             | FALSE |                          | NULL                          |
| 'c42505af...' | '22e62b1a...' | 'h'             | TRUE  |                          | NULL                          |
