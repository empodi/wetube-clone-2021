import User from "../models/User";
import bcrypt from "bcrypt";
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

export const startKakaoLogin = (req, res) => {

    const baseUrl = "https://kauth.kakao.com/oauth/authorize";

    const kakao = {
        client_id: process.env.KAKAO_CLIENT,
        //client_secret: process.env.KAKAO_SECRET,
        response_type: "code",
        redirect_uri: "http://localhost:8181/users/kakao/finish",
        scope: "profile_nickname,account_email,gender",
    };

    const params = new URLSearchParams(kakao).toString();

    const finalUrl = `${baseUrl}?${params}`;

    return res.redirect(finalUrl);
}

export const finishKakaoLogin = async(req, res) => {

    const baseUrl = "https://kauth.kakao.com/oauth/token";

    const config = {
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT,
        client_secret: process.env.KAKAO_SECRET,
        redirect_uri: "http://localhost:8181/users/kakao/finish",
        code:req.query.code,
    };

    const params = new URLSearchParams(config).toString();

    const finalUrl = `${baseUrl}?${params}`;

    const tokenRequest = await (
        await fetch(finalUrl, {
            method:"POST",
            headers: {
                "content-type":"application/x-www-form-urlencoded;charset=utf-8",
            },
        })
    ).json();

    const { access_token } = tokenRequest;

    if (access_token !== null) {

        const userData = await (
            await fetch("https://kapi.kakao.com/v2/user/me", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            })
        ).json();

        
        const email = userData.kakao_account.email;
        const username = email.split("@")[0];
        const name = userData.properties.nickname;

        if (!email) {
            return res.render("login", {
                pageTitle: "Log In",
                errorMessage: "Cannot get email from your Kakao Account",
            });
        }
        
        let user = await User.findOne({
            email: email
        });

        if (!user) {
            user = await User.create({
                name: name,
                email: email,
                username: username,
                password: "",
                socialOnly: true,
                location: ""
            });
        }

        req.session.loggedIn = true;
        req.session.user = user;

        return res.redirect("/");

    } else {
        return res.redirect("/login");
    }
}

export const logout = (req, res) => res.send("Log Out");
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const see = (req, res) => res.send("See User");
