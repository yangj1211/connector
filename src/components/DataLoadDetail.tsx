import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DataLoadDetail.css';

type TaskDetail = {
  id: string;
  connectorType: 'HIVE' | 'MySQL';
  connectorName: string;
  sourceTable: string;
  targetTable: string;
  loadMode: string;
  createdTime: string;
  createdBy: string;
  startTime: string;
  endTime: string;
  syncStrategy: string;
  conflictStrategy: string;
  status: string;
  progress: { inserted: number; total: number };
  importedRows: number;
  detail: string;
};

// 模拟根据 id 获取任务详情（实际应请求接口）
const getTaskDetail = (id: string): TaskDetail | null => {
  const mockDetails: Record<string, TaskDetail> = {
    '2016765054542139392': {
      id: '2016765054542139392',
      connectorType: 'HIVE',
      connectorName: 'HIVE连接器',
      sourceTable: 'default.口002028_source',
      targetTable: '默认/db1/金盈问数/目公司公告/口002028_source',
      loadMode: '一次载入',
      createdTime: '2026-01-29 14:47:13',
      createdBy: 'admin',
      startTime: '2026-01-29 14:47:13',
      endTime: '2026-01-29 14:47:15',
      syncStrategy: '单事务',
      conflictStrategy: '导入失败',
      status: '完成',
      progress: { inserted: 15420, total: 15420 },
      importedRows: 15420,
      detail: '-',
    },
    '2016765051853590528': {
      id: '2016765051853590528',
      connectorType: 'MySQL',
      connectorName: 'MySQL连接器',
      sourceTable: 'default.口002028_source',
      targetTable: '默认/db1/金盈问数/目公司公告/口002028_source',
      loadMode: '增量触发',
      createdTime: '2026-01-29 14:47:12',
      createdBy: 'admin',
      startTime: '2026-01-29 14:47:12',
      endTime: '-',
      syncStrategy: '多事务',
      conflictStrategy: '跳过冲突行',
      status: '运行中',
      progress: { inserted: 8750, total: 12000 },
      importedRows: 8750,
      detail: '-',
    },
    '2016764599900557312': {
      id: '2016764599900557312',
      connectorType: 'HIVE',
      connectorName: 'HIVE连接器',
      sourceTable: 'default.口002028_source',
      targetTable: '默认/db1/金盈问数/目公司公告/口002028_source',
      loadMode: '一次载入',
      createdTime: '2026-01-29 14:45:25',
      createdBy: 'admin',
      startTime: '2026-01-29 14:45:25',
      endTime: '2026-01-29 14:45:28',
      syncStrategy: '单事务',
      conflictStrategy: '导入失败',
      status: '完成',
      progress: { inserted: 9856, total: 9856 },
      importedRows: 9856,
      detail: '-',
    },
    '2016764600424845312': {
      id: '2016764600424845312',
      connectorType: 'MySQL',
      connectorName: 'MySQL连接器',
      sourceTable: 'default.口002028_source',
      targetTable: '默认/db1/金盈问数/目公司公告/口002028_source',
      loadMode: '增量触发',
      createdTime: '2026-01-29 14:45:25',
      createdBy: 'admin',
      startTime: '2026-01-29 14:45:25',
      endTime: '-',
      syncStrategy: '多事务',
      conflictStrategy: '替换冲突行',
      status: '暂停',
      progress: { inserted: 5230, total: 18000 },
      importedRows: 5230,
      detail: '-',
    },
    '2016763691649191936': {
      id: '2016763691649191936',
      connectorType: 'HIVE',
      connectorName: 'HIVE连接器',
      sourceTable: 'default.口000400_source',
      targetTable: '默认/db1/金盈问数/目公司公告/口000400_source',
      loadMode: '一次载入',
      createdTime: '2026-01-29 14:41:48',
      createdBy: 'admin',
      startTime: '2026-01-29 14:41:48',
      endTime: '2026-01-29 14:41:52',
      syncStrategy: '单事务',
      conflictStrategy: '导入失败',
      status: '完成',
      progress: { inserted: 23145, total: 23145 },
      importedRows: 23145,
      detail: '-',
    },
    '2016762296825008128': {
      id: '2016762296825008128',
      connectorType: 'MySQL',
      connectorName: 'MySQL连接器',
      sourceTable: 'default.口002028_source',
      targetTable: '默认/db1/金盈问数/目公司公告/口002028_source',
      loadMode: '一次载入',
      createdTime: '2026-01-29 14:36:16',
      createdBy: 'admin',
      startTime: '2026-01-29 14:36:16',
      endTime: '2026-01-29 14:36:18',
      syncStrategy: '多事务',
      conflictStrategy: '跳过冲突行',
      status: '完成',
      progress: { inserted: 7890, total: 7890 },
      importedRows: 7890,
      detail: '-',
    },
    '2016762294446837760': {
      id: '2016762294446837760',
      connectorType: 'HIVE',
      connectorName: 'HIVE连接器',
      sourceTable: 'default.口002028_source',
      targetTable: '默认/db1/金盈问数/目公司公告/口002028_source',
      loadMode: '一次载入',
      createdTime: '2026-01-29 14:36:15',
      createdBy: 'admin',
      startTime: '2026-01-29 14:36:15',
      endTime: '2026-01-29 14:36:17',
      syncStrategy: '单事务',
      conflictStrategy: '导入失败',
      status: '完成',
      progress: { inserted: 12340, total: 12340 },
      importedRows: 12340,
      detail: '-',
    },
  };
  return mockDetails[id] ?? null;
};

const DataLoadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const task = useMemo(() => (id ? getTaskDetail(id) : null), [id]);

  return (
    <div className="data-load-detail">
      <div className="detail-header">
        <button
          type="button"
          className="detail-back"
          onClick={() => navigate('/data-load')}
          aria-label="返回"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 15l-5-5 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="detail-title">ID-{id ?? '-'}</h1>
      </div>

      <div className="detail-card">
        <div className="detail-section-title">任务信息</div>
        {task ? (
          <div className="detail-grid">
            <div className="detail-item">
              <div className="detail-label">类型</div>
              <div className="detail-value">{task.connectorType}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">连接器</div>
              <div className="detail-value">{task.connectorName}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">源数据表</div>
              <div className="detail-value">{task.sourceTable}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">目标表</div>
              <div className="detail-value detail-value-target">
                <span className="detail-target-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12v8H2V4z" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5 4V2h6v2M5 8h6M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </span>
                {task.targetTable}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">载入模式</div>
              <div className="detail-value">{task.loadMode}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">同步策略</div>
              <div className="detail-value">{task.syncStrategy}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">主键冲突处理</div>
              <div className="detail-value">{task.conflictStrategy}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">状态</div>
              <div className="detail-value">
                <span className={`detail-status detail-status-${task.status === '完成' ? 'completed' : task.status === '运行中' ? 'running' : task.status === '暂停' ? 'paused' : 'failed'}`}>
                  {task.status}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">进度</div>
              <div className="detail-value">
                {task.progress.inserted.toLocaleString()}/{task.progress.total.toLocaleString()}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">创建时间</div>
              <div className="detail-value">{task.createdTime}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">创建人</div>
              <div className="detail-value">{task.createdBy}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">开始时间</div>
              <div className="detail-value">{task.startTime}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">结束时间</div>
              <div className="detail-value">{task.endTime}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">导入行数</div>
              <div className="detail-value">{task.importedRows}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">详情</div>
              <div className="detail-value">{task.detail}</div>
            </div>
          </div>
        ) : (
          <div className="detail-empty">未找到该任务</div>
        )}
      </div>
    </div>
  );
};

export default DataLoadDetail;
