# Module 11 - Notifications System Documentation

## Overview
The Smart Curriculum Application now includes a comprehensive notifications system with email, push, and in-app notification support. This document details the implementation and usage of the notification system.

## Features Implemented

### 1. In-App Notifications
- Real-time alerts via Socket.io
- Notification history and management
- Unread notification tracking
- Notification preferences management

### 2. Email Notifications
- HTML formatted emails
- Automatic sending based on user preferences
- Email delivery tracking

### 3. Push Notifications
- Web push notifications
- Real-time delivery via Socket.io
- Browser notification API support

### 4. Notification Center
- View all notifications with filtering
- Mark as read/unread
- Delete notifications
- Set notification preferences

## Backend Implementation

### Database Model: Notification

```javascript
{
  recipient: ObjectId,
  title: String,
  message: String,
  type: 'attendance|assignment|activity|message|system|alert',
  relatedModel: 'Attendance|Assignment|Activity|Class|Subject',
  relatedId: ObjectId,
  isRead: Boolean,
  readAt: Date,
  sender: ObjectId,
  notificationMethods: {
    inApp: Boolean,
    email: Boolean,
    push: Boolean
  },
  emailSent: Boolean,
  emailSentAt: Date,
  pushSent: Boolean,
  pushSentAt: Date,
  priority: 'low|medium|high',
  actionUrl: String,
  createdAt: Date,
  expiresAt: Date (auto-expires after 30 days)
}
```

### User Model Enhancement
Added `notificationPreferences` to User model:
```javascript
notificationPreferences: {
  email: Boolean (default: true),
  push: Boolean (default: true),
  inApp: Boolean (default: true)
}
```

## API Endpoints

### Get Notifications
**GET** `/api/v1/notifications`

Query Parameters:
- `isRead` (optional): 'true' or 'false'
- `type` (optional): notification type
- `limit` (default: 20): number of results
- `page` (default: 1): page number

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "pages": 3,
    "currentPage": 1
  }
}
```

### Get Unread Count
**GET** `/api/v1/notifications/count/unread`

Response:
```json
{
  "success": true,
  "data": { "unreadCount": 5 }
}
```

### Mark as Read
**PUT** `/api/v1/notifications/:id/read`

### Mark All as Read
**PUT** `/api/v1/notifications/mark-all-read`

### Delete Notification
**DELETE** `/api/v1/notifications/:id`

### Clear All Notifications
**DELETE** `/api/v1/notifications`

### Send Notification
**POST** `/api/v1/notifications/send`
(Requires: admin or teacher role)

Request Body:
```json
{
  "recipientIds": ["userId1", "userId2"],
  "title": "Notification Title",
  "message": "Notification Message",
  "type": "system",
  "priority": "medium",
  "notificationMethods": {
    "inApp": true,
    "email": false,
    "push": false
  }
}
```

### Broadcast Notification
**POST** `/api/v1/notifications/broadcast`
(Requires: admin role)

Request Body:
```json
{
  "title": "Broadcast Title",
  "message": "Broadcast Message",
  "type": "system",
  "notificationMethods": {
    "inApp": true,
    "email": false,
    "push": false
  }
}
```

### Get Notification Preferences
**GET** `/api/v1/notifications/preferences`

### Update Notification Preferences
**PUT** `/api/v1/notifications/preferences`

Request Body:
```json
{
  "email": true,
  "push": true,
  "inApp": true
}
```

## Frontend Components

### NotificationBell Component
Displays unread notification count in the header.
- Shows badge with unread count
- Dropdown menu with recent notifications
- Link to notification center

Location: `frontend-web/src/components/NotificationBell.js`

### NotificationCenter Page
Full notification management interface.
- Filter notifications (all/read/unread)
- Mark as read/delete notifications
- Manage preferences
- View notification details

Location: `frontend-web/src/pages/NotificationCenter.js`

### Notification Component (Enhanced)
Real-time notification alerts using Socket.io.
- Snackbar notifications
- Auto-close after 6 seconds
- Severity level based on type
- Real-time updates

Location: `frontend-web/src/components/Notification.js`

## Notification Service (Backend)

Location: `backend/src/utils/notificationService.js`

### Helper Functions

#### sendNotification(options)
Generic function to send notifications.

Example:
```javascript
const notificationService = require('./utils/notificationService');

