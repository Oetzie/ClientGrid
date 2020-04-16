<?php

/**
 * Client Grid
 *
 * Copyright 2019 by Oene Tjeerd de Bruin <modx@oetzie.nl>
 */
    
class ClientGrid
{
    /**
     * @access public.
     * @var modX.
     */
    public $modx;

    /**
     * @access public.
     * @var Array.
     */
    public $config = [];

    /**
     * @access public.
     * @param modX $modx.
     * @param Array $config.
     */
    public function __construct(modX &$modx, array $config = [])
    {
        $this->modx =& $modx;

        $corePath   = $this->modx->getOption('clientgrid.core_path', $config, $this->modx->getOption('core_path') . 'components/clientgrid/');
        $assetsUrl  = $this->modx->getOption('clientgrid.assets_url', $config, $this->modx->getOption('assets_url') . 'components/clientgrid/');
        $assetsPath = $this->modx->getOption('clientgrid.assets_path', $config, $this->modx->getOption('assets_path') . 'components/clientgrid/');

        $this->config = array_merge([
            'namespace'         => 'clientgrid',
            'lexicons'          => ['clientgrid:default', 'clientgrid:grids', 'base:clientgrid', 'site:clientgrid'],
            'base_path'         => $corePath,
            'core_path'         => $corePath,
            'model_path'        => $corePath . 'model/',
            'processors_path'   => $corePath . 'processors/',
            'elements_path'     => $corePath . 'elements/',
            'chunks_path'       => $corePath . 'elements/chunks/',
            'plugins_path'      => $corePath . 'elements/plugins/',
            'snippets_path'     => $corePath . 'elements/snippets/',
            'templates_path'    => $corePath . 'templates/',
            'assets_path'       => $assetsPath,
            'js_url'            => $assetsUrl . 'js/',
            'css_url'           => $assetsUrl . 'css/',
            'assets_url'        => $assetsUrl,
            'connector_url'     => $assetsUrl . 'connector.php',
            'version'           => '1.1.0',
            'branding_url'      => $this->modx->getOption('clientgrid.branding_url', null, ''),
            'branding_help_url' => $this->modx->getOption('clientgrid.branding_url_help', null, ''),
            'has_permission'    => (bool) $this->modx->hasPermission('clientgrid')
        ], $config);

        $this->modx->addPackage('clientgrid', $this->config['model_path']);

        if (is_array($this->config['lexicons'])) {
            foreach ($this->config['lexicons'] as $lexicon) {
                $this->modx->lexicon->load($lexicon);
            }
        } else {
            $this->modx->lexicon->load($this->config['lexicons']);
        }
    }

    /**
     * @access public.
     * @return String|Boolean.
     */
    public function getHelpUrl()
    {
        if (!empty($this->config['branding_help_url'])) {
            return $this->config['branding_help_url'] . '?v=' . $this->config['version'];
        }

        return false;
    }

    /**
     * @access public.
     * @return String|Boolean.
     */
    public function getBrandingUrl()
    {
        if (!empty($this->config['branding_url'])) {
            return $this->config['branding_url'];
        }

        return false;
    }

    /**
     * @access public.
     * @param String $key.
     * @param Array $options.
     * @param Mixed $default.
     * @return Mixed.
     */
    public function getOption($key, array $options = [], $default = null)
    {
        if (isset($options[$key])) {
            return $options[$key];
        }

        if (isset($this->config[$key])) {
            return $this->config[$key];
        }

        return $this->modx->getOption($this->config['namespace'] . '.' . $key, $options, $default);
    }

    /**
     * @access public.
     * @param String $key.
     * @return Boolean.
     */
    public function checkForExtraByOetzie($key)
    {
        $namespace = $this->modx->getObject('modNamespace', [
            'name' => $key
        ]);

        if ($namespace) {
            $readme = rtrim(str_replace('{core_path}', $this->modx->getOption('core_path'), $namespace->get('path')),'/') . '/docs/readme.txt';

            if (file_exists($readme)) {
                return preg_match('/@oetzie\.nl/i', file_get_contents($readme));
            }
        }

        return false;
    }

