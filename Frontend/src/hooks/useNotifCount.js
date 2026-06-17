import { useState, useEffect } from 'react';
import API from '../api';

export function useNotifCount() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const res = await API.get('/user/notifications');
      if (res.data.success) {
        setCount(res.data.data.filter(n => n.read_status === 0).length);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return { count, refresh: fetchCount };
}