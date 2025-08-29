const {sql,poolPromise} = require('../db_con')

exports.getCustomerData = async (req , res) => {
    try {
        const pool = await poolPromise
        const getCitizen = pool.request()
        .query(`
                SELECT * FROM mf_citizen
            `);
        const getSalutation = pool.request().query(`SELECT * FROM mf_salutation`);
        const getNatureOfBusiness = pool.request().query(`SELECT * FROM mF_nature_Business`);
        const [citizen, salutation, natureOfBusiness] = await Promise.all([getCitizen, getSalutation, getNatureOfBusiness])

        res.json({
            citizen: citizen.recordset,
            salutation: salutation.recordset,
            natureOfBusiness: natureOfBusiness.recordset,
        })
    } catch (error) {
        console.error('Error in fetching customer files ', error); 
    }
}

exports.insertCustomerData = async (req , res) => {
    const {data} = req.body
    status_id =  data.status_id === 'ACTIVE' ? 'A' : 'I'
    try {
        const pool = await poolPromise
        const getId =await pool.request()
            .query(`SELECT MAX(prov_id) AS LatestID FROM mf_province`)
        let latest_prov_id = Number(getId.recordset[0].LatestID)
        latest_prov_id++; 

        const result = await pool.request()
            .input('latest_prov_id', sql.NVarChar, latest_prov_id.toString()) 
            .input('prov_name', sql.NVarChar, data.province) 
            .input('status_id', sql.NVarChar, status_id)
            .query(`
                INSERT INTO mf_province (prov_id, prov_name, status_id)
                VALUES (@latest_prov_id, @prov_name, @status_id)
                `);
            return res.json({ success:true, message: 'Province inserted successfully'});   
    } catch (error) {
        if (error.number === 2627 || error.number === 2601) {
            return res.json ({ success: false, message: 'province already exists' });
        }

        console.error('Error in inserting province: ', error);
        return res.json ({ success: false, message: 'Unexpected error' }); 
    }
}