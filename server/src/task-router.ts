import express from 'express';

/**
 * Express router containing task methods.
 */
const router = express.Router();

router.get('/bets', async (_request: any, response: any) => {
  response.send("hello world")
});


export default router;
