import { DataFrame, DataFrameView, PanelProps } from '@grafana/data';
import React, { useState } from 'react';
import './styles.css';
import {
  EvaluatedExpression,
  getRootEvaluatedExpressions,
  ONE,
  REQUIRED_FIELDS,
} from './EvaluatedExpression';
import { getExactlyOne } from './utils';

class Rows {
  divs: React.JSX.Element[];

  constructor() {
    this.divs = [];
  }

  appendLeftColumnDiv() {
    this.divs.push(
      <div key={this.divs.length} className="left-column">
        |
      </div>
    );
  }

  AppendBecauseDiv() {
    this.appendLeftColumnDiv();
    this.divs.push(
      <div key={this.divs.length} className="because">
        because
      </div>
    );
  }

  AppendOperatorDiv(operator: string) {
    this.appendLeftColumnDiv();
    this.divs.push(
      <div key={this.divs.length} className="operator">
        {operator}
      </div>
    );
  }

  AppendOperandDivs(operand: EvaluatedExpression) {
    this.divs.push(
      <ExpressionComponent
        key={this.divs.length}
        evaluatedExpression={operand}
      />
    );
  }
}

interface ExpressionComponentProps {
  evaluatedExpression: EvaluatedExpression;
}

const ExpressionComponent: React.FC<ExpressionComponentProps> = (
  props
): React.JSX.Element => {
  const [childrenVisible, setChildrenVisible] = useState(false);

  const operator = props.evaluatedExpression.operator;

  let label = props.evaluatedExpression.label();
  let children = props.evaluatedExpression.children;
  if (operator === 'negative' || operator === 'inverse') {
    if (props.evaluatedExpression.name !== null) {
      label = props.evaluatedExpression.label();
      children = [props.evaluatedExpression.with(null, new Map())];
    } else {
      label = getExactlyOne(children).label();
      if (operator === 'negative') {
        label = `-(${label})`;
        children = getExactlyOne(children).children;
      } else {
        children = props.evaluatedExpression.children;
      }
    }
  }

  let rows = new Rows();
  if (childrenVisible && children.length > 0) {
    rows.AppendBecauseDiv();
    let child = children[0];
    if (child.operator === 'inverse') {
      rows.AppendOperandDivs(ONE);
      rows.AppendOperatorDiv('divided by');
      rows.AppendOperandDivs(getExactlyOne(child.children));
    } else {
      rows.AppendOperandDivs(child);
    }
    for (let i = 1; i < children.length; i++) {
      child = children[i];
      if (operator === 'plus') {
        if (child.operator === 'negative') {
          rows.AppendOperatorDiv('minus');
          child = getExactlyOne(child.children);
        } else {
          rows.AppendOperatorDiv(operator as string);
        }
        if (child.operator === 'inverse') {
          rows.AppendOperandDivs(ONE);
          rows.AppendOperatorDiv('divided by');
          child = getExactlyOne(child.children);
        }
      } else if (operator === 'times' && child.operator === 'inverse') {
        rows.AppendOperatorDiv('divided by');
        child = getExactlyOne(child.children);
      } else {
        rows.AppendOperatorDiv(operator as string);
      }
      rows.AppendOperandDivs(child);
    }
  }

  const expandCollapseButtonDisabled = children.length === 0;

  const metadata = Array.from(props.evaluatedExpression.metadata.values())
    .map((item) => (item !== null ? item.toString() : ''))
    .join(' ');

  return (
    <>
      <button
        className="expand-collapse-button"
        onClick={() => setChildrenVisible(!childrenVisible)}
        disabled={expandCollapseButtonDisabled}
        style={{
          backgroundColor: expandCollapseButtonDisabled
            ? 'transparent'
            : childrenVisible
            ? 'rgba(127,127,127,0.5)'
            : 'rgba(127,127,127,0.2)',
        }}
        data-testid={`${props.evaluatedExpression.id} button`}
      >
        ●
      </button>
      <div className="expression">
        <div>{label}</div>
        <div className="metadata">{metadata}</div>
      </div>
      <div></div>
      <div className="expressions-grid">{rows.divs}</div>
    </>
  );
};

export const decisionTrackerPanel = (series: DataFrame[]) => {
  if (series.length === 0) {
    return <div>No data</div>;
  }
  const frame = series[0];
  const fields = frame.fields.map((f) => f.name);
  const missing_fields = REQUIRED_FIELDS.filter((f) => !fields.includes(f));
  if (missing_fields.length > 0) {
    return <div>Missing required field(s): {missing_fields.join(', ')}</div>;
  }
  const rootEvaluatedExpressions = getRootEvaluatedExpressions(
    new DataFrameView(frame).toArray()
  );
  const rootExpressionComponents = rootEvaluatedExpressions.map((ee) => (
    <div key={ee.id} className="root-expression-grid">
      <ExpressionComponent evaluatedExpression={ee} />
    </div>
  ));
  return <>{rootExpressionComponents}</>;
};

export const DecisionTrackerPanel: React.FC<PanelProps> = ({ data }) => {
  return decisionTrackerPanel(data.series);
};
