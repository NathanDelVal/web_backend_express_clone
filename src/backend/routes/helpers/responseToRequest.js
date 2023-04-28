
module.exports = {
    responseForRequest: (msg, status, error, data) => {
        var response = {
            msg: null,
            status: null,
            error: null,
            data: null
        };
        
        msg    ? response.msg    = msg    : response.msg    = null;
        status ? response.status = status : response.status = false;
        error  ? response.error  = error  : response.error  = null;
        data   ? response.data   = data   : response.data   = null;
        
        return response;
    },

 
}
