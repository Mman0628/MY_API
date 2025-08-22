const {sql,poolPromise} = require('../db_con')


exports.getCompanyData = async (req , res) => {
    try {
        const pool = await poolPromise
        const getCompany = pool.request()
        .query(
            `SELECT A.co_id, A.co_name, A.co_alias, A.bldg_street, A.district_municipality, A.city_id, A.prov_id, A.zip_code, A.e_mail, A.tel_no, A.fax_no, A.co_tin, A.status_id,
            province.prov_name,
            city.CityDesc 
            FROM mf_company A
            LEFT JOIN mf_province province
            ON A.prov_id = province.prov_id
            LEFT JOIN mf_city city
            ON A.city_id = city.CityCode  
            `);
        const getProvince = pool.request().query(`SELECT prov.prov_id, prov.prov_name from mf_province prov`)
        const getCity = pool.request().query(`SELECT city.CityCode, city.CityDesc from mf_city city`)
        const getBusinessunit = pool.request()
            .query(
            `SELECT A.co_id, A.busunit_id, A.busunit_name, A.busunit_alias, A.bldg_street, A.district_municipality, A.city_id, A.prov_id, 
            A.zip_code, A.e_mail, A.tel_no, A.fax_no, A.status_id,
            province.prov_name,
            city.CityDesc ,
            comp.co_name
            FROM mf_business_unit A
            LEFT JOIN mf_province province
            ON A.prov_id = province.prov_id
            LEFT JOIN mf_city city
            ON A.city_id = city.CityCode 
            LEFT JOIN mf_company comp
            ON A.co_id = comp.co_id
            `);
        const getOfficeBranch = pool.request()
            .query(
            `SELECT A.co_id, A.branch_id, A.branch_name, A.branch_alias, A.bldg_street, A.district_municipality, A.city_id, A.prov_id, 
            A.zip_code, A.tel_no, A.fax_no, A.status_id,
            province.prov_name,
            city.CityDesc ,
            comp.co_name
            FROM mf_office_branch A
            LEFT JOIN mf_province province
            ON A.prov_id = province.prov_id
            LEFT JOIN mf_city city
            ON A.city_id = city.CityCode 
            LEFT JOIN mf_company comp
            ON A.co_id = comp.co_id
            `);

        const [resultCompany, provinceMaster, cityMaster, businessunit, officeBranch] = await Promise.all([getCompany, getProvince, getCity, getBusinessunit, getOfficeBranch]);

        res.json({
            company: resultCompany.recordset,
            province: provinceMaster.recordset,
            city: cityMaster.recordset,
            businessunit: businessunit.recordset,
            officeBranch: officeBranch.recordset,
        });
    } catch (err) {
        console.error('Query Error in getCompany:', err);
    }
} 

