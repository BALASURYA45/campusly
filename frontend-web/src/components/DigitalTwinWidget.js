import React from 'react';
import { 
  Box, Card, CardContent, Typography, Stack, Avatar, 
  Chip, CircularProgress, Tooltip, IconButton 
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

const DigitalTwinWidget = ({ data, type = 'student' }) => {
  if (!data) return null;

  const isStudent = type === 'student';
  const isTeacher = type === 'teacher';
  const isClass = type === 'class';

  let score, label, detailLabel, detailValue, icon;

  if (isStudent) {
    score = data.twin?.engagementScore || 0;
    label = 'Engagement';
    detailLabel = 'Predicted Performance';
    detailValue = data.twin?.predictedPerformance || 'Average';
    icon = <TrendingUpIcon />;
  } else if (isTeacher) {
    score = data.twin?.gradingEfficiency || 0;
    label = 'Grading Eff.';
    detailLabel = 'Content Richness';
    detailValue = `${data.twin?.contentRichness || 0}%`;
    icon = <PsychologyIcon />;
  } else {
    score = data.twin?.currentAttendanceRate || 0;
    label = 'Attendance';
    detailLabel = 'Resource Usage';
    detailValue = `${data.twin?.resourceUsage || 0}%`;
    icon = <HealthAndSafetyIcon />;
  }

  const getScoreColor = (s) => {
    if (s >= 80) return '#01b574';
    if (s >= 50) return '#ffb547';
    return '#ee5d50';
  };

  return (
    <Card sx={{ 
      borderRadius: 6, 
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      overflow: 'visible',
      position: 'relative'
    }}>
      <Box sx={{ 
        position: 'absolute', 
        top: -15, 
        right: 20, 
        bgcolor: 'primary.main', 
        color: 'white', 
        px: 2, py: 0.5, 
        borderRadius: 2,
        fontSize: '0.75rem',
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(0,98,255,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5
      }}>
        <PsychologyIcon sx={{ fontSize: 14 }} />
        DIGITAL TWIN ACTIVE
      </Box>

      <CardContent sx={{ pt: 3 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          {/* Main Score Circular Progress */}
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={score}
              size={100}
              thickness={6}
              sx={{ color: getScoreColor(score) }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h5" component="div" fontWeight={800}>
                {score}%
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {label}
              </Typography>
            </Box>
          </Box>

          {/* Details */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                  {isStudent ? 'Predicted Performance' : 'Resource Usage'}
                </Typography>
                <Chip 
                  label={isStudent ? data.twin?.predictedPerformance : `${data.twin?.resourceUsage}%`} 
                  size="small"
                  sx={{ 
                    bgcolor: isStudent ? `${getScoreColor(score)}15` : 'primary.light', 
                    color: isStudent ? getScoreColor(score) : 'primary.main',
                    fontWeight: 700,
                    borderRadius: 2
                  }}
                  icon={isStudent ? <TrendingUpIcon /> : <HealthAndSafetyIcon />}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                  Digital Health Status
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ 
                    width: 12, height: 12, 
                    borderRadius: '50%', 
                    bgcolor: getScoreColor(score),
                    boxShadow: `0 0 8px ${getScoreColor(score)}`
                  }} />
                  <Typography variant="body2" fontWeight={600}>
                    {score >= 80 ? 'Optimal' : (score >= 50 ? 'Stable' : 'Needs Attention')}
                  </Typography>
                  <Tooltip title="This score represents the real-time digital representation of your academic and attendance data.">
                    <IconButton size="small">
                      <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Stack>

        {isStudent && data.twin?.lastSync && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}>
            Last synced: {new Date(data.twin.lastSync).toLocaleString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DigitalTwinWidget;
