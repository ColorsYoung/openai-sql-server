const sql = require('mssql');

// SQL Server configuration
const sqlConfig = {
    user: 'sqlserver',
    password: 'kxE5alm4NholzoEy',
    server: '34.124.228.244',
    database: 'TP',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Function to query SQL Server
async function querySQLServer() {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query('SELECT TOP 10 * FROM cal_sum');
        console.log('SQL Result:', result.recordset);
    } catch (err) {
        console.error('SQL error:', err);
    }
}

// Main function
async function main() {
    await querySQLServer();
}

main();
