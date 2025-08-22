const {sql,poolPromise} = require('../db_con')

exports.getEntity = async (req , res) => {
    try {
        const pool = await poolPromise
        const getEntityData = await pool.request()
            .query( 
                `SELECT entity_id, entity_kind, entity_name, first_name, last_name, middle_name, status_id, position_as_signatory, tin, ctcno, date_tin_encoded, ctcplace, signatory_type_code
                FROM mf_entity
                `);
            res.json(getEntityData.recordset)
    } catch (error) {
        console.error('Error in fetching entity ', error); 
    }
}