const express = require('express');
const axios = require('axios');
const sql = require('mssql');

const app = express();
const port = 3000;

// Azure OpenAI configuration
const openaiKey = 'ae44e2a9b3864f4fbc2ece48adfa10d0';
const openaiEndpoint = 'https://poc-tax.openai.azure.com/';
const deploymentName = '35turbo';

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

// Function to query Azure OpenAI
async function queryOpenAI(prompt) {
    try {
        const response = await axios.post(
            `${openaiEndpoint}openai/deployments/${deploymentName}/completions?api-version=2022-12-01`,
            {
                prompt: prompt,
                max_tokens: 4500,
                temperature: 0.5,
                stop: [";"]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': openaiKey
                }
            }
        );

        const fullResponse = response.data.choices[0].text.trim();
        // Regular expression to match and extract SQL query
        const sqlQueryMatch = fullResponse.match(/SELECT[\s\S]*?FROM[\s\S]*?(;|$)/i);

        if (!sqlQueryMatch) {
            throw new Error("Invalid SQL query generated: " + fullResponse);
        }

        return sqlQueryMatch[0].replace(";", ""); // Remove trailing semicolon if present
    } catch (error) {
        console.error('Error querying OpenAI:', error.response ? error.response.data : error.message);
        throw new Error(error.response ? error.response.data : error.message);
    }
}

// Function to query SQL Server
async function querySQLServer(query) {
    try {
        const pool = await sql.connect(sqlConfig);
        const result = await pool.request().query(query);
        return result.recordset;
    } catch (err) {
        console.error('SQL error:', err);
        throw new Error(err);
    } finally {
        await sql.close(); // Ensure the connection is closed
    }
}

// Endpoint to handle queries
app.get('/query', async (req, res) => {
    const prompt = req.query.prompt;

    if (!prompt) {
        return res.status(400).send({ error: 'Prompt is required' });
    }

    try {
        const sqlQuery = await queryOpenAI(prompt);
        console.log('Generated SQL Query:', sqlQuery);

        const sqlResult = await querySQLServer(sqlQuery);
        res.json(sqlResult);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
