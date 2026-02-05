import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './DataLoadList.css';

type LoadRow = {
  id: string;
  loadType: string;
  connectorType: string;
  connectorName: string;
  loadMode: string;
  target: string;
  status: string;
  progress: {
    inserted: number;
    total: number;
  };
  completedTime: string;
  createdTime: string;
  createdBy: string;
};

type Column = {
  key: string;
  label: string;
  width: string;
  filterable?: boolean;
  sortable?: boolean;
};

const DataLoadList: React.FC = () => {
  const navigate = useNavigate();
  const [refreshCountdown, setRefreshCountdown] = useState(21);
  const [rows, setRows] = useState<LoadRow[]>([
      {
        id: '2016765054542139392',
        loadType: '非结构化数据',
        connectorType: 'HIVE',
        connectorName: 'HIVE连接器',
        loadMode: '一次载入',
        target: '金盈问数/目公司公告/口002028_source',
        status: '完成',
        progress: { inserted: 15420, total: 15420 },
        completedTime: '2026-01-29 14:47:13',
        createdTime: '2026-01-29 14:47:13',
        createdBy: 'admin',
      },
      {
        id: '2016765051853590528',
        loadType: '非结构化数据',
        connectorType: 'MySQL',
        connectorName: 'MySQL连接器',
        loadMode: '实时同步',
        target: '金盈问数/目公司公告/口002028_source',
        status: '运行中',
        progress: { inserted: 8750, total: 12000 },
        completedTime: '-',
        createdTime: '2026-01-29 14:47:12',
        createdBy: 'admin',
      },
      {
        id: '2016764599900557312',
        loadType: '非结构化数据',
        connectorType: 'HIVE',
        connectorName: 'HIVE连接器',
        loadMode: '一次载入',
        target: '金盈问数/目公司公告/口002028_source',
        status: '完成',
        progress: { inserted: 9856, total: 9856 },
        completedTime: '2026-01-29 14:45:25',
        createdTime: '2026-01-29 14:45:25',
        createdBy: 'admin',
      },
      {
        id: '2016764600424845312',
        loadType: '非结构化数据',
        connectorType: 'MySQL',
        connectorName: 'MySQL连接器',
        loadMode: '实时同步',
        target: '金盈问数/目公司公告/口002028_source',
        status: '暂停',
        progress: { inserted: 5230, total: 18000 },
        completedTime: '-',
        createdTime: '2026-01-29 14:45:25',
        createdBy: 'admin',
      },
      {
        id: '2016763691649191936',
        loadType: '非结构化数据',
        connectorType: 'HIVE',
        connectorName: 'HIVE连接器',
        loadMode: '一次载入',
        target: '金盈问数/目公司公告/口000400_source',
        status: '完成',
        progress: { inserted: 23145, total: 23145 },
        completedTime: '2026-01-29 14:41:48',
        createdTime: '2026-01-29 14:41:48',
        createdBy: 'admin',
      },
      {
        id: '2016762296825008128',
        loadType: '非结构化数据',
        connectorType: 'MySQL',
        connectorName: 'MySQL连接器',
        loadMode: '一次载入',
        target: '金盈问数/目公司公告/口002028_source',
        status: '完成',
        progress: { inserted: 7890, total: 7890 },
        completedTime: '2026-01-29 14:36:16',
        createdTime: '2026-01-29 14:36:16',
        createdBy: 'admin',
      },
      {
        id: '2016762294446837760',
        loadType: '非结构化数据',
        connectorType: 'HIVE',
        connectorName: 'HIVE连接器',
        loadMode: '一次载入',
        target: '金盈问数/目公司公告/口002028_source',
        status: '完成',
        progress: { inserted: 12340, total: 12340 },
        completedTime: '2026-01-29 14:36:15',
        createdTime: '2026-01-29 14:36:15',
        createdBy: 'admin',
      },
      {
        id: '2016765054542139393',
        loadType: '网页数据',
        connectorType: '网页载入',
        connectorName: '网页载入连接器',
        loadMode: '一次载入',
        target: '金盈问数/网页数据/新闻资讯',
        status: '运行中',
        progress: { inserted: 3250, total: 5000 },
        completedTime: '-',
        createdTime: '2026-01-29 15:10:20',
        createdBy: 'admin',
      },
      {
        id: '2016765054542139394',
        loadType: '网页数据',
        connectorType: '网页载入',
        connectorName: '网页载入连接器',
        loadMode: '周期载入',
        target: '金盈问数/网页数据/产品文档',
        status: '完成',
        progress: { inserted: 8500, total: 8500 },
        completedTime: '2026-01-29 15:05:10',
        createdTime: '2026-01-29 14:30:00',
        createdBy: 'admin',
      },
    ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => (prev <= 1 ? 21 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 暂停任务
  const handlePause = (id: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: '暂停', completedTime: '-' }
          : row
      )
    );
  };

  // 恢复任务
  const handleResume = (id: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: '运行中', completedTime: '-' }
          : row
      )
    );
  };

  // 重启任务
  const handleRestart = (id: string) => {
    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/\//g, '-');
    
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? { 
              ...row, 
              status: '运行中', 
              completedTime: '-', 
              createdTime: now,
              progress: { inserted: 0, total: row.progress.total }
            }
          : row
      )
    );
  };

  // 删除任务
  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条载入任务吗？')) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  };

  const columns: Column[] = [
    { key: 'id', label: 'ID', width: '180px' },
    { key: 'loadType', label: '载入类型', width: '140px' },
    { key: 'connectorType', label: '连接器类型', width: '140px', filterable: true },
    { key: 'connectorName', label: '连接器名称', width: '120px' },
    { key: 'loadMode', label: '载入模式', width: '110px', filterable: true },
    { key: 'target', label: '载入位置/目标表', width: '1fr' },
    { key: 'status', label: '状态', width: '100px', filterable: true },
    { key: 'progress', label: '进度', width: '130px' },
    { key: 'completedTime', label: '最后完成时间', width: '180px', sortable: true },
    { key: 'createdTime', label: '创建时间', width: '180px', sortable: true },
    { key: 'createdBy', label: '创建人', width: '100px' },
    { key: 'action', label: '操作', width: '150px' },
  ];

  return (
    <div className="data-load">
      <div className="page-header">
        <h1 className="page-title">数据载入</h1>
      </div>

      <div className="content-card">
        <div className="page-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索载入位置/创建人"
              className="search-input"
            />
            <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="action-buttons">
            <button className="refresh-pill">{refreshCountdown}s 后自动刷新</button>
            <button className="primary-button" onClick={() => navigate('/data-load/new')}>
              载入数据
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} style={{ width: c.width }}>
                    <div className="th-content">
                      <span className="th-label">{c.label}</span>
                      {c.filterable && (
                        <button className="filter-btn" title="筛选">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path
                              d="M2 2h6L6 5v3L4 9V5L2 2z"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                      {c.sortable && (
                        <button className="sort-btn" title="排序">
                          <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                            <path
                              d="M5 2v8M3 4l2-2 2 2M7 8l-2 2-2-2"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link className="id-link" to={`/data-load/${r.id}`}>
                      {r.id}
                    </Link>
                  </td>
                  <td>{r.loadType}</td>
                  <td>
                    <span className="inline-icon">
                      {r.connectorType === '网页载入' ? (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="2" y="3" width="14" height="12" rx="2" fill="#10b981" />
                          <path
                            d="M6 7l2 2 4-4M8 11h4"
                            stroke="white"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="2" y="3" width="14" height="12" rx="2" fill="#2f6eea" />
                          <path
                            d="M5 7h8M5 10h8"
                            stroke="white"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                      {r.connectorType}
                    </span>
                  </td>
                  <td>{r.connectorName}</td>
                  <td>{r.loadMode}</td>
                  <td>
                    <span className="inline-icon muted">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M8 2l6 3-6 3-6-3 6-3z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 8l6 3 6-3M2 11l6 3 6-3"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {r.target}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      r.status === '完成' ? 'status-completed' : 
                      r.status === '运行中' ? 'status-running' : 
                      r.status === '暂停' ? 'status-paused' : 
                      'status-failed'
                    }`}>
                      <span className="status-dot"></span>
                      {r.status}
                    </span>
                  </td>
                  <td className="progress-cell">
                    <span className="progress-text">
                      {r.progress.inserted.toLocaleString()}/{r.progress.total.toLocaleString()}
                    </span>
                  </td>
                  <td className="time-cell">{r.completedTime}</td>
                  <td className="time-cell">{r.createdTime}</td>
                  <td>{r.createdBy}</td>
                  <td>
                    <div className="action-buttons-cell">
                      {r.status === '运行中' && (
                        <button 
                          className="icon-action" 
                          title="暂停"
                          onClick={() => handlePause(r.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="4" y="3" width="3" height="10" rx="1" fill="currentColor" />
                            <rect x="9" y="3" width="3" height="10" rx="1" fill="currentColor" />
                          </svg>
                        </button>
                      )}
                      {r.status === '暂停' && (
                        <button 
                          className="icon-action" 
                          title="恢复"
                          onClick={() => handleResume(r.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M5 3l8 5-8 5V3z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      )}
                      {r.loadType !== '网页数据' && (
                        <button 
                          className="icon-action" 
                          title="重启同步"
                          onClick={() => handleRestart(r.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M13 8A5 5 0 1 1 8 3V1l3 2-3 2V3a5 5 0 1 0 5 5"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </svg>
                        </button>
                      )}
                      <button 
                        className="icon-action icon-action-danger" 
                        title="删除"
                        onClick={() => handleDelete(r.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M4 5v8m3-8v8m3-8v8"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                          <path
                            d="M2.5 5h11M6 3.5h4"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                          <path
                            d="M5 3.5l.3-1h5.4l.3 1"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
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
  );
};

export default DataLoadList;

