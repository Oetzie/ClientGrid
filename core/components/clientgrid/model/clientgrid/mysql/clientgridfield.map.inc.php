<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
$xpdo_meta_map['ClientGridField'] = [
    'package'       => 'clientgrid',
    'version'       => '1.0',
    'table'         => 'clientgrid_field',
    'extends'       => 'xPDOSimpleObject',
    'tableMeta'     => [
        'engine'        => 'InnoDB'
    ],
    'fields'        => [
        'id'            => null,
        'grid_id'       => null,
        'tab_id'        => null,
        'key'           => null,
        'name'          => null,
        'description'   => null,
        'xtype'         => null,
        'extra'         => null,
        'required'      => null,
        'searchable'    => null,
        'active'        => null,
        'menuindex'     => null,
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
        'tab_id'        => [
            'dbtype'        => 'int',
            'precision'     => '11',
            'phptype'       => 'integer',
            'null'          => false
        ],
        'key'           => [
            'dbtype'        => 'varchar',
            'precision'     => '15',
            'phptype'       => 'string',
            'null'          => false
        ],
        'name'          => [
            'dbtype'        => 'varchar',
            'precision'     => '75',
            'phptype'       => 'string',
            'null'          => false
        ],
        'description'   => [
            'dbtype'        => 'text',
            'phptype'       => 'string',
            'null'          => false
        ],
        'xtype'         => [
            'dbtype'        => 'varchar',
            'precision'     => '75',
            'phptype'       => 'string',
            'null'          => false
        ],
        'extra'         => [
            'dbtype'        => 'text',
            'phptype'       => 'string',
            'null'          => false
        ],
        'required'      => [
            'dbtype'        => 'int',
            'precision'     => '1',
            'phptype'       => 'integer',
            'null'          => false,
            'default'       => 0
        ],
        'searchable'    => [
            'dbtype'        => 'int',
            'precision'     => '1',
            'phptype'       => 'integer',
            'null'          => false,
            'default'       => 0
        ],
        'active'        => [
            'dbtype'        => 'int',
            'precision'     => '1',
            'phptype'       => 'integer',
            'null'          => false,
            'default'       => 1
        ],
        'menuindex'     => [
            'dbtype'        => 'int',
            'precision'     => '11',
            'phptype'       => 'integer',
            'null'          => false
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
        'Tab'           => [
            'local'         => 'tab_id',
            'class'         => 'ClientGridTab',
            'foreign'       => 'id',
            'owner'         => 'local',
            'cardinality'   => 'one'
        ],
        'Column'        => [
            'local'         => 'id',
            'class'         => 'ClientGridColumn',
            'foreign'       => 'field_id',
            'owner'         => 'local',
            'cardinality'   => 'many'
        ]
    ]
];
