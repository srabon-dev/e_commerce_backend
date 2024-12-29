const express = require('express');
const router = express.Router();

const authRouter = require('../modules/auth/auth.router');

const moduleRouter = [
    {
        path: '/auth',
        name: authRouter,
    }
];

moduleRouter.forEach((singleRouter=>router.use(singleRouter.path, singleRouter.name)));
module.exports = router;