const errorHandler = (err, req, res, next) => {
   
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`[ERROR] ${req.method} ${req.url} - ${message}`);
    if (statusCode === 500) console.error(err.stack);


    return res
        .status(statusCode)
        .json({
            status: statusCode,
            success: false, 
            message: message,
            data: err.info || err.errors || null,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined
        });
};


export default errorHandler;