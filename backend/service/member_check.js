//判斷空值
function checkNull(data) {
    for (var key in data) {
        // 不為空
        return false;
    }
    // 為空值
    return true;
}

//判斷單一欄位是否為空
function checkEmpty(value) {
    if (value === null || value === undefined || value === "" || value.trim() === "") {
        return true;  // 為空
    }
    return false;     // 不為空
}

module.exports = {
    checkNull: checkNull,
    checkEmpty: checkEmpty
};