export const localsMiddleware = (req, res, next) => {
    //console.log(req.session);
    //console.log("locals", res.locals);
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.loggedInUser = req.session.user;
    res.locals.siteName = "Wetube";
    console.log(res.locals.loggedInUser);
    //console.log("locals", res.locals);
    next();
}

export const protectorMiddleware = (req, res, next) => { // only logged in user can go to edit-profile page

    if (req.session.loggedIn === true) {
        return next();
    } else {
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req, res, next) => { // if you're logged in, you don't have to go to log-in page

    if (!req.session.loggedIn) {
        return next();
    } else {
        return res.redirect("/");
    }
}