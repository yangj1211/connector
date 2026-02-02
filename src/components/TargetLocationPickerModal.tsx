import React, { useEffect, useMemo, useState } from 'react';
import './TargetLocationPickerModal.css';

type Props = {
  isOpen: boolean;
  mode?: 'full' | 'db-only' | 'volume';
  initialDir?: string;
  initialDb?: string;
  initialTable?: string;
  onCancel: () => void;
  onConfirm: (dir: string, db: string, table?: string) => void;
};

const TargetLocationPickerModal: React.FC<Props> = ({
  isOpen,
  mode = 'full',
  initialDir,
  initialDb,
  initialTable,
  onCancel,
  onConfirm,
}) => {
  const isDbOnlyMode = mode === 'db-only';
  const isVolumeMode = mode === 'volume';
  const isThreeColumn = mode === 'full' || mode === 'volume';
  const dirOptions = useMemo(() => ['默认', '目录A', '目录B'], []);

  const dbOptionsByDir = useMemo(() => {
    return new Map<string, { name: string; disabled?: boolean }[]>([
      [
        '默认',
        [
          { name: '原始数据卷' },
          { name: '目标数据卷' },
          { name: 'bpc_combine', disabled: true },
          { name: 'jst_dwd', disabled: true },
          { name: 'jst_dws', disabled: true },
          { name: 'test_dwd' },
          { name: 'db1' },
        ],
      ],
      ['目录A', [{ name: 'db1' }, { name: 'db2' }]],
      ['目录B', [{ name: 'analytics' }, { name: 'lakehouse' }]],
    ]);
  }, []);

  const tableOptionsByDb = useMemo(() => {
    return new Map<string, string[]>([
      ['原始数据卷', ['tab1', 'tab2']],
      ['目标数据卷', ['tab1']],
      ['test_dwd', ['t1', 't2', 't3']],
      ['db1', ['tab1', 'tab2']],
      ['db2', ['t_user', 't_order']],
      ['analytics', ['events', 'sessions']],
      ['lakehouse', ['bronze_raw', 'silver_clean', 'gold_metrics']],
    ]);
  }, []);

  const volumeOptionsByDb = useMemo(() => {
    return new Map<string, string[]>([
      ['原始数据', ['智能工作流', '样例数据']],
      ['处理数据', ['智能工作流', '样例数据']],
      ['test_dwd', ['卷1', '卷2']],
      ['db1', ['智能工作流', '样例数据']],
      ['db2', ['智能工作流']],
      ['analytics', ['智能工作流']],
      ['lakehouse', ['智能工作流', '样例数据']],
    ]);
  }, []);

  const [dir, setDir] = useState('');
  const [db, setDb] = useState('');
  const [table, setTable] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const initDir = initialDir && dirOptions.includes(initialDir) ? initialDir : dirOptions[0]!;
    setDir(initDir);

    const dbList = dbOptionsByDir.get(initDir) ?? [];
    const firstEnabledDb = dbList.find((d) => !d.disabled)?.name ?? '';
    const initDb =
      initialDb && dbList.some((d) => d.name === initialDb && !d.disabled)
        ? initialDb
        : firstEnabledDb;
    setDb(initDb);

    if (isThreeColumn) {
      const items = isVolumeMode ? volumeOptionsByDb.get(initDb) ?? [] : tableOptionsByDb.get(initDb) ?? [];
      const initTable = initialTable && items.includes(initialTable) ? initialTable : items[0] ?? '';
      setTable(initTable);
    }
  }, [isOpen, initialDir, initialDb, initialTable, dirOptions, dbOptionsByDir, tableOptionsByDb, volumeOptionsByDb, isThreeColumn, isVolumeMode]);

  const dbList = useMemo(() => dbOptionsByDir.get(dir) ?? [], [dbOptionsByDir, dir]);
  const tableList = useMemo(() => tableOptionsByDb.get(db) ?? [], [tableOptionsByDb, db]);
  const volumeList = useMemo(() => volumeOptionsByDb.get(db) ?? [], [volumeOptionsByDb, db]);

  const canConfirm = isDbOnlyMode ? Boolean(dir && db) : Boolean(dir && db && table);

  if (!isOpen) return null;

  return (
    <div className="tlp-overlay" onClick={onCancel}>
      <div className="tlp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tlp-header">
          <div className="tlp-title">选择载入位置</div>
          <button className="tlp-close" onClick={onCancel} aria-label="关闭">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className={`tlp-grid ${isDbOnlyMode ? 'two-col' : ''}`}>
          <div className="tlp-col">
            <div className="tlp-col-head">
              目录
              {isThreeColumn && (
                <button className="tlp-add-btn" type="button" aria-label="新增">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 4v10M4 9h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
            <div className="tlp-list">
              {dirOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`tlp-item ${dir === d ? 'active' : ''}`}
                  onClick={() => {
                    setDir(d);
                    const nextDbList = dbOptionsByDir.get(d) ?? [];
                    const firstEnabled = nextDbList.find((x) => !x.disabled)?.name ?? '';
                    setDb(firstEnabled);
                    if (isThreeColumn) {
                      const nextItems = isVolumeMode 
                        ? volumeOptionsByDb.get(firstEnabled) ?? []
                        : tableOptionsByDb.get(firstEnabled) ?? [];
                      setTable(nextItems[0] ?? '');
                    }
                  }}
                >
                  <span className="tlp-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M3 6l6-3 6 3-6 3-6-3z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 9l6 3 6-3M3 12l6 3 6-3"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="tlp-text">{d}</span>
                  <span className="tlp-chevron">›</span>
                </button>
              ))}
            </div>
          </div>

          <div className="tlp-divider" />

          <div className="tlp-col">
            <div className="tlp-col-head">
              库
              {isThreeColumn && (
                <button className="tlp-add-btn" type="button" aria-label="新增">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 4v10M4 9h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
            <div className="tlp-list">
              {dbList.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  className={`tlp-item ${db === d.name ? 'active' : ''} ${d.disabled ? 'disabled' : ''}`}
                  onClick={() => {
                    if (d.disabled) return;
                    setDb(d.name);
                    if (isThreeColumn) {
                      const nextItems = isVolumeMode
                        ? volumeOptionsByDb.get(d.name) ?? []
                        : tableOptionsByDb.get(d.name) ?? [];
                      setTable(nextItems[0] ?? '');
                    }
                  }}
                >
                  <span className="tlp-icon">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <ellipse cx="9" cy="4.5" rx="6.5" ry="2.5" stroke="currentColor" strokeWidth="1.4" />
                      <path
                        d="M2.5 4.5v6.5c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V4.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                    </svg>
                  </span>
                  <span className="tlp-text">{d.name}</span>
                  {isThreeColumn && <span className="tlp-chevron">›</span>}
                </button>
              ))}
            </div>
          </div>

          {isThreeColumn && (
            <>
              <div className="tlp-divider" />

              <div className="tlp-col">
                <div className="tlp-col-head">{isVolumeMode ? '卷' : '表'}</div>
                <div className="tlp-list">
                  {(isVolumeMode ? volumeList : tableList).map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`tlp-item ${table === t ? 'active' : ''}`}
                      onClick={() => setTable(t)}
                    >
                      <span className="tlp-icon">
                        {isVolumeMode ? (
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path
                              d="M4 4.5h10a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 12V6A1.5 1.5 0 014 4.5z"
                              stroke="currentColor"
                              strokeWidth="1.4"
                            />
                            <path d="M6.5 7.5v3M11.5 7.5v3" stroke="currentColor" strokeWidth="1.2" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                            <path d="M3 7h12M3 11h12M7 3v12" stroke="currentColor" strokeWidth="1.2" />
                          </svg>
                        )}
                      </span>
                      <span className="tlp-text">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="tlp-footer">
          <div className="tlp-current">
            <span className="tlp-current-label">当前选择：</span>
            <span className="tlp-current-path">
              {isDbOnlyMode ? (
                <>
                  <span className="tlp-icon-small">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 4l5-2 5 2-5 2-5-2z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="tlp-path-item">{dir || '-'}</span>
                  <span className="tlp-sep">/</span>
                  <span className="tlp-icon-small">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <ellipse cx="7" cy="3.5" rx="4.5" ry="1.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M2.5 3.5v4c0 .8 2 1.5 4.5 1.5s4.5-.7 4.5-1.5v-4" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </span>
                  <span className="tlp-path-item">{db || '-'}</span>
                </>
              ) : (
                <>
                  <span className="tlp-icon-small">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 4l5-2 5 2-5 2-5-2z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="tlp-path-item">{dir || '-'}</span>
                  <span className="tlp-sep">/</span>
                  <span className="tlp-icon-small">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <ellipse cx="7" cy="3.5" rx="4.5" ry="1.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M2.5 3.5v4c0 .8 2 1.5 4.5 1.5s4.5-.7 4.5-1.5v-4" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </span>
                  <span className="tlp-path-item">{db || '-'}</span>
                  <span className="tlp-sep">/</span>
                  <span className="tlp-icon-small">
                    {isVolumeMode ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M3 3.5h8a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5a1 1 0 011-1z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path d="M5 6v2M9 6v2" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="2.5" y="2.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M2.5 5.5h9M2.5 8.5h9M5.5 2.5v9" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    )}
                  </span>
                  <span className="tlp-path-item">{table || '-'}</span>
                </>
              )}
            </span>
          </div>

          <div className="tlp-actions">
            <button type="button" className="tlp-btn" onClick={onCancel}>
              取 消
            </button>
            <button
              type="button"
              className={`tlp-btn tlp-btn-primary ${canConfirm ? '' : 'disabled'}`}
              onClick={() => canConfirm && onConfirm(dir, db, table)}
              disabled={!canConfirm}
            >
              确 定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetLocationPickerModal;

