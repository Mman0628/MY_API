const {sql,poolPromise} = require('../db_con')


exports.getProject = async (req , res) => {
    try {
        const pool = await poolPromise
        const getProj = pool.request()
            .query(
                `SELECT proj.co_id, proj.proj_id, proj.proj_name, proj.proj_alias, proj.bldg_street, proj.district_municipality, proj.city_id, proj.prov_id,
                    proj.zipcode, proj.startdate, proj.totLandArea, proj.totSaleableArea, proj.vatable, proj.status_id,
                    company.co_name,
                    prov.prov_name,
                    city.CityDesc
                FROM mf_project proj
                LEFT JOIN mf_company company
                ON proj.co_id = company.co_id
                LEFT JOIN mf_province prov
                ON proj.prov_id = prov.prov_id
                LEFT JOIN mf_city city
                ON proj.city_id = city.CityCode 
                `);

        const getSubProject = pool.request()
            .query(
                `SELECT sproj.proj_id, sproj.sub_proj_id, sproj.sub_proj_name, sproj.sub_proj_alias, sproj.phase, sproj.release_batch, sproj.with_change_model, sproj.status_id,
                proj.proj_name
                FROM mf_sub_project sproj
                LEFT JOIN mf_project proj
                ON sproj.proj_id = proj.proj_id 
                `)

        const [proj, subProj] = await Promise.all([getProj, getSubProject])

        res.json({
            project : proj.recordset,
            subProject : subProj.recordset
        });
    } catch (err) {
        console.error('Query Error in getting Project:', err);
    }
}

exports.insertProject = async (req , res) => {
    const {data, flag} = req.body
    const prov_id = !data.prov_name ? '' : data.prov_name.prov_id
    const city_id = !data.CityDesc ? '' : data.CityDesc.CityCode
    const co_id = !data.co_id ? '' : data.co_id.co_id
    status_id = !data.status_id ? '' : data.status_id == 'ACTIVE'? 'A':'I' 

    if(flag){
        try {
            const pool = await poolPromise
            const getId =await pool.request()
                .query(`SELECT MAX(proj_id) AS LatestID FROM mf_project`)
                let latest_proj_id = Number(getId.recordset[0].LatestID)
                latest_proj_id++; 

            const result =await pool.request()
                .input('latest_proj_id', sql.NVarChar, latest_proj_id.toString())
                .input('co_id', sql.NVarChar, co_id)
                .input('proj_name', sql.NVarChar, data.proj_name)
                .input('proj_alias', sql.NVarChar, data.proj_alias)
                .input('bldg_street', sql.NVarChar, data.bldg_street) 
                .input('district_municipality', sql.NVarChar, data.district_municipality) 
                .input('zipcode', sql.NVarChar, data.zipcode)  
                .input('city_id', sql.NVarChar, city_id)
                .input('prov_id', sql.NVarChar, prov_id)
                .input('startdate', sql.SmallDateTime, data.startdate)
                .input('totLandArea', sql.NVarChar, data.totLandArea)
                .input('totSaleableArea', sql.NVarChar, data.totSaleableArea)
                .input('status_id', sql.NVarChar, status_id)
                .query(`
                    INSERT INTO mf_project (co_id, proj_id, proj_name, proj_alias, bldg_street, district_municipality, zipcode, city_id, prov_id,
                        startdate, totLandArea, totSaleableArea,  status_id, vatable)
                    VALUES (@co_id, @latest_proj_id, @proj_name, @proj_alias, @bldg_street, @district_municipality, @zipcode, @city_id, @prov_id, @startdate, @totLandArea, @totSaleableArea, @status_id, 0)
                    `);
                return res.json({ success:true, message: 'Project inserted successfully'});  
        } catch (error) { 
            if (error.number === 2627 || error.number === 2601) {
                return res.json ({ success: false, message: 'Project already exists' });
            }

            console.error('Error in inserting Project:', error);
            return res.json ({ success: false, message: 'Unexpected error' });
        }
    }else{  
        const proj_id = !data.proj_name ? '' : data.proj_name.proj_id 
        with_change_model = !data.with_change_model ? 0 : 1
        try {
            const pool = await poolPromise
            const getId =await pool.request()
                .query(`SELECT MAX(sub_proj_id) AS LatestID FROM mf_sub_project`)
                let latest_subProj_id = Number(getId.recordset[0].LatestID)
                latest_subProj_id++; 

            const result =await pool.request()
                .input('latest_subProj_id', sql.NVarChar, latest_subProj_id.toString())
                .input('proj_id', sql.NVarChar, proj_id) 
                .input('sub_proj_name', sql.NVarChar, data.sub_proj_name)
                .input('sub_proj_alias', sql.NVarChar, data.sub_proj_alias) 
                .input('phase', sql.NVarChar, data.phase) 
                .input('release_batch', sql.NVarChar, data.release_batch)  
                .input('with_change_model', sql.Bit, with_change_model)
                .input('status_id', sql.NVarChar, status_id) 
                .query(`
                    INSERT INTO mf_sub_project (proj_id, sub_proj_id, sub_proj_name, sub_proj_alias, phase, release_batch, with_change_model, status_id)
                    VALUES (@proj_id, @latest_subProj_id, @sub_proj_name, @sub_proj_alias, @phase, @release_batch, @with_change_model, @status_id)
                    `);
                return res.json({ success:true, message: 'Sub Project inserted successfully'});  
        } catch (error) { 
            if (error.number === 2627 || error.number === 2601) {
                return res.json ({ success: false, message: 'Sub Project already exists' });
            }

            console.error('Error in inserting Sub Project:', error);
            return res.json ({ success: false, message: 'Unexpected error' });
        }
    }
    
}
