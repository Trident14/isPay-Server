import cors from 'cors'
import dotenv from 'dotenv';
import app from './server.js'

app.use(cors())
dotenv.config();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, World!')
  ;
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
