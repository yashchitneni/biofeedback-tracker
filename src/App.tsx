import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DataEntryPage from './components/DataEntryPage';
import BiofeedbackChart from './components/BiofeedbackChart';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BiofeedbackChart />} />
        <Route path="/data-entry" element={<DataEntryPage />} />
      </Routes>
    </Router>
  );
}

export default App;