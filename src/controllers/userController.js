export const getJoin = (req, res) => 
    res.render("join", { pageTitle: "Join" });
export const postJoin = (req, res) => res.render();
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const login = (req, res) => res.send("Log In");
export const logout = (req, res) => res.send("Log Out");
export const see = (req, res) => res.send("See User");
