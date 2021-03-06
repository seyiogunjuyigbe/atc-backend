const getJWT =  require('../services/jwtService');

module.exports = function(req, res, next) {
    
    if (req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {

            const scheme = parts[0];
            const credentials = parts[1];
            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
                getJWT.decodeToken(token, function (err, decoded){
                    if (err) {
                        //return res.json(401, {response: {message: err.message}});
                        return res.status(401).json({response: {message: err.message}});
                    }
                    req.user = decoded;
                    next();
                });
            } else {
               // return res.json(401, {response: {message: 'Format is Authorization: Bearer [token]'}});
                return res.status(401).json({response: {message: 'Format is Authorization: Bearer [token]'}});
                
            }
        } else {
           // return res.json(401, {response: {message: 'Format is Authorization: Bearer [token]'}});
            return res.status(401).json({response: {message: 'Format is Authorization: Bearer [token]'}});
        }
    }
    else {
       //return res.json(401, {response: {message: 'No Authorization header was found'}});
        return res.status(401).json({response: {message: 'No Authorization header was found'}});
    }
};