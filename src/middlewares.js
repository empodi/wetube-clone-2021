export const localsMiddleware = (req, res, next) => {
    //console.log(req.session);
    //console.log("locals", res.locals);
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.loggedInUser = req.session.user;
    res.locals.siteName = "Wetube";
    //console.log("locals", res.locals);
    next();
}