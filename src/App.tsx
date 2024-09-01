import React, { useState } from 'react';
import DataInput from './app/components/DataInput';
import BiofeedbackDashboard from './app/components/BiofeedbackDashboard';

function App() {
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="App">
      <header>
        <h1>Yash's Biofeedback Tracker</h1>
        <button onClick={() => setShowInput(!showInput)}>
          {showInput ? 'View Dashboard' : 'Input Data'}
        </button>
      </header>
      {showInput ? <DataInput /> : <BiofeedbackDashboard />}
    </div>
  );
}

export default App;