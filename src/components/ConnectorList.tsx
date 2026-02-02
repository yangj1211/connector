import React, { useState, useEffect } from 'react';
import CreateConnectorModal from './CreateConnectorModal';
import './ConnectorList.css';

type Connector = {
  id: string;
  name: string;
  purpose: string;
  type: string;
  creator: string;
  createTime: string;
  updateTime: string;
  status: string;
};

const ConnectorList: React.FC = () => {
  const [refreshCountdown, setRefreshCountdown] = useState(26);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectors] = useState<Connector[]>([
    {
      id: '1',
      name: 'Hive',
      purpose: '数据载入',
      type: 'Hive',
      creator: 'admin',
      createTime: '2026-01-28 10:30:00',
      updateTime: '2026-01-28 10:30:00',
      status: '正常',
    },
    {
      id: '2',
      name: 'MySQL',
      purpose: '数据载入',
      type: 'MySQL',
      creator: 'admin',
      createTime: '2026-01-28 10:35:00',
      updateTime: '2026-01-28 10:35:00',
      status: '正常',
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          return 26;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const columns = [
    { key: 'name', label: '连接器名称', sortable: true, filterable: true, width: '180px' },
    { key: 'purpose', label: '用途', sortable: true, filterable: true, width: '150px' },
    { key: 'type', label: '连接器类型', sortable: true, filterable: true, width: '150px' },
    { key: 'creator', label: '创建人', sortable: true, filterable: true, width: '120px' },
    { key: 'createTime', label: '创建时间', sortable: true, filterable: true, width: '180px' },
    { key: 'updateTime', label: '更新时间', sortable: true, filterable: true, width: '180px' },
    { key: 'status', label: '状态', sortable: true, filterable: true, width: '120px' },
    { key: 'action', label: '操作', sortable: false, filterable: false, width: '120px' },
  ];

  return (
    <div className="connector-list">
      <div className="page-header">
        <h1 className="page-title">连接器</h1>
      </div>

      <div className="content-card">
        <div className="page-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索连接器名称/创建人"
              className="search-input"
            />
            <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="action-buttons">
            <button className="refresh-pill">{refreshCountdown}s 后自动刷新</button>
            <button className="create-button" onClick={() => setIsModalOpen(true)}>创建连接器</button>
          </div>
        </div>

        <div className="table-container">
          <table className="connector-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} style={{ width: column.width }}>
                    <div className="th-content">
                      <span className="th-label">{column.label}</span>
                      <div className="th-icons">
                        {column.sortable && (
                          <button className="sort-btn" title="排序">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M3 6l2 2 2-2M5 2v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                        {column.filterable && (
                          <button className="filter-btn" title="筛选">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 2h6L6 5v3L4 9V5L2 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {connectors.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="empty-state">
                    <div className="empty-content">
                      <svg className="empty-icon" width="72" height="72" viewBox="0 0 72 72" fill="none">
                        <rect x="12" y="18" width="48" height="36" rx="4" stroke="#d1d5db" strokeWidth="2" fill="#ffffff"/>
                        <path d="M12 28h48" stroke="#e5e7eb" strokeWidth="2"/>
                        <path d="M36 28v26" stroke="#e5e7eb" strokeWidth="2"/>
                      </svg>
                      <div className="empty-text">暂无数据</div>
                    </div>
                  </td>
                </tr>
              ) : (
                connectors.map((connector) => (
                  <tr key={connector.id}>
                    <td>
                      <span className="connector-name">{connector.name}</span>
                    </td>
                    <td>
                      <span className="purpose-badge">{connector.purpose}</span>
                    </td>
                    <td>
                      <div className="type-cell">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="type-icon">
                          <rect x="2" y="3" width="14" height="12" rx="2" fill="#2f6eea" />
                          <path d="M5 7h8M5 10h8" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        <span>{connector.type}</span>
                      </div>
                    </td>
                    <td>{connector.creator}</td>
                    <td className="time-cell">{connector.createTime}</td>
                    <td className="time-cell">{connector.updateTime}</td>
                    <td>
                      <span className="status-badge status-normal">
                        <span className="status-dot"></span>
                        {connector.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-btn" title="编辑">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.5 2.5l2 2L6 12H4v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button className="icon-btn icon-btn-danger" title="删除">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 5v8m3-8v8m3-8v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            <path d="M2.5 5h11M6 3.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
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

      <CreateConnectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          console.log('创建连接器:', data);
          // 这里可以添加实际的提交逻辑
        }}
      />
    </div>
  );
};

export default ConnectorList;
