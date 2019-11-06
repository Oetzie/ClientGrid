<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
$xpdo_meta_map['ClientGridGrid'] = [
    'package'       => 'clientgrid',
    'version'       => '1.0',
    'table'         => 'clientgrid_grid',
    'extends'       => 'xPDOSimpleObject',
    'tableMeta'     => [
        'engine'        => 'InnoDB'
    ],
    'fields'        => [
        'id'            => null,
        'name'          => null,
        'description'   => null,
        'sort_column'   => null,
        'sort_dir'      => null,
        'sortable'      => null,
        'max_items'     => null,
        'actions'       => null,
        'window_width'  => null,
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
        'sort_column'   => [
            'dbtype'        => 'int',
            'precision'     => '11',
            'phptype'       => 'integer',
            'null'          => false
        ],
        'sort_dir'      => [
            'dbtype'        => 'varchar',
            'precision'     => '4',
            'phptype'       => 'string',
            'null'          => false,
            'default'       => 'ASC'
        ],
        'sortable'      => [
            'dbtype'        => 'int',
            'precision'     => '1',
            'phptype'       => 'integer',
            'null'          => false,
            'default'       => 1
        ],
        'max_items'     => [
            'dbtype'        => 'int',
            'precision'     => '3',
            'phptype'       => 'integer',
            'null'          => false,
            'default'       => 0
        ],
        'actions'       => [
            'dbtype'        => 'varchar',
            'precision'     => '255',
            'phptype'       => 'string',
            'null'          => false,
            'default'       => '{}'
        ],
        'window_width'  => [
            'dbtype'        => 'int',
            'precision'     => '4',
            'phptype'       => 'integer',
            'null'          => false,
            'default'       => 400
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
    ]
];
