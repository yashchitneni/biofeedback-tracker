import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BiofeedbackChart from '../components/BiofeedbackChart';
import DataEntryPage from './components/DataEntryPage';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/data-entry">Data Entry</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<BiofeedbackChart />} />
          <Route path="/data-entry" element={<DataEntryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;