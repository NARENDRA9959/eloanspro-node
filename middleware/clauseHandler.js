const createClauseHandler = (body) => {
    const columns = Object.keys(body).join(', ');
    const values = Object.values(body).map(value => `"${value}"`).join(', ');
    return [columns, values];
}

const updateClauseHandler = (body) => {
    // return Object.keys(body).map(key => `${key} = "${body[key]}"`).join(', ');
    return Object.keys(body).map(key => {
        if (Array.isArray(body[key])) {
            const arrayValues = JSON.stringify(body[key].map(value => value.replace(/\\/g, '/')));
            return `${key} = '${arrayValues}'`;
        } else {
            return `${key} = "${body[key]}"`;
        }
    }).join(', ');
}

module.exports = { createClauseHandler, updateClauseHandler };