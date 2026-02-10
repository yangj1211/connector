import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateKnowledgeBase.css';

type TableColumn = { name: string; comment: string };

function getMockTableColumns(tableName: string): TableColumn[] {
  const presets: Record<string, TableColumn[]> = {
    jst_flat_table: [
      { name: 'id', comment: '主键ID' },
      { name: 'revenue', comment: '收入金额' },
      { name: 'cost', comment: '成本金额' },
      { name: 'created_at', comment: '创建时间' },
    ],
    jinpan_catalog: [
      { name: 'catalog_id', comment: '目录编码' },
      { name: 'catalog_name', comment: '目录名称' },
      { name: 'status', comment: '状态' },
    ],
    dwd_dcp: [
      { name: 'id', comment: '主键' },
      { name: 'name', comment: '名称' },
      { name: 'created_at', comment: '创建时间' },
    ],
    dws_dcp: [
      { name: 'id', comment: '主键' },
      { name: 'name', comment: '名称' },
      { name: 'updated_at', comment: '更新时间' },
    ],
    dwd_secrecy: [
      { name: 'id', comment: '主键' },
      { name: 'name', comment: '名称' },
    ],
  };
  return (
    presets[tableName] ?? [
      { name: 'id', comment: '主键' },
      { name: 'name', comment: '名称' },
      { name: 'created_at', comment: '创建时间' },
      { name: 'updated_at', comment: '更新时间' },
    ]
  );
}

