import React, { useEffect, useState } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box, Divider, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await API.get('/notifications/count/unread');
      setUnreadCount(data.data.unreadCount);

      const { data: notifRes } = await API.get('/notifications?limit=5&isRead=false');
      setRecentNotifications(notifRes.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewAll = () => {
    navigate('/notifications');
    handleClose();
  };

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: '400px',
              width: '350px',
            },
          },
        }}
      >
        {recentNotifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          <>
            {recentNotifications.map((notif) => (
              <MenuItem
                key={notif._id}
                onClick={handleClose}
                sx={{
                  display: 'block',
                  padding: '12px',
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {notif.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {notif.message}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(notif.createdAt).toLocaleString()}
                </Typography>
              </MenuItem>
            ))}
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleViewAll}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
