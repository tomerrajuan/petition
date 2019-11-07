const express = require("express");
const app = express();
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.get("/", function(req, res) {
    res.render("home", {
        layout: "main",
        // helpers: {
        //     exclaim(text) {
        //         return text + "returned text";
        //     }
        // }
    });
});

app.get("/signatures", function(req, res) {
    res.render("signatures", {
        layout: "main",
        // helpers: {
        //     exclaim(text) {
        //         return text + "returned text";
        //     }
        // }
    });
});

app.get("/", function(req, res) {
    res.render("home", {
        layout: "main",
        // helpers: {
        //     exclaim(text) {
        //         return text + "returned text";
        //     }
        // }
    });
});


// app.get("/projects/:projName", function(req, res) {
//
//     const { projName } = req.params;
//     const selectedProject = projects.find(item => item.directory == projName);
//
//     if (!selectedProject) {
//         console.log("not found");
//         return res.sendStatus(404);
//     } else {
//         res.render("description", {
//             layout: "main",
//             projects: projects,
//             route: selectedProject
//         });
//     }
// });

app.listen(8080, () => console.log("something else"));
