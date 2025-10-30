import React, { useEffect, useState } from 'react';
import axios from 'axios';

const getApiClient = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: 'https://zerodha-clone-pa1.onrender.com', 
    headers: {
      Authorization: `Bearer ${token}` 
    }
  });
};


const Dashboard = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const api = getApiClient();
        const response = await api.get('/allholdings'); 
        setHoldings(response.data);
      } catch (err) {
        setError('Failed to fetch holdings. Maybe your token expired?');
       
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>My Dashboard</h1>
      <h2>Holdings</h2>
      <ul>
        {holdings.map(holding => (
          <li key={holding._id}>{holding.name} ({holding.qty})</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;