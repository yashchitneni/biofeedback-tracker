import React, { useState } from 'react';
import axios from 'axios';

const DataInput: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8000/biofeedback', JSON.parse(jsonInput));
      setMessage('Data submitted successfully!');
      setJsonInput('');
    } catch (error) {
      setMessage('Error submitting data. Please check your JSON format.');
    }
  };

  return (
    <div className="data-input">
      <h2>Input Biofeedback Data</h2>
      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Paste your JSON here"
        rows={10}
        cols={50}
      />
      <button onClick={handleSubmit}>Submit</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default DataInput;