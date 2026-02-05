import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DataLoadDetail.css';

type FileDetail = {
  filename: string;
  status: string;
  fileType: string;
  startTime: string;
  endTime: string;
  detail: string;
};

type UrlDetail = {
  url: string;
  status: string;
  detail: string;
};

type WebPageTaskDetail = {
  id: string;
  connectorType: '网页载入';
  connectorName: string;
  type: string;
  loadMode: string;
  decompressionStrategy?: string;
  status: string;
  createdTime: string;
  createdBy: string;
  fileTypes: string[];
  loadLocation: string;
  duplicateFileHandling: string;
  lastCompletionTime: string;
  pathRegex?: string;
  webpageCaptureMethod?: string; // 网页抓取方式
  linkAreaFilter?: string; // 链接区域筛选（CSS选择器）
  enableLinkAreaFilter?: boolean; // 是否启用链接区域筛选
  contentFilter?: string; // 内容筛选（CSS选择器）
  enableContentFilter?: boolean; // 是否启用内容筛选
  enableLinkExtraction?: boolean; // 抽取链接
  enableFileDownload?: boolean; // 文件下载
  url?: string; // 入口URL
  progress?: { inserted: number; total: number }; // 进度
  files: FileDetail[];
  urls?: UrlDetail[]; // URL列表
  fileSuccessCount: number; // 文件成功数量
  fileFailedCount: number; // 文件失败数量
  fileTotalCount: number; // 文件总数
  urlSuccessCount?: number; // URL成功数量
  urlFailedCount?: number; // URL失败数量
  urlTotalCount?: number; // URL总数
};

