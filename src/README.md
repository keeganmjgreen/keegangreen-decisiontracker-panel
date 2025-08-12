# DecisionTracker Grafana panel

![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.downloads&url=https://grafana.com/api/plugins/keegangreen-decisiontracker-panel&label=Downloads&prefix=v&color=F47A20)
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.version&url=https://grafana.com/api/plugins/keegangreen-decisiontracker-panel&label=Version&prefix=v&color=F47A20)
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.grafanaDependency&url=https://grafana.com/api/plugins/keegangreen-decisiontracker-panel&label=Grafana%20Dependency&prefix=v&color=F47A20)
![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.versionSignatureType&url=https://grafana.com/api/plugins/keegangreen-decisiontracker-panel&label=Signature%20Type&prefix=v&color=F47A20)

The DecisionTracker panel is a Grafana plugin for interactively viewing evaluated expressions saved to your database by [DecisionTracker](https://github.com/keeganmjgreen/decision_tracker) – a Python library for writing explainable, traceable, and auditable Python programs.

Here's a screenshot and screen recording of the panel with sample data:

 <div style="display: grid; grid-template-columns: 50% 50%;">
  <img src="https://raw.githubusercontent.com/keeganmjgreen/keegangreen-decisiontracker-panel/refs/heads/master/src/img/screenshot.png" style="padding-right:5px"></img>
  <img src="https://raw.githubusercontent.com/keeganmjgreen/keegangreen-decisiontracker-panel/refs/heads/master/src/img/screencast.gif" style="padding-left:5px"></img>
</div>
<p>

This is a bit easier to digest than the following plaintext representation! (Plus, the panel shows the value of intermediate expressions – though they are calculated not by the panel, but by the Python library, and stored in the database.)

```
output := true because ((my_comparison := ((my_sum := (a := 1) + (b := 2)) * (c := 3)) >= ((d := 4) - 1 / (f := 5))) or (g := False)) and (h := True)
```

The panel ingests evaluated expressions stored in the following data format:

| id (UUID)     | parent_id (UUID NULL) | name (TEXT NULL) | value (JSONB) | operator (VARCHAR(30) NULL)   | timestamp (TIMESTAMPTZ)  |
| ------------- | --------------------- | ---------------- | ------------- | ----------------------------- | ------------------------ |
| '22e62b1a...' | NULL                  | 'output'         | TRUE          | 'and'                         | '2025-01-01 00:00+00:00' |
| '400ca2a5...' | '22e62b1a...'         | NULL             | TRUE          | 'or'                          | NULL                     |
| 'e771a4ee...' | '400ca2a5...'         | 'my_comparison'  | TRUE          | 'is greater than or equal to' | NULL                     |
| '93b3398a...' | 'e771a4ee...'         | NULL             | 9             | 'times'                       | NULL                     |
| '7835c554...' | '93b3398a...'         | 'my_sum'         | 3             | 'plus'                        | NULL                     |
| 'e660104d...' | '7835c554...'         | 'a'              | 1             | NULL                          | NULL                     |
| (9 more rows) | ...                   | ...              | ...           | ...                           | ...                      |

Such records can be stored in your database by the DecisionTracker Python library and fetched for the dashboard's selected time range using a panel query like the following:

```sql
SELECT ee.id, ee.parent_id, ee.name, ee.value, ee.operator, md.timestamp
FROM decision_tracker.evaluated_expression ee
LEFT JOIN decision_tracker.evaluated_expression.metadata md
ON ee.id = md.evaluated_expression_id
WHERE $__timeFilter(md.timestamp)
```

`id`, `parent_id`, `name`, `value`, and `operator` are the only required columns. Any additional columns present in the panel's input data, including the `timestamp` in the above example, will form the "metadata" for each evaluated expression and be displayed on the right side of the panel. Columns like `timestamp` are optional but obviously recommended to allow filtering a large number of database records to display only relevant ones. Depending on your use case, it may be useful to store, query, filter by, and optionally display additional metadata columns, such as a `service_id`. Even if you integrate DecisionTracker with only one of your services at first, having additional metadata column(s) (e.g., `service_id`) helps to be able to onboard additional services and differentiate between their records. And, for example, if your service makes decisions for multiple customers, then a `customer_id` column would be called for.
