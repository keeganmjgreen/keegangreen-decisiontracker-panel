import { toDataFrame } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { DecisionTracker } from './DecisionTrackerPanel';
import React from 'react';

const frame = toDataFrame({
  fields: [
    {
      name: 'id',
      values: [
        '51909b4d-7469-4244-bd09-10377e243495',
        'cc7e5523-9d7e-4df5-bf63-6ee81127feac',
        '2d123c81-646b-4919-928d-bc55f517b623',
        '52383124-b10a-4e5a-8f97-c9e7c28c7854',
        'f27ad21d-989f-4f76-bb15-c64a3b6f400a',
      ],
    },
    {
      name: 'parent_id',
      values: [
        null,
        '51909b4d-7469-4244-bd09-10377e243495',
        '51909b4d-7469-4244-bd09-10377e243495',
        '2d123c81-646b-4919-928d-bc55f517b623',
        null,
      ],
    },
    {
      name: 'name',
      values: ['x', 'a', 'b', 'c', 'y'],
    },
    {
      name: 'value',
      values: [true, true, true, false, 4.2],
    },
    {
      name: 'operator',
      values: ['and', null, 'not', null, null],
    },
    {
      name: 'timestamp',
      values: [
        '2025-01-01 00:00+00:00',
        null,
        null,
        null,
        '2025-01-01 00:00+00:00',
      ],
    },
  ],
});

