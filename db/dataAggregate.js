const users = require('./users.json');
const products = require('./products.json');
const reviews = require('./reviews.json');
const orders = require('./orders.json');
const favorites = require('./favorites.json');
const vouchers = require('./vouchers.json');
const userVouchers = require('./userVouchers.json');
const blogs = require('./blogs.json');

const notifications = require('./notifications.json');

module.exports = () => ({
    users,
    products,
    reviews,
    orders,
    favorites,
    vouchers,
    userVouchers,
    blogs,
    notifications
});
