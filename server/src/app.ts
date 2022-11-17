import express from 'express';
import taskRouter from './task-router';
import path from 'path';

/**
 * Express application.
 */
const app = express();

// Serve client files
app.use(express.static(path.join(__dirname, '/../../client/build')));

app.use(express.json());

// Serve /api/v1/tasks api
app.use('/api/v1', taskRouter);

export default app;
