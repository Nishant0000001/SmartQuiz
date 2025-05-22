import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, CircularProgress, Table, TableHead,
  TableRow, TableCell, TableBody
} from '@mui/material';

const ViewScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/scores')
      .then(res => res.json())
      .then(data => {
        setScores(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching scores:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>User Scores</Typography>
        {scores.length === 0 ? (
          <Typography>No scores available.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Date Taken</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.score}</TableCell>
                  <TableCell>{new Date(row.date_taken).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ViewScores;
