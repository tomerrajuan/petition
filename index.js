(function() {
    const express = require("express");
    const app = express();
    const hb = require("express-handlebars");
    const db = require("./utils/db");
    const up = require("./utils/up");

    const cookieSession = require("cookie-session");
    const { hash, compare } = require("./utils/db");

    const csurf = require("csurf");
    app.engine("handlebars", hb());
    app.set("view engine", "handlebars");
    app.use(express.static("./public"));

    ////////////// SECURITY AND COOKIES //////////////
    app.use(
        cookieSession({
            maxAge: 1000 * 60 * 60 * 24 * 14,
            secret: "sessionSecret"
        })
    );
    app.use(
        express.urlencoded({
            extended: false
        })
    );

    app.use(csurf());

    app.use(function(req, res, next) {
        res.set("x-frame-options", "DENY");
        res.locals.csrfToken = req.csrfToken();
        // req.locals.firstname = req.session.firstname
        next();
    });

    // app.use((req, res, next) => {
    //     if (
    //         !req.session.user_id &&
    //         req.url != "/registration" &&
    //         req.url != "/login"
    //     ) {
    //         res.redirect("/registration");
    //     } else {
    //         next();
    //     }
    // });

    // function requireUserLoggedOut(res, req, next) {
    //     if (req.sesssion.user_id) {
    //         res.redirect("/petition");
    //     } else {
    //         next();
    //     }
    // }
    //
    // function requireSignature(res, req, next) {
    //     if (!req.sesssion.sigId) {
    //         res.redirect("/petition");
    //     } else {
    //         next();
    //     }
    // }

    app.get("/", function(req, res) {
        res.redirect("/login");
    });

    app.get("/registration", function(req, res) {
        res.render("registration", {
            layout: "main"
        });
    });

    app.post("/registration", function(req, res) {
        let first = req.body.first;
        let last = req.body.last;
        let email = req.body.email;
        let pass = req.body.password;
        hash(pass)
            .then(hashedPassword => {
                // console.log("user_id",req.session.user_id);
                if (!first && !last && !email && !hashedPassword) {
                    console.log(req.session);
                    res.render("registration", {
                        layout: "main",
                        errormessage:
                            "oops, something went wrong, please try one more time."
                    });
                } else {
                    db.addUser(first, last, email, hashedPassword).then(id => {
                        console.log("id is", id);
                        req.session.user_id = id.rows[0].id;
                        res.redirect("/petition");
                    });
                }
            })
            .catch(err => {
                console.log("err at registrationis", err);
            });
    });

    app.get("/login", function(req, res) {
        res.render("login", {
            layout: "main"
        });
    });

    app.post("/login", function(req, res) {
        let email = req.body.email;
        let pass = req.body.password;

        db.getUser(email)
            .then(result => {
                if (result.rows.length < 1) {
                    res.render("login", {
                        layout: "main",
                        errormessage:
                            "oops, something went wrong, please try one more time."
                    });
                } else {
                    let checkPass = result.rows[0].password;

                    compare(pass, checkPass)
                        .then(match => {
                            if (match === true) {
                                console.log("result are", result);
                                req.session.user_id = result.rows[0].user_id;

                                req.session.sigId = result.rows[0].id;

                                if (req.session.user_id) {
                                    console.log("we are here");
                                    res.redirect("/thankyou");
                                } else {
                                    res.redirect("/petition");
                                }
                            }
                        })
                        .catch(err => {
                            res.render("login", {
                                layout: "main",
                                errormessage:
                                    "oops, something went wrong, please try one more time."
                            });
                            console.log("error", err);
                        });
                }
            })
            .catch(err => {
                console.log("error while getUser", err);
            });
    });

    // app.get("/more-info", function(req, res) {
    //     let user_id = req.session.user_id;
    //     if (req.session.profileAdded) {
    //         res.redirect("/petition");
    //         // let url= req.body.url;
    //         // if (!url.startsWith("https://")){
    //         //     url = "https://" + req.body.url;
    //     } else {
    //         console.log("user id is: ", user_id);
    //         res.render("more-info", {
    //             layout: "main"
    //         });
    //     }
    // });
    //
    // app.post("/more-info", function(req, res) {
    //     let user_id = req.session.user_id;
    //
    //     console.log("req.session in more-info", req.session);
    //     console.log("more-info body", req.body.url);
    //     if (req.body.age == "") {
    //         req.body.age == null;
    //     up.addProfile(req.body.age, req.body.city, req.body.url, user_id)
    //         .then(result => {
    //             console.log("results on more info are ", result);
    //             req.session.profileAdded = "added";
    //         })
    //         .catch(err => {
    //             console.log("error at more-info post req", err);
    //         });
    //     }
    //     res.redirect("/petition");
    //
    // });

    app.get("/petition", function(req, res) {
        if (req.session.sigId) {
            console.log("session: ", req.session);
            res.redirect("/thankyou");
        } else {
            res.render("petition", {
                layout: "main"
            });
        }
    });

    app.post("/petition", (req, res) => {
        console.log("request", req.body);
        let user_id = req.session.user_id;
        let signature = req.body.signature;

        db.addSignature(user_id, signature)
            .then(({ rows }) => {
                console.log("rows are:", rows);
                req.session.sigId = rows[0].id;

                res.redirect("/thankyou");
            })
            .catch(err => {
                console.log("error of petition is: ", err);
            });
    });

    app.get("/thankyou", function(req, res) {
        if (!req.session.user_id) {
            res.redirect("/login");
        } else {
            db.getSignature(req.session.sigId)
                .then(signature => {
                    up.selectCount()
                        .then(count => {
                            console.log(
                                "results thank you",
                                req.session,
                                signature,
                                count
                            );
                            res.render("thankyou", {
                                layout: "main",
                                signature: signature.rows[0].signature,
                                numberOf: count.rows[0].count
                            });
                        })
                        .catch(err => {
                            console.log(err);
                        });
                })
                .catch(err => {
                    console.log("error at edit without pass", err);
                });
        }
    });

    app.get("/signatures", function(req, res) {
        up.getCombined()
            .then(({ rows }) => {
                console.log("results of getCombined are :", rows);
                let list = rows;

                res.render("signatures", {
                    layout: "main",
                    list
                });
            })
            .catch(err => {
                console.log(err);
            });
    });

    app.get("/signatures/:cities", function(req, res) {
        const { cities } = req.params;
        console.log("we are at", req.params);
        up.getSignersCity(cities).then(results => {
            let list = results.rows;
            console.log("getSignersByCity result: ", results.rows);
            res.render("cities", {
                layout: "main",
                list
            });
        });
    });

    app.get("/unsign", function(req, res) {
        req.session.sigId = null;
        console.log(req.session);
        up.deleteSignature(req.session.user_id);
        res.redirect("/petition");
    });

    app.get("/logout", function(req, res) {
        req.session = null;
        res.redirect("/login");
    });

    app.get("/profile", function(req, res) {
        let user_id = req.session.user_id;
        console.log("user id is: ", user_id);

        up.getCombinedProfile(user_id)
            .then(info => {
                console.log("info is: ", info);
                res.render("profile", {
                    layout: "main",
                    first: info.rows[0].first,
                    last: info.rows[0].last,
                    email: info.rows[0].email,
                    age: info.rows[0].age,
                    city: info.rows[0].city,
                    url: info.rows[0].url
                });
            })
            .catch(err => {
                console.log("error at info: ", err);
            });
    });

    app.post("/profile", function(req, res) {
        res.render("profile", {
            layout: "main"
        });
    });

    app.get("/profile/edit", function(req, res) {
        let user_id = req.session.user_id;
        console.log("user id is: ", user_id);
        up.getCombinedProfile(user_id)
            .then(info => {
                // let list = info.rows[0];
                console.log("info is: ", info);
                res.render("edit", {
                    layout: "main",
                    first: info.rows[0].first,
                    last: info.rows[0].last,
                    email: info.rows[0].email,
                    age: info.rows[0].age,
                    city: info.rows[0].city,
                    url: info.rows[0].url
                });
            })
            .catch(err => {
                console.log("error at info: ", err);
            });
    });

    app.post("/profile/edit", function(req, res) {
        console.log("req.body in profile", req.body);
        let user_id = req.session.user_id;
        console.log("req.session in profile", req.session);
        let pass = req.body.password;
        if (!pass == "") {
            hash(pass).then(hashedPassword => {
                Promise.all([
                    up.addProfileUsersPass(
                        req.body.first,
                        req.body.last,
                        req.body.eamil,
                        hashedPassword,
                        user_id
                    ),
                    up.addProfile(
                        req.body.age,
                        req.body.city,
                        req.body.url,
                        user_id
                    )
                ])
                    .then(result => {
                        console.log(result);
                        res.redirect("/thankyou");
                    })
                    .catch(err => {
                        console.log("error at hashedPasswordsend", err);
                    });
            });
        } else {
            Promise.all([
                up.addProfileUsers(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    user_id
                ),

                up.addProfile(
                    req.body.age,
                    req.body.city,
                    req.body.url,
                    user_id
                )
            ])
                .then(result => {
                    console.log(result);
                    res.redirect("/thankyou");
                })
                .catch(err => {
                    console.log("error at edit without pass", err);
                });
        }
    });

    app.listen(process.env.PORT || 8080, () => console.log("running"));
})();
