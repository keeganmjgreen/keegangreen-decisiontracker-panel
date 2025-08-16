import { DataFrame, DataFrameView, GrafanaTheme2, PanelProps } from '@grafana/data';
import React, { useState } from 'react';
import {
  EvaluatedExpression,
  getRootEvaluatedExpressions,
  ONE,
  REQUIRED_FIELDS,
} from './EvaluatedExpression';
import { getExactlyOne } from './utils';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';

class Rows {
  divs: React.JSX.Element[];
  styles: any;

  constructor(styles: any) {
    this.divs = [];
    this.styles = styles;
  }

  appendLeftColumnDiv() {
    this.divs.push(
      <div key={this.divs.length} className={this.styles.leftColumn}>
        |
      </div>
    );
  }

  appendBecauseDiv() {
    this.appendLeftColumnDiv();
    this.divs.push(
      <div key={this.divs.length} className={this.styles.because}>
        because
      </div>
    );
  }

  appendOperatorDiv(operator: string) {
    this.appendLeftColumnDiv();
    this.divs.push(
      <div key={this.divs.length} className={this.styles.operator}>
        {operator}
      </div>
    );
  }

  appendOperandDivs(operand: EvaluatedExpression) {
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
  const styles = useStyles2(getStyles);

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

  let rows = new Rows(styles);
  if (childrenVisible && children.length > 0) {
    rows.appendBecauseDiv();
    let child = children[0];
    if (child.operator === 'inverse') {
      rows.appendOperandDivs(ONE);
      rows.appendOperatorDiv('divided by');
      rows.appendOperandDivs(getExactlyOne(child.children));
    } else {
      rows.appendOperandDivs(child);
    }
    for (let i = 1; i < children.length; i++) {
      child = children[i];
      if (operator === 'plus') {
        if (child.operator === 'negative') {
          rows.appendOperatorDiv('minus');
          child = getExactlyOne(child.children);
        } else {
          rows.appendOperatorDiv(operator as string);
        }
        if (child.operator === 'inverse') {
          rows.appendOperandDivs(ONE);
          rows.appendOperatorDiv('divided by');
          child = getExactlyOne(child.children);
        }
      } else if (operator === 'times' && child.operator === 'inverse') {
        rows.appendOperatorDiv('divided by');
        child = getExactlyOne(child.children);
      } else {
        rows.appendOperatorDiv(operator as string);
      }
      rows.appendOperandDivs(child);
    }
  }

  const expandCollapseButtonDisabled = children.length === 0;

  const metadata = Array.from(props.evaluatedExpression.metadata.values())
    .map((item) => (item !== null ? item.toString() : ''))
    .join(' ');

  return (
    <>
      <button
        className={styles.expandCollapseButton}
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
        <div className={styles.dot} />
      </button>
      <div className={styles.expression}>
        <div>{label}</div>
        <div className={styles.metadata}>{metadata}</div>
      </div>
      <div></div>
      <div className={styles.expressionsGrid}>{rows.divs}</div>
    </>
  );
};

interface DecisionTrackerProps {
  series: DataFrame[];
}

export const DecisionTracker: React.FC<DecisionTrackerProps> = (
  props
): React.JSX.Element => {
  const styles = useStyles2(getStyles);

  if (props.series.length === 0) {
    return <div>No data</div>;
  }
  const frame = props.series[0];
  const fields = frame.fields.map((f) => f.name);
  const missing_fields = REQUIRED_FIELDS.filter((f) => !fields.includes(f));
  if (missing_fields.length > 0) {
    return <div>Missing required field(s): {missing_fields.join(', ')}</div>;
  }
  const rootEvaluatedExpressions = getRootEvaluatedExpressions(
    new DataFrameView(frame).toArray()
  );
  const rootExpressionComponents = rootEvaluatedExpressions.map((ee) => (
    <div key={ee.id} className={styles.rootExpressionGrid}>
      <ExpressionComponent evaluatedExpression={ee} />
    </div>
  ));
  return <>{rootExpressionComponents}</>;
};

export const DecisionTrackerPanel: React.FC<PanelProps> = ({ data }) => {
  return <DecisionTracker series={data.series} />;
};

function getStyles(theme: GrafanaTheme2) {
  return {
    expressionsGrid: css({
      display: 'grid',
      gridTemplateColumns: 'max-content auto',
      columnGap: '10px',
    }),
    rootExpressionGrid: css({
      display: 'grid',
      gridTemplateColumns: 'max-content auto',
      columnGap: '10px',
      marginTop: '5px',
      borderTop: '1px solid rgba(127, 127, 127, 0.5)',
      paddingTop: '5px',
    }),
    leftColumn: css({
      display: 'flex',
      justifyContent: 'center',
      opacity: '0.5',
    }),
    expandCollapseButton: css({
      border: 'none',
      borderRadius: '50%',
      width: '25px',
      height: '25px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }),
    dot: css({
      borderRadius: '50%',
      height: '5px',
      width: '5px',
      backgroundColor: theme.colors.text.primary,
    }),
    expression: css({
      display: 'grid',
      gridTemplateColumns: 'max-content auto',
      alignItems: 'center',
      fontFamily: 'monospace',
    }),
    because: css({
      fontSize: 'small',
      opacity: '50%',
    }),
    metadata: css({
      fontSize: 'small',
      opacity: '50%',
      textAlign: 'right',
    }),
    operator: css({
      fontSize: 'small',
      opacity: '50%',
    }),
  };
}
