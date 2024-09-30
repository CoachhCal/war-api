import express from 'express';
import contactsRouter from './routes/war.js';

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/api/photo', contactsRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


