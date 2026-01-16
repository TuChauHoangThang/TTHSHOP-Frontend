const jsonServer = require('json-server');
const server = jsonServer.create();
const fs = require('fs');
const path = require('path');
const middlewares = jsonServer.defaults();

// Rewrite routes to remove /api prefix if present (crucial for Vercel)
server.use(jsonServer.rewriter({
    '/api/*': '/$1'
}));

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Use require to force Vercel bundler to include the files
const dataAggregate = require('../db/dataAggregate');

// Initialize router with in-memory data
const router = jsonServer.router(dataAggregate());

// Custom middleware to handle writes (Read-only on Vercel, but we try to simulate or ignore)
server.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const originalSend = res.send;
        res.send = function (body) {
            originalSend.call(this, body);
            const resource = req.path.split('/')[1];

            // In Vercel Serverless, we CANNOT write to the file system to persist data.
            // This block attempts to write but catches errors so the app doesn't crash.
            if (resource && router.db.get(resource)) {
                try {
                    // This will likely fail on Vercel production
                    /* 
                    const filePath = getDbPath(`${resource}.json`);
                    const data = router.db.get(resource).value();
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    console.log(`Saved changes to db/${resource}.json`);
                    */
                    // Commented out to prevent errors in logs, as Vercel is read-only.
                } catch (err) {
                    console.error(`Error writing to db/${resource}.json:`, err);
                }
            }
        };
    }
    next();
});

const pseudoRandom = (seed) => {
    let value = seed;
    return () => {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
    };
};

const applyFlashSale = (data) => {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDate();
    const timeSeed = currentDay * 24 + currentHour;

    const processProduct = (product) => {
        if (!product || !product.id) return product;
        const seed = timeSeed + parseInt(product.id);
        const rand = pseudoRandom(seed);
        const isSale = rand() < 0.3;
        if (isSale) {
            const discountStep = Math.floor(rand() * 8) + 1;
            const discountPercent = discountStep * 5; // 5%, 10%, ..., 40%
            const originalPrice = product.originalPrice || product.price;
            const newPrice = originalPrice * (1 - discountPercent / 100);
            const roundedPrice = Math.round(newPrice / 1000) * 1000;

            return {
                ...product,
                price: roundedPrice,
                originalPrice: originalPrice,
                isFlashSale: true,
                discountPercent: discountPercent
            };
        }

        return product;
    };

    if (Array.isArray(data)) {
        return data.map(processProduct);
    } else if (typeof data === 'object' && data !== null) {
        if (data.price !== undefined && data.id !== undefined) {
            return processProduct(data);
        }
    }
    return data;
};

router.render = (req, res) => {
    const data = res.locals.data;
    if (req.url.startsWith('/products')) {
        const modifiedData = applyFlashSale(data);
        res.jsonp(modifiedData);
    } else {
        res.jsonp(data);
    }
};

server.use(router);

// Export the server for Vercel
module.exports = server;
