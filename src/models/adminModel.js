const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const walletSchema = new mongoose.Schema({
    coin: { type: String, required: true },
    image: { type: String, required: true },
    chainType: { type: String, required: true },
    walletAddress: { type: String, required: true },
});

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wallets: [walletSchema],
});


adminSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
