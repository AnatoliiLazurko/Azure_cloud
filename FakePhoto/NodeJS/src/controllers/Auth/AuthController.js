const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/UserModel');


const login = async (req, res) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({message: "User not found"});
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({message: "Password incorrect"});
    }

    jwt.sign({
        user: {
            id: user.id
        },
    },
        process.env.JWT_SECRET,
        { expiresIn: '7 days' },
        (err, token) => {
            if (err) throw err;
            res.json({ token, message: `Welcome ${user.name} !` })
        }
    );
}

const createUser  = async (req, res) => {
    const { name, email, emailVerifiedAt, password } = req.body;

    const existingUser = await User.findOne({ email: email });
    
    if (existingUser) {
        return res.json({ message: 'User already exist' });
    }

    const user = await User.create({ name, email, emailVerifiedAt, password });
    
    jwt.sign({
        user: {
            id: user.id
        },

    },
        process.env.JWT_SECRET,
        { expiresIn: '7 days' },
        (err, token) => {
            if (err) throw err;
            res.json({ token })
        }
    );

}

const getUserById  = async  (req, res) => {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({ user });
}

module.exports = { login, createUser , getUserById }