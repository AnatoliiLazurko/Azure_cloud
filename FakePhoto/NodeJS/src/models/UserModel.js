const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, "Name is required"],
    },
    email: {
        type: String,
        require: [true, "Email is required"],
        unique: true
    },
    emailVerifiedAt: {
        type: Date
    },
    password: {
        type: String,
        require: [true, "Password is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre("save", async function () {
    this.password = await bcrypt.hash(this.password, 12);
});


const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;