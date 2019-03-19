// IndexRouter
const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.use('/public', express.static(path.join(__dirname, '../public')))
router.get('/failure', (req, res, next) => {res.sendFile(path.join(__dirname, '../views/failure.html'))})

module.exports = router;

