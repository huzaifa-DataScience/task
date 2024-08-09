const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;


app.use(cors({
  origin: 'http://localhost:3000', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(bodyParser.json());

let url = 'mongodb+srv://huzaifa:huzaifa@surrendo.1dubx.mongodb.net/'

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));


app.use('/api', require('./routes/index'));


app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
