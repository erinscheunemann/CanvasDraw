window.addEventListener("load", function(){
    const canvasElem = document.getElementById("draw"); // gets canvas element
    const clear = document.getElementById("clear"); // clear button
    const save = document.getElementById("save"); // save button
    const rgb = document.getElementById("color"); // gets color for shapes
    const size = document.getElementById("size") // gets size for shapes/lines

        
    let grid = canvasElem.getContext('2d'); // creates drawable canvas
    grid.beginPath(); // this makes the background white and not transparent
    grid.rect(0, 0, canvasElem.width, canvasElem.height);
    grid.strokeStyle = "white";
    grid.fillStyle = "white";
    grid.fill();
    grid.stroke();
    grid.lineCap = 'round'; 

    let icoord = {x: 0, y: 0}; // initial coordinate
    let ecoord = {x: 0, y: 0}; // end coordinate
    let flag = false; // needed so nothing is drawn with mouse move if the shape isnt free line


    canvasElem.addEventListener("mousedown", begin); 
    canvasElem.addEventListener("mousemove", during); 
    canvasElem.addEventListener("mouseup", end);  // if mouse up occurs outside canvas this is never called

    clear.addEventListener("click", function(){
        grid.clearRect(0,0, canvasElem.width, canvasElem.height);
        grid.rect(0, 0, canvasElem.width, canvasElem.height);
        grid.strokeStyle = "white";
        grid.fillStyle = "white";
        grid.fill();
        grid.stroke();}) //clears the canvas and remakes the background opaque

    save.addEventListener('click', function(e) {  // saves image as png
        const link = document.createElement('a');
        link.download = 'myImage.png';
        link.href = canvasElem.toDataURL();
        link.click();
        link.delete;
    });

    function begin(e) { // mousedown
        icoord.x  = e.clientX - canvasElem.offsetLeft; // sets initial coordinates
        icoord.y = e.clientY - canvasElem.offsetTop;
        
        grid.lineWidth = size.value;

        if(document.querySelector('input[name="shape"]:checked').value == 'free'){ // only want to begin path is line is squiqly
            grid.beginPath();
            grid.moveTo(icoord.x, icoord.y); // start squigly at initial coordinate
            flag = true;
        }
    } 

    function during(e){ // mouse over
        let x  = e.clientX - canvasElem.offsetLeft; // gets currrent corrdinates
        let y = e.clientY - canvasElem.offsetTop;

        if(flag){
            grid.lineTo(x, y); // small line from last coordinates to current coordinates (lines so small it will look squigly)
            grid.stroke();
        } 
    }

    function end(e){ // mouse up 
        ecoord.x  = e.clientX - canvasElem.offsetLeft; // sets end coordinates
        ecoord.y = e.clientY - canvasElem.offsetTop;

        grid.strokeStyle = rgb.value; // sets color of line
        

        let shape = document.querySelector('input[name="shape"]:checked').value; // gets shape to draw

        let width = -(icoord.x-ecoord.x); // width and height for rectangles
        let height = -(icoord.y-ecoord.y);

        switch (shape) {
            case 'line': // straight line drawn
                grid.beginPath();
                grid.moveTo(icoord.x, icoord.y);
                grid.lineTo(ecoord.x, ecoord.y);
                grid.stroke();
                break;
            case 'hrect': // hollow rectangle drawn
                grid.strokeRect(icoord.x, icoord.y, width, height);
                break;
            case 'frect': // filled rectangle drawn
                grid.beginPath();
                grid.rect(icoord.x, icoord.y, width, height);
                grid.fillStyle = rgb.value;
                grid.fill();
                grid.stroke();
                break;
            case 'free': // only needs stroke because beginpath and lineto are in begin and during
                grid.lineTo(ecoord.x, ecoord.y);
                grid.stroke();
                flag = false;
                break;
            default: // technically dont need since one is always going to be checked but nice for troubleshooting
                console.log("shape: "+shape+" was not found");
                break;
        }

    }
})