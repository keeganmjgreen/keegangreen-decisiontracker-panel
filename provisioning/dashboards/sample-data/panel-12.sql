INSERT INTO decision_tracker.evaluated_expression
(id                                    , parent_id                             , name           , value, operator                     ) VALUES
('22e62b1a-09a0-4dba-af5b-59bde1d12e33', NULL                                  , 'output'       , TRUE , 'and'                        ),
('400ca2a5-1076-4e2d-ace0-a44ff51b51ff', '22e62b1a-09a0-4dba-af5b-59bde1d12e33', NULL           , TRUE , 'or'                         ),
('e771a4ee-5dfd-4404-8e8a-6ec116ecd648', '400ca2a5-1076-4e2d-ace0-a44ff51b51ff', 'my_comparison', TRUE , 'is greater than or equal to'),
('93b3398a-89a3-4187-91f5-4177fd55ff8c', 'e771a4ee-5dfd-4404-8e8a-6ec116ecd648', NULL           , 9    , 'times'                      ),
('7835c554-39f9-4089-99b6-7768154fc6ad', '93b3398a-89a3-4187-91f5-4177fd55ff8c', 'my_sum'       , 3    , 'plus'                       ),
('e660104d-6e4e-4b5b-a75d-f06966699289', '7835c554-39f9-4089-99b6-7768154fc6ad', 'a'            , 1    , NULL                         ),
('ae1628aa-abc2-443a-a420-ac98b9fe5456', '7835c554-39f9-4089-99b6-7768154fc6ad', 'b'            , 2    , NULL                         ),
('15dbc677-f86c-4538-b3f1-3db3644516e0', '93b3398a-89a3-4187-91f5-4177fd55ff8c', 'c'            , 3    , NULL                         ),
('da26a44b-27ce-4347-a533-6e2300b70f24', 'e771a4ee-5dfd-4404-8e8a-6ec116ecd648', NULL           , 3.8  , 'plus'                       ),
('3ff90605-0cfb-45d3-bea3-547c12023992', 'da26a44b-27ce-4347-a533-6e2300b70f24', 'd'            , 4    , NULL                         ),
('8861f456-a30e-41d1-ae8e-3d0386ed250d', 'da26a44b-27ce-4347-a533-6e2300b70f24', NULL           , -0.2 , 'negative'                   ),
('84766f0d-c5c5-4003-a80d-06029fa739f0', '8861f456-a30e-41d1-ae8e-3d0386ed250d', NULL           , 0.2  , 'inverse'                    ),
('239d8b28-e852-42ae-b21d-baf58fbebef8', '84766f0d-c5c5-4003-a80d-06029fa739f0', 'f'            , 5    , NULL                         ),
('76d1f6c3-878a-4c02-b5ce-00cf63fe2fc1', '400ca2a5-1076-4e2d-ace0-a44ff51b51ff', 'g'            , FALSE, NULL                         ),
('c42505af-3ecc-4d3b-b0d1-f7d92e5d6195', '22e62b1a-09a0-4dba-af5b-59bde1d12e33', 'h'            , TRUE , NULL                         );

INSERT INTO decision_tracker.evaluated_expression_metadata
(evaluated_expression_id               , timestamp               ) VALUES
('22e62b1a-09a0-4dba-af5b-59bde1d12e33', '2025-01-01 00:00+00:00');
