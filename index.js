(function() {
    const express = require("express");
    const app = express();
    const hb = require("express-handlebars");
    const db = require("./utils/db");
    const up = require("./utils/up");

    const cookieSession = require("cookie-session");
    const { hash, compare } = require("./utils/bc");
    const bc = require("./utils/bc");

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

    // app.use(function(req, res, next) {
    //     res.setHeader("x-frame-options", "DENY");
    //     res.locals.csrfToken = req.csrfToken();
    //     // req.locals.firstname = req.session.firstname
    //     next();
    // });

    // app.use(function(req, res, next) {
    //     res.locals.csrfToken = req.csrfToken();
    //     next();
    // });

    app.get("/", function(req, res) {
        res.redirect("/petition");
    });

    app.get("/petition", function(req, res) {
        res.render("petition", {
            layout: "main"

            // helpers: {
            //     exclaim(text) {
            //         return text + "returned text";
            //     }
            // }
        });
    });

    app.post("/petition", (req, res) => {
        console.log("request", req.body);
        console.log(req.session);
        let signature = req.body.signature;
        let user_id = req.session.id;
        if (req.session.sigId) {
            res.redirect("/thankyou");
        } else {
            db.addSignature(user_id, signature)
                .then(results => {
                    console.log(results);
                    req.session.sigId = results.rows[0].id;

                    res.redirect("/thankyou");
                    console.log("result", results.rows[0].id);
                })
                .catch(err => {
                    console.log("error of petition is: ", err);
                });
        }
    });

    app.get("/thankyou", function(req, res) {
        // if (!req.session.sigId || !req.session.id) {
        //     res.redirect("/login");
        // } else {

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
        // }
    });

    app.get("/signatures", function(req, res) {
        up.getCombined()
            .then(result => {
                console.log(result);
                let list = result.rows;
                console.log("list is ", list);
                res.render("signatures", {
                    layout: "main",

                    list
                });
            })
            .catch(err => {
                console.log(err);
            });
    });

    app.get("/login", function(req, res) {
        // hash("hello").then(hashedPassword => {
        //     console.log("hash: ", hashedPassword);
        //     res.redirect("/thanks");
        // });
        res.render("login", {
            layout: "main"
        });
    });

    app.post("/login", function(req, res) {
        let email = req.body.email;
        let pass = req.body.password;

        bc.getUser(email).then(result => {
            if (result.rows.length < 1) {
                console.log("this was true");
                res.render("login", {
                    layout: "main",
                    errormessage:
                        "oops, something went wrong, please try one more time."
                });
            } else {
                let checkPass = result.rows[0].password;
                console.log("pass is", result.rows[0]);

                compare(pass, checkPass)
                    .then(match => {
                        req.session.user_id = result.rows[0].id;
                        console.log("user id login", req.session.user_id);
                        console.log("results are", match);
                        if (match === true) {
                            console.log("working");
                            req.session.id = result.rows[0].id;
                            if (req.session.sigId) {
                                res.redirect("/thankyou");
                            }
                            if (!req.session.sigId) {
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
        });
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
        hash(pass).then(hashedPassword => {
            req.session.user_id;
            bc.addUser(first, last, email, hashedPassword).then(() => {
                if (!first && !last && !email && !pass) {
                    res.render("registration", {
                        layout: "main",
                        errormessage:
                            "oops, something went wrong, please try one more time."
                    });
                } else {
                    res.render("petition", {
                        layout: "main"
                    });
                }

                console.log(first, last, email, hashedPassword);
            });
        });
    });

    app.get("/", function(req, res) {
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