    /**
     * @access public.
     * @param String $name.
     * @param Array $properties.
     * @param Boolean $usePdoTools.
     * @param Boolean $usePdoElementsPath.
     * @return String.
     */
    public function getChunkTemplate($name, array $properties = [], $usePdoTools = true, $usePdoElementsPath = true)
    {
        if ($usePdoTools && $pdo = $this->modx->getService('pdoTools')) {
            if ($usePdoElementsPath) {
                $properties = array_merge([
                    'elementsPath' => $this->config['core_path']
                ], $properties);
            } else {
                $properties = array_merge([
                    'elementsPath' => $this->modx->getOption('pdotools_elements_path')
                ], $properties);
            }

            return $pdo->getChunk($name, $properties);
        }

        $type = 'CHUNK';

        if (strpos($name, '@') === 0) {
            $type = substr($name, 1, strpos($name, ' ') - 1);
            $name = ltrim(substr($name, strpos($name, ' ') + 1, strlen($name)));
        }

        switch (strtoupper($type)) {
            case 'FILE':
                if (false !== strrpos($name, '.')) {
                    $name = $this->config['core_path'] . $name;
                } else {
                    $name = $this->config['core_path'] . $name . '.chunk.tpl';
                }

                if (file_exists($name)) {
                    $chunk = $this->modx->newObject('modChunk', [
                        'name' => $this->config['namespace'] . uniqid()
                    ]);

                    if ($chunk) {
                        $chunk->setCacheable(false);

                        return $chunk->process($properties, file_get_contents($name));
                    }
                }

                break;
            case 'INLINE':
                $chunk = $this->modx->newObject('modChunk', [
                    'name' => $this->config['namespace'] . uniqid()
                ]);

                if ($chunk) {
                    $chunk->setCacheable(false);

                    return $chunk->process($properties, $name);
                }

                break;
        }

        return $this->modx->getChunk($name, $properties);
    }

    /**
     * @access public.
     * @param Array $grids.
     * @return Array.
     */
    public function formatGrids(array $grids = [])
    {
        $output = [];

        foreach ($grids as $grid) {
            $output[$grid->get('id')] = array_merge($grid->toArray(), [
                'columns'   => $grid->getColumnsFormatted(),
                'fields'    => $grid->getFieldsFormatted(),
                'actions'   => json_decode($grid->get('actions'), true)
            ]);
        }

        return $output;
    }

