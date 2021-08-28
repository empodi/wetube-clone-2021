import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => 
    res.render("join", { pageTitle: "Join" });


export const postJoin = async(req, res) => {

    const { name, email, username, password1, password2, location } = req.body;

    if (password1 !== password2) {
        return res.status(400).render("join", { 
            pageTitle: "Join",
            errorMessage: "Password confirmation does not match.", });
    }

    const usernameExists = await User.exists({ username });

    if (usernameExists) {
        return res.status(400).render("join", { 
            pageTitle: "Join",
            errorMessage: "This username is already taken.", });
    }

    const emailExists = await User.exists({ email });

    if (emailExists) {
        return res.status(400).render("join", {
            pageTitle: "Join",
            errorMessage: "This email is already taken.",
        });
    }

    console.log(req.body);

    try {
        await User.create({
            name,
            email,
            username,
            password:password1,
            location
        });
        return res.redirect("/login");

    } catch (error) {
        console.log(error);
        return res.status(400).render("join", {
            pageTitle: "Join",
            errorMessage: error._message,
        });
    }
}


export const getLogin = (req, res) => res.render("login", {
    pageTitle: "Log In",
});


export const postLogin = async(req, res) => {

    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).render("login", {
            pageTitle: "Log In",
            errorMessage: "username does not exist.",
        })
    }
        
    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
        return res.render("login", {
            pageTitle: "Log In",
            errorMessage: "Wrong password.",
        });
    }

    req.session.loggedIn = true;
    req.session.user = user;        //adding information to session

    return res.redirect("/");
}

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => res.send("Log Out");
export const see = (req, res) => res.send("See User");
