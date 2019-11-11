(function() {
    const express = require("express");
    const app = express();
    const hb = require("express-handlebars");
    const db = require("./utils/db");
    const cookieSession = require("cookie-session");
    const { hash, compare } = require("./utils/bc");
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
        res.redirect("/home");
    });

    app.get("/home", function(req, res) {
        res.render("home", {
            layout: "main"

            // helpers: {
            //     exclaim(text) {
            //         return text + "returned text";
            //     }
            // }
        });
    });

    app.post("/home", (req, res) => {
        console.log("request", req.body);
        let first_name = req.body.first;
        let last_name = req.body.last;
        let signature = req.body.signature;
        // if (req.session.sigId) {
        //     res.redirect("/thanks");
        // } else {
        if (first_name == "" || last_name == "" || !signature) {
            res.redirect("/home");
            // dialog.show();
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
            res.redirect("/home");
        } else {
            db.getSignature(req.session.sigId)
                .then(results => {
                    console.log(results.rows.length);

                    res.render("thanks", {
                        layout: "main",
                        signature: results.rows[0].signature,
                        numberOf: results.rows[0].id,
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
        res.render("signatures", {
            layout: "main"

            // helpers: {
            //     exclaim(text) {
            //         return text + "returned text";
            //     }
            // }
        });
    });

    //should happen in the post
    app.get("/register", function(req, res) {
        hash("hello").then(hashedPassword => {
            console.log("hash: ", hashedPassword);
            res.redirect('/thanks');
        });
        res.render("signatures", {
            layout: "main"

            // helpers: {
            //     exclaim(text) {
            //         return text + "returned text";
            //     }
            // }
        });
    });

    app.listen(8080, () => console.log("running"));
})();
