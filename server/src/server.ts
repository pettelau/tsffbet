/**
 * Web server entry point used in `npm start`.
 */

import app from './app';

const port = 3000;
app.listen(port, () => {
  console.info(`Server running on port ${port}`);
});
