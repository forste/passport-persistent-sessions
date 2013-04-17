
/*
 * GET users listing.
 */

exports.list = function(req, res){
    if(!req.session.passport || !req.session.passport.user) {
        console.log('session not authenticated');
        return res.send("respond with a resource");
    }
    return res.send('user'+req.session.passport.user);
};