exports.insertCompany = async (req , res) => { 
    const {data, flag} = req.body   
    const prov_id = !data.prov_name ? '' : data.prov_name.prov_id 
    let CityCode = !data.CityDesc ? '' : data.CityDesc.CityCode
    CityCode = CityCode.trim();  
    status_id = !data.status_id ? '' : data.status_id == 'ACTIVE'? 'A':'I' 
    console.log(data,'inserrtt data'); 
    
    if(flag === 'co'){ 
        let {co_name, co_alias, bldg_street, tel_no, district_municipality, co_tin, zip_code, fax_no, e_mail} = data 
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
                .input('city_id', sql.NVarChar, city_id)
                .input('prov_id', sql.NVarChar, prov_id)
                .input('status_id', sql.NVarChar, status_id)
                .query(`
                    INSERT INTO mf_company (co_id, co_name, co_alias, bldg_street, tel_no, district_municipality, co_tin, zip_code, fax_no, e_mail, city_id, prov_id, status_id)
                    VALUES (@latest_co_id, @co_name, @co_alias, @bldg_street, @tel_no, @district_municipality, @co_tin, @zip_code, @fax_no, @e_mail, @city_id, @prov_id, @status_id)
                    `);
                return res.json({ success:true, message: 'Company inserted successfully'});  
        } catch (error) { 
            if (error.number === 2627 || error.number === 2601) {
                return res.json ({ success: false, message: 'Company already exists' });
            }

            console.error('Error in inserting company:', error);
            return res.json ({ success: false, message: 'Unexpected error' });
        }
    }else if(flag === 'bu'){
        const co_id = !data.co_name ? data.co_name : data.co_name.co_id
        
        try {
            const pool = await poolPromise
            const getId =await pool.request()
                .query(`SELECT MAX(busunit_id) AS busunit_id FROM mf_business_unit`)
            let latest_bu_id = Number(getId.recordset[0].busunit_id)
            latest_bu_id++; 

            const result =await pool.request()
                .input('co_id', sql.NVarChar, co_id)
                .input('latest_bu_id', sql.NVarChar, latest_bu_id.toString())
                .input('busunit_name', sql.NVarChar, data.busunit_name)
                .input('busunit_alias', sql.NVarChar, data.busunit_alias)
                .input('bldg_street', sql.NVarChar, data.bldg_street) 
                .input('district_municipality', sql.NVarChar, data.district_municipality)  
                .input('CityCode', sql.NVarChar, CityCode)
                .input('tel_no', sql.NVarChar, data.tel_no)
                .input('zip_code', sql.NVarChar, data.zip_code)
                .input('fax_no', sql.NVarChar, data.fax_no)
                .input('e_mail', sql.NVarChar, data.e_mail)
                .input('prov_id', sql.NVarChar, prov_id)
                .input('status_id', sql.NVarChar, status_id)
                .query(`
                    INSERT INTO mf_business_unit 
                        (co_id, busunit_id, busunit_name, busunit_alias, bldg_street, district_municipality, city_id, prov_id, zip_code, tel_no, fax_no, e_mail, status_id)
                    VALUES (@co_id, @latest_bu_id, @busunit_name, @busunit_alias, @bldg_street, @district_municipality, @CityCode, @prov_id, @zip_code, @tel_no, @fax_no, @e_mail,  @status_id)
                    `);
                return res.json({ success:true, message: 'Business Unit inserted successfully'});  
        } catch (error) { 
            if (error.number === 2627 || error.number === 2601) {
                return res.json ({ success: false, message: 'Business Unit already exists' });
            }

            console.error('Error in inserting Business Unit:', error);
            return res.json ({ success: false, message: 'Unexpected error' });
        }
    }else if(flag === 'ob'){
        const co_id = !data.co_name ? data.co_name : data.co_name.co_id
        console.log(req,'reqqq ko'); 
        try {
            const pool = await poolPromise
            const getId =await pool.request()
                .query(`SELECT MAX(branch_id) AS branch_id FROM mf_office_branch`)
            let latest_ob_id = Number(getId.recordset[0].branch_id)
            latest_ob_id++; 

            const result =await pool.request()
                .input('co_id', sql.NVarChar, co_id)
                .input('latest_ob_id', sql.NVarChar, latest_ob_id.toString())
                .input('branch_name', sql.NVarChar, data.branch_name)
                .input('branch_alias', sql.NVarChar, data.branch_alias)
                .input('bldg_street', sql.NVarChar, data.bldg_street) 
                .input('district_municipality', sql.NVarChar, data.district_municipality)  
                .input('CityCode', sql.NVarChar, CityCode)
                .input('tel_no', sql.NVarChar, data.tel_no)
                .input('zip_code', sql.NVarChar, data.zip_code)
                .input('fax_no', sql.NVarChar, data.fax_no) 
                .input('prov_id', sql.NVarChar, prov_id)
                .input('status_id', sql.NVarChar, status_id)
                .query(`
                    INSERT INTO mf_office_branch 
                        (co_id, branch_id, branch_name, branch_alias, bldg_street, district_municipality, city_id, prov_id, zip_code, tel_no, fax_no, status_id)
                    VALUES (@co_id, @latest_ob_id, @branch_name, @branch_alias, @bldg_street, @district_municipality, @CityCode, @prov_id, @zip_code, @tel_no, @fax_no,  @status_id)
                    `);
                return res.json({ success:true, message: 'Office Branch inserted successfully'});  
        } catch (error) { 
            if (error.number === 2627 || error.number === 2601) {
                return res.json ({ success: false, message: 'Office Branch already exists' });
            }

            console.error('Error in inserting Office Branch:', error);
            return res.json ({ success: false, message: 'Unexpected error' });
        }
    }else{
        console.log('wala sa insert'); 
    }
       
}

