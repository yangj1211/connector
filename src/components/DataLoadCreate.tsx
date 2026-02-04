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
  const fileTypeDropdownRef = useRef<HTMLDivElement>(null);
  
  const [dataType, setDataType] = useState<DataType>('structured');
  const [loadFrom, setLoadFrom] = useState<LoadFrom>('connector');
  const [structuredLoadType, setStructuredLoadType] = useState<StructuredLoadType>('database');
  const [unstructuredLoadType, setUnstructuredLoadType] = useState<UnstructuredLoadType>('file');
  const [urlParseMethod, setUrlParseMethod] = useState<'page' | 'subpage' | 'targeted'>('page'); // page: 单页抓取, subpage: 递归抓取, targeted: 定向区域链接抓取
  const [webpageUrls, setWebpageUrls] = useState<string[]>([]); // 网页载入 URL 列表，最多 20 个
  const [webpageLoadMode, setWebpageLoadMode] = useState<'once' | 'periodic'>('once'); // 网页载入模式：一次载入/周期载入
  const [addUrlModalOpen, setAddUrlModalOpen] = useState(false); // 添加链接弹窗状态
  const [newUrlInput, setNewUrlInput] = useState(''); // 新URL输入框的值
  const [urlInputError, setUrlInputError] = useState<string | null>(null); // URL格式错误信息
  const [webpagePeriodDays, setWebpagePeriodDays] = useState<number>(1); // 周期载入天数：1, 3, 7, 30, 60, 90, 180
  const [decompressionStrategy, setDecompressionStrategy] = useState<'ignore' | 'keep'>('ignore'); // 解压策略：忽略目录结构/保持原始目录结构
  const [duplicateFileNameCheck, setDuplicateFileNameCheck] = useState(false); // 重复文件判断：文件名相同
  const [duplicateMd5Check, setDuplicateMd5Check] = useState(false); // 重复文件判断：MD5
  const [duplicateHandleMethod, setDuplicateHandleMethod] = useState<'skip' | 'overwrite'>('skip'); // 重复文件处理方式：跳过/覆盖
  const [enableWebpageFilter, setEnableWebpageFilter] = useState(false); // 内容筛选开关
  const [contentFilterSelector, setContentFilterSelector] = useState(''); // 主区域CSS选择器
  const [contentFilterSelectorError, setContentFilterSelectorError] = useState<string | null>(null); // CSS 选择器语法校验错误
  const [enableLinkAreaFilter, setEnableLinkAreaFilter] = useState(false); // 链接区域筛选开关（定向区域链接抓取时显示）
  const [linkAreaSelector, setLinkAreaSelector] = useState(''); // 链接区域CSS选择器
  const [linkAreaSelectorError, setLinkAreaSelectorError] = useState<string | null>(null); // 链接区域选择器语法校验错误
  const [enableFileDownload, setEnableFileDownload] = useState(false); // 文件下载开关
  const [onlyAttachmentContent, setOnlyAttachmentContent] = useState(true); // 仅保留附件内容
  const [enableLinkExtraction, setEnableLinkExtraction] = useState(false); // 链接内容保留开关
  
  // 附件格式分类定义
  const fileTypeCategories = {
    文档: ['TXT', 'PDF', 'PPT', 'DOC', 'DOCX', 'Markdown'],
    图片: ['JPG', 'PNG', 'GIF', 'BMP', 'SVG'],
    音频: ['MP3', 'WAV', 'AAC', 'FLAC'],
    视频: ['MP4', 'AVI', 'MKV', 'MOV'],
    其他: ['ZIP', 'RAR', 'XLS', 'XLSX', 'CSV']
  };
  
  // 获取所有文件格式
  const allFileTypes = Object.values(fileTypeCategories).flat();
  
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>(allFileTypes); // 默认全选
  const [fileTypeDropdownOpen, setFileTypeDropdownOpen] = useState(false);
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
  const [loadMode, setLoadMode] = useState('once'); // once: 一次载入, incremental: 实时同步
  const [enablePartitionSync, setEnablePartitionSync] = useState(false); // 是否开启全量分区同步，默认关闭（false=单事务，true=多事务）
  const [partitionField, setPartitionField] = useState(''); // 按值分批：单字段
  const [partitionFieldsForCount, setPartitionFieldsForCount] = useState<string[]>([]); // 按行数分区：支持复合唯一（多字段）
  const [partitionFieldDropdownOpen, setPartitionFieldDropdownOpen] = useState(false); // 分区字段多选下拉是否展开
  const [partitionFieldSearch, setPartitionFieldSearch] = useState(''); // 分区字段下拉内搜索关键词
  const partitionFieldDropdownRef = useRef<HTMLDivElement>(null);
  const [partitionFieldValueDropdownOpen, setPartitionFieldValueDropdownOpen] = useState(false); // 按字段值分区单选下拉是否展开
  const [partitionFieldValueSearch, setPartitionFieldValueSearch] = useState(''); // 按字段值分区下拉内搜索关键词
  const partitionFieldValueDropdownRef = useRef<HTMLDivElement>(null);
  const [partitionType, setPartitionType] = useState<'count' | 'value'>('count'); // count: 按行数, value: 按字段值
  const [partitionSize, setPartitionSize] = useState('10000'); // 每区行数
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

  // CSS 选择器语法校验：使用浏览器原生 querySelector 检测
  const validateContentFilterSelector = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setContentFilterSelectorError(null);
      return;
    }
    try {
      // 使用 querySelector 验证语法，如果语法错误会抛出异常
      document.createElement('div').querySelector(trimmed);
      // 额外检查：确保选择器不是空字符串且包含有效字符
      if (trimmed.length === 0) {
        setContentFilterSelectorError('CSS 选择器不能为空');
        return;
      }
      setContentFilterSelectorError(null);
    } catch (err) {
      // 捕获 DOMException 或其他语法错误
      setContentFilterSelectorError('CSS 选择器语法无效，请检查后重新输入');
    }
  };

  // 链接区域CSS选择器语法校验
  const validateLinkAreaSelector = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setLinkAreaSelectorError(null);
      return;
    }
    try {
      // 使用 querySelector 验证语法，如果语法错误会抛出异常
      document.createElement('div').querySelector(trimmed);
      // 额外检查：确保选择器不是空字符串且包含有效字符
      if (trimmed.length === 0) {
        setLinkAreaSelectorError('CSS 选择器不能为空');
        return;
      }
      setLinkAreaSelectorError(null);
    } catch (err) {
      // 捕获 DOMException 或其他语法错误
      setLinkAreaSelectorError('CSS 选择器语法无效，请检查后重新输入');
    }
  };

  // URL格式校验
  const validateUrl = (url: string): boolean => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlInputError('请输入URL链接');
      return false;
    }
    
    // 使用浏览器原生URL构造函数进行验证
    try {
      const urlObj = new URL(trimmed);
      // 检查协议是否为 http 或 https
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        setUrlInputError('URL格式不正确，必须以 http:// 或 https:// 开头');
        return false;
      }
      // 检查hostname是否有效
      if (!urlObj.hostname || urlObj.hostname.length === 0) {
        setUrlInputError('URL格式不正确，请检查域名部分');
        return false;
      }
      setUrlInputError(null);
      return true;
    } catch (err) {
      setUrlInputError('URL格式不正确，请输入以 http:// 或 https:// 开头的有效URL');
      return false;
    }
  };

  // 点击外部关闭分区字段多选下拉
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

  // 点击外部关闭按字段值分区单选下拉
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

  // 点击外部关闭文件类型下拉
  useEffect(() => {
    if (!fileTypeDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (fileTypeDropdownRef.current && !fileTypeDropdownRef.current.contains(e.target as Node)) {
        setFileTypeDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [fileTypeDropdownOpen]);

  // 当"文件下载"开启且勾选"仅保留附件内容"时，自动关闭"链接内容保留"
  useEffect(() => {
    if (enableFileDownload && onlyAttachmentContent) {
      setEnableLinkExtraction(false);
    }
  }, [enableFileDownload, onlyAttachmentContent]);

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

  // 未选择表时关闭分区字段下拉
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
              支持结构化文件和数据库表导入表中
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

              {unstructuredLoadType === 'file' && (
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
                        <span>一次载入路径</span>
                      </label>
                      <label className="radio">
                        <input
                          type="radio"
                          name="unstructuredMode"
                        />
                        <span>周期载入路径</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {unstructuredLoadType === 'webpage' && (
                <>
                  <div className="form-row">
                    <div className="label">
                      <span className="req">*</span>载入模式：
                    </div>
                    <div className="control">
                      <div className="radio-row-horizontal">
                        <label className="radio">
                          <input
                            type="radio"
                            name="webpageMode"
                            checked={webpageLoadMode === 'once'}
                            onChange={() => setWebpageLoadMode('once')}
                          />
                          <span>一次载入</span>
                        </label>
                        <label className="radio">
                          <input
                            type="radio"
                            name="webpageMode"
                            checked={webpageLoadMode === 'periodic'}
                            onChange={() => setWebpageLoadMode('periodic')}
                          />
                          <span>周期载入</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  {webpageLoadMode === 'periodic' && (
                    <div className="form-row">
                      <div className="label">周期：</div>
                      <div className="control">
                        <select
                          className="select"
                          value={webpagePeriodDays}
                          onChange={(e) => setWebpagePeriodDays(Number(e.target.value))}
                          style={{ width: 120 }}
                        >
                          <option value={1}>1天</option>
                          <option value={3}>3天</option>
                          <option value={7}>7天</option>
                          <option value={30}>30天</option>
                          <option value={60}>60天</option>
                          <option value={90}>90天</option>
                          <option value={180}>180天</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="label">
                      重复文件处理：
                      <span className="label-help" title="重复文件处理说明">?</span>
                    </div>
                    <div className="control">
                      <div className="duplicate-config-vertical">
                        <div>
                          <label className="config-label">判断规则：</label>
                          <div className="checkbox-group-horizontal">
                            <label className="checkbox-item">
                              <input
                                type="checkbox"
                                checked={duplicateFileNameCheck}
                                onChange={(e) => setDuplicateFileNameCheck(e.target.checked)}
                              />
                              <span>文件名相同</span>
                            </label>
                            <label className="checkbox-item">
                              <input
                                type="checkbox"
                                checked={duplicateMd5Check}
                                onChange={(e) => setDuplicateMd5Check(e.target.checked)}
                              />
                              <span>MD5</span>
                            </label>
                          </div>
                        </div>
                        <div className="handle-method-section">
                          <label className="config-label">处理方式：</label>
                          <div className="radio-group-horizontal">
                            <label className={`radio ${!duplicateFileNameCheck && !duplicateMd5Check ? 'disabled' : ''}`}>
                              <input
                                type="radio"
                                name="duplicateHandleMethod"
                                checked={duplicateHandleMethod === 'skip'}
                                onChange={() => setDuplicateHandleMethod('skip')}
                                disabled={!duplicateFileNameCheck && !duplicateMd5Check}
                              />
                              <span>跳过</span>
                            </label>
                            <label className={`radio ${!duplicateFileNameCheck && !duplicateMd5Check ? 'disabled' : ''}`}>
                              <input
                                type="radio"
                                name="duplicateHandleMethod"
                                checked={duplicateHandleMethod === 'overwrite'}
                                onChange={() => setDuplicateHandleMethod('overwrite')}
                                disabled={!duplicateFileNameCheck && !duplicateMd5Check}
                              />
                              <span>覆盖</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

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
                <>
                  <div className="form-row">
                    <div className="label">
                      <span className="req">*</span>网页抓取方式：
                    </div>
                    <div className="control">
                      <div className="url-parse-options">
                        <label className="url-parse-option">
                          <input 
                            type="radio" 
                            name="urlParseMethod" 
                            value="page" 
                            checked={urlParseMethod === 'page'}
                            onChange={() => setUrlParseMethod('page')}
                          />
                          <div className="option-content">
                            <span className="option-title">单页抓取</span>
                            <span className="option-desc">仅抓取当前特定 URL 页面内容</span>
                          </div>
                        </label>
                        <label className="url-parse-option">
                          <input 
                            type="radio" 
                            name="urlParseMethod" 
                            value="subpage" 
                            checked={urlParseMethod === 'subpage'}
                            onChange={() => setUrlParseMethod('subpage')}
                          />
                          <div className="option-content">
                            <span className="option-title">递归抓取</span>
                            <span className="option-desc">以该 URL 为起点，自动抓取其包含的子页面</span>
                          </div>
                        </label>
                        <label className="url-parse-option">
                          <input 
                            type="radio" 
                            name="urlParseMethod" 
                            value="targeted" 
                            checked={urlParseMethod === 'targeted'}
                            onChange={() => setUrlParseMethod('targeted')}
                          />
                          <div className="option-content">
                            <span className="option-title">定向区域链接抓取</span>
                            <span className="option-desc">系统将访问入口网页，获取该区域内的链接，并深入抓取这些链接指向的具体网页内容。</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {urlParseMethod === 'targeted' && (
                    <>
                      <div className="form-row">
                        <div className="label">链接区域筛选：</div>
                        <div className="control">
                          <div className="switch-with-hint">
                            <label className="switch-wrap">
                              <input
                                type="checkbox"
                                className="switch-input"
                                checked={enableLinkAreaFilter}
                                onChange={(e) => setEnableLinkAreaFilter(e.target.checked)}
                              />
                              <span className="switch-slider" />
                            </label>
                            <span className="switch-hint">入口网址中选择链接的区域</span>
                          </div>
                        </div>
                      </div>
                      {enableLinkAreaFilter && (
                        <div className="content-filter-block">
                          <div className="form-row">
                            <div className="label" />
                            <div className="control">
                              <input
                                type="text"
                                className={`input content-selector-input ${linkAreaSelectorError ? 'input-error' : ''}`}
                                placeholder="请输入链接区域CSS选择器(例如: .link-area)"
                                value={linkAreaSelector}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setLinkAreaSelector(v);
                                  validateLinkAreaSelector(v);
                                }}
                                onBlur={() => validateLinkAreaSelector(linkAreaSelector)}
                              />
                              {linkAreaSelectorError && (
                                <p className="content-filter-error">{linkAreaSelectorError}</p>
                              )}
                              <p className="content-filter-desc">
                                表示入口网址中选择链接的区域，仅在此区域内抽取链接进行定向抓取
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="form-row">
                    <div className="label">内容筛选：</div>
                    <div className="control">
                      <div className="switch-with-hint">
                        <label className="switch-wrap">
                          <input
                            type="checkbox"
                            className="switch-input"
                            checked={enableWebpageFilter}
                            onChange={(e) => setEnableWebpageFilter(e.target.checked)}
                          />
                          <span className="switch-slider" />
                        </label>
                        <span className="switch-hint">指定网页抓取的主范围</span>
                      </div>
                    </div>
                  </div>

                  {enableWebpageFilter && (
                    <div className="content-filter-block">
                      <div className="form-row">
                        <div className="label" />
                        <div className="control">
                          <input
                            type="text"
                            className={`input content-selector-input ${contentFilterSelectorError ? 'input-error' : ''}`}
                            placeholder="请输入主区域CSS选择器(例如: #main-content)"
                            value={contentFilterSelector}
                            onChange={(e) => {
                              const v = e.target.value;
                              setContentFilterSelector(v);
                              validateContentFilterSelector(v);
                            }}
                            onBlur={() => validateContentFilterSelector(contentFilterSelector)}
                          />
                          {contentFilterSelectorError && (
                            <p className="content-filter-error">{contentFilterSelectorError}</p>
                          )}
                          <p className="content-filter-desc">
                            可批量指定相同结构的网页内容范围进行解析。例如,可筛选新闻、产品文档、商品详情页中特定位置的内容,忽略顶部导航、广告、推荐等无关信息
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="label">链接内容保留：</div>
                    <div className="control">
                      <div className="switch-with-hint">
                        <label className={`switch-wrap ${(enableFileDownload && onlyAttachmentContent) ? 'disabled' : ''}`}>
                          <input 
                            type="checkbox" 
                            className="switch-input"
                            checked={enableLinkExtraction}
                            onChange={(e) => setEnableLinkExtraction(e.target.checked)}
                            disabled={enableFileDownload && onlyAttachmentContent}
                          />
                          <span className="switch-slider" />
                        </label>
                        <span className={`switch-hint ${(enableFileDownload && onlyAttachmentContent) ? 'disabled' : ''}`}>保留网页中的超链接</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="label">文件下载：</div>
                    <div className="control">
                      <div className="file-download-row">
                        <label className="switch-wrap">
                          <input
                            type="checkbox"
                            className="switch-input"
                            checked={enableFileDownload}
                            onChange={(e) => setEnableFileDownload(e.target.checked)}
                          />
                          <span className="switch-slider" />
                        </label>
                        {enableFileDownload && (
                          <label className="checkbox-item only-attachment-check">
                            <input
                              type="checkbox"
                              checked={onlyAttachmentContent}
                              onChange={(e) => setOnlyAttachmentContent(e.target.checked)}
                            />
                            <span>仅保留附件内容</span>
                          </label>
                        )}
                      </div>
                      {enableFileDownload && (
                        <div className="attachment-format-block">
                          <div className="attachment-format-header">
                            <span className="attachment-format-icon" aria-hidden>📄</span>
                            <span className="attachment-format-label">附件格式过滤</span>
                          </div>
                          <div className="file-type-selector-wrapper" ref={fileTypeDropdownRef}>
                            <div 
                              className="file-type-selector"
                              onClick={() => setFileTypeDropdownOpen(!fileTypeDropdownOpen)}
                            >
                              <span className="file-type-display">
                                {selectedFileTypes.length === 0 
                                  ? '请选择文件类型' 
                                  : selectedFileTypes.length === allFileTypes.length
                                  ? `全部文件类型（${selectedFileTypes.length}项）`
                                  : `已选择 ${selectedFileTypes.length} 种文件类型`}
                              </span>
                              <span className="dropdown-arrow">{fileTypeDropdownOpen ? '▲' : '▼'}</span>
                            </div>
                            {fileTypeDropdownOpen && (
                              <div className="file-type-dropdown">
                                <div className="file-type-category-header">
                                  <label className="file-type-category-item">
                                    <input
                                      type="checkbox"
                                      checked={selectedFileTypes.length === allFileTypes.length}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedFileTypes(allFileTypes);
                                        } else {
                                          setSelectedFileTypes([]);
                                        }
                                      }}
                                    />
                                    <span>全选</span>
                                  </label>
                                </div>
                                {Object.entries(fileTypeCategories).map(([category, types]) => (
                                  <div key={category} className="file-type-category">
                                    <label className="file-type-category-item">
                                      <input
                                        type="checkbox"
                                        checked={types.every(t => selectedFileTypes.includes(t))}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedFileTypes(prev => {
                                              const newSet = new Set([...prev, ...types]);
                                              return Array.from(newSet);
                                            });
                                          } else {
                                            setSelectedFileTypes(prev => 
                                              prev.filter(t => !types.includes(t))
                                            );
                                          }
                                        }}
                                      />
                                      <span className="category-name">{category}</span>
                                      <span className="expand-arrow">›</span>
                                    </label>
                                    <div className="file-type-list">
                                      {types.map(type => (
                                        <label key={type} className="file-type-item">
                                          <input
                                            type="checkbox"
                                            checked={selectedFileTypes.includes(type)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedFileTypes(prev => [...prev, type]);
                                              } else {
                                                setSelectedFileTypes(prev => 
                                                  prev.filter(t => t !== type)
                                                );
                                              }
                                            }}
                                          />
                                          <span>{type}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="file-download-desc">
                            自动识别并下载网页中包含的文件附件(如PDF、Docx、Xlsx等)
                          </p>
                        </div>
                      )}
                      {!enableFileDownload && (
                        <span className="switch-hint">自动识别并下载网页中包含的文件附件（如 PDF、Docx 等）</span>
                      )}
                    </div>
                  </div>

                  {enableFileDownload && (
                    <div className="form-row">
                      <div className="label">
                        解压策略：
                        <span className="label-help" title="解压策略说明">?</span>
                      </div>
                      <div className="control">
                        <div className="radio-row-horizontal">
                          <label className="radio">
                            <input
                              type="radio"
                              name="decompressionStrategy"
                              checked={decompressionStrategy === 'ignore'}
                              onChange={() => setDecompressionStrategy('ignore')}
                            />
                            <span>忽略目录结构</span>
                          </label>
                          <label className="radio disabled">
                            <input
                              type="radio"
                              name="decompressionStrategy"
                              checked={decompressionStrategy === 'keep'}
                              onChange={() => setDecompressionStrategy('keep')}
                              disabled
                            />
                            <span>保持原始目录结构</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </>
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
                    <span className="upload-files-title">{urlParseMethod === 'targeted' ? '入口网页' : '载入网页'}</span>
                    <button
                      type="button"
                      className="add-url-modal-btn"
                      onClick={() => {
                        setNewUrlInput('');
                        setUrlInputError(null);
                        setAddUrlModalOpen(true);
                      }}
                      disabled={(urlParseMethod === 'subpage' || urlParseMethod === 'targeted') && webpageUrls.length >= 1}
                    >
                      添加链接
                    </button>
                  </div>
                  <div className="upload-files-table">
                    <table className="files-table">
                      <thead>
                        <tr>
                          <th>URL</th>
                          <th style={{ width: '100px' }}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {webpageUrls.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="empty-files">
                              <div className="empty-files-content">
                                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                                  <circle cx="30" cy="30" r="18" stroke="#d1d5db" strokeWidth="2" />
                                  <path d="M20 24h20M20 30h20M20 36h12" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <div className="empty-files-text">暂无数据</div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          webpageUrls.map((url, i) => (
                            <tr key={i}>
                              <td>{url}</td>
                              <td>
                                <button
                                  type="button"
                                  className="url-list-delete-btn"
                                  onClick={() => {
                                    setWebpageUrls((prev) => prev.filter((_, idx) => idx !== i));
                                  }}
                                >
                                  删除
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
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

          {dataType === 'structured' && (
            <>
            {structuredLoadType === 'file' && (
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
                  <span>实时同步</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="label">是否开启全量分区同步：</div>
            <div className="control">
              <label className="switch-wrap">
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={enablePartitionSync}
                  onChange={(e) => setEnablePartitionSync(e.target.checked)}
                />
                <span className="switch-slider" />
              </label>
            </div>
          </div>

          {enablePartitionSync && (
            <div className={`form-row partition-config ${isDbLoad && (!dbSource || !tableName) ? 'partition-config-disabled' : ''}`}>
              <div className="label"></div>
              <div className="control">
                <div className="partition-fields">
                  <div className="partition-field-group">
                    <label className="field-label field-label-with-help">
                      分区方式
                      <span className="partition-help tooltip-trigger">
                        ?
                        <div className="tooltip partition-tooltip partition-tooltip--both">
                          <div className="tooltip-block">
                            <div className="tooltip-title">按行数分区</div>
                            需字段唯一，支持复合唯一（多字段）。排序后按每区行数切分事务。<br />
                            示例：ORDER BY 字段 LIMIT 10000 / OFFSET 10000 等。
                          </div>
                          <div className="tooltip-block">
                            <div className="tooltip-title">按字段值分区</div>
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
                      <option value="count">按行数分区</option>
                      <option value="value">按字段值分区</option>
                    </select>
                  </div>
                  <div className="partition-field-group">
                    <label className="field-label">
                      分区字段
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
                      <label className="field-label">每区行数</label>
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

      {/* 添加链接弹窗 */}
      {addUrlModalOpen && (
        <div className="modal-overlay" onClick={() => {
          setNewUrlInput('');
          setUrlInputError(null);
          setAddUrlModalOpen(false);
        }}>
          <div className="modal-content add-url-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">添加链接</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setNewUrlInput('');
                  setUrlInputError(null);
                  setAddUrlModalOpen(false);
                }}
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="label">URL：</div>
                <div className="control">
                  <input
                    type="text"
                    className={`input ${urlInputError ? 'input-error' : ''}`}
                    placeholder="请输入URL链接"
                    value={newUrlInput}
                    onChange={(e) => {
                      setNewUrlInput(e.target.value);
                      if (urlInputError) {
                        validateUrl(e.target.value);
                      }
                    }}
                    onBlur={() => {
                      if (newUrlInput.trim()) {
                        validateUrl(newUrlInput);
                      } else {
                        setUrlInputError(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const trimmed = newUrlInput.trim();
                        const maxUrls = (urlParseMethod === 'subpage' || urlParseMethod === 'targeted') ? 1 : 20;
                        if (validateUrl(trimmed) && webpageUrls.length < maxUrls) {
                          setWebpageUrls((prev) => [...prev, trimmed]);
                          setNewUrlInput('');
                          setUrlInputError(null);
                          setAddUrlModalOpen(false);
                        }
                      }
                    }}
                  />
                  {urlInputError && (
                    <div className="url-input-error">{urlInputError}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => {
                  setNewUrlInput('');
                  setUrlInputError(null);
                  setAddUrlModalOpen(false);
                }}
              >
                取消
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-confirm"
                onClick={() => {
                  const trimmed = newUrlInput.trim();
                  const maxUrls = (urlParseMethod === 'subpage' || urlParseMethod === 'targeted') ? 1 : 20;
                  if (validateUrl(trimmed) && webpageUrls.length < maxUrls) {
                    setWebpageUrls((prev) => [...prev, trimmed]);
                    setNewUrlInput('');
                    setUrlInputError(null);
                    setAddUrlModalOpen(false);
                  }
                }}
                disabled={!newUrlInput.trim() || ((urlParseMethod === 'subpage' || urlParseMethod === 'targeted') ? webpageUrls.length >= 1 : webpageUrls.length >= 20) || !!urlInputError}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataLoadCreate;

