import {
  EvaluatedExpression,
  getRootEvaluatedExpressions,
} from './EvaluatedExpression';

const rows = [
  {
    id: '51909b4d-7469-4244-bd09-10377e243495',
    parent_id: null,
    name: 'x',
    value: true,
    operator: 'and',
    timestamp: '2025-01-01 00:00+00:00',
  },
  {
    id: 'cc7e5523-9d7e-4df5-bf63-6ee81127feac',
    parent_id: '51909b4d-7469-4244-bd09-10377e243495',
    name: 'a',
    value: true,
    operator: null,
    timestamp: null,
  },
  {
    id: '2d123c81-646b-4919-928d-bc55f517b623',
    parent_id: '51909b4d-7469-4244-bd09-10377e243495',
    name: 'b',
    value: true,
    operator: 'not',
    timestamp: null,
  },
  {
    id: '52383124-b10a-4e5a-8f97-c9e7c28c7854',
    parent_id: '2d123c81-646b-4919-928d-bc55f517b623',
    name: 'c',
    value: false,
    operator: null,
    timestamp: null,
  },
  {
    id: 'f27ad21d-989f-4f76-bb15-c64a3b6f400a',
    parent_id: null,
    name: 'y',
    value: 4.2,
    operator: null,
    timestamp: '2025-01-01 00:00+00:00',
  },
];

describe('getRootEvaluatedExpressions', () => {
  it('should convert flat list of evaluated expression records to nested evaluated expressions', () => {
    expect(getRootEvaluatedExpressions(rows)).toEqual([
      new EvaluatedExpression(
        '51909b4d-7469-4244-bd09-10377e243495',
        'x',
        true,
        'and',
        new Map(Object.entries({ timestamp: '2025-01-01 00:00+00:00' })),
        [
          new EvaluatedExpression(
            'cc7e5523-9d7e-4df5-bf63-6ee81127feac',
            'a',
            true,
            null,
            new Map(Object.entries({ timestamp: null }))
          ),
          new EvaluatedExpression(
            '2d123c81-646b-4919-928d-bc55f517b623',
            'b',
            true,
            'not',
            new Map(Object.entries({ timestamp: null })),
            [
              new EvaluatedExpression(
                '52383124-b10a-4e5a-8f97-c9e7c28c7854',
                'c',
                false,
                null,
                new Map(Object.entries({ timestamp: null }))
              ),
            ]
          ),
        ]
      ),
      new EvaluatedExpression(
        'f27ad21d-989f-4f76-bb15-c64a3b6f400a',
        'y',
        4.2,
        null,
        new Map(Object.entries({ timestamp: '2025-01-01 00:00+00:00' }))
      ),
    ]);
  });
  it('should work even with empty input data', () => {
    expect(getRootEvaluatedExpressions([])).toEqual([]);
  });
});
