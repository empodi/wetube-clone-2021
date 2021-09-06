import User from "../models/User";
import bcrypt from "bcrypt";
import { json } from "express";
import fetch from "node-fetch";

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

    const user = await User.findOne({ username, socialOnly:false });

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

export const startGithubLogin = (req, res) => {
    
    const baseUrl = "https://github.com/login/oauth/authorize";

    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    };
    
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;

    return res.redirect(finalUrl);
}


export const finishGithubLogin = async(req, res) => {

    const baseUrl = "https://github.com/login/oauth/access_token";

    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };

    const params = new URLSearchParams(config).toString();

    const finalUrl = `${baseUrl}?${params}`;

    const tokenRequest = await (
        await fetch(finalUrl, {
            method:"POST",
            headers: {
                Accept: "application/json",
            },
        })
    ).json();

    const { access_token } = tokenRequest;

    if (access_token !== null) {

        const apiUrl = "https://api.github.com";

        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
        })).json();

        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
        })).json();

        const emailObj = emailData.find(
            email => email.primary === true && email.verified === true
        );

        if (!emailObj) {
            return res.redirect("/login");
        }

        let user = await User.findOne(
            {email:emailObj.email}
        );

        if (!user) {
            user = await User.create({
                name: userData.name,
                avatarUrl: userData.avatar_url,
                email: emailObj.email,
                username: userData.login,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;  
        return res.redirect("/");

    } else {
        return res.redirect("/login");
    }
}


export const getEdit = (req, res) => {

    return res.render("edit-profile", {
        pageTitle: "Edit Profile",
    });
}


export const postEdit = (req, res) => {

    
}


export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
}
export const see = (req, res) => res.send("See User");
