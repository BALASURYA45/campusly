import React, { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

const Notification = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const socket = React.useRef(null);

  useEffect(() => {
    if (!socket.current && user) {
      socket.current = io('http://localhost:5000');

      socket.current.on('connect', () => {
        console.log('Connected to notification server');
        if (user && user.id) {
          socket.current.emit('join', user.id || user.user?.id);
        }
      });

      socket.current.on('notification', (data) => {
        setNotifications((prev) => [...prev, data]);
        setCurrentNotification(data);
        setOpen(true);
      });

      socket.current.on('pushNotification', (data) => {
        setCurrentNotification(data);
        setOpen(true);
      });

      socket.current.on('broadcast', (data) => {
        setCurrentNotification(data);
        setOpen(true);
      });

      socket.current.on('attendanceMarked', (data) => {
        setCurrentNotification({
          title: 'Attendance Marked',
          message: `Attendance marked for student ${data.student}`,
          type: 'attendance',
        });
        setOpen(true);
      });
    }

    return () => {
      if (socket.current) {
        socket.current.off('notification');
        socket.current.off('pushNotification');
        socket.current.off('broadcast');
        socket.current.off('attendanceMarked');
      }
    };
  }, [user]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const getSeverity = (type) => {
    switch (type) {
      case 'error':
      case 'alert':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={currentNotification ? getSeverity(currentNotification.type) : 'info'}
        sx={{ width: '100%' }}
      >
        {currentNotification ? currentNotification.message || currentNotification.title : 'Notification'}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
