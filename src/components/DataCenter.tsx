import React, { useState, useEffect } from 'react';
import { useGlobalColumnSemantics } from '../contexts/GlobalColumnSemanticsContext';
import './DataCenter.css';

type DataObject = {
  id: string;
  name: string;
  size: string;
  createTime: string;
  createBy: string;
  modifyTime: string;
  modifyBy: string;
};

type TableColumn = {
  name: string;
  comment: string;
};

type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
  expanded?: boolean;
  selected?: boolean;
};

const MOCK_DATA: DataObject[] = [
  { id: '1', name: 'revenue_cost', size: '181.44 MB', createTime: '2025-12-05 18:27:34', createBy: 'admin', modifyTime: '2025-12-05 18:27:34', modifyBy: 'admin' },
  { id: '2', name: 'main_companies', size: '4.59 KB', createTime: '2025-12-05 18:39:17', createBy: 'admin', modifyTime: '2025-12-05 18:39:17', modifyBy: 'admin' },
  { id: '3', name: 'main_business_unit', size: '7.31 KB', createTime: '2025-12-05 18:44:20', createBy: 'admin', modifyTime: '2025-12-05 18:44:20', modifyBy: 'admin' },
  { id: '4', name: 'bpc_consolidated_report', size: '13.4 GB', createTime: '2025-12-10 18:34:35', createBy: 'admin', modifyTime: '2025-12-10 18:34:35', modifyBy: 'admin' },
  { id: '5', name: 'output_value_lg', size: '1.37 MB', createTime: '2025-12-26 17:38:15', createBy: 'admin', modifyTime: '2025-12-26 17:38:15', modifyBy: 'admin' },
  { id: '6', name: 'capacity', size: '5.2 KB', createTime: '2025-12-26 18:15:42', createBy: 'admin', modifyTime: '2026-02-06 18:50:44', modifyBy: 'admin' },
  { id: '7', name: 'output_value_pc', size: '2.1 KB', createTime: '2025-12-26 18:20:00', createBy: 'admin', modifyTime: '2025-12-26 18:20:00', modifyBy: 'admin' },
  { id: '8', name: 'output_amount_lg', size: '512 KB', createTime: '2025-12-28 10:15:00', createBy: 'admin', modifyTime: '2025-12-28 10:15:00', modifyBy: 'admin' },
  { id: '9', name: 'open_orders_result', size: '1.2 MB', createTime: '2026-01-05 09:30:00', createBy: 'admin', modifyTime: '2026-01-05 09:30:00', modifyBy: 'admin' },
  { id: '10', name: 'sales_orders_result', size: '856 KB', createTime: '2026-01-05 09:35:00', createBy: 'admin', modifyTime: '2026-01-05 09:35:00', modifyBy: 'admin' },
  { id: '11', name: 'staff_info', size: '3.8 KB', createTime: '2026-01-10 14:20:00', createBy: 'admin', modifyTime: '2026-01-10 14:20:00', modifyBy: 'admin' },
  { id: '12', name: 'tax_ledger', size: '12.5 MB', createTime: '2026-01-15 16:45:00', createBy: 'admin', modifyTime: '2026-01-15 16:45:00', modifyBy: 'admin' },
  { id: '13', name: 'sales_vat_invoice', size: '245 MB', createTime: '2026-01-20 11:00:00', createBy: 'admin', modifyTime: '2026-01-20 11:00:00', modifyBy: 'admin' },
];

