import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <Table>
    <TableHead>
      <TableRow>
        {Array.from({ length: columns }).map((_, idx) => (
          <TableCell key={idx}>
            <Skeleton variant="text" width="100%" />
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <TableCell key={colIdx}>
              <Skeleton variant="text" width="100%" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export const CardSkeleton = ({ count = 3 }) => (
  <Grid container spacing={2}>
    {Array.from({ length: count }).map((_, idx) => (
      <Grid item xs={12} sm={6} md={4} key={idx}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={24} />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export const DashboardSkeleton = () => (
  <Box>
    <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3 }} />
    <Grid container spacing={2}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <Grid item xs={12} md={3} key={idx}>
          <Skeleton variant="rectangular" width="100%" height={120} />
        </Grid>
      ))}
    </Grid>
  </Box>
);

export const FormSkeleton = () => (
  <Box>
    <Skeleton variant="text" width="100%" height={32} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={56} />
  </Box>
);

export const ListSkeleton = ({ items = 6 }) => (
  <Box>
    {Array.from({ length: items }).map((_, idx) => (
      <Box key={idx} sx={{ mb: 2 }}>
        <Skeleton variant="text" width="100%" height={24} />
      </Box>
    ))}
  </Box>
);

export const DetailSkeleton = () => (
  <Box>
    <Skeleton variant="rectangular" width="100%" height={300} sx={{ mb: 3 }} />
    <Grid container spacing={2}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <Grid item xs={12} md={6} key={idx}>
          <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={32} />
        </Grid>
      ))}
    </Grid>
  </Box>
);