type DatabaseTaskDetail = {
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

type TaskDetail = WebPageTaskDetail | DatabaseTaskDetail;

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
      loadMode: '实时同步',
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
      loadMode: '实时同步',
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
    '2016765054542139393': {
      id: '2016765054542139393',
      connectorType: '网页载入',
      connectorName: '网页载入',
      type: '网页数据',
      loadMode: '周期载入 (2小时)',
      decompressionStrategy: '忽略目录结构',
      status: '进行中',
      createdTime: '2026-02-02 10:25:58',
      createdBy: 'admin',
      fileTypes: ['html', 'pdf', 'docx'],
      url: 'https://example.com/news',
      loadLocation: '默认原始数据卷/vol1',
      duplicateFileHandling: 'name、md5跳过',
      lastCompletionTime: '',
      pathRegex: '',
      webpageCaptureMethod: '定向区域链接抓取',
      progress: { inserted: 3250, total: 5000 },
      linkAreaFilter: '.link-area',
      enableLinkAreaFilter: true,
      contentFilter: '#main-content',
      enableContentFilter: true,
      enableLinkExtraction: true,
      enableFileDownload: true,
      files: [
        {
          filename: '20231229-MO英文白皮书.pdf',
          status: '完成',
          fileType: 'pdf',
          startTime: '2026-02-02 10:26:05',
          endTime: '2026-02-02 10:26:12',
          detail: '',
        },
        {
          filename: '产品介绍页面.html',
          status: '完成',
          fileType: 'html',
          startTime: '2026-02-02 10:26:15',
          endTime: '2026-02-02 10:26:20',
          detail: '',
        },
        {
          filename: '用户使用手册.docx',
          status: '完成',
          fileType: 'docx',
          startTime: '2026-02-02 10:28:35',
          endTime: '2026-02-02 10:28:42',
          detail: '',
        },
        {
          filename: '技术文档页面.html',
          status: '完成',
          fileType: 'html',
          startTime: '2026-02-02 10:30:50',
          endTime: '2026-02-02 10:30:55',
          detail: '',
        },
        {
          filename: 'MatrixOne Intelligence白皮书.pdf',
          status: '完成',
          fileType: 'pdf',
          startTime: '2026-02-02 10:33:25',
          endTime: '2026-02-02 10:33:35',
          detail: '',
        },
        {
          filename: '最新-20231205英文产品白皮书.pdf',
          status: '完成',
          fileType: 'pdf',
          startTime: '2026-02-02 10:33:40',
          endTime: '2026-02-02 10:33:50',
          detail: '',
        },
        {
          filename: 'API参考文档.docx',
          status: '完成',
          fileType: 'docx',
          startTime: '2026-02-02 10:33:55',
          endTime: '2026-02-02 10:34:05',
          detail: '',
        },
      ],
      urls: [
        {
          url: 'https://example.com/news',
          status: '完成',
          detail: '',
        },
        {
          url: 'https://example.com/news/article1',
          status: '完成',
          detail: '',
        },
        {
          url: 'https://example.com/news/article2',
          status: '失败',
          detail: '网络超时：连接服务器超时，请检查网络连接',
        },
        {
          url: 'https://example.com/news/article3',
          status: '完成',
          detail: '',
        },
        {
          url: 'https://example.com/news/article4',
          status: '失败',
          detail: 'HTTP错误：404 Not Found，页面不存在',
        },
      ],
      fileSuccessCount: 7,
      fileFailedCount: 0,
      fileTotalCount: 7,
      urlSuccessCount: 3,
      urlFailedCount: 2,
      urlTotalCount: 5,
    },
    '2016765054542139394': {
      id: '2016765054542139394',
      connectorType: '网页载入',
      connectorName: '网页载入',
      type: '网页数据',
      loadMode: '一次载入',
      decompressionStrategy: '忽略目录结构',
      status: '完成',
      createdTime: '2026-01-29 14:30:00',
      createdBy: 'admin',
      fileTypes: ['html', 'pdf', 'docx'],
      url: 'https://example.com/docs',
      loadLocation: '默认原始数据卷/vol1',
      duplicateFileHandling: 'name跳过',
      lastCompletionTime: '2026-01-29 15:05:10',
      pathRegex: '',
      webpageCaptureMethod: '单页抓取',
      progress: { inserted: 3, total: 3 },
      linkAreaFilter: '',
      enableLinkAreaFilter: false,
      contentFilter: '',
      enableContentFilter: false,
      enableLinkExtraction: false,
      enableFileDownload: true,
      files: [
        {
          filename: '产品文档1.pdf',
          status: '完成',
          fileType: 'pdf',
          startTime: '2026-01-29 14:30:05',
          endTime: '2026-01-29 14:30:15',
          detail: '',
        },
        {
          filename: '产品文档2.docx',
          status: '完成',
          fileType: 'docx',
          startTime: '2026-01-29 14:30:20',
          endTime: '2026-01-29 14:30:25',
          detail: '',
        },
        {
          filename: '产品介绍页面.html',
          status: '完成',
          fileType: 'html',
          startTime: '2026-01-29 14:30:30',
          endTime: '2026-01-29 14:30:35',
          detail: '',
        },
      ],
      urls: [
        {
          url: 'https://example.com/docs',
          status: '完成',
          detail: '',
        },
      ],
      fileSuccessCount: 3,
      fileFailedCount: 0,
      fileTotalCount: 3,
      urlSuccessCount: 1,
      urlFailedCount: 0,
      urlTotalCount: 1,
    },
  };
  return mockDetails[id] ?? null;
};

const DataLoadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const task = useMemo(() => (id ? getTaskDetail(id) : null), [id]);
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'files' | 'urls'>('files');
  const pageSize = 10;

  useEffect(() => {
    if (task?.connectorType === '网页载入') {
      const timer = setInterval(() => {
        setRefreshCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [task]);

  useEffect(() => {
    setCurrentPage(1); // 切换tab时重置页码
  }, [activeTab]);

  const isWebPageTask = task?.connectorType === '网页载入';
  const webPageTask = isWebPageTask ? (task as WebPageTaskDetail) : null;
  const databaseTask = !isWebPageTask ? (task as DatabaseTaskDetail) : null;

  const paginatedFiles = webPageTask
    ? webPageTask.files.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];
  const paginatedUrls = webPageTask && webPageTask.urls
    ? webPageTask.urls.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];
  
  const totalPages = webPageTask 
    ? (activeTab === 'files' 
        ? Math.ceil(webPageTask.files.length / pageSize)
        : webPageTask.urls 
          ? Math.ceil(webPageTask.urls.length / pageSize)
          : 1)
    : 1;

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

      {task ? (
        <>
          <div className="detail-card">
            <div className="detail-section-title">任务信息</div>
            {isWebPageTask && webPageTask ? (
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">类型</div>
                  <div className="detail-value">{webPageTask.type}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">连接器</div>
                  <div className="detail-value">{webPageTask.connectorName}</div>
                </div>
                {webPageTask.url && (
                  <div className="detail-item">
                    <div className="detail-label">URL</div>
                    <div className="detail-value">{webPageTask.url}</div>
                  </div>
                )}
                <div className="detail-item">
                  <div className="detail-label">载入位置</div>
                  <div className="detail-value">{webPageTask.loadLocation}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">载入模式</div>
                  <div className="detail-value">{webPageTask.loadMode}</div>
                </div>
                {webPageTask.webpageCaptureMethod && (
                  <div className="detail-item">
                    <div className="detail-label">网页抓取方式</div>
                    <div className="detail-value">{webPageTask.webpageCaptureMethod}</div>
                  </div>
                )}
                {webPageTask.enableLinkAreaFilter !== undefined && (
                  <div className="detail-item">
                    <div className="detail-label">链接区域筛选</div>
                    <div className="detail-value">
                      {webPageTask.enableLinkAreaFilter ? (webPageTask.linkAreaFilter || '-') : '未启用'}
                    </div>
                  </div>
                )}
                {webPageTask.enableContentFilter !== undefined && (
                  <div className="detail-item">
                    <div className="detail-label">内容筛选</div>
                    <div className="detail-value">
                      {webPageTask.enableContentFilter ? (webPageTask.contentFilter || '-') : '未启用'}
                    </div>
                  </div>
                )}
                {webPageTask.enableLinkExtraction !== undefined && (
                  <div className="detail-item">
                    <div className="detail-label">抽取链接</div>
                    <div className="detail-value">{webPageTask.enableLinkExtraction ? '是' : '否'}</div>
                  </div>
                )}
                {webPageTask.enableFileDownload !== undefined && (
                  <div className="detail-item">
                    <div className="detail-label">文件下载</div>
                    <div className="detail-value">{webPageTask.enableFileDownload ? '是' : '否'}</div>
                  </div>
                )}
                {webPageTask.decompressionStrategy && (
                  <div className="detail-item">
                    <div className="detail-label">解压策略</div>
                    <div className="detail-value">{webPageTask.decompressionStrategy}</div>
                  </div>
                )}
                <div className="detail-item">
                  <div className="detail-label">状态</div>
                  <div className="detail-value">
                    <span className={`detail-status detail-status-${webPageTask.status === '完成' ? 'completed' : webPageTask.status === '已暂停' ? 'paused' : (webPageTask.status === '运行中' || webPageTask.status === '进行中') ? 'running' : 'failed'}`}>
                      {webPageTask.status}
                    </span>
                  </div>
                </div>
                {webPageTask.progress && (
                  <div className="detail-item">
                    <div className="detail-label">进度</div>
                    <div className="detail-value">
                      {webPageTask.progress.inserted.toLocaleString()}/{webPageTask.progress.total.toLocaleString()}
                    </div>
                  </div>
                )}
                <div className="detail-item">
                  <div className="detail-label">文件类型</div>
                  <div className="detail-value">
                    <div className="file-types-list">
                      {webPageTask.fileTypes.map((type, idx) => (
                        <span key={idx} className="file-type-tag">{type}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">重复文件处理</div>
                  <div className="detail-value">{webPageTask.duplicateFileHandling}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">创建时间</div>
                  <div className="detail-value">{webPageTask.createdTime}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">创建人</div>
                  <div className="detail-value">{webPageTask.createdBy}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">最近一次完成时间</div>
                  <div className="detail-value">{webPageTask.lastCompletionTime || '-'}</div>
                </div>
              </div>
            ) : databaseTask ? (
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">类型</div>
                  <div className="detail-value">{databaseTask.connectorType}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">连接器</div>
                  <div className="detail-value">{databaseTask.connectorName}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">源数据表</div>
                  <div className="detail-value">{databaseTask.sourceTable}</div>
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
                    {databaseTask.targetTable}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">载入模式</div>
                  <div className="detail-value">{databaseTask.loadMode}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">同步策略</div>
                  <div className="detail-value">{databaseTask.syncStrategy}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">主键冲突处理</div>
                  <div className="detail-value">{databaseTask.conflictStrategy}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">状态</div>
                  <div className="detail-value">
                    <span className={`detail-status detail-status-${databaseTask.status === '完成' ? 'completed' : databaseTask.status === '运行中' ? 'running' : databaseTask.status === '暂停' ? 'paused' : 'failed'}`}>
                      {databaseTask.status}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">进度</div>
                  <div className="detail-value">
                    {databaseTask.progress.inserted.toLocaleString()}/{databaseTask.progress.total.toLocaleString()}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">创建时间</div>
                  <div className="detail-value">{databaseTask.createdTime}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">创建人</div>
                  <div className="detail-value">{databaseTask.createdBy}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">开始时间</div>
                  <div className="detail-value">{databaseTask.startTime}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">结束时间</div>
                  <div className="detail-value">{databaseTask.endTime}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">导入行数</div>
                  <div className="detail-value">{databaseTask.importedRows}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">详情</div>
                  <div className="detail-value">{databaseTask.detail}</div>
                </div>
              </div>
            ) : null}
          </div>

          {isWebPageTask && webPageTask && (
            <div className="detail-card">
              <div className="file-details-header">
                <div className="file-stats">
                  {activeTab === 'files' ? (
                    <>
                      <span className="stat-success">载入成功 {webPageTask.fileSuccessCount}/{webPageTask.fileTotalCount}</span>
                      <span className="stat-failed">载入失败 {webPageTask.fileFailedCount}/{webPageTask.fileTotalCount}</span>
                    </>
                  ) : (
                    <>
                      <span className="stat-success">载入成功 {webPageTask.urlSuccessCount || 0}/{webPageTask.urlTotalCount || 0}</span>
                      <span className="stat-failed">载入失败 {webPageTask.urlFailedCount || 0}/{webPageTask.urlTotalCount || 0}</span>
                    </>
                  )}
                </div>
                <div className="refresh-indicator">{refreshCountdown}s 后自动刷新</div>
              </div>
              <div className="detail-tabs">
                <button
                  className={`detail-tab ${activeTab === 'files' ? 'active' : ''}`}
                  onClick={() => setActiveTab('files')}
                >
                  文件详情列表
                </button>
                <button
                  className={`detail-tab ${activeTab === 'urls' ? 'active' : ''}`}
                  onClick={() => setActiveTab('urls')}
                >
                  URL列表
                </button>
              </div>
              <div className="file-table-container">
                {activeTab === 'files' ? (
                  <table className="file-table">
                    <thead>
                      <tr>
                        <th>文件名</th>
                        <th>状态</th>
                        <th>文件类型</th>
                        <th>开始时间</th>
                        <th>结束时间</th>
                        <th>详情</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedFiles.length > 0 ? (
                        paginatedFiles.map((file, idx) => (
                          <tr key={idx}>
                            <td>{file.filename}</td>
                            <td>
                              <span className={`file-status file-status-${file.status === '完成' ? 'completed' : 'failed'}`}>
                                <span className="file-status-dot"></span>
                                {file.status}
                              </span>
                            </td>
                            <td>{file.fileType}</td>
                            <td>{file.startTime}</td>
                            <td>{file.endTime}</td>
                            <td>{file.detail || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="file-table-empty">暂无文件</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="file-table">
                    <thead>
                      <tr>
                        <th>URL</th>
                        <th>状态</th>
                        <th>详情</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUrls.length > 0 ? (
                        paginatedUrls.map((urlItem, idx) => (
                          <tr key={idx}>
                            <td>{urlItem.url}</td>
                            <td>
                              <span className={`file-status file-status-${urlItem.status === '完成' ? 'completed' : 'failed'}`}>
                                <span className="file-status-dot"></span>
                                {urlItem.status}
                              </span>
                            </td>
                            <td className={urlItem.detail ? 'url-detail-error' : ''}>{urlItem.detail || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="file-table-empty">暂无URL</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
                {totalPages > 1 && (
                  <div className="file-table-pagination">
                    <button
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      &lt;
                    </button>
                    <span className="pagination-info">{currentPage}</span>
                    <button
                      className="pagination-btn"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="detail-card">
          <div className="detail-empty">未找到该任务</div>
        </div>
      )}
    </div>
  );
};

export default DataLoadDetail;
