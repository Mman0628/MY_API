const {sql,poolPromise} = require('../db_con')


exports.getProject = async (req , res) => {
    try {
        const pool = await poolPromise
        const result = await pool.request()
        .query(
            `SELECT PROJECT_TCT.*, DEVELOPER.dev_desc FROM mf_project_tct PROJECT_TCT
            LEFT JOIN mf_developer DEVELOPER
            ON PROJECT_TCT.co_id = DEVELOPER.co_id 
            AND PROJECT_TCT.dev_id = DEVELOPER.dev_id
            `);
        res.send(result);
    } catch (err) {
        console.error('Query Error:', err);
    }
}
