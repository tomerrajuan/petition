(function() {
    const express = require("express");
    const app = express();
    const hb = require("express-handlebars");
    const db = require("./utils/db");
    const up = require("./utils/up");

    const cookieSession = require("cookie-session");
    const { hash, compare } = require("./utils/db");

    // const csurf = require("csurf");
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

    // app.use(csurf());

    app.use(function(req, res, next) {
        res.set("x-frame-options", "DENY");
        // res.locals.csrfToken = req.csrfToken();
        // req.locals.firstname = req.session.firstname
        next();
    });

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
                        // req.session.user_id;
                        res.redirect("petition");
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

        db.getUser(email).then(result => {
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
                            console.log("result are",result);
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
        }).catch(err => {
            console.log("error while getUser",err);
        });
    });

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
                // console.log("result", results.rows[0].id);
            })
            .catch(err => {
                console.log("error of petition is: ", err);
            });
    });

    app.get("/thankyou", function(req, res) {
        console.log("req.session",req.session);
        if (req.session.signature == null) {
            if (!req.session.sigId) {
                res.redirect("/login");
            }
        } else {
            db.getSignature(req.session.sigId)
                .then(results => {
                    console.log(results.rows.length);
                    res.render("thankyou", {
                        layout: "main",
                        signature: results.rows[0].signature,
                        numberOf: req.session.sigId
                    });
                })
                .catch(err => {
                    console.log("error of thankyou is: ", err);
                });
        }
    });

    app.get("/signatures", function(req, res) {
        // let user_id = req.session.u_id;
        up.getCombined()
            .then(result => {
                console.log(result);

                let first = result.rows.first;
                let last = result.rows.last;
                let city = result.rows.city;
                let age = result.rows.age;

                res.render("signatures", {
                    layout: "main",
                    first: first,
                    last: last,
                    city: city,
                    age: age
                });
            })
            .catch(err => {
                console.log(err);
            });
    });

    app.get("/logout", function(req, res) {
        req.session = null;
        res.redirect("/login");
    });

    // app.post("/profile", function(req, res) {
    //     res.render("profile", {
    //         layout: "main"
    //
    //         // helpers: {
    //         //     exclaim(text) {
    //         //         return text + "returned text";
    //         //     }
    //         // }
    //     });
    // });

    app.get("/profile", function(req, res) {
        let user_id = req.session.user_id;
        console.log("user id is: ", user_id);

        up.getCombined(user_id)
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

        up.addProfile()
            .then(results => {
                console.log(results);
                res.render("petition", {
                    layout: "main"
                });
            })
            .catch(err => {
                console.log(err);
            });
    });

    app.listen(process.env.PORT || 8080, () => console.log("running"));
})();
