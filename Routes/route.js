const express = require('express');
const router = express.Router();
const projectController = require('../Controllers/ProjectController')
const companyController = require('../Controllers/CompanyController') 
const otherFiles = require('../Controllers/OtherFilesController')
const customerFilesController = require('../Controllers/CustomerFilesController')

module.exports = router.get('/', (req,res) => {
    res.send('THIS IS BASE'); 
});

//GET
module.exports =router.get('/project',projectController.getProject)
module.exports =router.get('/company',companyController.getCompanyData)  
module.exports =router.get('/other_files',otherFiles.getEntity) 
module.exports =router.get('/customer_files',customerFilesController.getCustomerData) 

//POST
module.exports =router.post('/add_company',companyController.insertCompany)
module.exports =router.post('/edit_company',companyController.editCompany) 
module.exports =router.post('/insert_project',projectController.insertProject)
module.exports =router.post('/insert_entity',otherFiles.insertEntity)
module.exports =router.post('/insert_customer_files',customerFilesController.insertCustomerData)