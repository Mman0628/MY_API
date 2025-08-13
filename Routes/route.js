const express = require('express');
const router = express.Router();
const projectController = require('../Controllers/ProjectController')
const companyController = require('../Controllers/CompanyController') 

module.exports = router.get('/', (req,res) => {
    res.send('THIS IS BASE'); 
});

//GET
module.exports =router.get('/project',projectController.getProject)
module.exports =router.get('/company',companyController.getCompany)

//POST
module.exports =router.post('/add_company',companyController.insertCompany)
module.exports =router.post('/edit_company',companyController.editCompany)