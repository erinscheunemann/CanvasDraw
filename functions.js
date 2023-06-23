window.addEventListener("load", function(){ // only works when page is fully loaded
    const canvasElem = document.getElementById("draw1"); // gets background's canvas element
    const clear = document.getElementById("clear"); // clear button
    const save = document.getElementById("save"); // save button
    const add = document.getElementById("addLayer"); // add layer button
    const rgb = document.getElementById("color"); // gets color for shapes
    const size = document.getElementById("size"); // gets size for shapes/lines
    const easel = this.document.getElementById("easel"); // div with canvases 

    let grid1 = canvasElem.getContext('2d'); // creates drawable canvas
    grid1.beginPath(); // this makes the background white and not transparent
    grid1.rect(0, 0, canvasElem.width, canvasElem.height);
    grid1.strokeStyle = "white";
    grid1.fillStyle = "white";
    grid1.fill(); 
    grid1.stroke();
    grid1.lineCap = 'round'; 

    let nextLayer = 1; // initializes layer count
    let icoord = {x: 0, y: 0}; // initial coordinate
    let ecoord = {x: 0, y: 0}; // end coordinate
    let flag = false; // needed so nothing is drawn with mouse move if the shape isnt free line
    let flag2 = false; // needed so nothing is drawn with during/end if begin doesnt happen
    let grid = grid1; // default to grid one 

    // background layer event listeners initialized
    canvasElem.addEventListener("mousedown", begin); 
    canvasElem.addEventListener("mousemove", during); 
    canvasElem.addEventListener("mouseup", end);  // if mouse up occurs outside canvas this is never called
    canvasElem.addEventListener("mouseleave", end); // but this is 

    // checkbox visibility background eventlistener initialized
    let visibility = document.getElementById("vis1");
    visibility.addEventListener("change", changeVisibility);

    add.addEventListener("click", function(){
        nextLayer += 1; // advance count by one
        let layerDiv = document.getElementById("chooseLayer"); // get div for layer control
        // add break 
        let br = document.createElement("br");
        layerDiv.appendChild(br);
        // add label for new layer
        let newLabel = document.createElement("label");
        newLabel.for = nextLayer;
        newLabel.innerText = "Layer " + nextLayer
        layerDiv.appendChild(newLabel);
        // add radio button for new layer
        let newRadio = document.createElement("input");
        newRadio.type = "radio";
        newRadio.id = nextLayer;
        newRadio.name = "layer";
        newRadio.value = nextLayer;
        layerDiv.appendChild(newRadio);
        // add checkbox for visibility of new layer
        let newCheck = document.createElement("input");
        newCheck.type = "checkbox"
        newCheck.id = "vis" + nextLayer;
        newCheck.value = nextLayer;
        newCheck.checked = true;
        layerDiv.appendChild(newCheck)
        // add canvas element for new layer
        let easel = document.getElementById("easel");
        let newCanvas = document.createElement("canvas");
        newCanvas.style = "border: 1px black solid; position: absolute; top: 0px; left: 0px;";
        newCanvas.width = 500;
        newCanvas.height = 300;
        newCanvas.id = "draw" + nextLayer;
        easel.appendChild(newCanvas);
        // create grid for new canvas element
        window["grid" + nextLayer] = newCanvas.getContext('2d'); // creates drawable canvas
        window["grid" + nextLayer].lineCap = "round";
        // add event listeners
        // add change event to visibility checkbox
        newCheck.addEventListener("change", changeVisibility);
        // add mouse event listeners to new canvas
        newCanvas.addEventListener("mousedown", begin); 
        newCanvas.addEventListener("mousemove", during); 
        newCanvas.addEventListener("mouseup", end);  // if mouse up occurs outside canvas this is never called
        newCanvas.addEventListener("mouseleave", end); // but this is 
    });

    clear.addEventListener("click", function(){ // clears the layer that is selected
        grid.clearRect(0,0, canvasElem.width, canvasElem.height);
    });

    // TODO make this condense all layers and save???
    save.addEventListener('click', function() {  // saves image as png
        const link = document.createElement('a');
        link.download = 'myImage.png'; 
        link.href = canvasElem.toDataURL();
        link.click();
        link.delete;
    });

    function changeVisibility(e) { // hides canvas if unchecked and unhides if checked again
        let layer = this.value;
        let visStatus = this.checked;
        let canvas = document.getElementById("draw" + layer);            
        if ( visStatus == 1 ) {
            console.log(layer, " is checked");
            canvas.style.visibility = 'visible';

        } else {
            console.log(layer, " is not checked");
            canvas.style.visibility = 'hidden';
        }
        console.log(canvas);
    }


    function begin(e) { // mousedown
        let layer = document.querySelector('input[name="layer"]:checked').value // gets what layer user is working on
        grid = eval("grid" + layer) // sets grid to correct layer 

        flag2 = true;

        icoord.x  = e.clientX - easel.offsetLeft; // sets initial coordinates
        icoord.y = e.clientY - easel.offsetTop;

        grid.lineWidth = size.value;

        if(document.querySelector('input[name="shape"]:checked').value == 'free'){ // only want to begin path is line is squiqly
            grid.beginPath();
            grid.moveTo(icoord.x, icoord.y); // start squigly at initial coordinate
            flag = true;
        }
    } 

    function during(e){ // mouse over
        let x  = e.clientX - easel.offsetLeft; // gets currrent corrdinates 
        let y = e.clientY - easel.offsetTop;

        if(flag && flag2){
            grid.lineTo(x, y); // small line from last coordinates to current coordinates (lines so small it will look squigly)
            grid.stroke();
        } 
    }

    function end(e){ // mouse up or mouse leave
        ecoord.x  = e.clientX - easel.offsetLeft; // sets end coordinates
        ecoord.y = e.clientY - easel.offsetTop;

        grid.strokeStyle = rgb.value; // sets color of line
        

        let shape = document.querySelector('input[name="shape"]:checked').value; // gets shape to draw

        let width = -(icoord.x-ecoord.x); // width and height for rectangles
        let height = -(icoord.y-ecoord.y);


        if (flag2) {
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
        flag2 = false;
    }
})