exports.editCompany = async (req , res) => {  
    console.log(req,'reqqqq');
    
    const {data, flag} = req.body 
    const prov_id = typeof data.prov_name === 'object' && data.prov_name !== null ? data.prov_name.prov_id : data.prov_name === null ? data.prov_name: data.prov_id
    const city_id = typeof data.CityDesc === 'object' && data.CityDesc !== null ? data.CityDesc.CityCode : data.CityDesc === null ? data.CityDesc : data.city_id 
    const co_id = typeof data.co_name === 'object' && data.co_name !== null ? data.co_name.co_id : data.co_name === null ? data.co_name : data.co_id
    
    data.status_id = data.status_id == 'ACTIVE'? 'A':'I' 
    if(flag === 'co'){ 
        try {
            const pool = await poolPromise
            const updateCompany =await pool.request()
            .input('co_id', sql.NVarChar, data.co_id)
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

            console.error('Error in editing company:', error);
            return res.json ({ success: false, message: 'Unexpected error' });
        } 
    }else if(flag === 'bu'){
        try {
            const pool = await poolPromise
            const updateBU =await pool.request()
            .input('co_id', sql.NVarChar, co_id)
            .input('busunit_id', sql.NVarChar, data.busunit_id)
            .input('busunit_name', sql.NVarChar, data.busunit_name)
            .input('busunit_alias', sql.NVarChar, data.busunit_alias)
            .input('bldg_street', sql.NVarChar, data.bldg_street)
            .input('tel_no', sql.NVarChar, data.tel_no)
            .input('district_municipality', sql.NVarChar, data.district_municipality) 
            .input('zip_code', sql.NVarChar, data.zip_code)
            .input('fax_no', sql.NVarChar, data.fax_no)
            .input('e_mail', sql.NVarChar, data.e_mail)
            .input('city_id', sql.NVarChar, city_id)
            .input('prov_id', sql.NVarChar, prov_id)
            .input('status_id', sql.NVarChar, data.status_id)
            .query(
                `UPDATE mf_business_unit
                SET co_id = @co_id, busunit_name = @busunit_name, busunit_alias= @busunit_alias, bldg_street = @bldg_street, tel_no = @tel_no,
                    district_municipality= @district_municipality, zip_code= @zip_code, fax_no= @fax_no, e_mail= @e_mail, city_id= @city_id, prov_id= @prov_id, status_id= @status_id
                WHERE busunit_id = @busunit_id 
                `); 
            res.json({message: 'Business Unit updated successfully.'})
        } catch (error) { 
            if (error.number === 2627 || error.number === 2601) {
                return res.json ({ success: false, message: 'Business Unit already Edited' });
            }

            console.error('Error in editing Business Unit:', error);
            return res.json ({ success: false, message: 'Unexpected error' });
        } 
    }else if(flag === 'ob'){
        console.log('here');
        
        try {
            const pool = await poolPromise
            const updateOB =await pool.request()
            .input('co_id', sql.NVarChar, co_id)
            .input('branch_id', sql.NVarChar, data.branch_id)
            .input('branch_name', sql.NVarChar, data.branch_name)
            .input('branch_alias', sql.NVarChar, data.branch_alias)
            .input('bldg_street', sql.NVarChar, data.bldg_street)
            .input('tel_no', sql.NVarChar, data.tel_no)
            .input('district_municipality', sql.NVarChar, data.district_municipality) 
            .input('zip_code', sql.NVarChar, data.zip_code)
            .input('fax_no', sql.NVarChar, data.fax_no) 
            .input('city_id', sql.NVarChar, city_id)
            .input('prov_id', sql.NVarChar, prov_id)
            .input('status_id', sql.NVarChar, data.status_id)
            .query(
                `UPDATE mf_office_branch
                SET co_id = @co_id, branch_name = @branch_name, branch_alias= @branch_alias, bldg_street = @bldg_street, tel_no = @tel_no,
                    district_municipality= @district_municipality, zip_code= @zip_code, fax_no= @fax_no, city_id= @city_id, prov_id= @prov_id, status_id= @status_id
                WHERE branch_id = @branch_id 
                `); 
            res.json({message: 'Office branch updated successfully.'})
        } catch (error) { 
            if (error.number === 2627 || error.number === 2601) {
                return res.json ({ success: false, message: 'Office branch already Edited' });
            }

            console.error('Error in editing Office branch:', error);
            return res.json ({ success: false, message: 'Unexpected error' });
        } 
    } else{
        console.log('wala sa edit'); 
    }
}