const productData = require('../../models/product/getAllproduct_model');

module.exports = class Product{
    async getAllProducts(req, res, next) {
        try {
            const result = await productData();
            
            // 處理圖片路徑，加上完整 URL
            if (result.products && result.products.length > 0) {
                result.products = result.products.map(product => ({
                    ...product,
                    image_url: `http://localhost:3000${product.imgPath}`
                }));
            }
            
            res.json(result);

        } catch (error) {
            console.log(error);
            res.status(500).json(error);
        }
    }
}