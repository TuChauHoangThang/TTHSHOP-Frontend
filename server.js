const jsonServer = require('json-server');
const server = jsonServer.create();
const fs = require('fs');
const path = require('path');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const loadData = () => {
    const data = {};
    const files = ['users', 'products', 'reviews', 'orders', 'favorites', 'vouchers', 'userVouchers', 'blogs', 'notifications'];
    files.forEach(name => {
        try {
            const filePath = path.join(__dirname, 'db', `${name}.json`);
            if (fs.existsSync(filePath)) {
                data[name] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            } else {
                data[name] = [];
            }
        } catch (error) {
            console.error(`Error loading ${name}.json:`, error);
            data[name] = [];
        }
    });
    return data;
};

const router = jsonServer.router(loadData());
server.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const originalSend = res.send;
        res.send = function (body) {
            originalSend.call(this, body);
            const resource = req.path.split('/')[1];

            if (resource && router.db.get(resource)) {
                try {
                    const filePath = path.join(__dirname, 'db', `${resource}.json`);
                    const data = router.db.get(resource).value();
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    console.log(`Saved changes to db/${resource}.json`);
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
        if (Array.isArray(data)) {
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

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Custom JSON Server is running on port ${PORT}`);
    console.log('Watching db/ folder for changes...');
});
