import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateKnowledgeBase.css';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [terminologyList, setTerminologyList] = useState<{ id: string; name: string; desc: string }[]>([]);
  const [sqlMappingList, setSqlMappingList] = useState<{ id: string; name: string; desc: string; sql: string }[]>([]);
  const [logicList, setLogicList] = useState<{ id: string; explanation: string; type: string }[]>([]);
  const [logicSearchKeyword, setLogicSearchKeyword] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ jinpan: true });
  const [activeAdvancedTab, setActiveAdvancedTab] = useState('terminology');
  const [showNL2SQLConfig, setShowNL2SQLConfig] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  type TreeNode = {
    id: string;
    name: string;
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
        { id: 'jst_flat', name: 'jst_flat_table', selectable: true },
        { id: 'jinpan_catalog', name: 'jinpan_catalog', selectable: true },
        { id: 'dwd_dcp', name: 'dwd_dcp', selectable: true },
        { id: 'dws_dcp', name: 'dws_dcp', selectable: true },
        { id: 'dwd_load', name: 'dwd_load', selectable: false },
        { id: 'dwd_secrecy', name: 'dwd_secrecy', selectable: true },
      ],
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
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
    item?: { id: string; name?: string; desc?: string; sql?: string; explanation?: string; type?: string }
  ) => {
    setAddKnowledgeSource(source);
    setEditingId(item?.id ?? null);
    setAddKnowledgeName(item?.name ?? item?.explanation ?? '');
    setAddKnowledgeDesc(item?.desc ?? '');
    setAddKnowledgeSql(item?.sql ?? '');
    setAddLogicType(item?.type ?? '系统智能判断');
    setShowAddKnowledgeModal(true);
  };

  const closeAddKnowledgeModal = () => {
    setShowAddKnowledgeModal(false);
    setEditingId(null);
    setAddLogicType('');
  };

  const handleAddKnowledgeConfirm = () => {
    if (addKnowledgeSource === 'sql_mapping') {
      if (!addKnowledgeName.trim() || !addKnowledgeDesc.trim() || !addKnowledgeSql.trim()) return;
      const item = { id: editingId || `sql-${Date.now()}`, name: addKnowledgeName.trim(), desc: addKnowledgeDesc.trim(), sql: addKnowledgeSql.trim() };
      setSqlMappingList((prev) =>
        editingId ? prev.map((i) => (i.id === editingId ? item : i)) : [...prev, item]
      );
    } else if (addKnowledgeSource === 'logic') {
      if (!addKnowledgeName.trim() || !addLogicType.trim()) return;
      const item = { id: editingId || `logic-${Date.now()}`, explanation: addKnowledgeName.trim(), type: addLogicType.trim() };
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
                            className={`advanced-nav-item ${activeAdvancedTab === 'sql_mapping' ? 'active' : ''}`}
                            onClick={() => setActiveAdvancedTab('sql_mapping')}
                          >
                            语义SQL
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
                            placeholder="搜索知识名称"
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
                              <th>业务逻辑类型</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {logicList.length === 0 ? (
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
                              logicList.map((item) => (
                                <tr key={item.id}>
                                  <td>{item.explanation}</td>
                                  <td>{item.type}</td>
                                  <td>
                                    <div className="table-actions">
                                      <button type="button" className="action-btn edit" onClick={() => openAddKnowledgeModal('logic', { id: item.id, explanation: item.explanation, type: item.type })}>编辑</button>
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
                  {activeAdvancedTab === 'sql_mapping' && (
                    <div className="terminology-content">
                      <h3 className="terminology-title">语义SQL</h3>
                      <p className="terminology-desc">
                        配置自然语言与SQL的语义映射关系，帮助MOI更好地理解用户意图并生成准确的SQL查询。
                      </p>
                      <div className="terminology-toolbar">
                        <div className="terminology-search">
                          <input
                            type="text"
                            placeholder="搜索知识名称"
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
                          新增语义SQL
                        </button>
                      </div>
                      <div className="terminology-table-wrapper">
                        <table className="terminology-table">
                          <thead>
                            <tr>
                              <th>语义SQL名称</th>
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

      {/* 新增知识 / 新增SQL定义 弹窗 */}
      {showAddKnowledgeModal && (
        <div className="add-knowledge-modal-overlay" onClick={closeAddKnowledgeModal}>
          <div className="add-knowledge-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-knowledge-modal-header">
              <h3>
                {editingId
                  ? addKnowledgeSource === 'sql_mapping'
                    ? '编辑SQL定义'
                    : addKnowledgeSource === 'logic'
                      ? '编辑逻辑解释'
                      : '编辑知识'
                  : addKnowledgeSource === 'sql_mapping'
                    ? '新增SQL定义'
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
                  <div className="add-knowledge-form-group">
                    <label className="add-knowledge-label required">业务逻辑类型</label>
                    <div className="logic-type-options">
                      <label
                        className={`logic-type-card ${addLogicType === '系统智能判断' ? 'selected' : ''}`}
                        onClick={() => setAddLogicType('系统智能判断')}
                      >
                        <div className="logic-type-card-header">
                          <span className="logic-type-radio">
                            {addLogicType === '系统智能判断' && <span className="radio-dot" />}
                          </span>
                          <span className="logic-type-title">系统智能判断</span>
                          <span className="logic-type-tag">推荐</span>
                        </div>
                        <p className="logic-type-desc">将由模型根据用户问题内容进行智能判断选择性生效。</p>
                      </label>
                      <label
                        className={`logic-type-card ${addLogicType === '全局类型' ? 'selected' : ''}`}
                        onClick={() => setAddLogicType('全局类型')}
                      >
                        <div className="logic-type-card-header">
                          <span className="logic-type-radio">
                            {addLogicType === '全局类型' && <span className="radio-dot" />}
                          </span>
                          <span className="logic-type-title">全局类型</span>
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
                      {addKnowledgeSource === 'sql_mapping' ? '语义SQL名称' : '知识名称'}
                    </label>
                    <input
                      type="text"
                      className="add-knowledge-input"
                      placeholder={addKnowledgeSource === 'sql_mapping' ? '请输入语义SQL名称' : '请输入知识名称'}
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
