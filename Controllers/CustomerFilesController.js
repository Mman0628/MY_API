const {sql,poolPromise} = require('../db_con')

exports.getCustomerData = async (req , res) => {
    try {
        const pool = await poolPromise
        const getCitizen = pool.request().query(` SELECT * FROM mf_citizen `);
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
    const {data, flag} = req.body
    status_id =  data.status_id === 'ACTIVE' ? 'A' : 'I'
    if(flag == 'province'){ 
        try {
            const pool = await poolPromise
            const getId = await pool.request()
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
    }else if(flag == 'city'){
        city_prov = !data.prov_name ? null : data.prov_name.prov_id 
        try {
            const pool = await poolPromise
            const getId = await pool.request()
                .query(`SELECT MAX(CityCode) AS LatestID FROM mf_city`)
            let latest_city_id = Number(getId.recordset[0].LatestID)
            latest_city_id++; 

            const result = await pool.request()
                .input('latest_city_id', sql.NVarChar, latest_city_id.toString()) 
                .input('CityDesc', sql.NVarChar, data.city) 
                .input('city_prov', sql.NVarChar, city_prov) 
                .input('status_id', sql.NVarChar, status_id)
                .query(`
                    INSERT INTO mf_city (CityCode, CityDesc, city_prov, status_id)
                    VALUES (@latest_city_id, @CityDesc, @city_prov, @status_id)
                    `);
            return res.json({ success:true, message: 'City inserted successfully'});
        } catch (error) {
             if (error.number === 2627 || error.number === 2601) {
                return res.json ({ success: false, message: 'city already exists' });
            }

            console.error('Error in inserting city: ', error);
            return res.json ({ success: false, message: 'Unexpected error' }); 
        }
    }else if(flag == 'citizen'){
        try {
            const pool = await poolPromise 
            const result = await pool.request() 
                .input('CitizenshipCode', sql.NVarChar, data.alias) 
                .input('CitizenshipDesc', sql.NVarChar, data.citizenName) 
                .input('status_id', sql.NVarChar, status_id)
                .query(`
                    INSERT INTO mf_citizen (CitizenshipCode, CitizenshipDesc, status_id)
                    VALUES (@CitizenshipCode, @CitizenshipDesc, @status_id)
                    `);
            return res.json({ success:true, message: 'Citizen inserted successfully'});
        } catch (error) {
             if (error.number === 2627 || error.number === 2601) {
                return res.json ({ success: false, message: 'Citizen already exists' });
            }

            console.error('Error in inserting Citizen: ', error);
            return res.json ({ success: false, message: 'Unexpected error' }); 
        }
    }else if(flag == 'salutation'){
        try {
            const pool = await poolPromise 
            const result = await pool.request() 
                .input('SalutationCode', sql.NVarChar, data.salutCode) 
                .input('SalutationDesc', sql.NVarChar, data.salutName) 
                .input('status_id', sql.NVarChar, status_id)
                .query(`
                    INSERT INTO mf_salutation (SalutationCode, SalutationDesc, status_id)
                    VALUES (@SalutationCode, @SalutationDesc, @status_id)
                    `);
            return res.json({ success:true, message: 'Salutation inserted successfully'});
        } catch (error) {
             if (error.number === 2627 || error.number === 2601) {
                return res.json ({ success: false, message: 'Salutation already exists' });
            }

            console.error('Error in inserting Salutation: ', error);
            return res.json ({ success: false, message: 'Unexpected error' }); 
        }
    } else if(flag == 'NOB'){ 
        try {
            const pool = await poolPromise
            const getId = await pool.request()
                .query(`SELECT MAX(NOBCode) AS LatestID FROM mF_nature_Business`)
            let latest_NOB_id = Number(getId.recordset[0].LatestID)
            latest_NOB_id++; 
 
            const result = await pool.request() 
                .input('latest_NOB_id', sql.NVarChar, latest_NOB_id.toString()) 
                .input('NOBDesc', sql.NVarChar, data.NOBDescription) 
                .input('status_id', sql.NVarChar, status_id)
                .query(`
                    INSERT INTO mF_nature_Business (NOBCode, NOBDesc, status_id)
                    VALUES (@latest_NOB_id, @NOBDesc, @status_id)
                    `);
            return res.json({ success:true, message: 'Nature of business inserted successfully'});
        } catch (error) {
             if (error.number === 2627 || error.number === 2601) {
                return res.json ({ success: false, message: 'Nature of business already exists' });
            }

            console.error('Error in inserting Nature of business: ', error);
            return res.json ({ success: false, message: 'Unexpected error' }); 
        }
    }
}