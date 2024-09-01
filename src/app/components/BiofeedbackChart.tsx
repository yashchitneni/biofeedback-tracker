import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';
import { TextField, Button, Paper, Typography, Grid, CircularProgress, Tabs, Tab, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface BiofeedbackEntry {
  id: number;
  date: string;
  time: string;
  mood: number;
  gym_performance: number;
  soreness: number;
  sleep_quality: number;
  energy_levels: number;
  sex_drive: number;
  hunger_levels: number;
  cravings: number;
  digestion: number;
  additional_notes: string[];
  summary: string;
  metrics: {
    [key: string]: number;
  };
  [key: string]: number | string | string[] | { [key: string]: number };
}

const BiofeedbackChart: React.FC = () => {
  const [data, setData] = useState<BiofeedbackEntry[]>([]);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get<BiofeedbackEntry[]>('http://localhost:8000/biofeedback');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch biofeedback data.');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonSubmit = async () => {
    setLoading(true);
    try {
      const parsedJson = JSON.parse(jsonInput);
      const response = await axios.post('http://localhost:8000/biofeedback', parsedJson);
      if (response.status === 200) {
        setJsonInput('');
        setError(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      setError('Failed to submit biofeedback data.');
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (data.length > 0) {
      return Object.keys(data[0]).filter(key => 
        typeof data[0][key] === 'number' && !['id'].includes(key)
      );
    }
    return [];
  };

  const formatMetricName = (metric: string): string => {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const metrics = getMetrics();

  const chartData = data.map(entry => ({
    ...entry,
    ...Object.fromEntries(
      metrics.map(metric => [metric, Number(entry[metric as keyof BiofeedbackEntry]) || 0])
    )
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const latestEntry = chartData[chartData.length - 1];

  const colorScale = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
  ];

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 5]} />
        <Tooltip />
        <Legend />
        {metrics.map((metric, index) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={colorScale[index % colorScale.length]}
            name={formatMetricName(metric)}
            connectNulls={true}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={[latestEntry]}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 5]} />
        <Tooltip />
        <Legend />
        {metrics.map((metric, index) => (
          <Bar
            key={metric}
            dataKey={metric}
            fill={colorScale[index % colorScale.length]}
            name={formatMetricName(metric)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderSummary = () => (
    <Grid container spacing={2}>
      {metrics.map((metric) => (
        <Grid item xs={6} sm={4} md={3} key={metric}>
          <Paper elevation={2} style={{ padding: '10px', textAlign: 'center' }}>
            <Typography variant="h6">{formatMetricName(metric)}</Typography>
            <Typography variant="h4">{latestEntry[metric as keyof BiofeedbackEntry] as number}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
        <Typography variant="h4" gutterBottom>Biofeedback Tracker</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your JSON here"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleJsonSubmit}
              disabled={loading}
              style={{ marginTop: '10px' }}
            >
              Submit New Entry
            </Button>
          </Grid>
        </Grid>
        {error && <Typography color="error" style={{ marginTop: '10px' }}>{error}</Typography>}
        {loading ? (
          <CircularProgress style={{ margin: '20px auto', display: 'block' }} />
        ) : chartData.length > 0 ? (
          <Box sx={{ width: '100%', typography: 'body1' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} aria-label="biofeedback tabs">
                <Tab label="Trend Chart" />
                <Tab label="Latest Entry" />
                <Tab label="Summary" />
              </Tabs>
            </Box>
            <Box sx={{ padding: 2 }}>
              {tabValue === 0 && renderLineChart()}
              {tabValue === 1 && renderBarChart()}
              {tabValue === 2 && renderSummary()}
            </Box>
          </Box>
        ) : (
          <Typography style={{ marginTop: '20px' }}>No data available. Please submit some biofeedback data.</Typography>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default BiofeedbackChart;