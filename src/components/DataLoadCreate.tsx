import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TablePickerModal from './TablePickerModal';
import TargetLocationPickerModal from './TargetLocationPickerModal';
import './DataLoadCreate.css';

type DataType = 'unstructured' | 'structured';
type LoadFrom = 'connector' | 'local';
type TargetTableMode = 'existing' | 'new';
type StructuredLoadType = 'file' | 'database';
type UnstructuredLoadType = 'file' | 'webpage';

const DataLoadCreate: React.FC = () => {
  const navigate = useNavigate();
  const [dataType, setDataType] = useState<DataType>('structured');
  const [loadFrom, setLoadFrom] = useState<LoadFrom>('connector');
  const [structuredLoadType, setStructuredLoadType] = useState<StructuredLoadType>('database');
  const [unstructuredLoadType, setUnstructuredLoadType] = useState<UnstructuredLoadType>('file');
  const [targetMode, setTargetMode] = useState<TargetTableMode>('existing');
  const [dbSource, setDbSource] = useState<'hive' | 'mysql' | ''>('');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [dbName, setDbName] = useState('');
  const [tableName, setTableName] = useState('');
  const [tableModalOpen, setTableModalOpen] = useState(false);

  const [targetDir, setTargetDir] = useState('默认');
  const [targetDb, setTargetDb] = useState('');
  const [targetTable, setTargetTable] = useState('');
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [targetError, setTargetError] = useState(false);

  const [newTableTargetDir, setNewTableTargetDir] = useState('默认');
  const [newTableTargetDb, setNewTableTargetDb] = useState('');
  const [newTableModalOpen, setNewTableModalOpen] = useState(false);
  const [newTableError, setNewTableError] = useState(false);

  // 非结构化数据载入位置相关state
  const [unstructuredTargetDir, setUnstructuredTargetDir] = useState('默认');
  const [unstructuredTargetDb, setUnstructuredTargetDb] = useState('');
  const [unstructuredTargetVolume, setUnstructuredTargetVolume] = useState('');
  const [unstructuredModalOpen, setUnstructuredModalOpen] = useState(false);

  // 表定义相关state
  const [conflictStrategy, setConflictStrategy] = useState('fail');
  const [dataProcessMode, setDataProcessMode] = useState<'append' | 'overwrite'>('append'); // 选择已有表时：数据处理方式，默认追加数据
  const [loadMode, setLoadMode] = useState('once'); // once: 一次载入, incremental: 增量触发
  const [syncUpstreamTruncate, setSyncUpstreamTruncate] = useState(false); // 增量触发时：同步上游truncate操作，默认关闭
  const [syncStrategy, setSyncStrategy] = useState('single'); // single: 单事务, multi: 多事务
  const [partitionField, setPartitionField] = useState(''); // 按值分批：单字段
  const [partitionFieldsForCount, setPartitionFieldsForCount] = useState<string[]>([]); // 按行数分批：支持复合唯一（多字段）
  const [partitionFieldDropdownOpen, setPartitionFieldDropdownOpen] = useState(false); // 分批字段多选下拉是否展开
  const [partitionFieldSearch, setPartitionFieldSearch] = useState(''); // 分批字段下拉内搜索关键词
  const partitionFieldDropdownRef = useRef<HTMLDivElement>(null);
  const [partitionFieldValueDropdownOpen, setPartitionFieldValueDropdownOpen] = useState(false); // 按字段值分批单选下拉是否展开
  const [partitionFieldValueSearch, setPartitionFieldValueSearch] = useState(''); // 按字段值分批下拉内搜索关键词
  const partitionFieldValueDropdownRef = useRef<HTMLDivElement>(null);
  const [partitionType, setPartitionType] = useState<'count' | 'value'>('count'); // count: 按行数, value: 按字段值
  const [partitionSize, setPartitionSize] = useState('10000'); // 每批行数
  const [newTableName, setNewTableName] = useState('');
  const [newTableDesc, setNewTableDesc] = useState('');
  const [columns, setColumns] = useState<Array<{
    id: string;
    sourceFieldName: string;
    sourceDataType: string;
    name: string;
    dataType: string;
    length: string;
    isPrimary: boolean;
    description: string;
    defaultValue: string;
    actionInfo: string;
  }>>([]);

  // 点击外部关闭分批字段多选下拉
  useEffect(() => {
    if (!partitionFieldDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (partitionFieldDropdownRef.current && !partitionFieldDropdownRef.current.contains(e.target as Node)) {
        setPartitionFieldDropdownOpen(false);
        setPartitionFieldSearch('');
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [partitionFieldDropdownOpen]);

  // 点击外部关闭按字段值分批单选下拉
  useEffect(() => {
    if (!partitionFieldValueDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (partitionFieldValueDropdownRef.current && !partitionFieldValueDropdownRef.current.contains(e.target as Node)) {
        setPartitionFieldValueDropdownOpen(false);
        setPartitionFieldValueSearch('');
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [partitionFieldValueDropdownOpen]);

  // 获取目标表结构（模拟从API获取）
  const getTargetTableFields = useMemo(() => {
    if (!targetTable || !targetDb) return [];
    
    // 模拟已有表的字段结构
    const mockTargetFields: Record<string, Array<{
      name: string;
      type: string;
      isPrimary: boolean;
      description: string;
      defaultValue: string;
    }>> = {
      'tab1': [
        { name: 'id', type: 'BIGINT', isPrimary: true, description: '主键ID', defaultValue: '' },
        { name: 'user_name', type: 'VARCHAR(100)', isPrimary: false, description: '用户名称', defaultValue: '' },
        { name: 'email_address', type: 'VARCHAR(200)', isPrimary: false, description: '邮箱', defaultValue: '' },
        { name: 'mobile_phone', type: 'VARCHAR(20)', isPrimary: false, description: '手机号', defaultValue: '' },
        { name: 'user_status', type: 'TINYINT(1)', isPrimary: false, description: '状态', defaultValue: '1' },
        { name: 'create_time', type: 'DATETIME', isPrimary: false, description: '创建时间', defaultValue: 'CURRENT_TIMESTAMP' },
      ],
      'tab2': [
        { name: 'order_id', type: 'BIGINT', isPrimary: true, description: '订单ID', defaultValue: '' },
        { name: 'customer_id', type: 'BIGINT', isPrimary: false, description: '客户ID', defaultValue: '' },
        { name: 'order_amount', type: 'DECIMAL(10,2)', isPrimary: false, description: '订单金额', defaultValue: '' },
        { name: 'order_date', type: 'DATETIME', isPrimary: false, description: '订单日期', defaultValue: '' },
      ],
      'users': [
        { name: 'user_id', type: 'BIGINT', isPrimary: true, description: '用户ID', defaultValue: '' },
        { name: 'username', type: 'VARCHAR(50)', isPrimary: false, description: '用户名', defaultValue: '' },
        { name: 'email', type: 'VARCHAR(100)', isPrimary: false, description: '邮箱', defaultValue: '' },
        { name: 'created_at', type: 'DATETIME', isPrimary: false, description: '创建时间', defaultValue: 'CURRENT_TIMESTAMP' },
      ],
    };
    
    return mockTargetFields[targetTable] || [
      { name: 'id', type: 'BIGINT', isPrimary: true, description: '主键', defaultValue: '' },
      { name: 'name', type: 'VARCHAR(255)', isPrimary: false, description: '名称', defaultValue: '' },
      { name: 'created_at', type: 'DATETIME', isPrimary: false, description: '创建时间', defaultValue: 'CURRENT_TIMESTAMP' },
    ];
  }, [targetTable, targetDb]);

  // 表结构是否完全一致（仅在选择已有表且都有表结构时使用）
  const isSchemaIdentical = useMemo(() => {
    if (!targetTable || !targetDb || columns.length === 0) return false;
    const targetFields = getTargetTableFields;
    if (targetFields.length !== columns.length) return false;
    const norm = (s: string | undefined) => (s ?? '').trim() || '-';
    return columns.every((col, i) => {
      const t = targetFields[i];
      if (!t) return false;
      return (
        col.sourceFieldName.toLowerCase() === t.name.toLowerCase() &&
        col.sourceDataType === t.type &&
        col.isPrimary === t.isPrimary &&
        norm(col.description) === norm(t.description) &&
        norm(col.defaultValue) === norm(t.defaultValue)
      );
    });
  }, [targetTable, targetDb, columns, getTargetTableFields]);

  // 当选择表后，自动填充表名、描述和字段信息
  useEffect(() => {
    if (tableName && dbSource) {
      // 只有在新建表模式才设置表名
      if (targetMode === 'new') {
        setNewTableName(tableName);
      }
      
      // 根据数据源类型映射数据类型
      const mapDataType = (sourceType: string) => {
        if (dbSource === 'mysql') {
          // Hive -> MySQL 映射
          const typeMap: Record<string, { type: string; length: string }> = {
            'STRING': { type: 'VARCHAR', length: '255' },
            'BIGINT': { type: 'BIGINT', length: '' },
            'INT': { type: 'INT', length: '' },
            'TIMESTAMP': { type: 'DATETIME', length: '' },
            'DATE': { type: 'DATE', length: '' },
            'DOUBLE': { type: 'DOUBLE', length: '' },
            'BOOLEAN': { type: 'TINYINT', length: '1' },
            'DECIMAL': { type: 'DECIMAL', length: '10,2' },
          };
          return typeMap[sourceType] || { type: 'VARCHAR', length: '255' };
        } else {
          // Hive 或其他数据源的默认映射
          const typeMap: Record<string, { type: string; length: string }> = {
            'STRING': { type: 'TEXT', length: '' },
            'BIGINT': { type: 'BIGINT', length: '' },
            'INT': { type: 'INT', length: '' },
            'TIMESTAMP': { type: 'DATETIME', length: '' },
            'DATE': { type: 'DATE', length: '' },
            'DOUBLE': { type: 'DOUBLE', length: '' },
            'DECIMAL': { type: 'DECIMAL', length: '10,2' },
          };
          return typeMap[sourceType] || { type: 'TEXT', length: '' };
        }
      };

      // 根据表名返回不同的字段结构（模拟从API获取）
      const getTableSchema = (table: string) => {
        const schemas: Record<string, any> = {
          'users': {
            description: '用户信息表',
            fields: [
              { sourceFieldName: 'user_id', sourceDataType: 'BIGINT', description: '用户唯一标识', defaultValue: '' },
              { sourceFieldName: 'username', sourceDataType: 'STRING', description: '用户名', defaultValue: '' },
              { sourceFieldName: 'email', sourceDataType: 'STRING', description: '用户邮箱地址', defaultValue: '' },
              { sourceFieldName: 'phone', sourceDataType: 'STRING', description: '手机号码', defaultValue: '' },
              { sourceFieldName: 'status', sourceDataType: 'INT', description: '用户状态（0-禁用，1-启用）', defaultValue: '1' },
              { sourceFieldName: 'created_at', sourceDataType: 'TIMESTAMP', description: '创建时间', defaultValue: 'CURRENT_TIMESTAMP' },
            ]
          },
          'orders': {
            description: '订单信息表',
            fields: [
              { sourceFieldName: 'order_id', sourceDataType: 'BIGINT', description: '订单ID', defaultValue: '' },
              { sourceFieldName: 'user_id', sourceDataType: 'BIGINT', description: '用户ID', defaultValue: '' },
              { sourceFieldName: 'order_no', sourceDataType: 'STRING', description: '订单编号', defaultValue: '' },
              { sourceFieldName: 'total_amount', sourceDataType: 'DECIMAL', description: '订单总金额', defaultValue: '0.00' },
              { sourceFieldName: 'order_status', sourceDataType: 'INT', description: '订单状态', defaultValue: '0' },
              { sourceFieldName: 'payment_method', sourceDataType: 'STRING', description: '支付方式', defaultValue: '' },
              { sourceFieldName: 'order_time', sourceDataType: 'TIMESTAMP', description: '下单时间', defaultValue: 'CURRENT_TIMESTAMP' },
              { sourceFieldName: 'remark', sourceDataType: 'STRING', description: '订单备注', defaultValue: '' },
            ]
          },
          'products': {
            description: '商品信息表',
            fields: [
              { sourceFieldName: 'product_id', sourceDataType: 'BIGINT', description: '商品ID', defaultValue: '' },
              { sourceFieldName: 'product_name', sourceDataType: 'STRING', description: '商品名称', defaultValue: '' },
              { sourceFieldName: 'category', sourceDataType: 'STRING', description: '商品分类', defaultValue: '' },
              { sourceFieldName: 'price', sourceDataType: 'DECIMAL', description: '商品价格', defaultValue: '0.00' },
              { sourceFieldName: 'stock', sourceDataType: 'INT', description: '库存数量', defaultValue: '0' },
              { sourceFieldName: 'is_available', sourceDataType: 'BOOLEAN', description: '是否上架', defaultValue: 'true' },
              { sourceFieldName: 'description', sourceDataType: 'STRING', description: '商品描述', defaultValue: '' },
              { sourceFieldName: 'created_date', sourceDataType: 'DATE', description: '创建日期', defaultValue: '' },
            ]
          },
          'logs': {
            description: '系统日志表',
            fields: [
              { sourceFieldName: 'log_id', sourceDataType: 'BIGINT', description: '日志ID', defaultValue: '' },
              { sourceFieldName: 'user_id', sourceDataType: 'BIGINT', description: '用户ID', defaultValue: '' },
              { sourceFieldName: 'action', sourceDataType: 'STRING', description: '操作行为', defaultValue: '' },
              { sourceFieldName: 'ip_address', sourceDataType: 'STRING', description: 'IP地址', defaultValue: '' },
              { sourceFieldName: 'user_agent', sourceDataType: 'STRING', description: '用户代理', defaultValue: '' },
              { sourceFieldName: 'log_time', sourceDataType: 'TIMESTAMP', description: '日志时间', defaultValue: 'CURRENT_TIMESTAMP' },
            ]
          }
        };

        // 如果找不到对应的表，返回默认结构
        return schemas[table] || {
          description: `${table}表的描述信息`,
          fields: [
            { sourceFieldName: 'id', sourceDataType: 'BIGINT', description: '主键ID', defaultValue: '' },
            { sourceFieldName: 'name', sourceDataType: 'STRING', description: '名称', defaultValue: '' },
            { sourceFieldName: 'created_at', sourceDataType: 'TIMESTAMP', description: '创建时间', defaultValue: 'CURRENT_TIMESTAMP' },
          ]
        };
      };

      const tableSchema = getTableSchema(tableName);
      // 只有在新建表模式才设置表描述
      if (targetMode === 'new') {
        setNewTableDesc(tableSchema.description);
      }
      
      setColumns(tableSchema.fields.map((field: any, index: number) => {
        const mappedType = mapDataType(field.sourceDataType);
        return {
          id: String.fromCharCode(65 + index), // A, B, C, D...
          sourceFieldName: field.sourceFieldName,
          sourceDataType: field.sourceDataType,
          name: field.sourceFieldName, // 默认使用源字段名
          dataType: mappedType.type,
          length: mappedType.length,
          isPrimary: dbSource !== 'hive' && index === 0 && mappedType.type !== 'TEXT' && mappedType.type !== 'DATETIME' && mappedType.type !== 'TIMESTAMP', // Hive没有主键概念，不默认设置主键；其他数据源第一个字段默认为主键
          description: field.description || '',
          defaultValue: field.defaultValue || '',
          actionInfo: `行 ${index + 1}`
        };
      }));
    }
  }, [tableName, dbSource, targetMode]);

  const isDbLoad = dataType === 'structured' && structuredLoadType === 'database';

  // 未选择表时关闭分批字段下拉
  useEffect(() => {
    if (isDbLoad && (!dbSource || !tableName)) {
      setPartitionFieldDropdownOpen(false);
      setPartitionFieldValueDropdownOpen(false);
    }
  }, [isDbLoad, dbSource, tableName]);

  // 当切换数据源时，重置所有相关状态
  useEffect(() => {
    if (dbSource) {
      setDbName('');
      setTableName('');
      setTargetDir('默认');
      setTargetDb('');
      setTargetTable('');
      setNewTableTargetDir('默认');
      setNewTableTargetDb('');
      setNewTableName('');
      setNewTableDesc('');
      setColumns([]);
      setTargetError(false);
      setNewTableError(false);
    }
  }, [dbSource]);

  // 根据数据源获取可用的数据类型选项
  const getDataTypeOptions = useMemo(() => {
    if (dbSource === 'mysql') {
      return [
        { value: 'VARCHAR', label: 'VARCHAR', needsLength: true },
        { value: 'INT', label: 'INT', needsLength: false },
        { value: 'BIGINT', label: 'BIGINT', needsLength: false },
        { value: 'TINYINT', label: 'TINYINT', needsLength: true },
        { value: 'TEXT', label: 'TEXT', needsLength: false },
        { value: 'DATETIME', label: 'DATETIME', needsLength: false },
        { value: 'TIMESTAMP', label: 'TIMESTAMP', needsLength: false },
        { value: 'DATE', label: 'DATE', needsLength: false },
        { value: 'DECIMAL', label: 'DECIMAL', needsLength: true },
        { value: 'FLOAT', label: 'FLOAT', needsLength: false },
        { value: 'DOUBLE', label: 'DOUBLE', needsLength: false },
      ];
    } else if (dbSource === 'hive') {
      return [
        { value: 'STRING', label: 'STRING', needsLength: false },
        { value: 'INT', label: 'INT', needsLength: false },
        { value: 'BIGINT', label: 'BIGINT', needsLength: false },
        { value: 'TIMESTAMP', label: 'TIMESTAMP', needsLength: false },
        { value: 'DATE', label: 'DATE', needsLength: false },
        { value: 'DOUBLE', label: 'DOUBLE', needsLength: false },
        { value: 'BOOLEAN', label: 'BOOLEAN', needsLength: false },
      ];
    } else {
      // MySQL 或默认
      return [
        { value: 'VARCHAR', label: 'VARCHAR', needsLength: true },
        { value: 'INT', label: 'INT', needsLength: false },
        { value: 'BIGINT', label: 'BIGINT', needsLength: false },
        { value: 'TEXT', label: 'TEXT', needsLength: false },
        { value: 'DATETIME', label: 'DATETIME', needsLength: false },
        { value: 'DATE', label: 'DATE', needsLength: false },
      ];
    }
  }, [dbSource]);

  const dbOptions = useMemo(
    () => [
      { value: 'hive' as const, label: 'Hive' },
      { value: 'mysql' as const, label: 'MySQL' },
    ],
    []
  );

  const selectedDbLabel = useMemo(() => {
    const found = dbOptions.find((o) => o.value === dbSource);
    return found?.label ?? '';
  }, [dbOptions, dbSource]);

  const databaseOptions = useMemo(() => {
    // mock：按数据源给一些不同的库名
    if (dbSource === 'hive') return ['default', 'ods', 'dwd', 'dws'];
    if (dbSource === 'mysql') return ['test', 'app', 'report'];
    return [];
  }, [dbSource]);

  const getTablesForDb = useMemo(() => {
    return (db: string) => {
      if (!db) return [];
      if (db === 'default') return ['users', 'orders', 'products', 'logs'];
      if (db === 'ods') return ['ods_trade', 'ods_user', 'ods_company'];
      if (db === 'dwd') return ['dwd_trade_detail', 'dwd_user_profile'];
      if (db === 'dws') return ['dws_trade_day', 'dws_user_day'];
      if (db === 'test') return ['users', 'orders', 'products'];
      if (db === 'app') return ['users', 'orders', 'products', 'logs'];
      if (db === 'report') return ['rpt_daily', 'rpt_monthly'];
      if (db === 'demo') return ['fact_sales', 'dim_customer'];
      if (db === 'analytics') return ['events', 'sessions'];
      if (db === 'lakehouse') return ['bronze_raw', 'silver_clean', 'gold_metrics'];
      return ['users', 'orders'];
    };
  }, []);

  useEffect(() => {
    const anyOpen = sourceOpen;
    if (!anyOpen) return;
    const onDocClick = () => {
      setSourceOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [sourceOpen]);

  return (
    <div className="data-load-create">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/data-load')} aria-label="返回">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M9.5 3.5L5 8l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="topbar-title">数据载入</div>
      </div>

      <div className="type-cards-row">
        <button
          type="button"
          className={`load-type-card ${dataType === 'unstructured' ? 'active' : ''}`}
          onClick={() => setDataType('unstructured')}
        >
          <div className="ltc-icon blue">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="3" y="4" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M6.5 8h9M6.5 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className="ltc-main">
            <div className="ltc-title">非结构化数据</div>
            <div className="ltc-desc">支持多模态数据混合上传，如文档、图片、音频、视频等</div>
          </div>
        </button>

        <button
          type="button"
          className={`load-type-card ${dataType === 'structured' ? 'active' : ''}`}
          onClick={() => setDataType('structured')}
        >
          <div className="ltc-icon green">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="4" y="5" width="14" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7.5 9h7M7.5 13h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className="ltc-main">
            <div className="ltc-title">结构化数据</div>
            <div className="ltc-desc">
              支持结构化数据上传，包括csv、xlsx、xls，并将结构化数据导入表中
            </div>
          </div>
        </button>
      </div>

      <div className="form-card">
        <div className="form-rows">
          {dataType === 'unstructured' ? (
            /* 非结构化数据表单 */
            <>
              <div className="form-row">
                <div className="label">载入类型：</div>
                <div className="control">
                  <div className="tabs">
                    <button
                      type="button"
                      className={`tab ${unstructuredLoadType === 'file' ? 'active' : ''}`}
                      onClick={() => setUnstructuredLoadType('file')}
                    >
                      文件
                    </button>
                    <button
                      type="button"
                      className={`tab ${unstructuredLoadType === 'webpage' ? 'active' : ''}`}
                      onClick={() => setUnstructuredLoadType('webpage')}
                    >
                      网页
                    </button>
                  </div>
                </div>
              </div>

              {unstructuredLoadType === 'file' && (
                <div className="form-row">
                  <div className="label">数据源入：</div>
                  <div className="control">
                    <div className="radio-row-horizontal">
                      <label className="radio">
                        <input
                          type="radio"
                          name="unstructuredSource"
                          checked={loadFrom === 'connector'}
                          onChange={() => setLoadFrom('connector')}
                        />
                        <span>在线路径</span>
                      </label>
                      <label className="radio">
                        <input
                          type="radio"
                          name="unstructuredSource"
                          checked={loadFrom === 'local'}
                          onChange={() => setLoadFrom('local')}
                        />
                        <span>本地上传</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {unstructuredLoadType === 'webpage' && (
                <div className="form-row">
                  <div className="label">
                    <span className="req">*</span>网页URL：
                  </div>
                  <div className="control">
                    <input
                      type="text"
                      className="input"
                      placeholder="请输入网页URL，如：https://example.com"
                    />
                  </div>
                </div>
              )}

              {unstructuredLoadType === 'file' && (
                <div className="form-row">
                  <div className="label">
                    <span className="req">*</span>选择路径：
                  </div>
                  <div className="control">
                    <input
                      type="text"
                      className="input"
                      placeholder="请选择路径或搜索"
                      disabled={loadFrom === 'local'}
                    />
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="label">
                  <span className="req">*</span>载入位置：
                </div>
                <div className="control">
                  <input
                    type="text"
                    className="input"
                    placeholder="请选择位置/使用搜索"
                    readOnly
                    value={
                      unstructuredTargetVolume
                        ? `${unstructuredTargetDir} / ${unstructuredTargetDb} / ${unstructuredTargetVolume}`
                        : ''
                    }
                    onClick={() => setUnstructuredModalOpen(true)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="label">载入模式：</div>
                <div className="control">
                  <div className="radio-row-horizontal">
                    <label className="radio">
                      <input
                        type="radio"
                        name="unstructuredMode"
                        defaultChecked
                      />
                      <span>一次载入{unstructuredLoadType === 'file' ? '路径' : '网页'}</span>
                    </label>
                    <label className="radio">
                      <input
                        type="radio"
                        name="unstructuredMode"
                      />
                      <span>周期载入{unstructuredLoadType === 'file' ? '路径' : '网页'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {unstructuredLoadType === 'file' && (
                <div className="form-row">
                  <div className="label">重复文件名处理：</div>
                  <div className="control">
                    <div className="duplicate-config">
                      <div className="config-section">
                        <label className="config-label">前缀配置</label>
                        <div className="checkbox-group-horizontal">
                          <label className="checkbox-item">
                            <input type="checkbox" defaultChecked />
                            <span>文件名前缀</span>
                          </label>
                          <label className="checkbox-item">
                            <input type="checkbox" defaultChecked />
                            <span>MD5</span>
                          </label>
                        </div>
                      </div>
                      <div className="config-section">
                        <label className="config-label">处理方式</label>
                        <div className="radio-group-horizontal">
                          <label className="radio">
                            <input type="radio" name="handleMethod" defaultChecked />
                            <span>跳过</span>
                          </label>
                          <label className="radio">
                            <input type="radio" name="handleMethod" />
                            <span>覆盖</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {unstructuredLoadType === 'webpage' && (
                <div className="form-row">
                  <div className="label">爬取深度：</div>
                  <div className="control">
                    <div className="radio-row-horizontal">
                      <label className="radio">
                        <input
                          type="radio"
                          name="crawlDepth"
                          defaultChecked
                        />
                        <span>当前页面</span>
                      </label>
                      <label className="radio">
                        <input
                          type="radio"
                          name="crawlDepth"
                        />
                        <span>包含子页面</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {unstructuredLoadType === 'file' && (
                <div className="form-row">
                  <div className="label">载入范围：</div>
                  <div className="control">
                    <div className="file-types-section">
                      <div className="file-types-row">
                        <span className="file-types-label">文件类型：</span>
                        <div className="file-type-tags">
                          {['TXT', 'PDF', 'PPT', 'DOC', 'DOCX', 'Markdown', 'PPTX', 'CSV', 'XLS', 'XLSX', 'HTML', 'HTM', '+12...'].map((type) => (
                            <span key={type} className="file-type-tag">{type}</span>
                          ))}
                        </div>
                      </div>
                      <div className="regex-config">
                        <span className="regex-label">跳过正则表达式：</span>
                        <input
                          type="text"
                          className="regex-input"
                          placeholder="请输入正则表达式，如：^\.git$|^\.DS_Store$|node_modules"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {unstructuredLoadType === 'file' ? (
                <div className="upload-files-section">
                  <div className="upload-files-header">
                    <span className="upload-files-title">载入文件</span>
                    <span className="upload-files-count">全部文件</span>
                  </div>
                  <div className="upload-files-table">
                    <table className="files-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>
                            <input type="checkbox" />
                          </th>
                          <th>文件名</th>
                          <th>文件大小</th>
                          <th>文件类型</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={4} className="empty-files">
                            <div className="empty-files-content">
                              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                                <rect x="15" y="10" width="30" height="40" rx="3" stroke="#d1d5db" strokeWidth="2" />
                                <path d="M25 25h10M25 32h10M25 39h7" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              <div className="empty-files-text">暂无数据</div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="upload-files-section">
                  <div className="upload-files-header">
                    <span className="upload-files-title">载入网页</span>
                    <span className="upload-files-count">全部网页</span>
                  </div>
                  <div className="upload-files-table">
                    <table className="files-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px' }}>
                            <input type="checkbox" />
                          </th>
                          <th>网页标题</th>
                          <th>网页URL</th>
                          <th>状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={4} className="empty-files">
                            <div className="empty-files-content">
                              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                                <circle cx="30" cy="30" r="18" stroke="#d1d5db" strokeWidth="2" />
                                <path d="M20 24h20M20 30h20M20 36h12" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              <div className="empty-files-text">暂无数据</div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : dataType === 'structured' && (
            <div className="form-row">
              <div className="label">载入类型：</div>
              <div className="control">
                <div className="tabs">
                  <button
                    type="button"
                    className={`tab ${structuredLoadType === 'file' ? 'active' : ''}`}
                    onClick={() => setStructuredLoadType('file')}
                  >
                    文件
                  </button>
                  <button
                    type="button"
                    className={`tab ${structuredLoadType === 'database' ? 'active' : ''}`}
                    onClick={() => setStructuredLoadType('database')}
                  >
                    数据库
                  </button>
                </div>
              </div>
            </div>
          )}

          {(dataType !== 'structured' || structuredLoadType === 'file') && (
            <div className="form-row">
              <div className="label">数据载入：</div>
              <div className="control">
                <div className="tabs">
                  <button
                    type="button"
                    className={`tab ${loadFrom === 'connector' ? 'active' : ''}`}
                    onClick={() => setLoadFrom('connector')}
                  >
                    连接器载入
                  </button>
                  <button
                    type="button"
                    className={`tab ${loadFrom === 'local' ? 'active' : ''}`}
                    onClick={() => setLoadFrom('local')}
                  >
                    本地载入
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="label">
              <span className="req">*</span>连接器：
            </div>
            <div className="control">
              <div
                className={`select ${sourceOpen ? 'open' : ''}`}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setSourceOpen((v) => !v);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSourceOpen((v) => !v);
                }}
              >
                {isDbLoad ? (
                  <span className={selectedDbLabel ? 'value' : 'placeholder'}>
                    {selectedDbLabel || '请选择连接器'}
                  </span>
                ) : (
                  <span className="placeholder">请选择连接器</span>
                )}

                <svg className="caret" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M4 6l3 3 3-3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {isDbLoad && sourceOpen && (
                  <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                    {dbOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`dropdown-item ${dbSource === opt.value ? 'active' : ''}`}
                        onClick={() => {
                          setDbSource(opt.value);
                          setDbName('');
                          setTableName('');
                          setSourceOpen(false);
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {isDbLoad ? (
            <div className="form-row">
              <div className="label">
                <span className="req">*</span>源数据表：
              </div>
              <div className="control">
                <div
                  className={`select select-neutral ${!dbSource ? 'select-disabled' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!dbSource) return;
                    setTableModalOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (!dbSource) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      setTableModalOpen(true);
                    }
                  }}
                >
                  <span className={tableName ? 'value' : 'placeholder'}>
                    {tableName ? `${dbName}.${tableName}` : '请选择源数据表'}
                  </span>
                  <svg className="caret" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M4 6l3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="label">
                <span className="req">*</span>选择文件：
              </div>
              <div className="control">
                <button type="button" className="upload-btn" disabled>
                  <span className="plus">＋</span>
                  添加文件
                </button>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="label">载入模式：</div>
            <div className="control">
              <div className="radio-row-horizontal">
                <label className="radio">
                  <input
                    type="radio"
                    name="loadMode"
                    checked={loadMode === 'once'}
                    onChange={() => setLoadMode('once')}
                  />
                  <span>一次载入</span>
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="loadMode"
                    checked={loadMode === 'incremental'}
                    onChange={() => setLoadMode('incremental')}
                  />
                  <span>增量触发</span>
                </label>
              </div>
            </div>
          </div>

          {loadMode === 'incremental' && (
            <div className="form-row">
              <div className="label">同步上游truncate操作：</div>
              <div className="control">
                <label className="switch-wrap">
                  <input
                    type="checkbox"
                    className="switch-input"
                    checked={syncUpstreamTruncate}
                    onChange={(e) => setSyncUpstreamTruncate(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="label">同步策略：</div>
            <div className="control">
              <div className="radio-row-horizontal">
                <label className="radio tooltip-trigger">
                  <input
                    type="radio"
                    name="syncStrategy"
                    checked={syncStrategy === 'single'}
                    onChange={() => setSyncStrategy('single')}
                  />
                  <span>单事务</span>
                  <div className="tooltip">
                    数据作为一个整体写入。如果中间任何一行出错，全部自动撤回。保证数据"要么全有，要么全无"。<br />
                    <strong>推荐：小数据量 / 高一致性</strong>
                  </div>
                </label>
                <label className="radio tooltip-trigger">
                  <input
                    type="radio"
                    name="syncStrategy"
                    checked={syncStrategy === 'multi'}
                    onChange={() => setSyncStrategy('multi')}
                  />
                  <span>多事务</span>
                  <div className="tooltip">
                    按选定字段的取值区间划分多个事务。若某个分批失败，仅回滚当前批。<br />
                    <strong>适用于海量数据，防止锁表。</strong>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {syncStrategy === 'multi' && (
            <div className={`form-row partition-config ${isDbLoad && (!dbSource || !tableName) ? 'partition-config-disabled' : ''}`}>
              <div className="label"></div>
              <div className="control">
                <div className="partition-fields">
                  <div className="partition-field-group">
                    <label className="field-label field-label-with-help">
                      分批方式
                      <span className="partition-help tooltip-trigger">
                        ?
                        <div className="tooltip partition-tooltip partition-tooltip--both">
                          <div className="tooltip-block">
                            <div className="tooltip-title">按行数分批</div>
                            需字段唯一，支持复合唯一（多字段）。排序后按每批行数切分事务。<br />
                            示例：ORDER BY 字段 LIMIT 10000 / OFFSET 10000 等。
                          </div>
                          <div className="tooltip-block">
                            <div className="tooltip-title">按字段值分批</div>
                            只能选一个字段。系统 SELECT DISTINCT 该字段，每个取值一个事务。<br />
                            示例：WHERE 字段 = 202509 / 202510 / 202511 等。
                          </div>
                        </div>
                      </span>
                    </label>
                    <select
                      className="select partition-select"
                      value={partitionType}
                      disabled={isDbLoad && (!dbSource || !tableName)}
                      onChange={(e) => {
                        const next = e.target.value as 'count' | 'value';
                        if (next === 'value') {
                          setPartitionField(partitionFieldsForCount[0] || '');
                        } else {
                          setPartitionFieldsForCount(partitionField ? [partitionField] : []);
                        }
                        setPartitionType(next);
                      }}
                    >
                      <option value="count">按行数分批</option>
                      <option value="value">按字段值分批</option>
                    </select>
                  </div>
                  <div className="partition-field-group">
                    <label className="field-label">
                      分批字段
                      {partitionType === 'count' && (
                        <span className="field-hint">（支持复合唯一，可多选）</span>
                      )}
                    </label>
                    {partitionType === 'count' ? (
                      <div
                        ref={partitionFieldDropdownRef}
                        className={`partition-select partition-select-dropdown ${partitionFieldDropdownOpen ? 'open' : ''} ${isDbLoad && (!dbSource || !tableName) ? 'disabled' : ''}`}
                        role="button"
                        tabIndex={isDbLoad && (!dbSource || !tableName) ? -1 : 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDbLoad && (!dbSource || !tableName)) return;
                          setPartitionFieldDropdownOpen((v) => !v);
                        }}
                        onKeyDown={(e) => {
                          if (isDbLoad && (!dbSource || !tableName)) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setPartitionFieldDropdownOpen((v) => !v);
                          }
                        }}
                      >
                        <span className={partitionFieldsForCount.length > 0 ? 'value' : 'placeholder'}>
                          {partitionFieldsForCount.length > 0
                            ? partitionFieldsForCount.join('、')
                            : '请选择字段'}
                        </span>
                        <svg className="partition-select-caret" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {partitionFieldDropdownOpen && (
                          <div
                            className="partition-field-dropdown"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="partition-field-search-wrap">
                              <input
                                type="text"
                                className="partition-field-search"
                                placeholder="搜索字段"
                                value={partitionFieldSearch}
                                onChange={(e) => setPartitionFieldSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            {columns
                              .filter(
                                (col) =>
                                  !partitionFieldSearch.trim() ||
                                  col.sourceFieldName.toLowerCase().includes(partitionFieldSearch.trim().toLowerCase()) ||
                                  col.sourceDataType.toLowerCase().includes(partitionFieldSearch.trim().toLowerCase())
                              )
                              .map((col) => {
                              const checked = partitionFieldsForCount.includes(col.sourceFieldName);
                              return (
                                <label key={col.id} className="partition-field-dropdown-item">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setPartitionFieldsForCount([...partitionFieldsForCount, col.sourceFieldName]);
                                      } else {
                                        setPartitionFieldsForCount(partitionFieldsForCount.filter((n) => n !== col.sourceFieldName));
                                      }
                                    }}
                                  />
                                  <span>{col.sourceFieldName}</span>
                                  <span className="partition-field-type">({col.sourceDataType})</span>
                                  {col.isPrimary && (
                                    <span className="partition-field-key" title="主键">
                                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="3.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1"/>
                                        <path d="M5.5 5.5l3.5-1v1.2l-1.2 1.2v2h-1v-1.2l1.2-1.2V4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M8.2 7.9v1.2M9.2 8.9v1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                                      </svg>
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        ref={partitionFieldValueDropdownRef}
                        className={`partition-select partition-select-dropdown ${partitionFieldValueDropdownOpen ? 'open' : ''} ${isDbLoad && (!dbSource || !tableName) ? 'disabled' : ''}`}
                        role="button"
                        tabIndex={isDbLoad && (!dbSource || !tableName) ? -1 : 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDbLoad && (!dbSource || !tableName)) return;
                          setPartitionFieldValueDropdownOpen((v) => !v);
                        }}
                        onKeyDown={(e) => {
                          if (isDbLoad && (!dbSource || !tableName)) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setPartitionFieldValueDropdownOpen((v) => !v);
                          }
                        }}
                      >
                        <span className={partitionField ? 'value' : 'placeholder'}>
                          {partitionField
                            ? (() => {
                                const col = columns.find((c) => c.sourceFieldName === partitionField);
                                return col ? `${col.sourceFieldName} (${col.sourceDataType})` : partitionField;
                              })()
                            : '请选择字段'}
                        </span>
                        <svg className="partition-select-caret" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {partitionFieldValueDropdownOpen && (
                          <div
                            className="partition-field-dropdown"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="partition-field-search-wrap">
                              <input
                                type="text"
                                className="partition-field-search"
                                placeholder="搜索字段"
                                value={partitionFieldValueSearch}
                                onChange={(e) => setPartitionFieldValueSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            {columns
                              .filter(
                                (col) =>
                                  !partitionFieldValueSearch.trim() ||
                                  col.sourceFieldName.toLowerCase().includes(partitionFieldValueSearch.trim().toLowerCase()) ||
                                  col.sourceDataType.toLowerCase().includes(partitionFieldValueSearch.trim().toLowerCase())
                              )
                              .map((col) => (
                                <div
                                  key={col.id}
                                  role="button"
                                  tabIndex={0}
                                  className={`partition-field-dropdown-item partition-field-dropdown-item-single ${partitionField === col.sourceFieldName ? 'selected' : ''}`}
                                  onClick={() => {
                                    setPartitionField(col.sourceFieldName);
                                    setPartitionFieldValueDropdownOpen(false);
                                    setPartitionFieldValueSearch('');
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      setPartitionField(col.sourceFieldName);
                                      setPartitionFieldValueDropdownOpen(false);
                                      setPartitionFieldValueSearch('');
                                    }
                                  }}
                                >
                                  <span>{col.sourceFieldName}</span>
                                  <span className="partition-field-type">({col.sourceDataType})</span>
                                  {col.isPrimary && (
                                    <span className="partition-field-key" title="主键">
                                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="3.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1"/>
                                        <path d="M5.5 5.5l3.5-1v1.2l-1.2 1.2v2h-1v-1.2l1.2-1.2V4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M8.2 7.9v1.2M9.2 8.9v1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                                      </svg>
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {partitionType === 'count' && (
                  <div className="partition-fields">
                    <div className="partition-field-group">
                      <label className="field-label">每批行数</label>
                      <input
                        type="text"
                        className="partition-input"
                        placeholder="10000"
                        value={partitionSize}
                        disabled={isDbLoad && (!dbSource || !tableName)}
                        onChange={(e) => setPartitionSize(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="label">
              <span className="req">*</span>目标表：
            </div>
            <div className="control">
              <div className="radio-row">
                <label
                  className="radio"
                  title="必须保证已有表的字段名和数量与需要载入的表一致"
                >
                  <input
                    type="radio"
                    name="targetMode"
                    checked={targetMode === 'existing'}
                    onChange={() => setTargetMode('existing')}
                    disabled={isDbLoad && (!dbSource || !tableName)}
                  />
                  <span>选择已有表</span>
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="targetMode"
                    checked={targetMode === 'new'}
                    onChange={() => setTargetMode('new')}
                    disabled={isDbLoad && (!dbSource || !tableName)}
                  />
                  <span>选择新建表</span>
                </label>
              </div>

              {targetMode === 'existing' ? (
                <>
                  <div
                    className={`target-input ${targetError ? 'error' : ''} ${isDbLoad && (!dbSource || !tableName) ? 'disabled' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (isDbLoad && (!dbSource || !tableName)) return;
                      setTargetModalOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (isDbLoad && (!dbSource || !tableName)) return;
                      if (e.key === 'Enter' || e.key === ' ') setTargetModalOpen(true);
                    }}
                  >
                    <span className={targetTable ? 'value' : 'placeholder'}>
                      {targetTable ? `${targetDir}/${targetDb}/${targetTable}` : '请选择目标表'}
                    </span>
                  </div>
                  {targetError && <div className="error-text">请选择目标表</div>}
                </>
              ) : (
                <>
                  <div
                    className={`target-input ${newTableError ? 'error' : ''} ${isDbLoad && (!dbSource || !tableName) ? 'disabled' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (isDbLoad && (!dbSource || !tableName)) return;
                      setNewTableModalOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (isDbLoad && (!dbSource || !tableName)) return;
                      if (e.key === 'Enter' || e.key === ' ') setNewTableModalOpen(true);
                    }}
                  >
                    <span className={newTableTargetDb ? 'value' : 'placeholder'}>
                      {newTableTargetDb
                        ? `${newTableTargetDir}/${newTableTargetDb}`
                        : '请选择目标库'}
                    </span>
                  </div>
                  {newTableError && <div className="error-text">请选择目标库</div>}
                </>
              )}
            </div>
          </div>

          {targetMode === 'existing' && (
            <div className="form-row">
              <div className="label">数据处理方式：</div>
              <div className="control">
                <div className="radio-row-horizontal">
                  <label className="radio">
                    <input
                      type="radio"
                      name="dataProcessMode"
                      checked={dataProcessMode === 'append'}
                      onChange={() => setDataProcessMode('append')}
                    />
                    <span>追加数据</span>
                  </label>
                  <label className="radio">
                    <input
                      type="radio"
                      name="dataProcessMode"
                      checked={dataProcessMode === 'overwrite'}
                      onChange={() => setDataProcessMode('overwrite')}
                    />
                    <span>覆盖数据</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="label">主键冲突处理：</div>
            <div className="control">
              <div className="radio-row-horizontal">
                <label className="radio">
                  <input
                    type="radio"
                    name="conflictStrategy"
                    checked={conflictStrategy === 'fail'}
                    onChange={() => setConflictStrategy('fail')}
                  />
                  <span>导入失败</span>
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="conflictStrategy"
                    checked={conflictStrategy === 'skip'}
                    onChange={() => setConflictStrategy('skip')}
                  />
                  <span>跳过冲突行</span>
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="conflictStrategy"
                    checked={conflictStrategy === 'replace'}
                    onChange={() => setConflictStrategy('replace')}
                  />
                  <span>替换冲突行</span>
                </label>
              </div>
            </div>
          </div>

          {targetMode === 'existing' && targetTable && tableName && (
            <>
              <div className="table-definition-section">
                <div className="section-title">表结构对比</div>

                <div className="schema-compare-wrapper">
                  <div className="compare-table-header">
                    <div className="compare-table-info">
                      <span className="compare-label">源表：</span>
                      <span className="compare-value">{dbName}.{tableName}</span>
                    </div>
                    <div className="compare-table-info">
                      <span className="compare-label">目标表：</span>
                      <span className="compare-value">{targetDir}/{targetDb}/{targetTable}</span>
                    </div>
                  </div>

                  <div className="compare-table-container">
                    <table className="compare-table">
                      <thead>
                        <tr className="compare-header-group">
                          <th colSpan={5} className="compare-group-header source-group">源表结构</th>
                          <th className="compare-divider-header"></th>
                          <th colSpan={5} className="compare-group-header target-group">目标表结构</th>
                        </tr>
                        <tr>
                          <th style={{ width: '160px' }}>字段名</th>
                          <th style={{ width: '120px' }}>数据类型</th>
                          <th style={{ width: '70px' }}>主键</th>
                          <th style={{ width: '1fr' }}>描述</th>
                          <th style={{ width: '120px' }}>默认值</th>
                          <th style={{ width: '2px' }}></th>
                          <th style={{ width: '160px' }}>字段名</th>
                          <th style={{ width: '120px' }}>数据类型</th>
                          <th style={{ width: '70px' }}>主键</th>
                          <th style={{ width: '1fr' }}>描述</th>
                          <th style={{ width: '120px' }}>默认值</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const maxLen = Math.max(columns.length, getTargetTableFields.length);
                          const norm = (s: string | undefined) => (s ?? '').trim() || '-';
                          const isFieldIdentical = (s: typeof columns[0], t: typeof getTargetTableFields[0]) =>
                            s && t &&
                            s.sourceFieldName.toLowerCase() === t.name.toLowerCase() &&
                            s.sourceDataType === t.type &&
                            s.isPrimary === t.isPrimary &&
                            norm(s.description) === norm(t.description) &&
                            norm(s.defaultValue) === norm(t.defaultValue);

                          return Array.from({ length: maxLen }).map((_, idx) => {
                            const sourceField = columns[idx];
                            const targetField = getTargetTableFields[idx];
                            const sourceOnly = sourceField && !targetField;
                            const targetOnly = !sourceField && targetField;
                            const bothExist = sourceField && targetField;
                            const isRowDifferent = sourceOnly || targetOnly || (bothExist && !isFieldIdentical(sourceField, targetField));

                            return (
                              <tr key={idx}>
                                {/* 源表字段 */}
                                <td className={`${sourceField ? (sourceOnly ? 'highlight-add' : '') : 'empty-cell'} ${isRowDifferent ? 'compare-diff' : ''}`}>
                                  {sourceField?.sourceFieldName || '-'}
                                </td>
                                <td className={`${sourceField ? (sourceOnly ? 'highlight-add' : '') : 'empty-cell'} ${isRowDifferent ? 'compare-diff' : ''}`}>
                                  {sourceField?.sourceDataType || '-'}
                                </td>
                                <td className={`${sourceField ? (sourceOnly ? 'highlight-add' : '') : 'empty-cell'} ${isRowDifferent ? 'compare-diff' : ''}`}>
                                  {sourceField?.isPrimary ? '✓' : ''}
                                </td>
                                <td className={`${sourceField ? (sourceOnly ? 'highlight-add' : '') : 'empty-cell'} ${isRowDifferent ? 'compare-diff' : ''}`}>
                                  {sourceField?.description || '-'}
                                </td>
                                <td className={`${sourceField ? (sourceOnly ? 'highlight-add' : '') : 'empty-cell'} ${isRowDifferent ? 'compare-diff' : ''}`}>
                                  {sourceField?.defaultValue || '-'}
                                </td>

                                {/* 分隔线 */}
                                <td className="compare-divider"></td>

                                {/* 目标表字段 */}
                                <td className={`${targetField ? (targetOnly ? 'highlight-remove' : '') : 'empty-cell'} ${isRowDifferent ? 'compare-diff' : ''}`}>
                                  {targetField?.name || '-'}
                                </td>
                                <td className={`${targetField ? (targetOnly ? 'highlight-remove' : '') : 'empty-cell'} ${isRowDifferent ? 'compare-diff' : ''}`}>
                                  {targetField?.type || '-'}
                                </td>
                                <td className={`${targetField ? (targetOnly ? 'highlight-remove' : '') : 'empty-cell'} ${isRowDifferent ? 'compare-diff' : ''}`}>
                                  {targetField?.isPrimary ? '✓' : ''}
                                </td>
                                <td className={`${targetField ? (targetOnly ? 'highlight-remove' : '') : 'empty-cell'} ${isRowDifferent ? 'compare-diff' : ''}`}>
                                  {targetField?.description || '-'}
                                </td>
                                <td className={`${targetField ? (targetOnly ? 'highlight-remove' : '') : 'empty-cell'} ${isRowDifferent ? 'compare-diff' : ''}`}>
                                  {targetField?.defaultValue || '-'}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                  {!isSchemaIdentical && (
                    <div className="schema-mismatch-tip">schema不匹配</div>
                  )}
                </div>
              </div>
            </>
          )}

          {targetMode === 'new' && newTableTargetDb && (
            <>
              <div className="table-definition-section">
                <div className="section-title">表定义</div>

                <div className="form-row-split">
                  <div className="split-item">
                    <label className="split-label">
                      <span className="req">*</span>表名
                    </label>
                    <span className="table-input-readonly input-white-readonly">{newTableName || '-'}</span>
                  </div>
                  <div className="split-item">
                    <label className="split-label">表描述</label>
                    <input
                      type="text"
                      className="input-white"
                      placeholder="请输入表描述"
                      value={newTableDesc}
                      onChange={(e) => setNewTableDesc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="columns-table-wrap">
                  <table className="columns-table">
                    <thead>
                      <tr>
                        <th style={{ width: '140px' }}>字段名</th>
                        <th style={{ width: '120px' }}>源数据类型</th>
                        <th style={{ width: '180px' }}>目标数据类型</th>
                        <th style={{ width: '60px' }}>主键</th>
                        <th style={{ width: '200px' }}>列描述</th>
                        <th style={{ width: '140px' }}>默认值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {columns.map((col) => (
                        <tr key={col.id}>
                          <td>
                            <span className="table-input-readonly">{col.name}</span>
                          </td>
                          <td>
                            <span className="source-type-text">{col.sourceDataType}</span>
                          </td>
                          <td>
                            <div className="type-cell">
                              <select
                                className="table-select"
                                value={col.dataType}
                                onChange={(e) => {
                                  const newType = e.target.value;
                                  const typeOption = getDataTypeOptions.find(opt => opt.value === newType);
                                  setColumns((prev) =>
                                    prev.map((c) => 
                                      c.id === col.id 
                                        ? { 
                                            ...c, 
                                            dataType: newType, 
                                            length: typeOption?.needsLength ? c.length : '',
                                            isPrimary: (newType === 'TEXT' || newType === 'DATETIME' || newType === 'TIMESTAMP') ? false : c.isPrimary 
                                          }
                                        : c
                                    )
                                  );
                                }}
                              >
                                {getDataTypeOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              {(() => {
                                const typeOption = getDataTypeOptions.find(opt => opt.value === col.dataType);
                                return typeOption?.needsLength && (
                                  <input
                                    type="text"
                                    className="table-input-small"
                                    value={col.length}
                                    placeholder="长度"
                                    onChange={(e) => {
                                      setColumns((prev) =>
                                        prev.map((c) => (c.id === col.id ? { ...c, length: e.target.value } : c))
                                      );
                                    }}
                                  />
                                );
                              })()}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={col.isPrimary}
                              disabled={col.dataType === 'TEXT' || col.dataType === 'DATETIME' || col.dataType === 'TIMESTAMP'}
                              onChange={(e) => {
                                setColumns((prev) =>
                                  prev.map((c) => (c.id === col.id ? { ...c, isPrimary: e.target.checked } : c))
                                );
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="table-input"
                              placeholder="请输入描述"
                              value={col.description}
                              onChange={(e) => {
                                setColumns((prev) =>
                                  prev.map((c) => (c.id === col.id ? { ...c, description: e.target.value } : c))
                                );
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="table-input"
                              placeholder="请输入默认值"
                              value={col.defaultValue}
                              onChange={(e) => {
                                setColumns((prev) =>
                                  prev.map((c) => (c.id === col.id ? { ...c, defaultValue: e.target.value } : c))
                                );
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="form-footer">
          <button
            type="button"
            className={`primary ${targetMode === 'existing' && targetTable && tableName && !isSchemaIdentical ? 'disabled' : ''}`}
            disabled={targetMode === 'existing' && !!targetTable && !!tableName && !isSchemaIdentical}
            title={targetMode === 'existing' && targetTable && tableName && !isSchemaIdentical ? '请确保源表与目标表结构完全一致后再创建' : ''}
            onClick={() => {
              if (targetMode === 'existing') {
                if (!targetTable) {
                  setTargetError(true);
                  return;
                }
                if (!isSchemaIdentical) return;
                setTargetError(false);
              } else {
                if (!newTableTargetDb) {
                  setNewTableError(true);
                  return;
                }
                setNewTableError(false);
              }
            }}
          >
            创建并开始载入
          </button>
        </div>
      </div>

      <TablePickerModal
        isOpen={tableModalOpen}
        databases={databaseOptions}
        getTables={getTablesForDb}
        initialDb={dbName}
        initialTable={tableName}
        onCancel={() => setTableModalOpen(false)}
        onConfirm={(db, table) => {
          setDbName(db);
          setTableName(table);
          setTableModalOpen(false);
        }}
      />

      <TargetLocationPickerModal
        isOpen={targetModalOpen}
        initialDir={targetDir}
        initialDb={targetDb}
        initialTable={targetTable}
        onCancel={() => setTargetModalOpen(false)}
        onConfirm={(dir, db, table) => {
          setTargetDir(dir);
          setTargetDb(db);
          setTargetTable(table ?? '');
          setTargetError(false);
          setTargetModalOpen(false);
        }}
      />

      <TargetLocationPickerModal
        isOpen={newTableModalOpen}
        initialDir={newTableTargetDir}
        initialDb={newTableTargetDb}
        initialTable=""
        mode="db-only"
        onCancel={() => setNewTableModalOpen(false)}
        onConfirm={(dir, db) => {
          setNewTableTargetDir(dir);
          setNewTableTargetDb(db);
          setNewTableError(false);
          setNewTableModalOpen(false);
        }}
      />

      <TargetLocationPickerModal
        isOpen={unstructuredModalOpen}
        initialDir={unstructuredTargetDir}
        initialDb={unstructuredTargetDb}
        initialTable={unstructuredTargetVolume}
        mode="volume"
        onCancel={() => setUnstructuredModalOpen(false)}
        onConfirm={(dir, db, volume) => {
          setUnstructuredTargetDir(dir);
          setUnstructuredTargetDb(db);
          setUnstructuredTargetVolume(volume || '');
          setUnstructuredModalOpen(false);
        }}
      />
    </div>
  );
};

export default DataLoadCreate;

