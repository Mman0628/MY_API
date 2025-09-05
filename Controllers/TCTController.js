const {sql,poolPromise} = require('../db_con')

exports.TCTData = async (req , res) => {
    try {
        const pool = await poolPromise
        const getClient = await pool.request()
        .query(`
            SELECT A.co_id, A.co_name, A.co_alias, A.bldg_street, A.district_municipality, A.city_id, A.prov_id, A.zip_code, A.contact_salutation, A.contact_last,
                A.contact_first, A.contact_mid, A.position, A.tin_no, A.ctc_no, A.ctc_place, A.ctc_date, A.tel_no, A.fax_no, A.e_mail, A.status_id, A.all_in,
                prov.prov_name,
                city.CityDesc
            FROM mf_client_info A
            LEFT JOIN mf_province prov
            ON A.prov_id = prov.prov_id
            LEFT JOIN mf_city city
            ON A.city_id = city.CityCode
            `); 
        res.json({
            client: getClient.recordset, 
        });
    } catch (error) {
        console.error('Error fetching client data ', error); 
    }
}