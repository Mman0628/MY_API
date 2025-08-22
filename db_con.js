const sql = require('mssql');

const config = {
  user: 'sa', // or your SQL Server username
  password: 'OOASolutions2013', 
  server: 'server1',
  database: 'bios_db_ooasi_clone_07302025',
  options: {
    encrypt: false, // For local SQL Server
    trustServerCertificate: true,
    instanceName: 'sqlexpress'
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(async pool => {
    console.log('Connected to SQL Server'); 
    return pool;
  })
  .catch(err => console.error('Database Connection Failed', err));

module.exports = {
  sql, poolPromise
};