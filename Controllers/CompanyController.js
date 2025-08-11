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
    let {data, status, city, province} = req.body
    const {co_name, bldg_street, tel_no, district_municipality, co_tin, zip_code, fax_no, e_mail} = data
    const {CityCode} = city
    const {prov_id} = province
    status = status == 'ACTIVE'? 'A':'INA' 
    try {
        const pool = await poolPromise
        const result = pool.request()
            .input('co_name', sql.NVarChar, co_name)
    } catch (error) {
         console.error('Error in inserting company: ', error); 
    }

    // console.log(data,'data');
    // console.log(status,'status');
    // console.log(city,'city');
    // console.log(province,'province');
    try {
        const pool = await poolPromise
        const result =await pool.request()
            .query(`SELECT MAX(co_id) AS LatestID FROM mf_company`)
        let latest_co_id = Number(result.recordset[0].LatestID)
        latest_co_id++;
    } catch (error) {
        console.error('Error in incrementing company id: ', error); 
    }
    
}