(function() {
    const express = require("express");
    const app = express();
    const hb = require("express-handlebars");
    const db = require("./utils/db");
    const cookieSession = require("cookie-session");
    const { hash, compare } = require("./utils/bc");
    const bc = require("./utils/bc");

    // const dialog= document.getElementById("#dialog");
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
        let first_name = req.body.first;
        let last_name = req.body.last;
        let signature = req.body.signature;
        // if (req.session.sigId) {
        //     res.redirect("/thanks");
        // } else {
        if (first_name == "" || last_name == "" || !signature) {
            res.redirect("/petition");
        } else {
            db.addSignature(first_name, last_name, signature)
                .then(results => {
                    req.session.sigId = results.rows[0].id;
                    res.redirect("/thanks");
                    console.log("result", results.rows[0].id);
                })
                .catch(err => {
                    console.log(err);
                });
            // }
        }
    });

    app.get("/thanks", function(req, res) {
        if (!req.session.sigId) {
            res.redirect("/petition");
        } else {
            db.getSignature(req.session.sigId)
                .then(results => {
                    console.log(results.rows.length);
                    res.render("thanks", {
                        layout: "main",
                        signature: results.rows[0].signature,
                        numberOf: req.session.sigId,
                        first: results.rows[0].first_name,
                        last: results.rows[0].last_name
                    });
                })
                .catch(err => {
                    console.log(err);
                });
        }
    });

    app.get("/signatures", function(req, res) {
        db.getSignature(req.session.sigId)
            .then(rows => {
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
                console.log("pass is", pass);

                compare(pass, checkPass)
                    .then(match => {
                        console.log("results are", match);
                        if (match === true) {
                            console.log("working");
                            req.session.id = result.rows[0].id;
                        } else {
                            res.render("login", {
                                layout: "main",
                                errormessage:
                                    "oops, something went wrong, please try one more time."
                            });
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
            bc.addUser(first, last, email, hashedPassword).then(() => {
                console.log("hash: ", hashedPassword);
                // res.redirect("/thanks");
                res.render("registration", {
                    layout: "main"
                });
                console.log(first, last, email, hashedPassword);
            });
        });
    });

    app.listen(8080, () => console.log("running"));
})();
