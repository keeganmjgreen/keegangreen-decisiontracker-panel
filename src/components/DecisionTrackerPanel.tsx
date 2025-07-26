import { DataFrameView, PanelProps } from '@grafana/data'
import { UUID } from 'crypto'
import React, { useState } from 'react'
import './styles.css'

export class EvaluatedExpression {
  id: UUID
  name: string | null
  value: any
  operator: string | null
  children: EvaluatedExpression[]

  constructor(id: UUID, name: string | null, value: any, operator: string | null, children: EvaluatedExpression[]) {
    this.id = id
    this.name = name
    this.value = value
    this.operator = operator
    this.children = children
  }
}

interface ExpressionComponentProps { evaluatedExpression: EvaluatedExpression }

const ExpressionComponent: React.FC<ExpressionComponentProps> = (props): React.JSX.Element => {
  const [childrenVisible, setChildrenVisible] = useState(false)

  let rows = []
  if (childrenVisible) {
    const children = props.evaluatedExpression.children
    if (children.length > 0) {
      rows.push(<div key={rows.length} className='left-column'>|</div>)
      rows.push(<div key={rows.length} className='because'>because</div>)
    }
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      rows.push(<ExpressionComponent key={rows.length} evaluatedExpression={child} />)
      if (i < children.length - 1) {
        rows.push(<div key={rows.length} className='left-column'>|</div>)
        rows.push(<div key={rows.length} className='operator'>{props.evaluatedExpression.operator}</div>)
      }
    }
  }
  const expandCollapseButtonDisabled = props.evaluatedExpression.children.length === 0
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
        {`${props.evaluatedExpression.name} := ${props.evaluatedExpression.value}`}
      </div>
      <div></div>
      <div className='expressions-grid'>{rows}</div>
    </>
  )
}

export const GetRootEvaluatedExpressions = (view: DataFrameView) => {
  const rows = view.toArray()
  const evaluatedExpressions = rows.map(
    row => new EvaluatedExpression(row.id, row.name, row.value, row.operator, [])
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

export const DecisionTrackerPanel: React.FC<PanelProps> = ({ data }) => {
  if (data.series.length === 0) {
    return <div>No data</div>
  }
  const frame = data.series[0]
  const fields = frame.fields.map(f => f.name)
  const req_fields = ['id', 'parent_id', 'name', 'value', 'operator']
  const missing_fields = req_fields.filter(f => !fields.includes(f))
  if (missing_fields.length > 0) {
    return <div>Missing required field(s): {missing_fields.join(', ')}</div>
  }
  const rootEvaluatedExpressions = GetRootEvaluatedExpressions(new DataFrameView(frame))
  const rootExpressionComponents = rootEvaluatedExpressions.map(
    ee => <ExpressionComponent evaluatedExpression={ee} key={ee.id} />
  )
  return <div className='expressions-grid'>{rootExpressionComponents}</div>
}
