<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
$xpdo_meta_map['ClientGridColumn'] = [
    'package'       => 'clientgrid',
    'version'       => '1.0',
    'table'         => 'clientgrid_column',
    'extends'       => 'xPDOSimpleObject',
    'tableMeta'     => [
        'engine'        => 'InnoDB'
    ],
    'fields'        => [
        'id'            => null,
        'grid_id'       => null,
        'field_id'      => null,
        'name'          => null,
        'render'        => null,
        'fixed'         => null,
        'width'         => null,
        'menuindex'     => null,
        'active'        => null,
        'editedon'      => null
    ],
    'fieldMeta'     => [
        'id'            => [
            'dbtype'        => 'int',
            'precision'     => '11',
            'phptype'       => 'integer',
            'null'          => false,
            'index'         => 'pk',
            'generated'     => 'native'
        ],
        'grid_id'       => [
            'dbtype'        => 'int',
            'precision'     => '11',
            'phptype'       => 'integer',
            'null'          => false
        ],
        'field_id'      => [
            'dbtype'        => 'int',
            'precision'     => '11',
            'phptype'       => 'integer',
            'null'          => false
        ],
        'name'          => [
            'dbtype'        => 'varchar',
            'precision'     => '75',
            'phptype'       => 'string',
            'null'          => false
        ],
        'render'        => [
            'dbtype'        => 'varchar',
            'precision'     => '75',
            'phptype'       => 'string',
            'null'          => false
        ],
        'fixed'         => [
            'dbtype'        => 'int',
            'precision'     => '1',
            'phptype'       => 'integer',
            'null'          => false,
            'default'       => 0
        ],
        'width'          => [
            'dbtype'        => 'int',
            'precision'     => '3',
            'phptype'       => 'integer',
            'null'          => false,
            'default'       => 0
        ],
        'menuindex'      => [
            'dbtype'        => 'int',
            'precision'     => '11',
            'phptype'       => 'integer',
            'null'          => false
        ],
        'active'        => [
            'dbtype'        => 'int',
            'precision'     => '1',
            'phptype'       => 'integer',
            'null'          => false,
            'default'       => 1
        ],
        'editedon'      => [
            'dbtype'        => 'timestamp',
            'phptype'       => 'timestamp',
            'attributes'    => 'ON UPDATE CURRENT_TIMESTAMP',
            'null'          => false
        ]
    ],
    'indexes'       => [
        'PRIMARY'       => [
            'alias'         => 'PRIMARY',
            'primary'       => true,
            'unique'        => true,
            'columns'       => [
                'id'            => [
                    'collation'     => 'A',
                    'null'          => false
                ]
            ]
        ]
    ],
    'aggregates'    =>  [
        'Grid'          => [
            'local'         => 'grid_id',
            'class'         => 'ClientGridGrid',
            'foreign'       => 'id',
            'owner'         => 'local',
            'cardinality'   => 'one'
        ],
        'Field'         => [
            'local'         => 'field_id',
            'class'         => 'ClientGridField',
            'foreign'       => 'id',
            'owner'         => 'local',
            'cardinality'   => 'one'
        ]
    ]
];