await notificationService.sendNotification({
  recipients: ['userId1', 'userId2'],
  title: 'New Assignment',
  message: 'A new assignment has been created',
  type: 'assignment',
  sender: teacherId,
  relatedModel: 'Assignment',
  relatedId: assignmentId,
  priority: 'high',
  methods: { inApp: true, email: true, push: false }
});
```

#### notifyAttendanceMarked(classId, studentIds, date, teacherId)
Notify students when attendance is marked.

#### notifyAssignmentCreated(assignmentId, classId, teacherId, title, dueDate)
Notify students when a new assignment is created.

#### notifyAssignmentSubmitted(assignmentId, studentId, studentName, teacherId)
Notify teacher when an assignment is submitted.

#### notifyActivityCreated(activityId, participantIds, title, teacherId)
Notify participants when they're added to an activity.

#### notifySystemAlert(recipients, title, message, priority)
Send system-wide alerts.

## Integration Points

### Attendance System
When attendance is marked:
- Automatic notification sent to student
- Notification type: 'attendance'
- Methods: In-app only

### Assignment System
When assignment is created:
- Automatic notification sent to all students in class
- Notification type: 'assignment'
- Methods: In-app + Email

When assignment is submitted:
- Automatic notification sent to teacher
- Notification type: 'assignment'
- Methods: In-app + Email

### Admin Panel
Admins can:
- Send notifications to specific users
- Broadcast notifications to all users
- Select notification methods (email, push, in-app)
- Set priority level
- Choose notification type

## Socket.io Events

### Client-Server Events

#### Client joins user room
```javascript
socket.emit('join', userId);
```

### Server broadcasts

#### Individual notification
```javascript
socket.to(`user_${userId}`).emit('notification', {
  id: notificationId,
  title: 'Title',
  message: 'Message',
  type: 'type',
  priority: 'priority'
});
```

#### Broadcast notification
```javascript
socket.emit('broadcast', {
  title: 'Title',
  message: 'Message',
  type: 'type'
});
```

#### Attendance marked
```javascript
socket.emit('attendanceMarked', {
  student: studentId,
  status: 'status',
  date: date
});
```

## User Preferences

Users can manage notification preferences through:
1. Notification Center page
2. User Profile (future enhancement)
3. Notification Bell dropdown menu

Preferences control:
- Email notifications: On/Off
- Push notifications: On/Off
- In-app notifications: On/Off

## Configuration

### Environment Variables
Add to `.env` file:
```
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
FROM_NAME=Smart Curriculum
FROM_EMAIL=noreply@smartcurriculum.com
FRONTEND_URL=http://localhost:3000
```

## Best Practices

1. **Use appropriate notification types**: Choose the right type (attendance, assignment, activity, etc.)
2. **Set priority correctly**: 
   - High: System alerts, urgent updates
   - Medium: Regular assignments, class updates
   - Low: General announcements
3. **Choose notification methods wisely**:
   - Email: For important events
   - Push: For urgent updates
   - In-app: All events
4. **Respect user preferences**: Always check user preferences before sending
5. **Provide action URLs**: Include actionUrl for actionable notifications

## Testing the Notification System

### Manual Testing

1. **In-app Notifications**:
   - Create an assignment
   - Verify notification appears in real-time
   - Check notification count in bell icon

2. **Email Notifications**:
   - Send broadcast notification with email enabled
   - Check email inbox (use test email provider like Mailtrap)

3. **Notification Center**:
   - Navigate to /notifications
   - Verify filtering works (read/unread)
   - Test marking as read/delete
   - Verify preference settings

### Testing with API

```bash
# Send notification
curl -X POST http://localhost:5000/api/v1/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "recipientIds": ["userId"],
    "title": "Test Notification",
    "message": "This is a test",
    "type": "system"
  }'

# Get notifications
curl http://localhost:5000/api/v1/notifications \
  -H "Authorization: Bearer your-token"

# Get unread count
curl http://localhost:5000/api/v1/notifications/count/unread \
  -H "Authorization: Bearer your-token"
```

## Troubleshooting

### Notifications not appearing
1. Check Socket.io connection in browser console
2. Verify user is logged in
3. Check notification preferences
4. Verify recipient user exists

### Emails not sending
1. Check EMAIL_* environment variables
2. Verify email credentials
3. Check email provider (Mailtrap/Gmail/etc.)
4. Review backend logs for errors

### Push notifications not working
1. Check browser notifications permission
2. Verify Socket.io connection
3. Ensure user joined room (emit 'join' event)

## Future Enhancements

1. SMS notifications integration
2. Notification templates
3. Scheduled notifications
4. Notification scheduling (send at specific time)
5. Notification categories/tags
6. Notification analytics and tracking
7. Deep linking in mobile notifications
8. Notification webhooks for third-party integration

## Module Status

✅ **MODULE 11 - NOTIFICATIONS: COMPLETE**

- ✅ Email Notifications
- ✅ Push Notifications (via Socket.io)
- ✅ In-app Alerts
- ✅ Notification Center UI
- ✅ Notification Bell Component
- ✅ Admin Broadcasting
- ✅ User Preferences
- ✅ Integration with Attendance System
- ✅ Integration with Assignment System
- ✅ Real-time Updates via Socket.io