    /**
     * @access public.
     * @param Integer $id.
     * @return Null|Object.
     */
    public function getGrid($id)
    {
        $criteria = $this->modx->newQuery('ClientGridGrid');

        $criteria->select($this->modx->getSelectColumns('ClientGridGrid', 'ClientGridGrid'));
        $criteria->select($this->modx->getSelectColumns('ClientGridField', 'ClientGridField', 'sort_column_', ['key']));

        $criteria->leftJoin('ClientGridColumn', 'ClientGridColumn', '`ClientGridGrid`.`sort_column` = `ClientGridColumn`.`id`');
        $criteria->leftJoin('ClientGridField', 'ClientGridField', '`ClientGridField`.`id` = `ClientGridColumn`.`field_id`');

        $criteria->where([
            'id' => $id
        ]);

        return $this->modx->getObject('ClientGridGrid', $criteria);
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getGrids()
    {
        $grids = [];

        $criteria = $this->modx->newQuery('ClientGridGrid');

        $criteria->select($this->modx->getSelectColumns('ClientGridGrid', 'ClientGridGrid'));
        $criteria->select($this->modx->getSelectColumns('ClientGridField', 'ClientGridField', 'sort_column_', ['key']));

        $criteria->leftJoin('ClientGridColumn', 'ClientGridColumn', '`ClientGridGrid`.`sort_column` = `ClientGridColumn`.`id`');
        $criteria->leftJoin('ClientGridField', 'ClientGridField', '`ClientGridField`.`id` = `ClientGridColumn`.`field_id`');

        foreach ($this->modx->getCollection('ClientGridGrid', $criteria) as $grid) {
            $grids[$grid->get('id')] = $grid;
        }

        return $grids;
    }

    /**
     * @access public.
     * @param Array $data.
     * @param Array $fields.
     * @param String $query.
     * @return Array.
     */
    public function formatData(array $data = [], array $fields = [], $query = '')
    {
        $output = [];

        if ($data) {
            $idx = 0;

            foreach ($data as $row) {
                $newRow  = [
                    'idx'           => $idx,
                    'idx_hidden'    => false
                ];

                if (!empty($query)) {
                    $newRow['idx_hidden'] = true;
                }

                foreach ((array) $fields as $field) {
                    if ($field['xtype'] === 'checkbox') {
                        $newRow[$field['key']] = (int) $row[$field['key']] ?: 0;
                    } else if ($field['xtype'] === 'checkboxgroup') {
                        $newRow[$field['key']] = (array) $row[$field['key']] ?: [];
                    } else {
                        $newRow[$field['key']] = $row[$field['key']] ?: '';
                    }

                    $replace = $this->formatDataReplace($field, $newRow[$field['key']]);

                    if ($replace !== null) {
                        $newRow[$field['key'] . '_replace'] = $replace;
                    }

                    if (!empty($query) && (int) $field['searchable'] === 1) {
                        if (preg_match('/' . preg_quote($query) . '/si', $newRow[$field['key']])) {
                            $newRow['idx_hidden'] = false;
                        }
                    }
                }

                $output[] = $newRow;

                $idx++;
            }
        }

        return $output;
    }

    /**
     * @access public.
     * @param Array $field.
     * @param Mixed $value.
     * @return Mixed.
     */
    public function formatDataReplace(array $field = [], $value)
    {
        if (in_array($field['xtype'], ['resource', 'browser', 'datefield', 'timefield', 'datetimefield'], true)) {
            if (!empty($value)) {
                if ($field['xtype'] === 'resource') {
                    $object = $this->modx->getObject('modResource', [
                        'id' => $value
                    ]);

                    if ($object) {
                        $value = $object->get('pagetitle') . ($this->modx->hasPermission('tree_show_resource_ids') ? ' (' . $object->get('id') . ')' : '');
                    }
                } else if ($field['xtype'] === 'browser') {
                    $value = $field['extra']['sourcePath'] . $value;
                } else if ($field['xtype'] === 'datefield') {
                    $value = date($this->modx->getOption('manager_date_format'), strtotime($value));
                } else if ($field['xtype'] === 'timefield') {
                    $value = date($this->modx->getOption('manager_time_format'), strtotime($value));
                } else if ($field['xtype'] === 'datetimefield') {
                    $value = date($this->modx->getOption('manager_date_format') . ', ' . $this->modx->getOption('manager_time_format'), strtotime($value));
                }
            }

            return $value;
        }

        return null;
    }

    /**
     * @access public.
     * @param Array $data.
     * @return Mixed.
     */
    public function cleanData(array $data = [])
    {
        $output = [];

        if ($data) {
            $idx = 0;

            foreach ($data as $row) {
                $newRow = [
                    'idx' => $idx
                ];

                foreach ((array) $row as $key => $value) {
                    if (!in_array($key, ['idx', 'idx_hidden'], true)) {
                        $newRow[str_replace('_replace', '', $key)] = $value;
                    }
                }

                $output[] = $newRow;

                $idx++;
            }
        }

        return $output;
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getXTypes()
    {
        $xtypes = [
            'textfield'     => $this->modx->lexicon('clientgrid.xtype_textfield'),
            'datefield'     => $this->modx->lexicon('clientgrid.xtype_datefield'),
            'timefield'     => $this->modx->lexicon('clientgrid.xtype_timefield'),
            'datetimefield' => $this->modx->lexicon('clientgrid.xtype_datetimefield'),
            'passwordfield' => $this->modx->lexicon('clientgrid.xtype_passwordfield'),
            'numberfield'   => $this->modx->lexicon('clientgrid.xtype_numberfield'),
            'textarea'      => $this->modx->lexicon('clientgrid.xtype_textarea'),
            'richtext'      => $this->modx->lexicon('clientgrid.xtype_richtext'),
            'boolean'       => $this->modx->lexicon('clientgrid.xtype_boolean'),
            'combo'         => $this->modx->lexicon('clientgrid.xtype_combo'),
            'checkbox'      => $this->modx->lexicon('clientgrid.xtype_checkbox'),
            'checkboxgroup' => $this->modx->lexicon('clientgrid.xtype_checkboxgroup'),
            'radiogroup'    => $this->modx->lexicon('clientgrid.xtype_radiogroup'),
            'resource'      => $this->modx->lexicon('clientgrid.xtype_resource'),
            'browser'       => $this->modx->lexicon('clientgrid.xtype_browser')
        ];

        if ($this->checkForExtraByOetzie('tinymce')) {
            $xtypes['tinymce'] = $this->modx->lexicon('clientgrid.xtype_tinymce');
        }

        if ($this->checkForExtraByOetzie('clientgrid')) {
            $xtypes['clientgrid'] = $this->modx->lexicon('clientgrid.xtype_clientgrid');
        }

        return $xtypes;
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getRenders()
    {
        return [
            ''          => $this->modx->lexicon('clientgrid.no_render'),
            'image'     => $this->modx->lexicon('clientgrid.render_image'),
            'date'      => $this->modx->lexicon('clientgrid.render_date'),
            'youtube'   => $this->modx->lexicon('clientgrid.render_youtube'),
            'url'       => $this->modx->lexicon('clientgrid.render_url'),
            'tag'       => $this->modx->lexicon('clientgrid.render_tag'),
            'password'  => $this->modx->lexicon('clientgrid.render_password'),
            'boolean'   => $this->modx->lexicon('clientgrid.render_boolean'),
            'resource'  => $this->modx->lexicon('clientgrid.render_resource')
        ];
    }
}
