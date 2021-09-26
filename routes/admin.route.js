const express = require('express')
const route = express.Router()

const auth = require('../middleware/auth')
const {auth_admin} = require('../middleware/decentralization')
const upload = require('../middleware/upload')

const AdminController = require('../controller/admin.controller')
const UserController = require('../controller/user.controller')

route.get('/', auth, auth_admin, (req, res) => {
    res.render('admin')
})

route.post('/register', UserController.register)
route.post('/previewImg', upload.array('img', 10), AdminController.addPreview)
route.post('/product', upload.single('img'), AdminController.addProduct )
route.post('/category', AdminController.addCategory)
route.post('/product/:idProduct', AdminController.updateProduct)
route.post('/category/:idCategory', AdminController.updateCategory)
route.get('/user', AdminController.getAllUser)
route.get('/order', AdminController.getAllOrder)

module.exports = route