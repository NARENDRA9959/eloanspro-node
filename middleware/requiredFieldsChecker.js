const databaseRequiredFields = {
    'leads': ['businessName']
}

const handleRequiredFields = (database, body) => {
    const requiredFields = databaseRequiredFields[database];
    if (!requiredFields) {
        return true;
    }
    return requiredFields.every(field => Object.prototype.hasOwnProperty.call(body, field));;
}

module.exports = handleRequiredFields;