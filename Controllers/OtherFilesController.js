const {sql,poolPromise} = require('../db_con')

exports.getEntity = async (req , res) => {
    try {
        const pool = await poolPromise
        const getEntityData = await pool.request()
            .query( 
                `SELECT A.entity_id, A.entity_kind, A.entity_name, A.first_name, A.last_name, A.middle_name, A.status_id, A.position_as_signatory, A.tin, 
                    A.ctcno, A.date_tin_encoded, A.ctcplace, A.signatory_type_code, city.CityDesc
                FROM mf_entity A
                LEFT JOIN mf_city city
                on A.ctcplace = city.CityCode
                `);
            res.json(getEntityData.recordset)
    } catch (error) {
        console.error('Error in fetching entity ', error); 
    }
}

exports.insertEntity = async (req, res) => { 
    const {data} = req.body
    const ctcplace = !data.CityCode ? data.CityCode : data.CityCode.CityCode
    status_id = !data.status_id ? data.status_id : data.status_id === 'ACTIVE' ? 'A' : 'I'
    signatory_type_code = !data.signatory_type_code ? data.signatory_type_code : data.signatory_type_code === 'Company Signatory' ? 'C' : 'P'
    entity_name = `${data.last_name} ${data.first_name} ${data.middle_name}`
    try {
        const pool = await poolPromise
        const getId =await pool.request()
            .query(`SELECT MAX(entity_id) AS LatestID FROM mf_entity`)
        let latest_entity_id = Number(getId.recordset[0].LatestID)
        latest_entity_id++; 

        const result = await pool.request()
            .input('latest_entity_id', sql.NVarChar, latest_entity_id.toString()) 
            .input('first_name', sql.NVarChar, data.first_name)
            .input('last_name', sql.NVarChar, data.last_name)
            .input('middle_name', sql.NVarChar, data.middle_name)
            .input('ctcplace', sql.NVarChar, ctcplace)
            .input('date_tin_encoded', sql.SmallDateTime, data.date_tin_encoded)
            .input('position_as_signatory', sql.NVarChar, data.position_as_signatory)
            .input('signatory_type_code', sql.NVarChar, signatory_type_code) 
            .input('entity_name', sql.NVarChar, entity_name) 
            .input('status_id', sql.NVarChar, status_id)
            .query(`
                INSERT INTO mf_entity (entity_id, entity_kind, entity_name, first_name, last_name, middle_name, status_id, ctcplace, date_tin_encoded, position_as_signatory, signatory_type_code)
                VALUES (@latest_entity_id, 'I', @entity_name, @first_name, @last_name, @middle_name, @status_id, @ctcplace, @date_tin_encoded, @position_as_signatory, @signatory_type_code)
                `);
            return res.json({ success:true, message: 'Entity inserted successfully'});  
    } catch (error) { 
        if (error.number === 2627 || error.number === 2601) {
            return res.json ({ success: false, message: 'Entity already exists' });
        }

        console.error('Error in inserting Entity:', error);
        return res.json ({ success: false, message: 'Unexpected error' });
    }
}