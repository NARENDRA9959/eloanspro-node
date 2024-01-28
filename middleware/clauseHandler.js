const createClauseHandler = (body) => {
    const columns = Object.keys(body).join(', ');
    const values = Object.values(body).map(value => `"${value}"`).join(', ');
    return [columns, values];
}

const updateClauseHandler = (body) => {
    return Object.keys(body).map(key => `${key} = "${body[key]}"`).join(', ');
}

module.exports = { createClauseHandler, updateClauseHandler };