import React, { useState } from 'react';
import './CreateConnectorModal.css';

interface CreateConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CreateConnectorModal: React.FC<CreateConnectorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'database',
    dbEngine: 'matrixone',
    purposes: ['load'] as string[],
    host: '',
    port: '',
    username: '',
    password: '',
    databaseName: '',
    jdbcUrl: '',
    hiveAuthMode: 'ldap',
    kerberosPrincipal: '',
    keytabFile: null as File | null,
    krb5File: null as File | null,
  });
  const [showPassword, setShowPassword] = useState(false);

  const connectorTypes = [
    { id: 'object-storage', label: '对象存储' },
    { id: 'distributed-fs', label: '分布式文件系统' },
    { id: 'database', label: '数据库' },
    { id: 'knowledge-base', label: '知识库' },
  ];

  const databaseEngines = [
    { id: 'matrixone', label: 'MatrixOne' },
    { id: 'mysql', label: 'MySQL' },
    { id: 'hive', label: 'Hive' },
  ] as const;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePurposeChange = (purpose: string) => {
    setFormData((prev) => {
      const purposes = prev.purposes.includes(purpose)
        ? prev.purposes.filter((p) => p !== purpose)
        : [...prev.purposes, purpose];
      return { ...prev, purposes };
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const isDatabase = formData.type === 'database';
  const isHive = isDatabase && formData.dbEngine === 'hive';

  const hostPlaceholder = (() => {
    if (!isDatabase) return '请输入主机地址（如：192.168.1.100）';
    if (formData.dbEngine === 'mysql') return '请输入 MySQL 主机地址（如：192.168.1.100）';
    if (formData.dbEngine === 'hive') return '请输入 HiveServer2 主机地址（如：192.168.1.100）';
    return '请输入 MatrixOne 主机地址（如：192.168.1.100）';
  })();

  const portPlaceholder = (() => {
    if (!isDatabase) return '请输入端口号';
    if (formData.dbEngine === 'mysql') return '请输入端口号（默认：3306）';
    if (formData.dbEngine === 'hive') return '请输入端口号（默认：10000）';
    return '请输入端口号（默认：6001）';
  })();

  const hiveJdbcPlaceholder =
    '请输入 JDBC URL（如：jdbc:hive2://192.168.1.100:10000/default）';

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">创建连接器</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="form">
            {/* 连接器名称 */}
            <div className="form-row">
              <div className="form-label">
                <span className="required">*</span>连接器名称:
              </div>
              <div className="form-control">
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input form-input--name"
                    placeholder="请输入连接器名称"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    maxLength={100}
                  />
                  <span className="char-count">{formData.name.length} / 100</span>
                </div>
              </div>
            </div>

            {/* 类型 */}
            <div className="form-row form-row--top">
              <div className="form-label">类型:</div>
              <div className="form-control">
                <div className="type-tabs-wrap">
                  {connectorTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className={`type-tab ${formData.type === type.id ? 'active' : ''}`}
                      onClick={() => handleInputChange('type', type.id)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
                <div className="type-card-row">
                  {formData.type === 'database' ? (
                    <div className="type-cards">
                      {databaseEngines.map((engine) => (
                        <button
                          key={engine.id}
                          type="button"
                          className={`type-card ${formData.dbEngine === engine.id ? 'active' : ''}`}
                          onClick={() => handleInputChange('dbEngine', engine.id)}
                        >
                          <span className="type-card-brand">{engine.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="type-card-placeholder">请选择类型</div>
                  )}
                </div>
              </div>
            </div>

            {/* 用途 */}
            <div className="form-row">
              <div className="form-label">用途:</div>
              <div className="form-control">
                <div className="purpose-checkboxes">
                  <label className={`checkbox-label ${!formData.purposes.includes('load') ? 'muted' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.purposes.includes('load')}
                      onChange={() => handlePurposeChange('load')}
                    />
                    <span>载入</span>
                  </label>
                  <label className="checkbox-label checkbox-label--disabled" title="仅支持载入">
                    <input
                      type="checkbox"
                      checked={false}
                      disabled
                      readOnly
                    />
                    <span>导出</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 连接信息 */}
            <div className="form-row form-row--top">
              <div className="form-label">连接信息:</div>
              <div className="form-control">
                <div className="connection-panel">
                  {isHive ? (
                    <>
                      <div className="panel-row">
                        <div className="panel-label">
                          <span className="required">*</span>JDBC URL
                          <span className="help">?</span>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={hiveJdbcPlaceholder}
                          value={formData.jdbcUrl}
                          onChange={(e) => handleInputChange('jdbcUrl', e.target.value)}
                        />
                      </div>
                      <div className="panel-row">
                        <div className="panel-label">
                          认证方式
                          <span className="help">?</span>
                        </div>
                        <div className="type-tabs-wrap">
                          <button
                            type="button"
                            className={`type-tab ${formData.hiveAuthMode === 'ldap' ? 'active' : ''}`}
                            onClick={() => handleInputChange('hiveAuthMode', 'ldap')}
                          >
                            LDAP
                          </button>
                          <button
                            type="button"
                            className={`type-tab ${formData.hiveAuthMode === 'kerberos' ? 'active' : ''}`}
                            onClick={() => handleInputChange('hiveAuthMode', 'kerberos')}
                          >
                            Kerberos
                          </button>
                        </div>
                      </div>
                      {formData.hiveAuthMode === 'kerberos' && (
                        <>
                          <div className="panel-row">
                            <div className="panel-label">
                              <span className="required">*</span>Kerberos Principal
                              <span className="help">?</span>
                            </div>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="user@REALM.COM 或 service/host@REALM.COM"
                              value={formData.kerberosPrincipal}
                              onChange={(e) => handleInputChange('kerberosPrincipal', e.target.value)}
                            />
                          </div>
                          <div className="panel-row">
                            <div className="panel-label">
                              <span className="required">*</span>Keytab 文件
                              <span className="help">?</span>
                            </div>
                            <label className="file-upload-btn">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 3v8M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                              <span>{formData.keytabFile ? formData.keytabFile.name : '添加 Keytab 文件'}</span>
                              <input
                                type="file"
                                accept=".keytab"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setFormData((prev) => ({ ...prev, keytabFile: file }));
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <div className="panel-row">
                            <div className="panel-label">
                              <span className="required">*</span>Krb5 配置文件
                              <span className="help">?</span>
                            </div>
                            <label className="file-upload-btn">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 3v8M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                              <span>{formData.krb5File ? formData.krb5File.name : '添加 Krb5 文件'}</span>
                              <input
                                type="file"
                                accept=".conf"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setFormData((prev) => ({ ...prev, krb5File: file }));
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="panel-row">
                        <div className="panel-label">
                          <span className="required">*</span>主机
                          <span className="help">?</span>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={hostPlaceholder}
                          value={formData.host}
                          onChange={(e) => handleInputChange('host', e.target.value)}
                        />
                      </div>

                      <div className="panel-row">
                        <div className="panel-label">
                          <span className="required">*</span>端口
                          <span className="help">?</span>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={portPlaceholder}
                          value={formData.port}
                          onChange={(e) => handleInputChange('port', e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {!(isHive && formData.hiveAuthMode === 'kerberos') && (
                    <>
                      <div className="panel-row">
                        <div className="panel-label">
                          <span className="required">*</span>用户名
                          <span className="help">?</span>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={isHive ? '请输入 Hive 用户名' : formData.dbEngine === 'mysql' ? '请输入 MySQL 用户名' : '请输入用户名'}
                          value={formData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                        />
                      </div>

                      <div className="panel-row">
                        <div className="panel-label">
                          <span className="required">*</span>密码
                          <span className="help">?</span>
                        </div>
                        <div className="password-input-wrapper">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            placeholder={isHive ? '请输入 Hive 密码' : '请输入密码'}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? '隐藏密码' : '显示密码'}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 3C4 3 1.5 5.5 1 8c.5 2.5 3 5 7 5s6.5-2.5 7-5c-.5-2.5-3-5-7-5z" stroke="currentColor" strokeWidth="1.2"/>
                              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
                              {!showPassword && (
                                <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              )}
                            </svg>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" type="button" onClick={() => {}}>
            连接测试
          </button>
          <div className="footer-right">
            <button className="btn-secondary" type="button" onClick={onClose}>
              取消
            </button>
            <button className="btn-primary" type="button" onClick={handleSubmit}>
              创建
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateConnectorModal;
