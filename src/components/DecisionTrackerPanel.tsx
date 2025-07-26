import { DataFrameView, PanelProps } from '@grafana/data'
import { UUID } from 'crypto'
import React, { useState } from 'react'
import './styles.css'

class EvaluatedExpression {
  id: UUID
  name: string | null
  value: any
  operator: string | null
  children: EvaluatedExpression[]

  constructor(id: UUID, name: string | null, value: any, operator: string | null) {
    this.id = id
    this.name = name
    this.value = value
    this.operator = operator
    this.children = []
  }
}

interface ExpressionComponentProps { evaluatedExpression: EvaluatedExpression }

const ExpressionComponent: React.FC<ExpressionComponentProps> = (props): React.JSX.Element => {
  const [childrenVisible, setChildrenVisible] = useState(false)

  let rows = []
  if (childrenVisible) {
    const indent = <div className="left-column">|</div>
    const children = props.evaluatedExpression.children
    if (children.length > 0) {
      rows.push(<>{indent}<div className='because'>because</div></>)
    }
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      rows.push(<ExpressionComponent evaluatedExpression={child} />)
      if (i < children.length - 1) {
        rows.push(
          <>{indent}<div className='operator'>{props.evaluatedExpression.operator}</div></>
        )
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
      >●</button>
      <div className='expression'>
        {`${props.evaluatedExpression.name} := ${props.evaluatedExpression.value}`}
      </div>
      <div></div>
      <div className='expressions-grid'>{rows}</div>
    </>
  )
}

export const DecisionTrackerPanel: React.FC<PanelProps> = ({ data }) => {
  const frame = data.series[0]
  const rows = new DataFrameView(frame).toArray()
  const evaluatedExpressions = rows.map(
    row => new EvaluatedExpression(row.id, row.name, row.value, row.operator)
  )
  const evaluatedExpressionsMap = new Map(evaluatedExpressions.map(ee => [ee.id, ee]))
  rows.forEach(
    row => {
      evaluatedExpressionsMap.get(row.parent_id)?.children.push(
        evaluatedExpressionsMap.get(row.id)!
      )
    }
  )
  const rootEvaluatedExpressions = rows.filter(row => row.parent_id === null).map(
    row => evaluatedExpressionsMap.get(row.id)!
  )
  const rootExpressionComponents = rootEvaluatedExpressions.map(
    ee => <ExpressionComponent evaluatedExpression={ee} key={ee.id} />
  )
  return <div className='expressions-grid'>{rootExpressionComponents}</div>
}
