import { UUID } from 'crypto';

export class EvaluatedExpression {
  id: UUID | null;
  name: string | null;
  value: any;
  operator: string | null;
  metadata: Map<string, any>;
  children: EvaluatedExpression[];

  constructor(
    id: UUID | null,
    name: string | null,
    value: any,
    operator: string | null,
    metadata: Map<string, any> = new Map(),
    children: EvaluatedExpression[] = []
  ) {
    this.id = id;
    this.name = name;
    this.value = value;
    this.operator = operator;
    this.metadata = metadata;
    this.children = children;
  }

  with(name: string | null, metadata: Map<string, any>) {
    let copy = new EvaluatedExpression(
      this.id,
      this.name,
      this.value,
      this.operator,
      this.metadata,
      this.children
    );
    copy.name = name;
    copy.metadata = metadata;
    return copy;
  }

  label() {
    if (this.name === null) {
      return `${this.value}`;
    } else {
      return `${this.name} := ${this.value}`;
    }
  }
}

export const ONE = new EvaluatedExpression(null, null, 1, null);

export const REQUIRED_FIELDS = ['id', 'parent_id', 'name', 'value', 'operator'];

export const getRootEvaluatedExpressions = (rows: any[]) => {
  const evaluatedExpressions = rows.map(
    (row) =>
      new EvaluatedExpression(
        row.id,
        row.name,
        row.value,
        row.operator,
        new Map<string, any>(
          Object.entries(row).filter(
            ([key, _]) => !REQUIRED_FIELDS.includes(key)
          )
        )
      )
  );
  const evaluatedExpressionsMap = new Map(
    evaluatedExpressions.map((ee) => [ee.id, ee])
  );
  rows.forEach((row) => {
    evaluatedExpressionsMap
      .get(row.parent_id)
      ?.children.push(evaluatedExpressionsMap.get(row.id)!);
  });
  return rows
    .filter((row) => row.parent_id === null)
    .map((row) => evaluatedExpressionsMap.get(row.id)!);
};
