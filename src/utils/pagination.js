export const getPagination = ( query ) => {
    const page = parseInt( query.page ) || 1;
    const limit = parseInt( query.limit ) || 10;
    const skip = ( page - 1 ) * limit;

    const sortBy = query.sortBy || "createdAt";
    const order = query.order === "asc" ? 1 : -1; 

    const sort = { [sortBy]: order };

    return {
        page,
        limit,
        skip,
        sort
    };
}