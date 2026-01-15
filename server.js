const jsonServer = require('json-server');
const server = jsonServer.create();
const fs = require('fs');
const path = require('path');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Helper to load data from individual files
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

// Initialize Router with in-memory data
const router = jsonServer.router(loadData());

// Middleware to intercept write operations and persist to disk
server.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        // Capture the original send to run after router updates the adapter
        const originalSend = res.send;
        res.send = function (body) {
            originalSend.call(this, body);

            // Determine which collection was modified
            // URL format usually: /resource or /resource/id
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

// Custom PRNG to ensure deterministic results per hour per product
const pseudoRandom = (seed) => {
    let value = seed;
    return () => {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
    };
};

// Logic tính toán Flash Sale
const applyFlashSale = (data) => {
    // Chỉ áp dụng cho danh sách sản phẩm hoặc chi tiết sản phẩm
    // Data có thể là array (list) hoặc object (detail)
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDate(); // Thay đổi theo cả ngày để đa dạng hơn
    const timeSeed = currentDay * 24 + currentHour;

    const processProduct = (product) => {
        if (!product || !product.id) return product;

        // Seed unique cho từng sản phẩm trong giờ hiện tại
        const seed = timeSeed + parseInt(product.id);
        const rand = pseudoRandom(seed);

        // 1. Xác suất sản phẩm này có được sale không? (Ví dụ: 30% sản phẩm được sale)
        const isSale = rand() < 0.3;

        if (isSale) {
            // 2. Mức giảm giá: random từ 1 (5%) đến 8 (40%) -> step 5%
            // Random integer từ 1 đến 8
            const discountStep = Math.floor(rand() * 8) + 1;
            const discountPercent = discountStep * 5; // 5%, 10%, ..., 40%

            // Giữ giá gốc nếu chưa có
            const originalPrice = product.originalPrice || product.price;

            // Tính giá mới
            const newPrice = originalPrice * (1 - discountPercent / 100);

            // Làm tròn giá về hàng nghìn (ví dụ 135.500 -> 136.000 hoặc 135.000)
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
        // Kiểm tra nếu là object sản phẩm (có id và price)
        if (data.price !== undefined && data.id !== undefined) {
            return processProduct(data);
        }
        // Nếu response là dạng { data: [...] } (pagination)
        if (Array.isArray(data)) { // json-server đôi khi trả mảng trực tiếp, hoặc nếu render custom
            // (Logic ở đây chủ yếu xử lý mảng trả về trực tiếp từ router.render của json-server)
        }
    }
    return data;
};

// Custom output handling
router.render = (req, res) => {
    const data = res.locals.data;

    // Chỉ can thiệp nếu request URL liên quan đến products
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
