const {sql,poolPromise} = require('../db_con')


exports.getCompany = async (req , res) => {
    try {
        const pool = await poolPromise
        const getCompany = pool.request()
        .query(
            `SELECT A.co_id, A.co_name, A.co_alias, A.bldg_street, A.district_municipality, A.city_id, A.prov_id, A.zip_code, A.e_mail, A.tel_no, A.fax_no, A.co_tin, A.status_id,
            province.prov_name,
            city.city_name 
            FROM mf_company A
            LEFT JOIN mf_province province
            ON A.prov_id = province.prov_id
            LEFT JOIN mf_city city
            ON A.city_id = city.city_id  
            `);
        const getProvince = pool.request().query(`SELECT prov.prov_id, prov.prov_name from mf_province prov`)
        const getCity = pool.request().query(`SELECT city.CityCode, city.CityDesc from mf_city city`)

        const [resultCompany, provinceMaster, cityMaster] = await Promise.all([getCompany, getProvince, getCity]);

        res.json({
            company: resultCompany.recordset,
            province: provinceMaster.recordset,
            city: cityMaster.recordset,
        });
    } catch (err) {
        console.error('Query Error in getCompany:', err);
    }
}

exports.insertCompany = async (req , res) => { 
    const {data} = req.body 
    // const ifEmptyData = Object.keys(data).length === 0
    // const ifEmptyProv_City = data.prov_name === undefined || data.city_name === undefined 

    // if(ifEmptyData || ifEmptyProv_City){
    //     return res.json({success:'warning', message: 'PLEASE FILL ALL FIELDS' });
    // }

    let {co_name, status_id, co_alias, bldg_street, tel_no, district_municipality, co_tin, zip_code, fax_no, e_mail} = data 
    const {prov_id, prov_name} = data.prov_name  
    const {CityCode, CityDesc} = data.city_name  
    
    status_id = status_id == 'ACTIVE'? 'A':'I' 
    try {
        const pool = await poolPromise
        const getId =await pool.request()
            .query(`SELECT MAX(co_id) AS LatestID FROM mf_company`)
        let latest_co_id = Number(getId.recordset[0].LatestID)
        latest_co_id++; 

        const result =await pool.request()
            .input('latest_co_id', sql.NVarChar, latest_co_id.toString())
            .input('co_name', sql.NVarChar, co_name)
            .input('co_alias', sql.NVarChar, co_alias)
            .input('bldg_street', sql.NVarChar, bldg_street)
            .input('tel_no', sql.NVarChar, tel_no)
            .input('district_municipality', sql.NVarChar, district_municipality)
            .input('co_tin', sql.NVarChar, co_tin)
            .input('zip_code', sql.NVarChar, zip_code)
            .input('fax_no', sql.NVarChar, fax_no)
            .input('e_mail', sql.NVarChar, e_mail)
            .input('CityCode', sql.NVarChar, CityCode)
            .input('prov_id', sql.NVarChar, prov_id)
            .input('status_id', sql.NVarChar, status_id)
            .query(`
                INSERT INTO mf_company (co_id, co_name, co_alias, bldg_street, tel_no, district_municipality, co_tin, zip_code, fax_no, e_mail, city_id, prov_id, status_id)
                VALUES (@latest_co_id, @co_name, @co_alias, @bldg_street, @tel_no, @district_municipality, @co_tin, @zip_code, @fax_no, @e_mail, @CityCode, @prov_id, @status_id)
                `);
            return res.json({ success:true, message: 'Company inserted successfully'});  
    } catch (error) { 
        if (error.number === 2627 || error.number === 2601) {
            return res.json ({ success: false, message: 'Company already exists' });
        }

        console.error('Error in inserting company:', error);
        return res.json ({ success: false, message: 'Unexpected error' });
    }   
}

exports.editCompany = async (req , res) => {  
    const {data} = req.body
     
    const prov_id = typeof data.prov_name === 'object' && data.prov_name !== null ? data.prov_name.prov_id : data.prov_name === null ? data.prov_name: data.prov_id
    const city_id = typeof data.city_name === 'object' && data.city_name !== null ? data.city_name.CityCode : data.city_name === null ? data.city_name : data.city_id 
    
    data.status_id = data.status_id == 'ACTIVE'? 'A':'I' 
    try {
        const pool = await poolPromise
        const updateCompany =await pool.request()
        .input('co_id', sql.NVarChar, data.co_id.toString())
        .input('co_name', sql.NVarChar, data.co_name)
        .input('co_alias', sql.NVarChar, data.co_alias)
        .input('bldg_street', sql.NVarChar, data.bldg_street)
        .input('tel_no', sql.NVarChar, data.tel_no)
        .input('district_municipality', sql.NVarChar, data.district_municipality)
        .input('co_tin', sql.NVarChar, data.co_tin)
        .input('zip_code', sql.NVarChar, data.zip_code)
        .input('fax_no', sql.NVarChar, data.fax_no)
        .input('e_mail', sql.NVarChar, data.e_mail)
        .input('city_id', sql.NVarChar, city_id)
        .input('prov_id', sql.NVarChar, prov_id)
        .input('status_id', sql.NVarChar, data.status_id)
        .query(
            `UPDATE mf_company 
            SET co_name = @co_name, co_alias = @co_alias, bldg_street= @bldg_street, tel_no = @tel_no, district_municipality= @district_municipality, 
                co_tin= @co_tin, zip_code= @zip_code, fax_no= @fax_no, e_mail= @e_mail, city_id= @city_id, prov_id= @prov_id, status_id= @status_id
            WHERE co_id = @co_id 
            `); 
        res.json({message: 'Company updated successfully.', updateCompany})
    } catch (error) { 
        if (error.number === 2627 || error.number === 2601) {
            return res.json ({ success: false, message: 'Company already Edited' });
        }

        console.error('Error in inserting company:', error);
        return res.json ({ success: false, message: 'Unexpected error' });
    } 
}