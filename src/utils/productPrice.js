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
