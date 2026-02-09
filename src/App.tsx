import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GlobalColumnSemanticsProvider } from './contexts/GlobalColumnSemanticsContext';
import Layout from './components/Layout';
import ConnectorList from './components/ConnectorList';
import DataLoadList from './components/DataLoadList';
import DataLoadDetail from './components/DataLoadDetail';
import DataLoadCreate from './components/DataLoadCreate';
import DataExportList from './components/DataExportList';
import DataExploration from './components/DataExploration';
import DataCenter from './components/DataCenter';
import CreateKnowledgeBase from './components/CreateKnowledgeBase';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <BrowserRouter>
        <GlobalColumnSemanticsProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/connectors" replace />} />
            <Route path="connectors" element={<ConnectorList />} />
            <Route path="data-load" element={<DataLoadList />} />
            <Route path="data-load/new" element={<DataLoadCreate />} />
            <Route path="data-load/:id" element={<DataLoadDetail />} />
            <Route path="data-export" element={<DataExportList />} />
            <Route path="data-center" element={<DataCenter />} />
            <Route path="data-exploration" element={<DataExploration />} />
            <Route path="create-knowledge-base" element={<CreateKnowledgeBase />} />
          </Route>
          <Route path="*" element={<Navigate to="/connectors" replace />} />
        </Routes>
        </GlobalColumnSemanticsProvider>
      </BrowserRouter>
    </div>
  );
};

export default App;
