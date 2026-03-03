import ApiError from "../utils/ApiError.js";

const validate = (schema, property = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((err) => err.message);
            return next(new ApiError(400, "Validation Error", errors));
        }

        Object.assign(req[property], value);
        
        next();
    };
};

export default validate;