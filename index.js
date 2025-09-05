const express = require('express');
const app = express();
const PORT = 3000;
const chalk = require('chalk');
const routes = require('./Routes/route')
const cors = require('cors')

// Middleware to parse JSON
app.use(cors())
app.use(express.json());


// Sample route
// app.get('/myApi', (req, res) => {
//     res.send('Hello, API!');
// });

app.use('/myApi',routes);   

app.listen(PORT, '192.168.1.174', () => {
console.log(`Server running on http://192.168.1.174:${chalk.green(PORT)}`);
}); 