// 模拟根据表名获取表列信息（列名 + comment）
function getMockTableColumns(tableName: string): TableColumn[] {
  const presets: Record<string, TableColumn[]> = {
    revenue_cost: [
      { name: 'id', comment: '主键ID' },
      { name: 'revenue', comment: '收入金额' },
      { name: 'cost', comment: '成本金额' },
      { name: 'created_at', comment: '创建时间' },
    ],
    main_companies: [
      { name: 'company_id', comment: '公司编码' },
      { name: 'company_name', comment: '公司名称' },
      { name: 'status', comment: '状态' },
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

const TREE_DATA: TreeNode[] = [
  {
    id: 'workspace',
    label: '我的工作区',
    expanded: true,
    children: [
      { id: 'default', label: '默认' },
      {
        id: 'jinpan',
        label: '金盘问数',
        expanded: true,
        selected: true,
        children: [
          {
            id: 'jst_flat',
            label: 'jst_flat_table',
            expanded: true,
            selected: true,
            children: [
              { id: 'revenue_cost', label: 'revenue_cost' },
              { id: 'main_companies', label: 'main_companies' },
              { id: 'main_business_unit', label: 'main_business_unit' },
              { id: 'bpc_consolidated_report', label: 'bpc_consolidated_report' },
              { id: 'output_value_lg', label: 'output_value_lg' },
              { id: 'capacity', label: 'capacity' },
              { id: 'output_value_pc', label: 'output_value_pc' },
              { id: 'output_amount_lg', label: 'output_amount_lg' },
              { id: 'open_orders_result', label: 'open_orders_result' },
              { id: 'sales_orders_result', label: 'sales_orders_result' },
              { id: 'staff_info', label: 'staff_info' },
              { id: 'tax_ledger', label: 'tax_ledger' },
              { id: 'sales_vat_invoice', label: 'sales_vat_invoice' },
            ],
          },
          { id: 'dwd_dcp', label: 'dwd_dcp', expanded: false },
          { id: 'dws_dcp', label: 'dws_dcp', expanded: false },
          { id: 'dwd_secrecy', label: 'dwd_secrecy', expanded: false },
          { id: 'company_announcement', label: '公司公告', expanded: false },
          { id: 'dwd_load', label: 'dwd_load', expanded: false },
          { id: 'announcement_processed', label: '公告处理后数据', expanded: false },
          { id: 'announcement_parse', label: '公司公告解析结果', expanded: false },
        ],
      },
      { id: 'file', label: '文件' },
    ],
  },
];

const DataCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshCountdown, setRefreshCountdown] = useState(20);
  const [dataObjects, setDataObjects] = useState<DataObject[]>(MOCK_DATA);
  const [treeData, setTreeData] = useState<TreeNode[]>(TREE_DATA);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<DataObject | null>(null);
  const [columnExtraDescs, setColumnExtraDescs] = useState<Record<string, string>>({});
  const [savedColumnExtras, setSavedColumnExtras] = useState<Record<string, Record<string, string>>>({});
  const [columnNl2SqlEnabled, setColumnNl2SqlEnabled] = useState<Record<string, boolean>>({});
  const [savedColumnNl2SqlEnabled, setSavedColumnNl2SqlEnabled] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => (prev <= 1 ? 20 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshCountdown(20);
    // TODO: 实际刷新逻辑
  };

  const handleCreateTable = () => {
    // TODO: 创建表
    console.log('创建表');
  };

  const handleCreateVolume = () => {
    // TODO: 创建卷
    console.log('创建卷');
  };

  const handleDownload = (obj: DataObject) => {
    console.log('下载', obj.name);
  };

  const handleCopy = (obj: DataObject) => {
    console.log('复制', obj.name);
  };

  const handleDelete = (obj: DataObject) => {
    if (window.confirm(`确定要删除 ${obj.name} 吗？`)) {
      setDataObjects((prev) => prev.filter((o) => o.id !== obj.id));
    }
  };

  const handleEdit = (obj: DataObject) => {
    setEditingObject(obj);
    const columns = getMockTableColumns(obj.name);
    const saved = savedColumnExtras[obj.id] ?? {};
    const globalByTable = globalColumnSemantics[obj.name] ?? {};
    const savedNl2Sql = savedColumnNl2SqlEnabled[obj.id] ?? {};
    setColumnExtraDescs(
      columns.reduce<Record<string, string>>((acc, col) => {
        acc[col.name] = saved[col.name] ?? globalByTable[col.name] ?? '';
        return acc;
      }, {})
    );
    setColumnNl2SqlEnabled(
      columns.reduce<Record<string, boolean>>((acc, col) => {
        acc[col.name] = savedNl2Sql[col.name] ?? true;
        return acc;
      }, {})
    );
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditingObject(null);
    setColumnExtraDescs({});
    setColumnNl2SqlEnabled({});
  };

  const handleExtraDescChange = (columnName: string, value: string) => {
    setColumnExtraDescs((prev) => ({ ...prev, [columnName]: value }));
  };

  const handleNl2SqlToggle = (columnName: string) => {
    setColumnNl2SqlEnabled((prev) => ({ ...prev, [columnName]: !(prev[columnName] ?? true) }));
  };

  const { globalColumnSemantics, setGlobalColumnSemantics } = useGlobalColumnSemantics();

  const handleEditModalConfirm = () => {
    if (editingObject) {
      setSavedColumnExtras((prev) => ({
        ...prev,
        [editingObject.id]: { ...columnExtraDescs },
      }));
      setSavedColumnNl2SqlEnabled((prev) => ({
        ...prev,
        [editingObject.id]: { ...columnNl2SqlEnabled },
      }));
      setGlobalColumnSemantics((prev) => ({
        ...prev,
        [editingObject.name]: { ...columnExtraDescs },
      }));
    }
    handleEditModalClose();
  };

  const toggleTreeNode = (id: string) => {
    const toggle = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: toggle(node.children) };
        }
        return node;
      });
    setTreeData((prev) => toggle(prev));
  };

  const renderTreeNode = (node: TreeNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded ?? false;

    return (
      <div key={node.id} className="tree-node-wrapper">
        <div
          className={`tree-node ${node.selected ? 'selected' : ''}`}
          style={{ paddingLeft: 12 + level * 16 }}
          onClick={() => hasChildren && toggleTreeNode(node.id)}
        >
          {hasChildren ? (
            <span className="tree-expand">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                className={isExpanded ? 'expanded' : ''}
              >
                <path d="M4 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          ) : (
            <span className="tree-expand Placeholder" />
          )}
          <span className="tree-icon">
            {hasChildren ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3h6l4 4v6H3V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M9 3v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
          </span>
          <span className="tree-label">{node.label}</span>
        </div>
        {hasChildren && isExpanded && node.children?.map((child) => renderTreeNode(child, level + 1))}
      </div>
    );
  };

  const filteredData = searchQuery
    ? dataObjects.filter((o) => o.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : dataObjects;

  return (
    <div className="data-center">
      {/* 面包屑 */}
      <div className="dc-breadcrumb">
        <span className="breadcrumb-item">我的工作区</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-item">金盘问数</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-item active">jst_flat_table</span>
      </div>

      {/* 搜索与操作 */}
      <div className="dc-toolbar">
        <div className="dc-search">
          <input
            type="text"
            className="dc-search-input"
            placeholder="搜索数据对象"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="dc-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <button className="dc-refresh-btn" onClick={handleRefresh}>
          {refreshCountdown}s 后自动刷新
        </button>
        <div className="dc-create-buttons">
          <button className="dc-btn-primary" onClick={handleCreateTable}>
            创建表
          </button>
          <button className="dc-btn-primary" onClick={handleCreateVolume}>
            创建卷
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="dc-content">
        {/* 左侧树形目录 */}
        <div className="dc-tree-panel">
          <div className="dc-tree-header">
            <span className="dc-tree-title">数据目录</span>
          </div>
          <div className="dc-tree-body">
            {treeData.map((node) => renderTreeNode(node))}
          </div>
        </div>

        {/* 右侧数据表格 */}
        <div className="dc-table-panel">
          <div className="dc-table-container">
            <table className="dc-table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>大小</th>
                  <th>创建时间</th>
                  <th>创建人</th>
                  <th>修改时间</th>
                  <th>修改人</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((obj) => (
                  <tr key={obj.id}>
                    <td>
                      <span className="dc-object-name">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="dc-object-icon">
                          <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        {obj.name}
                      </span>
                    </td>
                    <td className="dc-size-cell">{obj.size}</td>
                    <td className="dc-time-cell">{obj.createTime}</td>
                    <td>{obj.createBy}</td>
                    <td className="dc-time-cell">{obj.modifyTime}</td>
                    <td>{obj.modifyBy}</td>
                    <td>
                      <div className="dc-row-actions">
                        <button
                          className="dc-action-btn"
                          onClick={() => handleDownload(obj)}
                          title="下载"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M8 11V3M8 11L5 8M8 11l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          className="dc-action-btn"
                          onClick={() => handleCopy(obj)}
                          title="复制/移动"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M2 11V3a1 1 0 011-1h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          className="dc-action-btn"
                          onClick={() => handleEdit(obj)}
                          title="编辑"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 3.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          className="dc-action-btn dc-action-danger"
                          onClick={() => handleDelete(obj)}
                          title="删除"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M4 5v8m3-8v8m3-8v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            <path d="M2.5 5h11M6 3.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            <path d="M5 3.5l.3-1h5.4l.3 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 编辑表弹窗 */}
      {editModalOpen && editingObject && (
        <div className="dc-modal-overlay" onClick={handleEditModalClose}>
          <div className="dc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dc-modal-header">
              <h3 className="dc-modal-title">编辑表信息</h3>
              <button type="button" className="dc-modal-close" onClick={handleEditModalClose} aria-label="关闭">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="dc-modal-body">
              <div className="dc-edit-field">
                <label className="dc-edit-label">表名</label>
                <input
                  type="text"
                  className="dc-edit-input dc-edit-input-readonly"
                  value={editingObject.name}
                  readOnly
                />
              </div>
              <div className="dc-edit-section">
                <label className="dc-edit-label">表列信息</label>
                <div className="dc-columns-table-wrap">
                  <table className="dc-columns-table">
                    <thead>
                      <tr>
                        <th>列名</th>
                        <th>列 Comment</th>
                        <th>全局列语义</th>
                        <th title="关闭表示在 NL2SQL 中不会查看此列的内容">NL2SQL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getMockTableColumns(editingObject.name).map((col) => (
                        <tr key={col.name}>
                          <td>
                            <input
                              type="text"
                              className="dc-edit-input dc-edit-input-readonly"
                              value={col.name}
                              readOnly
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="dc-edit-input dc-edit-input-readonly"
                              value={col.comment}
                              readOnly
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="dc-edit-input"
                              placeholder="请输入全局列语义"
                              value={columnExtraDescs[col.name] ?? ''}
                              onChange={(e) => handleExtraDescChange(col.name, e.target.value)}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={columnNl2SqlEnabled[col.name] !== false}
                              title={columnNl2SqlEnabled[col.name] !== false ? 'NL2SQL 中会查看此列' : 'NL2SQL 中不会查看此列'}
                              className={`dc-nl2sql-switch ${columnNl2SqlEnabled[col.name] !== false ? 'dc-nl2sql-switch-on' : ''}`}
                              onClick={() => handleNl2SqlToggle(col.name)}
                            >
                              <span className="dc-nl2sql-switch-knob" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="dc-modal-footer">
              <button type="button" className="dc-modal-btn dc-modal-btn-secondary" onClick={handleEditModalClose}>
                取消
              </button>
              <button type="button" className="dc-modal-btn dc-modal-btn-primary" onClick={handleEditModalConfirm}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 右下角浮动客服按钮 */}
      <button className="dc-fab" title="帮助/反馈">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default DataCenter;
