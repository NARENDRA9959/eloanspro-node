const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'eloanspro',
  password: 'Eloanspro@2024',
  database: 'eloanspro'
});
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database successfully!');
});

connection.end();
