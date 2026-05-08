import ApiError from "../utils/ApiError.js"

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            params: req.params,
            query: req.query
        });
        
        return next();
    } catch (error) {
       
        return next(new ApiError(400, "Validation error", error.issues || error.message));
    }
}

export default validate;