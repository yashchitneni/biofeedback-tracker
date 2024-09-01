import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

interface BiofeedbackEntry {
  date: string;
  metrics: {
    [key: string]: {
      score: number;
      notes: string;
    };
  };
  additional_notes: string[];
  summary: string;
}

const BiofeedbackDashboard: React.FC = () => {
  const [data, setData] = useState<BiofeedbackEntry[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const response = await axios.get<BiofeedbackEntry[]>('http://localhost:8000/biofeedback', {
        params: { start_date: dateRange.start, end_date: dateRange.end }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const metrics = data.length > 0 ? Object.keys(data[0].metrics) : [];

  return (
    <div className="dashboard">
      <div className="chart-container">
        <LineChart width={800} height={400} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {selectedMetric ? (
            <Line 
              type="monotone" 
              dataKey={`metrics.${selectedMetric}.score`} 
              stroke="#8884d8" 
              name={selectedMetric}
            />
          ) : (
            metrics.map((metric, index) => (
              <Line 
                key={metric} 
                type="monotone" 
                dataKey={`metrics.${metric}.score`} 
                stroke={`#${Math.floor(Math.random()*16777215).toString(16)}`} 
                name={metric}
              />
            ))
          )}
        </LineChart>
      </div>
      <div className="sidebar">
        <h3>Metrics</h3>
        {metrics.map(metric => (
          <button key={metric} onClick={() => setSelectedMetric(metric)}>
            {metric}
          </button>
        ))}
        <button onClick={() => setSelectedMetric(null)}>Show All</button>
      </div>
      {selectedMetric && (
        <div className="metric-details">
          <h3>{selectedMetric} Details</h3>
          {data.map(entry => (
            <div key={entry.date}>
              <p><strong>{entry.date}</strong>: {entry.metrics[selectedMetric].score}</p>
              <p>{entry.metrics[selectedMetric].notes}</p>
            </div>
          ))}
        </div>
      )}
      <div className="date-range">
        <input 
          type="date" 
          value={dateRange.start} 
          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
        />
        <input 
          type="date" 
          value={dateRange.end} 
          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
        />
      </div>
    </div>
  );
};

export default BiofeedbackDashboard;