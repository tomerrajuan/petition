(function() {
    const canvas = document.querySelector(".canvas");
    var inputfield= document.querySelector(".canvas_input");
    const c = canvas.getContext("2d");

    let signing = false;
    let x = 0;
    let y = 0;

    canvas.addEventListener("mousedown", function(pos) {
        console.log("clicked now");
        x = pos.clientX - canvas.offsetLeft;
        y = pos.clientY - canvas.offsetTop;
        signing = true;
    });
    canvas.addEventListener("mousemove", function(pos) {
        if (signing === true) {
            console.log("movingmouse");
            console.log(pos.clientX);

            c.beginPath();
            c.strokStyle = "black";
            c.lineWidth = 4;
            c.moveTo(x, y);
            x = pos.clientX - canvas.offsetLeft;
            y = pos.clientY - canvas.offsetTop;
            c.lineTo(x, y);
            c.stroke();
            c.closePath();
        }
    });
    canvas.addEventListener("mouseup", function() {
        if (signing === true) {
            x = 0;
            y = 0;
            signing = false;

            var myImage = canvas.toDataURL();
            inputfield.value = myImage;
            console.log(inputfield.value);
        }
    });
})();
