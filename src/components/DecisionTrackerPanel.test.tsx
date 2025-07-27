import { DataFrameView, toDataFrame } from '@grafana/data'
import { fireEvent, render, screen } from '@testing-library/react'
import { decisionTrackerPanel, EvaluatedExpression, GetRootEvaluatedExpressions } from './DecisionTrackerPanel'

const frame = toDataFrame(
  {
    fields: [
      {
        name: 'id',
        values: [
          '51909b4d-7469-4244-bd09-10377e243495',
          'cc7e5523-9d7e-4df5-bf63-6ee81127feac',
          '2d123c81-646b-4919-928d-bc55f517b623',
          '52383124-b10a-4e5a-8f97-c9e7c28c7854',
          'f27ad21d-989f-4f76-bb15-c64a3b6f400a'
        ]
      },
      {
        name: 'parent_id',
        values: [
          null,
          '51909b4d-7469-4244-bd09-10377e243495',
          '51909b4d-7469-4244-bd09-10377e243495',
          '2d123c81-646b-4919-928d-bc55f517b623',
          null
        ]
      },
      {
        name: 'name',
        values: [
          'x',
          'a',
          'b',
          'c',
          'y'
        ]
      },
      {
        name: 'value',
        values: [
          true,
          true,
          true,
          false,
          4.2
        ]
      },
      {
        name: 'operator',
        values: [
          'and',
          null,
          'not',
          null,
          null
        ]
      },
    ]
  }
)

describe(
  'GetRootEvaluatedExpressions',
  () => {
    it('should convert flat list of evaluated expression records to nested evaluated expressions', () => {
      expect(GetRootEvaluatedExpressions(new DataFrameView(frame))).toEqual(
        [
          new EvaluatedExpression(
            '51909b4d-7469-4244-bd09-10377e243495',
            'x',
            true,
            'and',
            [
              new EvaluatedExpression(
                'cc7e5523-9d7e-4df5-bf63-6ee81127feac',
                'a',
                true,
                null,
                []
              ),
              new EvaluatedExpression(
                '2d123c81-646b-4919-928d-bc55f517b623',
                'b',
                true,
                'not',
                [
                  new EvaluatedExpression(
                    '52383124-b10a-4e5a-8f97-c9e7c28c7854',
                    'c',
                    false,
                    null,
                    []
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
            []
          )
        ]
      )
    })
    it('should work even with empty input data', () => {
      const frame = toDataFrame([])
      expect(GetRootEvaluatedExpressions(new DataFrameView(frame))).toEqual(
        []
      )
    })
  }
)

describe(
  'DecisionTrackerPanel',
  () => {
    it('should render nested evaluated expressions', () => {
      render(decisionTrackerPanel([frame]))
      expect(screen.getByText('x := true')).toBeInTheDocument()
    })
    it('should enable expanding/collapsing of evaluated expressions via buttons', () => {
      render(decisionTrackerPanel([frame]))
      fireEvent.click(screen.getByTestId('51909b4d-7469-4244-bd09-10377e243495 button'))
      expect(screen.getByText('because')).toBeInTheDocument()
      expect(screen.getByText('a := true')).toBeInTheDocument()
      expect(screen.getByText('and')).toBeInTheDocument()
      expect(screen.getByText('b := true')).toBeInTheDocument()
    })
    it('should display "No data" in case panel data is empty', () => {
      render(decisionTrackerPanel([]))
      expect(screen.getByText('No data')).toBeInTheDocument()
    })
    it('should list any fields missing in panel data', () => {
      render(decisionTrackerPanel([toDataFrame([])]))
      expect(
        screen.getByText('Missing required field(s): id, parent_id, name, value, operator')
      ).toBeInTheDocument()
    })
  }
)
