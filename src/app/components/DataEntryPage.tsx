import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import axios from 'axios';

const DataEntryPage: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/biofeedback', JSON.parse(jsonInput));
      setMessage('Data submitted successfully!');
      setJsonInput('');
    } catch (error) {
      console.error('Error submitting data:', error);
      setMessage('Error submitting data. Please check your input and try again.');
    }
  };

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password === 'tLiktbti07!') {  // Replace with a secure password
      setIsAuthenticated(true);
    } else {
      setMessage('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
        <Typography variant="h4" gutterBottom>Authentication Required</Typography>
        <form onSubmit={handlePasswordSubmit}>
          <TextField
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary">
            Authenticate
          </Button>
        </form>
        {message && (
          <Box mt={2}>
            <Typography color="error">{message}</Typography>
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Paper elevation={3} style={{ padding: '20px', margin: '20px' }}>
      <Typography variant="h4" gutterBottom>Data Entry</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={10}
          variant="outlined"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste your JSON data here"
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Submit Data
        </Button>
      </form>
      {message && (
        <Box mt={2}>
          <Typography color={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default DataEntryPage;