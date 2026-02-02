import React, { useEffect, useMemo, useState } from 'react';
import './TablePickerModal.css';

type Props = {
  isOpen: boolean;
  databases: string[];
  getTables: (db: string) => string[];
  initialDb?: string;
  initialTable?: string;
  onCancel: () => void;
  onConfirm: (db: string, table: string) => void;
};

const TablePickerModal: React.FC<Props> = ({
  isOpen,
  databases,
  getTables,
  initialDb,
  initialTable,
  onCancel,
  onConfirm,
}) => {
  const [activeDb, setActiveDb] = useState('');
  const [activeTable, setActiveTable] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const db = initialDb && databases.includes(initialDb) ? initialDb : databases[0] ?? '';
    setActiveDb(db);
    const tables = db ? getTables(db) : [];
    const t =
      initialTable && tables.includes(initialTable) ? initialTable : tables[0] ?? '';
    setActiveTable(t);
  }, [isOpen, initialDb, initialTable, databases, getTables]);

  const tables = useMemo(() => (activeDb ? getTables(activeDb) : []), [activeDb, getTables]);
  const canConfirm = Boolean(activeDb && activeTable);

  if (!isOpen) return null;

  return (
    <div className="tp-overlay" onClick={onCancel}>
      <div className="tp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tp-body">
          <div className="tp-grid">
            <div className="tp-col">
              <div className="tp-col-head">库</div>
              <div className="tp-list">
                {databases.map((db) => (
                  <button
                    key={db}
                    type="button"
                    className={`tp-item ${activeDb === db ? 'active' : ''}`}
                    onClick={() => {
                      setActiveDb(db);
                      const nextTables = getTables(db);
                      setActiveTable(nextTables[0] ?? '');
                    }}
                  >
                    <span className="tp-icon">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <ellipse cx="9" cy="4.5" rx="6.5" ry="2.5" stroke="currentColor" strokeWidth="1.4" />
                        <path
                          d="M2.5 4.5v6.5c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V4.5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        />
                      </svg>
                    </span>
                    <span className="tp-text">{db}</span>
                    <span className="tp-chevron">›</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="tp-divider" />

            <div className="tp-col">
              <div className="tp-col-head">表</div>
              <div className="tp-list">
                {tables.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tp-item ${activeTable === t ? 'active' : ''}`}
                    onClick={() => setActiveTable(t)}
                  >
                    <span className="tp-icon">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path
                          d="M3 7h12M3 11h12M7 3v12"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </span>
                    <span className="tp-text">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="tp-footer">
          <button type="button" className="tp-btn" onClick={onCancel}>
            取 消
          </button>
          <button
            type="button"
            className={`tp-btn tp-btn-primary ${canConfirm ? '' : 'disabled'}`}
            onClick={() => canConfirm && onConfirm(activeDb, activeTable)}
            disabled={!canConfirm}
          >
            确 定
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePickerModal;

