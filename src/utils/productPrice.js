/**
 * Tính toán giá sản phẩm dựa trên loại/size đã chọn.
 * Mỗi cấp tiếp theo trong mảng types sẽ tăng thêm 30,000 VND.
 * 
 * @param {number} basePrice - Giá gốc của sản phẩm.
 * @param {string} selectedType - Loại/Size đang chọn.
 * @param {string[]} typesArray - Mảng các loại/size của sản phẩm.
 * @returns {number} - Giá sau khi đã cộng thêm chênh lệch.
 */
export const getPriceByType = (basePrice, selectedType, typesArray) => {
    if (!basePrice) return 0;
    if (!selectedType || !typesArray || !Array.isArray(typesArray)) {
        return basePrice;
    }

    const index = typesArray.indexOf(selectedType);
    if (index === -1) {
        return basePrice;
    }

    // Mỗi bậc tăng 30,000đ
    const priceIncrease = index * 30000;
    return basePrice + priceIncrease;
};