describe('DecisionTrackerPanel', () => {
  it('should render nested evaluated expressions', () => {
    render(<DecisionTracker series={[frame]} />);
    expect(screen.getByText('x := true')).toBeInTheDocument();
  });
  it('should enable expanding/collapsing of evaluated expressions via buttons', () => {
    render(<DecisionTracker series={[frame]} />);
    fireEvent.click(
      screen.getByTestId('51909b4d-7469-4244-bd09-10377e243495 button')
    );
    expect(screen.getByText('because')).toBeInTheDocument();
    expect(screen.getByText('a := true')).toBeInTheDocument();
    expect(screen.getByText('and')).toBeInTheDocument();
    expect(screen.getByText('b := true')).toBeInTheDocument();
  });
  it('should display "No data" in case panel data is empty', () => {
    render(<DecisionTracker series={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
  it('should list any fields missing in panel data', () => {
    render(<DecisionTracker series={[toDataFrame([])]} />);
    expect(
      screen.getByText(
        'Missing required field(s): id, parent_id, name, value, operator'
      )
    ).toBeInTheDocument();
  });
  it('should render a named negative expression in two levels where the second is ["-(name := value)"]', () => {
    render(
      <DecisionTracker
        series={[
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [
                  '3ab1cccc-53c3-47b0-af3a-500976d1afac',
                  '53d655c4-ecda-4741-8532-f3ba296be09a',
                ],
              },
              {
                name: 'parent_id',
                values: [null, '3ab1cccc-53c3-47b0-af3a-500976d1afac'],
              },
              {
                name: 'name',
                values: ['a', 'b'],
              },
              {
                name: 'value',
                values: [-1, 1],
              },
              {
                name: 'operator',
                values: ['negative', null],
              },
              {
                name: 'timestamp',
                values: [null, null],
              },
            ],
          }),
        ]}
      />
    );
    expect(screen.getByText('a := -1')).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId('3ab1cccc-53c3-47b0-af3a-500976d1afac button')
    );
    expect(screen.getByText('-(b := 1)')).toBeInTheDocument();
  });
  it('should render an unnamed negative expression in the beginning of a sum expression as ["-(operand.name := value)", ...]', () => {
    render(
      <DecisionTracker
        series={[
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [
                  'ea4095f5-9b60-49d4-9d8d-8df04b56b368',
                  '3f55fc30-621f-4315-ad3b-60d5948fb48a',
                  'a2a1fd97-f866-4685-bd1b-908e4cc48d52',
                  '18dcbf65-bb81-48a2-a882-23a67a007884',
                ],
              },
              {
                name: 'parent_id',
                values: [
                  null,
                  'ea4095f5-9b60-49d4-9d8d-8df04b56b368',
                  '3f55fc30-621f-4315-ad3b-60d5948fb48a',
                  'ea4095f5-9b60-49d4-9d8d-8df04b56b368',
                ],
              },
              {
                name: 'name',
                values: ['a', null, 'b', 'c'],
              },
              {
                name: 'value',
                values: [2, -1, 1, 3],
              },
              {
                name: 'operator',
                values: ['plus', 'negative', null, null],
              },
              {
                name: 'timestamp',
                values: [null, null, null, null],
              },
            ],
          }),
        ]}
      />
    );
    expect(screen.getByText('a := 2')).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId('ea4095f5-9b60-49d4-9d8d-8df04b56b368 button')
    );
    expect(screen.getByText('-(b := 1)')).toBeInTheDocument();
    expect(screen.getByText('plus')).toBeInTheDocument();
    expect(screen.getByText('c := 3')).toBeInTheDocument();
  });
  it('should render an unnamed negative expression in the beginning of a product expression as ["-(operand.name := value)", ...]', () => {
    render(
      <DecisionTracker
        series={[
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [
                  'f46aa217-ef63-4033-a965-24009e7dd2cd',
                  '50a6e3c1-932a-4998-a0fa-5c501177c464',
                  'c06c7eea-5f17-4b1d-9f3b-3bd5b269873f',
                  'b3c8ea41-01f9-4d59-bbf0-f37f571ed1db',
                ],
              },
              {
                name: 'parent_id',
                values: [
                  null,
                  'f46aa217-ef63-4033-a965-24009e7dd2cd',
                  '50a6e3c1-932a-4998-a0fa-5c501177c464',
                  'f46aa217-ef63-4033-a965-24009e7dd2cd',
                ],
              },
              {
                name: 'name',
                values: ['a', null, 'b', 'c'],
              },
              {
                name: 'value',
                values: [-3, -1, 1, 3],
              },
              {
                name: 'operator',
                values: ['times', 'negative', null, null],
              },
              {
                name: 'timestamp',
                values: [null, null, null, null],
              },
            ],
          }),
        ]}
      />
    );
    expect(screen.getByText('a := -3')).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId('a := -3 button')
    );
    expect(screen.getByText('-(b := 1)')).toBeInTheDocument();
    expect(screen.getByText('times')).toBeInTheDocument();
    expect(screen.getByText('c := 3')).toBeInTheDocument();
  });
  it('should render an unnamed negative expression in the middle or end of a sum or product expression as [..., "minus", "name := value", ...]', () => {
    render(
      <DecisionTracker
        series={[
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [
                  '99be468e-10e2-4021-bafa-76b5c087b8f1',
                  '42a753e7-8b1e-42f4-9f49-806c5b95f9ae',
                  '137b1ef7-5350-4e30-a372-a8bc97f75ec0',
                  'b9c5b3b5-84ae-4c37-a7d1-a2c3b6ea61b0',
                ],
              },
              {
                name: 'parent_id',
                values: [
                  null,
                  '99be468e-10e2-4021-bafa-76b5c087b8f1',
                  '99be468e-10e2-4021-bafa-76b5c087b8f1',
                  '137b1ef7-5350-4e30-a372-a8bc97f75ec0',
                ],
              },
              {
                name: 'name',
                values: ['a', 'b', null, 'c'],
              },
              {
                name: 'value',
                values: [2, 3, -1, 1],
              },
              {
                name: 'operator',
                values: ['plus', null, 'negative', null],
              },
              {
                name: 'timestamp',
                values: [null, null, null, null],
              },
            ],
          }),
        ]}
      />
    );
    expect(screen.getByText('a := 2')).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId('99be468e-10e2-4021-bafa-76b5c087b8f1 button')
    );
    expect(screen.getByText('b := 3')).toBeInTheDocument();
    expect(screen.getByText('minus')).toBeInTheDocument();
    expect(screen.getByText('c := 1')).toBeInTheDocument();
  });
  it('should render a named inverse expression in two levels where the second is ["1", "divided by", "name := value"]', () => {
    render(
      <DecisionTracker
        series={[
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [
                  '5bd0c93d-f164-484e-b45a-fd2b33f072e2',
                  '07c69e52-9345-44f7-967f-255a7b014995',
                ],
              },
              {
                name: 'parent_id',
                values: [null, '5bd0c93d-f164-484e-b45a-fd2b33f072e2'],
              },
              {
                name: 'name',
                values: ['a', 'b'],
              },
              {
                name: 'value',
                values: [0.5, 2],
              },
              {
                name: 'operator',
                values: ['inverse', null],
              },
              {
                name: 'timestamp',
                values: [null, null],
              },
            ],
          }),
        ]}
      />
    );
    expect(screen.getByText('a := 0.5')).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId('5bd0c93d-f164-484e-b45a-fd2b33f072e2 button')
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('divided by')).toBeInTheDocument();
    expect(screen.getByText('b := 2')).toBeInTheDocument();
  });
  it('should render an unnamed inverse expression in the beginning of a sum or product expression as ["1", "divided by", "name := value", ...]', () => {
    render(
      <DecisionTracker
        series={[
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [
                  '8cbc55dd-6240-4fa4-8689-d29bcb364f2a',
                  '1fab7186-c1de-4d58-905b-727d4c10cdfb',
                  '3574315e-4053-4ea6-a43f-9b8bf1bd1558',
                  '2e2efa71-f7ae-447c-a7d5-7e8a3201df7c',
                ],
              },
              {
                name: 'parent_id',
                values: [
                  null,
                  '8cbc55dd-6240-4fa4-8689-d29bcb364f2a',
                  '1fab7186-c1de-4d58-905b-727d4c10cdfb',
                  '8cbc55dd-6240-4fa4-8689-d29bcb364f2a',
                ],
              },
              {
                name: 'name',
                values: ['a', null, 'b', 'c'],
              },
              {
                name: 'value',
                values: [1.5, 0.5, 2, 3],
              },
              {
                name: 'operator',
                values: ['times', 'inverse', null, null],
              },
              {
                name: 'timestamp',
                values: [null, null, null, null],
              },
            ],
          }),
        ]}
      />
    );
    expect(screen.getByText('a := 1.5')).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId('8cbc55dd-6240-4fa4-8689-d29bcb364f2a button')
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('divided by')).toBeInTheDocument();
    expect(screen.getByText('b := 2')).toBeInTheDocument();
    expect(screen.getByText('times')).toBeInTheDocument();
    expect(screen.getByText('c := 3')).toBeInTheDocument();
  });
  it('should render an unnamed inverse expression in the middle or end of a sum expression as [..., "1", "divided by", "name := value", ...]', () => {
    render(
      <DecisionTracker
        series={[
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [
                  'e2f0de75-e212-460b-8fc3-1825bb371690',
                  '7767fd04-b110-401d-966e-feb40d7a0f8d',
                  '235290b7-4feb-445d-a789-5583551c6aab',
                  'd2adc5d9-6b20-4bb0-b7ea-a1b152bc6709',
                ],
              },
              {
                name: 'parent_id',
                values: [
                  null,
                  'e2f0de75-e212-460b-8fc3-1825bb371690',
                  'e2f0de75-e212-460b-8fc3-1825bb371690',
                  '235290b7-4feb-445d-a789-5583551c6aab',
                ],
              },
              {
                name: 'name',
                values: ['a', 'b', null, 'c'],
              },
              {
                name: 'value',
                values: [3.5, 3, 0.5, 2],
              },
              {
                name: 'operator',
                values: ['plus', null, 'inverse', null],
              },
              {
                name: 'timestamp',
                values: [null, null, null, null],
              },
            ],
          }),
        ]}
      />
    );
    expect(screen.getByText('a := 3.5')).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId('a := 3.5 button')
    );
    expect(screen.getByText('b := 3')).toBeInTheDocument();
    expect(screen.getByText('plus')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('divided by')).toBeInTheDocument();
    expect(screen.getByText('c := 2')).toBeInTheDocument();
  });
  it('should render an unnamed inverse expression in the middle or end of a product expression as [..., "divided by", "name := value", ...]', () => {
    render(
      <DecisionTracker
        series={[
          toDataFrame({
            fields: [
              {
                name: 'id',
                values: [
                  'be218b8c-bc7c-4ed2-ae8c-e59df990385e',
                  'cd9875c9-3a96-487b-a6b2-662dea8d4833',
                  '3e195ed9-e410-4c32-bc18-ebffa0953e7d',
                  '564b7d39-8dc1-42af-8655-1d4e4e3f56e8',
                ],
              },
              {
                name: 'parent_id',
                values: [
                  null,
                  'be218b8c-bc7c-4ed2-ae8c-e59df990385e',
                  'be218b8c-bc7c-4ed2-ae8c-e59df990385e',
                  '3e195ed9-e410-4c32-bc18-ebffa0953e7d',
                ],
              },
              {
                name: 'name',
                values: ['a', 'b', null, 'c'],
              },
              {
                name: 'value',
                values: [1.5, 3, 0.5, 2],
              },
              {
                name: 'operator',
                values: ['times', null, 'inverse', null],
              },
              {
                name: 'timestamp',
                values: [null, null, null, null],
              },
            ],
          }),
        ]}
      />
    );
    expect(screen.getByText('a := 1.5')).toBeInTheDocument();
    fireEvent.click(
      screen.getByTestId('be218b8c-bc7c-4ed2-ae8c-e59df990385e button')
    );
    expect(screen.getByText('b := 3')).toBeInTheDocument();
    expect(screen.getByText('divided by')).toBeInTheDocument();
    expect(screen.getByText('c := 2')).toBeInTheDocument();
  });
});
