import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DataExploration.css';

type KnowledgeBase = {
  id: string;
  name: string;
  description: string;
  fileCount?: number;
};

const DataExploration: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [knowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: '1',
      name: '默认知识库',
      description: '默认知识库',
      fileCount: 0,
    },
  ]);
  const pageSize = 12;
  const totalPages = Math.ceil((knowledgeBases.length + 1) / pageSize); // +1 for create card

  const handleCreateKnowledgeBase = () => {
    navigate('/create-knowledge-base');
  };

  const handleKnowledgeBaseSettings = (id: string) => {
    // TODO: 打开知识库设置
    console.log('设置知识库', id);
  };

  const handleDeleteKnowledgeBase = (id: string) => {
    if (window.confirm('确定要删除这个知识库吗？')) {
      // TODO: 删除知识库
      console.log('删除知识库', id);
    }
  };

  const handleStartConversation = (id: string) => {
    // TODO: 开始对话
    console.log('开始对话', id);
  };

  return (
    <div className="data-exploration">
      <div className="exploration-header">
        <h1 className="exploration-title">数据探索</h1>
        <button className="exploration-filter-btn" aria-label="筛选">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 3h12M2 8h12M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="exploration-content">
        {/* 左侧面板 - 对话列表 */}
        <div className="conversation-panel">
          <div className="conversation-actions">
            <button className="btn-primary btn-new-conversation" onClick={() => console.log('新建对话')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              新建对话
            </button>
            <button className="btn-secondary btn-knowledge-base" onClick={() => console.log('知识库')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10v8H3V4z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 4V2h6v2M5 8h6M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              知识库
            </button>
          </div>

          <div className="conversation-search">
            <input
              type="text"
              className="search-input"
              placeholder="搜索会话"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="conversation-empty">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="20" y="25" width="40" height="30" rx="2" stroke="#d1d5db" strokeWidth="2" />
              <path d="M25 30h30M25 35h20M25 40h15" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="empty-text">暂无会话</p>
          </div>
        </div>

        {/* 右侧主内容区 - 知识库列表 */}
        <div className="knowledge-base-content">
          <div className="knowledge-base-grid">
            {/* 创建知识库卡片 */}
            <div className="kb-card kb-card-create" onClick={handleCreateKnowledgeBase}>
              <div className="kb-create-icon">
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                  <path d="M24 12v24M12 24h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div className="kb-create-label">+ 创建知识库</div>
              <div className="kb-create-desc">选择文件并创建知识库,即可开始智能对话。</div>
            </div>

            {/* 知识库卡片列表 */}
            {knowledgeBases.map((kb) => (
              <div key={kb.id} className="kb-card">
                <div className="kb-card-header">
                  <div className="kb-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6h16v12H4V6z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 6V4h10v2M7 12h10M7 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="kb-actions">
                    <button
                      className="kb-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleKnowledgeBaseSettings(kb.id);
                      }}
                      aria-label="设置"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                        <circle cx="8" cy="3" r="1.5" fill="currentColor" />
                        <circle cx="8" cy="13" r="1.5" fill="currentColor" />
                        <circle cx="3" cy="8" r="1.5" fill="currentColor" />
                        <circle cx="13" cy="8" r="1.5" fill="currentColor" />
                      </svg>
                    </button>
                    <button
                      className="kb-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteKnowledgeBase(kb.id);
                      }}
                      aria-label="删除"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 5v8m3-8v8m3-8v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        <path d="M2.5 5h11M6 3.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        <path d="M5 3.5l.3-1h5.4l.3 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="kb-card-body">
                  <h3 className="kb-name">{kb.name}</h3>
                  <p className="kb-description">{kb.description}</p>
                </div>
                <div className="kb-card-footer">
                  <button
                    className="kb-conversation-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartConversation(kb.id);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3C4 3 1.5 5.5 1 8c.5 2.5 3 5 7 5s6.5-2.5 7-5c-.5-2.5-3-5-7-5z" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    对话
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="kb-pagination">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M7.5 9L4.5 6l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="pagination-page">{currentPage}</span>
              <button
                className="pagination-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4.5 9l3-3-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataExploration;