const CreateKnowledgeBase: React.FC = () => {
  const navigate = useNavigate();
  const [knowledgeBaseName, setKnowledgeBaseName] = useState('');
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [remarks, setRemarks] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDataSourceModal, setShowDataSourceModal] = useState(false);
  const [showAddKnowledgeModal, setShowAddKnowledgeModal] = useState(false);
  const [addKnowledgeSource, setAddKnowledgeSource] = useState<'terminology' | 'sql_mapping' | 'logic'>('terminology');
  const [addKnowledgeName, setAddKnowledgeName] = useState('');
  const [addKnowledgeDesc, setAddKnowledgeDesc] = useState('');
  const [addKnowledgeSql, setAddKnowledgeSql] = useState('');
  const [addLogicType, setAddLogicType] = useState('系统智能判断');
  const [addLogicRelatedTables, setAddLogicRelatedTables] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [terminologyList, setTerminologyList] = useState<{ id: string; name: string; desc: string }[]>([]);
  const [sqlMappingList, setSqlMappingList] = useState<{ id: string; name: string; desc: string; sql: string }[]>([]);
  const [logicList, setLogicList] = useState<{ id: string; explanation: string; type: string; relatedTables?: string }[]>([]);
  const [logicSearchKeyword, setLogicSearchKeyword] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ jinpan: true });
  const [activeAdvancedTab, setActiveAdvancedTab] = useState('terminology');
  const [showNL2SQLConfig, setShowNL2SQLConfig] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [columnSemantics, setColumnSemantics] = useState<Record<string, Record<string, string>>>({});
  const [columnSemanticsEnabled, setColumnSemanticsEnabled] = useState<Record<string, Record<string, boolean>>>({});
  const [columnSemanticsModalTableId, setColumnSemanticsModalTableId] = useState<string | null>(null);
  const [columnSemanticsModalColumnSearch, setColumnSemanticsModalColumnSearch] = useState('');
  const [columnSemanticsSearchKeyword, setColumnSemanticsSearchKeyword] = useState('');
  const [tableSupplementNotes, setTableSupplementNotes] = useState<Record<string, string>>({});
  const [logicRelatedTablesDropdownOpen, setLogicRelatedTablesDropdownOpen] = useState(false);
  const [logicRelatedTablesSearchKeyword, setLogicRelatedTablesSearchKeyword] = useState('');
  const logicRelatedTablesDropdownRef = useRef<HTMLDivElement>(null);

  type TreeNode = {
    id: string;
    name: string;
    description?: string;
    expandable?: boolean;
    selectable?: boolean;
    children?: TreeNode[];
  };

  const dataSourceTree: TreeNode[] = [
    { id: 'default', name: '默认', expandable: true, selectable: false, children: [] },
    {
      id: 'jinpan',
      name: '金盘问数',
      expandable: true,
      selectable: false,
      children: [
        { id: 'gongsi', name: '公司公告', expandable: true, selectable: false },
        { id: 'gongsi_result', name: '公司公告解析结果', expandable: true, selectable: false },
        { id: 'jst_flat', name: 'jst_flat_table', description: '金盘问数扁平表', selectable: true },
        { id: 'jinpan_catalog', name: 'jinpan_catalog', description: '金盘目录表', selectable: true },
        { id: 'dwd_dcp', name: 'dwd_dcp', description: 'DCP 明细层', selectable: true },
        { id: 'dws_dcp', name: 'dws_dcp', description: 'DCP 汇总层', selectable: true },
        { id: 'dwd_load', name: 'dwd_load', selectable: false },
        { id: 'dwd_secrecy', name: 'dwd_secrecy', description: '保密明细表', selectable: true },
      ],
    },
  ];

  const flattenSelectableTables = (nodes: TreeNode[]): { id: string; name: string; description: string }[] => {
    const result: { id: string; name: string; description: string }[] = [];
    nodes.forEach((n) => {
      if (n.selectable && n.id) result.push({ id: n.id, name: n.name, description: n.description ?? '' });
      if (n.children && n.children.length) result.push(...flattenSelectableTables(n.children));
    });
    return result;
  };

  const selectedTables = useMemo(() => {
    const all = flattenSelectableTables(dataSourceTree);
    return all.filter((t) => selectedDataSources.includes(t.id));
  }, [selectedDataSources]);

  const filteredColumnSemanticsTables = useMemo(() => {
    if (!columnSemanticsSearchKeyword.trim()) return selectedTables;
    const kw = columnSemanticsSearchKeyword.trim().toLowerCase();
    return selectedTables.filter((t) => t.name.toLowerCase().includes(kw) || (t.description && t.description.toLowerCase().includes(kw)));
  }, [selectedTables, columnSemanticsSearchKeyword]);

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleColumnSemanticChange = (tableId: string, columnName: string, value: string) => {
    setColumnSemantics((prev) => ({
      ...prev,
      [tableId]: { ...(prev[tableId] ?? {}), [columnName]: value },
    }));
  };

  const handleColumnSemanticEnabledToggle = (tableId: string, columnName: string) => {
    setColumnSemanticsEnabled((prev) => ({
      ...prev,
      [tableId]: { ...(prev[tableId] ?? {}), [columnName]: !(prev[tableId]?.[columnName] ?? true) },
    }));
  };

  const handleTableSupplementNoteChange = (tableId: string, value: string) => {
    setTableSupplementNotes((prev) => ({ ...prev, [tableId]: value }));
  };

  const closeColumnSemanticsModal = () => {
    setColumnSemanticsModalTableId(null);
    setColumnSemanticsModalColumnSearch('');
  };

  const handleDataSourceToggle = (id: string) => {
    setSelectedDataSources((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const DbIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="tree-db-icon">
      <ellipse cx="8" cy="4" rx="5" ry="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 4v6c0 1.1 2.24 2 5 2s5-.9 5-2V4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10v2c0 1.1 2.24 2 5 2s5-.9 5-2v-2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );

  const handleCreate = () => {
    console.log('创建知识库:', {
      name: knowledgeBaseName,
      dataSources: selectedDataSources,
      remarks,
    });
    // TODO: 调用创建 API
    navigate('/data-exploration');
  };

  const handleCancel = () => {
    navigate('/data-exploration');
  };

  const openAddKnowledgeModal = (
    source: 'terminology' | 'sql_mapping' | 'logic',
    item?: { id: string; name?: string; desc?: string; sql?: string; explanation?: string; type?: string; relatedTables?: string }
  ) => {
    setAddKnowledgeSource(source);
    setEditingId(item?.id ?? null);
    setAddKnowledgeName(item?.name ?? item?.explanation ?? '');
    setAddKnowledgeDesc(item?.desc ?? '');
    setAddKnowledgeSql(item?.sql ?? '');
    setAddLogicType(item?.type ?? '系统智能判断');
    setAddLogicRelatedTables(
      item?.relatedTables === '全部' || !item?.relatedTables
        ? []
        : item.relatedTables.split(',').filter(Boolean)
    );
    setShowAddKnowledgeModal(true);
  };

  const closeAddKnowledgeModal = () => {
    setShowAddKnowledgeModal(false);
    setEditingId(null);
    setAddLogicType('');
    setAddLogicRelatedTables([]);
    setLogicRelatedTablesDropdownOpen(false);
    setLogicRelatedTablesSearchKeyword('');
  };

  useEffect(() => {
    if (!logicRelatedTablesDropdownOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (logicRelatedTablesDropdownRef.current && !logicRelatedTablesDropdownRef.current.contains(e.target as Node)) {
        setLogicRelatedTablesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [logicRelatedTablesDropdownOpen]);

  const handleAddKnowledgeConfirm = () => {
    if (addKnowledgeSource === 'sql_mapping') {
      if (!addKnowledgeName.trim() || !addKnowledgeDesc.trim() || !addKnowledgeSql.trim()) return;
      const item = { id: editingId || `sql-${Date.now()}`, name: addKnowledgeName.trim(), desc: addKnowledgeDesc.trim(), sql: addKnowledgeSql.trim() };
      setSqlMappingList((prev) =>
        editingId ? prev.map((i) => (i.id === editingId ? item : i)) : [...prev, item]
      );
    } else if (addKnowledgeSource === 'logic') {
      if (!addKnowledgeName.trim() || !addLogicType.trim()) return;
      const item = {
        id: editingId || `logic-${Date.now()}`,
        explanation: addKnowledgeName.trim(),
        type: addLogicType.trim(),
        relatedTables: addLogicRelatedTables.length === 0 ? '全部' : addLogicRelatedTables.join(','),
      };
      setLogicList((prev) =>
        editingId ? prev.map((i) => (i.id === editingId ? item : i)) : [...prev, item]
      );
    } else {
      if (!addKnowledgeName.trim() || !addKnowledgeDesc.trim()) return;
      const item = { id: editingId || `term-${Date.now()}`, name: addKnowledgeName.trim(), desc: addKnowledgeDesc.trim() };
      setTerminologyList((prev) =>
        editingId ? prev.map((i) => (i.id === editingId ? item : i)) : [...prev, item]
      );
    }
    closeAddKnowledgeModal();
  };

  const handleDeleteKnowledge = (source: 'terminology' | 'sql_mapping' | 'logic', id: string) => {
    if (!window.confirm('确定要删除吗？')) return;
    if (source === 'sql_mapping') {
      setSqlMappingList((prev) => prev.filter((i) => i.id !== id));
    } else if (source === 'logic') {
      setLogicList((prev) => prev.filter((i) => i.id !== id));
    } else {
      setTerminologyList((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="create-kb-page">
      <div className="create-kb-container">
        <div className="create-kb-header">
          <button className="back-btn" onClick={handleCancel}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="create-kb-title">新建知识库</h2>
          <button
            type="button"
            className="data-source-trigger"
            onClick={() => setShowDataSourceModal(true)}
          >
            <span className="data-source-trigger-label">选择数据源</span>
            {selectedDataSources.length > 0 && (
              <span className="data-source-badge">{selectedDataSources.length}</span>
            )}
          </button>
        </div>

        <div className="create-kb-form">
          {/* 知识库名称 */}
          <div className="form-group">
            <label className="form-label required">知识库名称</label>
            <div className="input-with-counter">
              <input
                type="text"
                className="form-input"
                placeholder="请输入知识库名称"
                value={knowledgeBaseName}
                onChange={(e) => setKnowledgeBaseName(e.target.value.slice(0, 20))}
                maxLength={20}
              />
              <span className="char-counter">{knowledgeBaseName.length} / 20</span>
            </div>
          </div>

          {/* 备注说明内容 */}
          <div className="form-group">
            <label className="form-label required">备注说明内容</label>
            <div className="textarea-hint">
              请描述知识库包含的内容及范围说明。建议详细说明可用的实体列表、文档主题、关键字等信息。
            </div>
            <div className="textarea-with-counter">
              <textarea
                className="form-textarea"
                placeholder="例如：此知识库包含公司内部所有销售合同及相关文本，可用于支持客户购买记录查询、销售业绩分析等相关场景的问题..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value.slice(0, 10000))}
                maxLength={10000}
                rows={2}
              />
              <span className="char-counter">{remarks.length} / 10000</span>
            </div>
          </div>

          {/* 高级配置 */}
          <div className="advanced-config">
            <button className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>高级配置（可选）</span>
            </button>
            {showAdvanced && (
              <div className="advanced-content">
                {/* 左侧导航 */}
                <div className="advanced-sidebar">
                  <div className="advanced-nav-section">
                    <div className="advanced-nav-group">
                      <div className="advanced-nav-group-header" onClick={() => setShowNL2SQLConfig(!showNL2SQLConfig)}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          style={{ transform: showNL2SQLConfig ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                        >
                          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>NL2SQL知识配置</span>
                      </div>
                      {showNL2SQLConfig && (
                        <div className="advanced-nav-items">
                          <div
                            className={`advanced-nav-item ${activeAdvancedTab === 'terminology' ? 'active' : ''}`}
                            onClick={() => setActiveAdvancedTab('terminology')}
                          >
                            名词解释
                          </div>
                          <div
                            className={`advanced-nav-item ${activeAdvancedTab === 'synonyms' ? 'active' : ''}`}
                            onClick={() => setActiveAdvancedTab('synonyms')}
                          >
                            同义词
                          </div>
                          <div
                            className={`advanced-nav-item ${activeAdvancedTab === 'logic' ? 'active' : ''}`}
                            onClick={() => setActiveAdvancedTab('logic')}
                          >
                            业务逻辑
                          </div>
                          <div
                            className={`advanced-nav-item ${activeAdvancedTab === 'column_semantics' ? 'active' : ''}`}
                            onClick={() => setActiveAdvancedTab('column_semantics')}
                          >
                            表和列补充说明
                          </div>
                          <div
                            className={`advanced-nav-item ${activeAdvancedTab === 'sql_mapping' ? 'active' : ''}`}
                            onClick={() => setActiveAdvancedTab('sql_mapping')}
                          >
                            SQL结果集
                          </div>
                          <div
                            className={`advanced-nav-item ${activeAdvancedTab === 'optimization' ? 'active' : ''}`}
                            onClick={() => setActiveAdvancedTab('optimization')}
                          >
                            优化案例管理
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="advanced-nav-item standalone">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span>分析模板配置</span>
                    </div>
                  </div>
                </div>

                {/* 右侧内容 */}
                <div className="advanced-main">
                  {activeAdvancedTab === 'terminology' && (
                    <div className="terminology-content">
                      <h3 className="terminology-title">名词解释</h3>
                      <p className="terminology-desc">
                        为了帮助所有MOI更好地理解您在数据分析中的目标表达，您可以将常见表达中涉及的专有名词、描述行事口径等信息在此录入。
                      </p>
                      <div className="terminology-toolbar">
                        <div className="terminology-search">
                          <input
                            type="text"
                            placeholder="搜索结果集名称"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                          />
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <button className="add-knowledge-btn" onClick={() => openAddKnowledgeModal('terminology')}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          新增知识
                        </button>
                      </div>
                      <div className="terminology-table-wrapper">
                        <table className="terminology-table">
                          <thead>
                            <tr>
                              <th>知识名称</th>
                              <th>知识描述</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {terminologyList.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="empty-state">
                                  <div className="empty-icon">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                      <circle cx="24" cy="24" r="20" stroke="#D1D5DB" strokeWidth="2" />
                                      <path d="M24 16v16M16 24h16" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  </div>
                                  <p className="empty-text">暂无数据</p>
                                </td>
                              </tr>
                            ) : (
                              terminologyList.map((item) => (
                                <tr key={item.id}>
                                  <td>{item.name}</td>
                                  <td>{item.desc}</td>
                                  <td>
                                    <div className="table-actions">
                                      <button type="button" className="action-btn edit" onClick={() => openAddKnowledgeModal('terminology', item)}>编辑</button>
                                      <button type="button" className="action-btn delete" onClick={() => handleDeleteKnowledge('terminology', item.id)}>删除</button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {activeAdvancedTab === 'synonyms' && (
                    <div className="terminology-content">
                      <h3 className="terminology-title">同义词</h3>
                      <p className="terminology-desc">配置同义词内容...</p>
                    </div>
                  )}
                  {activeAdvancedTab === 'logic' && (
                    <div className="terminology-content">
                      <h3 className="terminology-title">业务逻辑</h3>
                      <p className="terminology-desc">
                        您可以将业务口径的逻辑定义、专有名词、指标计算口径等信息在此录入，帮助所有MOI更好地理解自然语言问题中的业务知识。
                      </p>
                      <div className="logic-example">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M8 7v4M8 5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>举例：本月指的是本来月日至今天的数据量定义；咨询转化率指的是有咨询且下单成功客户数/有咨询客户数*100%，显示百分数，保留两位小数。</span>
                      </div>
                      <div className="terminology-toolbar">
                        <div className="terminology-search">
                          <input
                            type="text"
                            placeholder="搜索业务逻辑关键词"
                            value={logicSearchKeyword}
                            onChange={(e) => setLogicSearchKeyword(e.target.value)}
                          />
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <button className="add-knowledge-btn" onClick={() => openAddKnowledgeModal('logic')}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          新增逻辑解释
                        </button>
                      </div>
                      <div className="terminology-table-wrapper">
                        <table className="terminology-table">
                          <thead>
                            <tr>
                              <th>业务逻辑解释</th>
                              <th>关联的表</th>
                              <th>业务逻辑类型</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {logicList.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="empty-state">
                                  <div className="empty-icon">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                      <circle cx="24" cy="24" r="20" stroke="#D1D5DB" strokeWidth="2" />
                                      <path d="M24 16v16M16 24h16" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  </div>
                                  <p className="empty-text">暂无数据</p>
                                </td>
                              </tr>
                            ) : (
                              logicList.map((item) => (
                                <tr key={item.id}>
                                  <td>{item.explanation}</td>
                                  <td>
                                    {item.relatedTables === '全部' || !item.relatedTables
                                      ? '全部'
                                      : item.relatedTables
                                          .split(',')
                                          .map((id) => selectedTables.find((t) => t.id === id)?.name ?? id)
                                          .join('、')}
                                  </td>
                                  <td>{item.type}</td>
                                  <td>
                                    <div className="table-actions">
                                      <button type="button" className="action-btn edit" onClick={() => openAddKnowledgeModal('logic', { id: item.id, explanation: item.explanation, type: item.type, relatedTables: item.relatedTables })}>编辑</button>
                                      <button type="button" className="action-btn delete" onClick={() => handleDeleteKnowledge('logic', item.id)}>删除</button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {activeAdvancedTab === 'column_semantics' && (
                    <div className="terminology-content">
                      <h3 className="terminology-title">表和列补充说明</h3>
                      <p className="terminology-desc">
                        配置各表和列的补充说明，仅在本知识库内生效，帮助 NL2SQL 更准确理解表和列含义与使用场景。
                      </p>
                      <div className="sql-mapping-reminder">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="reminder-icon">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M8 7v4M8 5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span><strong>提醒：</strong>请先在「选择数据源」中勾选表，下方将展示已选表，点击「编辑」可为每列配置表和列补充说明。</span>
                      </div>
                      <div className="terminology-toolbar">
                        <div className="terminology-search">
                          <input
                            type="text"
                            placeholder="搜索表名"
                            value={columnSemanticsSearchKeyword}
                            onChange={(e) => setColumnSemanticsSearchKeyword(e.target.value)}
                          />
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                      <div className="terminology-table-wrapper">
                        <table className="terminology-table">
                          <thead>
                            <tr>
                              <th>表名</th>
                              <th>表描述</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredColumnSemanticsTables.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="empty-state">
                                  <div className="empty-icon">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                      <circle cx="24" cy="24" r="20" stroke="#D1D5DB" strokeWidth="2" />
                                      <path d="M24 16v16M16 24h16" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  </div>
                                  <p className="empty-text">暂无数据</p>
                                </td>
                              </tr>
                            ) : (
                              filteredColumnSemanticsTables.map((table) => (
                                <tr key={table.id}>
                                  <td>{table.name}</td>
                                  <td>{table.description || '-'}</td>
                                  <td>
                                    <div className="table-actions">
                                      <button
                                        type="button"
                                        className="action-btn edit"
                                        onClick={() => setColumnSemanticsModalTableId(table.id)}
                                      >
                                        编辑
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {activeAdvancedTab === 'sql_mapping' && (
                    <div className="terminology-content">
                      <h3 className="terminology-title">SQL结果集</h3>
                      <p className="terminology-desc">
                      定义SQL结果集的业务语义映射，为自然语言查询提供数据上下文理解。
                      </p>
                      <div className="sql-mapping-reminder">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="reminder-icon">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M8 7v4M8 5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span><strong>提醒：</strong>如需引用已定义的SQL结果集，请使用 {'{'}结果集名称{'}'} 格式在「业务逻辑」处进行调用。</span>
                      </div>
                      <div className="terminology-toolbar">
                        <div className="terminology-search">
                          <input
                            type="text"
                            placeholder="搜索结果集名称"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                          />
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <button className="add-knowledge-btn" onClick={() => openAddKnowledgeModal('sql_mapping')}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          新增SQL结果集
                        </button>
                      </div>
                      <div className="terminology-table-wrapper">
                        <table className="terminology-table">
                          <thead>
                            <tr>
                              <th>结果集名称</th>
                              <th>SQL</th>
                              <th>描述</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sqlMappingList.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="empty-state">
                                  <div className="empty-icon">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                      <circle cx="24" cy="24" r="20" stroke="#D1D5DB" strokeWidth="2" />
                                      <path d="M24 16v16M16 24h16" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                  </div>
                                  <p className="empty-text">暂无数据</p>
                                </td>
                              </tr>
                            ) : (
                              sqlMappingList.map((item) => (
                                <tr key={item.id}>
                                  <td>{item.name}</td>
                                  <td className="sql-cell">{item.sql}</td>
                                  <td>{item.desc}</td>
                                  <td>
                                    <div className="table-actions">
                                      <button type="button" className="action-btn edit" onClick={() => openAddKnowledgeModal('sql_mapping', item)}>编辑</button>
                                      <button type="button" className="action-btn delete" onClick={() => handleDeleteKnowledge('sql_mapping', item.id)}>删除</button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {activeAdvancedTab === 'optimization' && (
                    <div className="terminology-content">
                      <h3 className="terminology-title">优化案例管理</h3>
                      <p className="terminology-desc">管理优化案例...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="create-kb-footer">
          <button className="cancel-btn" onClick={handleCancel}>
            取消
          </button>
          <button className="create-btn" onClick={handleCreate} disabled={!knowledgeBaseName || selectedDataSources.length === 0 || !remarks}>
            创建
          </button>
        </div>
      </div>

      {/* 选择数据源弹窗 */}
      {showDataSourceModal && (
        <div className="data-source-modal-overlay" onClick={() => setShowDataSourceModal(false)}>
          <div className="data-source-modal" onClick={(e) => e.stopPropagation()}>
            <div className="data-source-modal-header">
              <h3><span className="required-asterisk">*</span> 选择数据源</h3>
              <button className="modal-close-btn" onClick={() => setShowDataSourceModal(false)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="data-source-modal-body">
              <div className="data-source-warning">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1.333A6.667 6.667 0 1 0 14.667 8 6.674 6.674 0 0 0 8 1.333zm0 10a.667.667 0 1 1 0-1.333.667.667 0 0 1 0 1.333zm.667-3.333a.667.667 0 0 1-1.334 0V5.333a.667.667 0 0 1 1.334 0V8z"
                    fill="#F59E0B"
                  />
                </svg>
                <span>注意: 只有经过嵌入节点处理后的非结构化文件或结构化数据表才能被选中作为知识。</span>
              </div>
              <div className="data-source-section">
                <h3 className="section-title">数据中心</h3>
                <div className="data-source-tree">
                  {dataSourceTree.map((node) => (
                    <React.Fragment key={node.id}>
                      <div
                        className={`tree-item ${node.expandable ? 'expandable' : ''}`}
                        style={{ paddingLeft: 8 }}
                        onClick={() => node.expandable && toggleExpand(node.id)}
                      >
                        <span className="tree-expand">
                          {node.expandable && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              style={{ transform: expandedNodes[node.id] ? 'rotate(90deg)' : 'rotate(0deg)' }}
                            >
                              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        {node.selectable ? (
                          <div
                            className={`tree-checkbox ${selectedDataSources.includes(node.id) ? 'checked' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleDataSourceToggle(node.id); }}
                          >
                            {selectedDataSources.includes(node.id) && (
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        ) : (
                          <span className="tree-checkbox-spacer" />
                        )}
                        <DbIcon />
                        <span className="tree-label">{node.name}</span>
                      </div>
                      {node.expandable && expandedNodes[node.id] && node.children && (
                        <div className="tree-children">
                          {node.children.map((child) => (
                            <div
                              key={child.id}
                              className={`tree-item ${child.expandable ? 'expandable' : ''}`}
                              style={{ paddingLeft: 32 }}
                              onClick={() => child.expandable && toggleExpand(child.id)}
                            >
                              <span className="tree-expand">
                                {child.expandable && (
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    style={{ transform: expandedNodes[child.id] ? 'rotate(90deg)' : 'rotate(0deg)' }}
                                  >
                                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </span>
                              {child.selectable ? (
                                <div
                                  className={`tree-checkbox ${selectedDataSources.includes(child.id) ? 'checked' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); handleDataSourceToggle(child.id); }}
                                >
                                  {selectedDataSources.includes(child.id) && (
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                      <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                              ) : (
                                <span className="tree-checkbox-spacer" />
                              )}
                              <DbIcon />
                              <span className="tree-label">{child.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div className="data-source-modal-footer">
              <button className="cancel-btn" onClick={() => setShowDataSourceModal(false)}>取消</button>
              <button className="create-btn" onClick={() => setShowDataSourceModal(false)}>确定</button>
            </div>
          </div>
        </div>
      )}

      {/* 配置表和列补充说明弹窗 */}
      {columnSemanticsModalTableId && (() => {
        const table = selectedTables.find((t) => t.id === columnSemanticsModalTableId);
        if (!table) return null;
        const allColumns = getMockTableColumns(table.name);
        const kw = columnSemanticsModalColumnSearch.trim().toLowerCase();
        const columns = kw
          ? allColumns.filter((c) => c.name.toLowerCase().includes(kw) || c.comment.toLowerCase().includes(kw))
          : allColumns;
        return (
          <div className="add-knowledge-modal-overlay" onClick={closeColumnSemanticsModal}>
            <div className="add-knowledge-modal column-semantics-modal" onClick={(e) => e.stopPropagation()}>
              <div className="add-knowledge-modal-header">
                <h3>配置表和列补充说明 - {table.name}</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={closeColumnSemanticsModal}
                  aria-label="关闭"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="add-knowledge-modal-body">
                <div className="column-semantics-table-section">
                  <div className="add-knowledge-form-group">
                    <label className="add-knowledge-label">表描述</label>
                    <div className="column-semantics-table-comment">{table.description || '-'}</div>
                  </div>
                  <div className="add-knowledge-form-group">
                    <label className="add-knowledge-label">表补充说明</label>
                    <input
                      type="text"
                      className="add-knowledge-input"
                      placeholder="请输入表补充说明"
                      value={tableSupplementNotes[table.id] ?? ''}
                      onChange={(e) => handleTableSupplementNoteChange(table.id, e.target.value)}
                    />
                  </div>
                </div>
                <div className="column-semantics-modal-search">
                  <input
                    type="text"
                    placeholder="搜索列名"
                    value={columnSemanticsModalColumnSearch}
                    onChange={(e) => setColumnSemanticsModalColumnSearch(e.target.value)}
                  />
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="terminology-table-wrapper">
                  <table className="terminology-table column-semantics-table">
                    <thead>
                      <tr>
                        <th>列名</th>
                        <th>列描述</th>
                        <th>列补充说明</th>
                        <th>启用</th>
                      </tr>
                    </thead>
                    <tbody>
                      {columns.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="empty-state">
                            <p className="empty-text">无匹配列</p>
                          </td>
                        </tr>
                      ) : (
                        columns.map((col) => (
                          <tr key={col.name}>
                            <td>
                              <input
                                type="text"
                                className="column-semantics-input readonly"
                                value={col.name}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="column-semantics-input readonly"
                                value={col.comment}
                                readOnly
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className={`column-semantics-input ${columnSemanticsEnabled[table.id]?.[col.name] === false ? 'disabled' : ''}`}
                                placeholder="请输入列补充说明"
                                value={columnSemantics[table.id]?.[col.name] ?? ''}
                                onChange={(e) => handleColumnSemanticChange(table.id, col.name, e.target.value)}
                                disabled={columnSemanticsEnabled[table.id]?.[col.name] === false}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={columnSemanticsEnabled[table.id]?.[col.name] !== false}
                                title={columnSemanticsEnabled[table.id]?.[col.name] !== false ? '已启用' : '禁用后该字段将不会被检索'}
                                className={`kb-column-semantics-switch ${columnSemanticsEnabled[table.id]?.[col.name] !== false ? 'kb-column-semantics-switch-on' : ''}`}
                                onClick={() => handleColumnSemanticEnabledToggle(table.id, col.name)}
                              >
                                <span className="kb-column-semantics-switch-knob" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="add-knowledge-modal-footer">
                <button type="button" className="cancel-btn" onClick={closeColumnSemanticsModal}>
                  取消
                </button>
                <button type="button" className="create-btn" onClick={closeColumnSemanticsModal}>
                  确定
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 新增知识 / 新增SQL结果集定义 弹窗 */}
      {showAddKnowledgeModal && (
        <div className="add-knowledge-modal-overlay" onClick={closeAddKnowledgeModal}>
          <div className={`add-knowledge-modal ${addKnowledgeSource === 'logic' ? 'add-knowledge-modal-logic' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="add-knowledge-modal-header">
              <h3>
                {editingId
                  ? addKnowledgeSource === 'sql_mapping'
                    ? '编辑SQL定义'
                    : addKnowledgeSource === 'logic'
                      ? '编辑逻辑解释'
                      : '编辑知识'
                  : addKnowledgeSource === 'sql_mapping'
                    ? '新增SQL结果集定义'
                    : addKnowledgeSource === 'logic'
                      ? '新增逻辑解释'
                      : '新增知识'}
              </h3>
              <button className="modal-close-btn" onClick={closeAddKnowledgeModal}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="add-knowledge-modal-body">
              {addKnowledgeSource === 'logic' ? (
                <>
                  <div className="add-knowledge-form-group">
                    <label className="add-knowledge-label required">业务逻辑解释</label>
                    <textarea
                      className="add-knowledge-textarea"
                      placeholder="请输入业务逻辑解释"
                      value={addKnowledgeName}
                      onChange={(e) => setAddKnowledgeName(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="add-knowledge-form-group" ref={logicRelatedTablesDropdownRef}>
                    <label className="add-knowledge-label">选择关联的表</label>
                    <div className="logic-related-tables-dropdown">
                      <button
                        type="button"
                        className="add-knowledge-select logic-related-tables-trigger"
                        onClick={() => setLogicRelatedTablesDropdownOpen((v) => !v)}
                        aria-expanded={logicRelatedTablesDropdownOpen}
                      >
                        <span className="logic-related-tables-trigger-text">
                          {addLogicRelatedTables.length === 0
                            ? '全部'
                            : addLogicRelatedTables
                                .map((id) => selectedTables.find((t) => t.id === id)?.name ?? id)
                                .join('、')}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 12 12" className={`logic-related-tables-chevron ${logicRelatedTablesDropdownOpen ? 'open' : ''}`}>
                          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      {logicRelatedTablesDropdownOpen && (
                        <div className="logic-related-tables-panel">
                          <div className="logic-related-tables-search">
                            <input
                              type="text"
                              placeholder="搜索表名"
                              value={logicRelatedTablesSearchKeyword}
                              onChange={(e) => setLogicRelatedTablesSearchKeyword(e.target.value)}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div
                            role="button"
                            tabIndex={0}
                            className={`logic-related-tables-option ${addLogicRelatedTables.length === 0 ? 'selected' : ''}`}
                            onClick={() => setAddLogicRelatedTables([])}
                            onKeyDown={(e) => e.key === 'Enter' && setAddLogicRelatedTables([])}
                          >
                            <span className="logic-related-tables-check-wrap">
                              {addLogicRelatedTables.length === 0 && (
                                <svg className="logic-related-tables-check" width="14" height="14" viewBox="0 0 14 14">
                                  <path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" />
                                </svg>
                              )}
                            </span>
                            <span>全部</span>
                          </div>
                          {(logicRelatedTablesSearchKeyword.trim()
                            ? selectedTables.filter(
                                (t) =>
                                  t.name.toLowerCase().includes(logicRelatedTablesSearchKeyword.trim().toLowerCase()) ||
                                  (t.description && t.description.toLowerCase().includes(logicRelatedTablesSearchKeyword.trim().toLowerCase()))
                              )
                            : selectedTables
                          ).map((t) => {
                            const selected = addLogicRelatedTables.includes(t.id);
                            return (
                              <div
                                key={t.id}
                                role="button"
                                tabIndex={0}
                                className={`logic-related-tables-option ${selected ? 'selected' : ''}`}
                                onClick={() => {
                                  if (selected) {
                                    setAddLogicRelatedTables((prev) => prev.filter((id) => id !== t.id));
                                  } else {
                                    setAddLogicRelatedTables((prev) => (prev.length === 0 ? [t.id] : [...prev, t.id]));
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key !== 'Enter') return;
                                  if (selected) {
                                    setAddLogicRelatedTables((prev) => prev.filter((id) => id !== t.id));
                                  } else {
                                    setAddLogicRelatedTables((prev) => (prev.length === 0 ? [t.id] : [...prev, t.id]));
                                  }
                                }}
                              >
                                <span className="logic-related-tables-check-wrap">
                                  {selected && (
                                    <svg className="logic-related-tables-check" width="14" height="14" viewBox="0 0 14 14">
                                      <path d="M2 7l3 3 7-7" stroke="currentColor" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" />
                                    </svg>
                                  )}
                                </span>
                                <span>{t.name}{t.description ? ` - ${t.description}` : ''}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="add-knowledge-form-group">
                    <label className="add-knowledge-label required">业务逻辑类型</label>
                    <div className="logic-type-options">
                      <label
                        className={`logic-type-card ${addLogicType === '系统智能判断' ? 'selected' : ''}`}
                        onClick={() => setAddLogicType('系统智能判断')}
                      >
                        <div className="logic-type-card-header">
                          <span className="logic-type-title">系统智能判断</span>
                          <span className="logic-type-tag">推荐</span>
                          <span className="logic-type-radio">
                            {addLogicType === '系统智能判断' && <span className="radio-dot" />}
                          </span>
                        </div>
                        <p className="logic-type-desc">将由模型根据用户问题内容进行智能判断选择性生效。</p>
                      </label>
                      <label
                        className={`logic-type-card ${addLogicType === '全局类型' ? 'selected' : ''}`}
                        onClick={() => setAddLogicType('全局类型')}
                      >
                        <div className="logic-type-card-header">
                          <span className="logic-type-title">全局类型</span>
                          <span className="logic-type-radio">
                            {addLogicType === '全局类型' && <span className="radio-dot" />}
                          </span>
                        </div>
                        <p className="logic-type-desc">全局型业务逻辑对全部用户问题生效。</p>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="add-knowledge-form-group">
                    <label className="add-knowledge-label required">
                      {addKnowledgeSource === 'sql_mapping' ? '结果集名称' : '知识名称'}
                    </label>
                    <input
                      type="text"
                      className="add-knowledge-input"
                      placeholder={addKnowledgeSource === 'sql_mapping' ? '请输入结果集名称' : '请输入知识名称'}
                      value={addKnowledgeName}
                      onChange={(e) => setAddKnowledgeName(e.target.value)}
                    />
                  </div>
                  {addKnowledgeSource === 'sql_mapping' && (
                    <div className="add-knowledge-form-group">
                      <label className="add-knowledge-label required">SQL</label>
                      <textarea
                        className="add-knowledge-textarea"
                        placeholder="请输入SQL"
                        value={addKnowledgeSql}
                        onChange={(e) => setAddKnowledgeSql(e.target.value)}
                        rows={6}
                      />
                    </div>
                  )}
                  <div className="add-knowledge-form-group">
                    <label className="add-knowledge-label required">
                      {addKnowledgeSource === 'sql_mapping' ? '描述' : '知识描述'}
                    </label>
                    <textarea
                      className="add-knowledge-textarea"
                      placeholder={addKnowledgeSource === 'sql_mapping' ? '请输入描述' : '请输入知识描述'}
                      value={addKnowledgeDesc}
                      onChange={(e) => setAddKnowledgeDesc(e.target.value)}
                      rows={4}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="add-knowledge-modal-footer">
              <button className="cancel-btn" onClick={closeAddKnowledgeModal}>取消</button>
              <button
                className="create-btn"
                onClick={handleAddKnowledgeConfirm}
                disabled={
                  addKnowledgeSource === 'logic'
                    ? !addKnowledgeName.trim() || !addLogicType.trim()
                    : addKnowledgeSource === 'sql_mapping'
                      ? !addKnowledgeName.trim() || !addKnowledgeDesc.trim() || !addKnowledgeSql.trim()
                      : !addKnowledgeName.trim() || !addKnowledgeDesc.trim()
                }
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

export default CreateKnowledgeBase;
