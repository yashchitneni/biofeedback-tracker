import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';
import { Paper, Typography, Grid, CircularProgress, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { config } from '../app/config';
import { Tabs, Tab } from '@mui/material';

interface BiofeedbackEntry {
  id: number;
  date: string;
  time: string;
  metrics: {
    [key: string]: {
      score: number;
      notes: string;
    };
  };
  additional_notes: string[];
  summary: string;
}

const BiofeedbackChart: React.FC = () => {
  const [data, setData] = useState<BiofeedbackEntry[]>([]);
  const [latestEntry, setLatestEntry] = useState<BiofeedbackEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BiofeedbackEntry | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get<BiofeedbackEntry[]>('http://localhost:8000/biofeedback');
      console.log('API Response:', response.data);
      setData(response.data);
      if (response.data.length > 0) {
        setLatestEntry(response.data[response.data.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch biofeedback data.');
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    if (latestEntry) {
      return Object.keys(latestEntry.metrics);
    }
    return [];
  };

  const metrics = getMetrics();

  const chartData = data.map(entry => ({
    ...entry,
    ...Object.fromEntries(
      Object.entries(entry.metrics).map(([key, value]) => [key, value.score])
    )
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleMetricClick = (entry: BiofeedbackEntry, metric: string) => {
    console.log("Metric clicked:", entry, metric);
    setSelectedEntry(entry);
    setSelectedMetric(metric);
    setOpenModal(true);
  };

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
            stroke={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
            name={formatMetricName(metric)}
            connectNulls={true}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={latestEntry ? [latestEntry] : []}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 5]} />
        <Tooltip />
        <Legend />
        {metrics.map((metric, index) => (
          <Bar
            key={metric}
            dataKey={`metrics.${metric}.score`}
            fill={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
            name={formatMetricName(metric)}
            onClick={() => latestEntry && handleMetricClick(latestEntry, metric)}
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
            <Typography variant="h4">
              {latestEntry?.metrics[metric]?.score !== undefined 
                ? latestEntry.metrics[metric].score.toFixed(2)
                : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatMetricName = (metric: string) => {
    return metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEntry(null);
    setSelectedMetric(null);
  };

  const renderModal = () => (
    <Dialog open={openModal} onClose={handleCloseModal}>
      <DialogTitle>Notes for {selectedEntry?.date}</DialogTitle>
      <DialogContent>
        {selectedEntry && selectedMetric && selectedEntry.metrics[selectedMetric]?.notes && (
          <>
            <Typography variant="body1" style={{ marginTop: '16px', fontWeight: 'bold' }}>
              Notes for {formatMetricName(selectedMetric)}:
            </Typography>
            <Typography variant="body2" paragraph>
              {selectedEntry.metrics[selectedMetric].notes}
            </Typography>
          </>
        )}
        {selectedEntry?.additional_notes && selectedEntry.additional_notes.length > 0 && (
          <>
            <Typography variant="body1" style={{ marginTop: '16px', fontWeight: 'bold' }}>
              Additional Notes:
            </Typography>
            {selectedEntry.additional_notes.map((note, index) => (
              <Typography key={index} variant="body2" paragraph>
                {note}
              </Typography>
            ))}
          </>
        )}
        {(!selectedEntry?.additional_notes || selectedEntry.additional_notes.length === 0) &&
         (!selectedEntry?.metrics[selectedMetric as string]?.notes) && (
          <Typography variant="body1">No notes available for this entry.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
        {loading ? (
          <CircularProgress style={{ margin: '20px auto', display: 'block' }} />
        ) : (
          <>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Trending" />
              <Tab label="Latest" />
              <Tab label="Summary" />
            </Tabs>

            {tabValue === 0 && <div>{renderLineChart()}</div>}
            {tabValue === 1 && <div>{renderBarChart()}</div>}
            {tabValue === 2 && <div>{renderSummary()}</div>}
          </>
        )}
        {renderModal()}
      </Paper>
    </LocalizationProvider>
  );
};

export default BiofeedbackChart;