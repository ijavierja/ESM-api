import express from 'express';
import api from './api'

const app = express();

app.use('/api', api)

const port = 8080

app.listen(port, () => {
  console.log(`Application started on port ${port}`);
});