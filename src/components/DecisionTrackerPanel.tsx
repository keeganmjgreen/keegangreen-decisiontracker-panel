import { DataFrame, DataFrameView, PanelProps } from '@grafana/data'
import { UUID } from 'crypto'
import React, { useState } from 'react'
import './styles.css'

export class EvaluatedExpression {
  id: UUID | null
  name: string | null
  value: any
  timestamp: string | null
  operator: string | null
  children: EvaluatedExpression[]

  constructor(
    id: UUID | null,
    name: string | null,
    value: any,
    operator: string | null,
    timestamp: string | null,
    children: EvaluatedExpression[]
  ) {
    this.id = id
    this.name = name
    this.value = value
    this.operator = operator
    this.timestamp = timestamp
    this.children = children
  }

  with(name: string | null, timestamp: string | null) {
    let copy = new EvaluatedExpression(
      this.id, this.name, this.value, this.operator, this.timestamp, this.children
    )
    copy.name = name
    copy.timestamp = timestamp
    return copy
  }

  label() {
    if (this.name === null) {
      return `${this.value}`
    } else {
      return `${this.name} := ${this.value}`
    }
  }
}

const ONE = new EvaluatedExpression(null, null, 1, null, null, [])

class Rows {
  divs: React.JSX.Element[]

  constructor() {
    this.divs = []
  }

  appendLeftColumnDiv() {
    this.divs.push(<div key={this.divs.length} className='left-column'>|</div>)
  }

  AppendBecauseDiv() {
    this.appendLeftColumnDiv()
    this.divs.push(<div key={this.divs.length} className='because'>because</div>)
  }

  AppendOperatorDiv(operator: string) {
    this.appendLeftColumnDiv()
    this.divs.push(<div key={this.divs.length} className='operator'>{operator}</div>)
  }

  AppendOperandDivs(operand: EvaluatedExpression) {
    this.divs.push(<ExpressionComponent key={this.divs.length} evaluatedExpression={operand} />)
  }
}

function getExactlyOne<Type>(array: Type[]) {
  if (array.length !== 1) {
    throw Error('The array must contain exactly one element.')
  }
  return array[0]
}

interface ExpressionComponentProps { evaluatedExpression: EvaluatedExpression }

const ExpressionComponent: React.FC<ExpressionComponentProps> = (props): React.JSX.Element => {
  const [childrenVisible, setChildrenVisible] = useState(false)

  const operator = props.evaluatedExpression.operator

  let label = props.evaluatedExpression.label()
  let children = props.evaluatedExpression.children
  if (operator === 'negative' || operator === 'inverse') {
    if (props.evaluatedExpression.name !== null) {
      label = props.evaluatedExpression.label()
      children = [props.evaluatedExpression.with(null, null)]
    } else {
      label = getExactlyOne(children).label()
      if (operator === 'negative') {
        label = `-(${label})`
        children = getExactlyOne(children).children
      } else {
        children = props.evaluatedExpression.children
      }
    }
  }

  let rows = new Rows()
  if (childrenVisible && children.length > 0) {
    rows.AppendBecauseDiv()
    let child = children[0]
    if (child.operator === 'inverse') {
      rows.AppendOperandDivs(ONE)
      rows.AppendOperatorDiv('divided by')
      rows.AppendOperandDivs(getExactlyOne(child.children))
    } else {
      rows.AppendOperandDivs(child)
    }
    for (let i = 1; i < children.length; i++) {
      child = children[i]
      if (operator === 'plus') {
        if (child.operator === 'negative') {
          rows.AppendOperatorDiv('minus')
          child = getExactlyOne(child.children)
        } else {
          rows.AppendOperatorDiv(operator as string)
        }
        if (child.operator === 'inverse') {
          rows.AppendOperandDivs(ONE)
          rows.AppendOperatorDiv('divided by')
          child = getExactlyOne(child.children)
        }
      } else if (operator === 'times' && child.operator === 'inverse') {
        rows.AppendOperatorDiv('divided by')
        child = getExactlyOne(child.children)
      } else {
        rows.AppendOperatorDiv(operator as string)
      }
      rows.AppendOperandDivs(child)
    }
  }

  const expandCollapseButtonDisabled = children.length === 0

  return (
    <>
      <button
        className='expand-collapse-button'
        onClick={() => setChildrenVisible(!childrenVisible)}
        disabled={expandCollapseButtonDisabled}
        style={
          {
            backgroundColor: (
              expandCollapseButtonDisabled ? 'transparent' : (
                childrenVisible ? 'rgba(127,127,127,0.5)' : 'rgba(127,127,127,0.2)'
              )
            )
          }
        }
        data-testid={`${props.evaluatedExpression.id} button`}
      >●</button>
      <div className='expression'>
        <div>{label}</div>
        <div className='metadata'>{props.evaluatedExpression.timestamp}</div>
      </div>
      <div></div>
      <div className='expressions-grid'>{rows.divs}</div>
    </>
  )
}

export const GetRootEvaluatedExpressions = (view: DataFrameView) => {
  const rows = view.toArray()
  const evaluatedExpressions = rows.map(
    row => new EvaluatedExpression(row.id, row.name, row.value, row.operator, row.timestamp, [])
  )
  const evaluatedExpressionsMap = new Map(evaluatedExpressions.map(ee => [ee.id, ee]))
  rows.forEach(
    row => {
      evaluatedExpressionsMap.get(row.parent_id)?.children.push(
        evaluatedExpressionsMap.get(row.id)!
      )
    }
  )
  return rows.filter(row => row.parent_id === null).map(
    row => evaluatedExpressionsMap.get(row.id)!
  )
}

export const decisionTrackerPanel = (series: DataFrame[]) => {
  if (series.length === 0) {
    return <div>No data</div>
  }
  const frame = series[0]
  const fields = frame.fields.map(f => f.name)
  const req_fields = ['id', 'parent_id', 'name', 'value', 'operator', 'timestamp']
  const missing_fields = req_fields.filter(f => !fields.includes(f))
  if (missing_fields.length > 0) {
    return <div>Missing required field(s): {missing_fields.join(', ')}</div>
  }
  const rootEvaluatedExpressions = GetRootEvaluatedExpressions(new DataFrameView(frame))
  const rootExpressionComponents = rootEvaluatedExpressions.map(
    ee => (
      <div key={ee.id} className='root-expression-grid'>
        <ExpressionComponent evaluatedExpression={ee} />
      </div>
    )
  )
  return <>{rootExpressionComponents}</>
}

export const DecisionTrackerPanel: React.FC<PanelProps> = ({ data }) => {
  return decisionTrackerPanel(data.series)
}
