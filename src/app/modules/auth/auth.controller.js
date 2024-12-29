const User = require('./auth.model');
const catchAsync = require('../../../share/catch.async');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signUp = catchAsync(async (req, res)=>{
    const {body} = req;
    const password = await bcrypt.hash(body.password, 10);

    const user = new User({
        name: body.name,
        email: body.email,
        role: body.role,
        address: body.address,
        dateOfBirth: body.dateOfBirth,
        password: password,
        confirmPassword: password,
    });
    const savedUser = await user.save();
    console.log(req.body);
    const { name, email, role, address, dateOfBirth } = savedUser;
    res.status(201).json({
        message: "Request send Successful",
        data: {
            name,
            email,
            role,
            address,
            dateOfBirth,
        },
    });
});

const login = catchAsync(async (req, res)=>{
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("name email role address dateOfBirth");

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({
        id: user._id,
    },process.env.SECRET);
    const {  } = user;
    res.status(200).json({ message: 'Login successful', data: user,accessToken: token});
});



const users = catchAsync(async (req, res)=>{
    const { userId } = req.userId;
    const user = await User.findOne({ userId }).select("name email role address dateOfBirth");

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    res.status(200).json({ message: 'User Get successful', data: user});
});


const AuthController = {
    signUp,
    login,
    users
  };
  
  module.exports = { AuthController };