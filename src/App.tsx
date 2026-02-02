import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ConnectorList from './components/ConnectorList';
import DataLoadList from './components/DataLoadList';
import DataLoadDetail from './components/DataLoadDetail';
import DataLoadCreate from './components/DataLoadCreate';
import DataExportList from './components/DataExportList';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/connectors" replace />} />
            <Route path="connectors" element={<ConnectorList />} />
            <Route path="data-load" element={<DataLoadList />} />
            <Route path="data-load/new" element={<DataLoadCreate />} />
            <Route path="data-load/:id" element={<DataLoadDetail />} />
            <Route path="data-export" element={<DataExportList />} />
          </Route>
          <Route path="*" element={<Navigate to="/connectors" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
