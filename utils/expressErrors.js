class ExpressError extends Error{
    constructor(messgae, status){
        super();
        this.message = messgae;
        this.statusCode = status;
    }
}

module.exports = ExpressError;