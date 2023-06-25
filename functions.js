window.addEventListener("load", function(){ // only works when page is fully loaded
    const canvasElem = document.getElementById("draw1"); // gets background's canvas element
    const clear = document.getElementById("clear"); // clear button
    const save = document.getElementById("save"); // save button
    const add = document.getElementById("addLayer"); // add layer button
    const rgb = document.getElementById("color"); // gets color for shapes
    const size = document.getElementById("size"); // gets size for shapes/lines
    const eraser = document.getElementById("eraser"); // gets erasing status 
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
    // need to keep track of what layers are being undone and redone. 
    let icoord = {x: 0, y: 0}; // initial coordinate
    let ecoord = {x: 0, y: 0}; // end coordinate
    let flag = false; // needed so nothing is drawn with mouse move if the shape isnt free line
    let flag2 = false; // needed so nothing is drawn with during/end if begin doesnt happen
    let grid = grid1; // default to grid one 

    // UNDO and REDO TEST
    const undoButton = document.getElementById("undo");
    const redoButton = document.getElementById("redo");
    const maxUndos = 5;
    let undo = [];
    let redo = [];
    

    // background layer event listeners initialized
    canvasElem.addEventListener("mousedown", begin); 
    canvasElem.addEventListener("mousemove", during); 
    canvasElem.addEventListener("mouseup", end);  // if mouse up occurs outside canvas this is never called
    canvasElem.addEventListener("mouseleave", end); // but this is 

    // checkbox visibility background eventlistener initialized
    let visibility = document.getElementById("vis1");
    visibility.addEventListener("change", changeVisibility);

    undoButton.addEventListener("click", function(){
        if ( redo.length >= maxUndos || undo.length < 1){  // check if an undo can be preformed
            alert("NO MORE UNDOS LEFT!");
            return;
        }
        let replacement = undo.pop();
        // SAVE CURRENT LAYER STATE TO REDO PILE 
        let redoCanvas = document.createElement("canvas");
        redoCanvas.width = 500;
        redoCanvas.height = 300;
        let redoGrid = redoCanvas.getContext('2d');
        let can = document.getElementById("draw"+replacement[1]); // need to FIX LOL ARGH like do i need to change when image is loaded lol??? TODO
        redoGrid.drawImage(can,0,0);
        redo.push([redoCanvas, replacement[1]]);
        // END SAVE TO REDO PILE 
        // REPLACE LAYER WITH LAST ON UNDO PILE
        let g = eval("grid"+replacement[1]); // this is fine?
        g.clearRect(0,0, canvasElem.width, canvasElem.height);
        g.drawImage(replacement[0], 0, 0);
    });

    redoButton.addEventListener("click", function(){
        if ( undo.length >= maxUndos || redo.length < 1){  // check if an undo can be preformed
            alert("NO MORE REDOS LEFT!");
            return;
        }
        let replacement = redo.pop();
        // SAVE CURRENT LAYER STATE TO UNDO PILE 
        let undoCanvas = document.createElement("canvas");
        undoCanvas.width = 500;
        undoCanvas.height = 300;
        let undoGrid = undoCanvas.getContext('2d');
        let can = document.getElementById("draw"+replacement[1]); // NEED TO FIX TODO
        undoGrid.drawImage(can,0,0);
        undo.push([undoCanvas, replacement[1]]);
        // END SAVE TO UNDO PILE 
        // REPLACE LAYER WITH LAST ON UNDO PILE
        let g = eval("grid"+replacement[1]); // this is fine?
        g.clearRect(0,0, canvasElem.width, canvasElem.height);
        g.drawImage(replacement[0], 0, 0);
    });

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

    clear.addEventListener("click", function(){ // clears all layers
        for (i=1; i <= nextLayer; i++) {
            let g = eval("grid"+i);
            g.clearRect(0,0, canvasElem.width, canvasElem.height);
        }
    });

    save.addEventListener('click', function() {  // condenses all layers and saves image as png
        const link = document.createElement('a');
        link.download = prompt("Please name your image!", "yourDrawing") + ".png"; 
        let canvas = document.createElement("canvas");
        canvas.width = 500;
        canvas.height = 300;
        let image = canvas.getContext('2d');
        for (i=1; i <= nextLayer; i++) { // TODO: make sure to only add if layer is not hidden 
            let can = document.getElementById("draw"+i);
            image.drawImage(can, 0, 0);
        }
        link.href = canvas.toDataURL();
        link.click();
        link.delete;
    });

    function changeVisibility(e) { // hides canvas if unchecked and unhides if checked again
        let layer = this.value;
        let visStatus = this.checked;
        let canvas = document.getElementById("draw" + layer);            
        if ( visStatus == 1 ) {
            canvas.style.visibility = 'visible';

        } else {
            canvas.style.visibility = 'hidden';
        }
    }


    function begin(e) { // mousedown
        let layer = document.querySelector('input[name="layer"]:checked').value // gets what layer user is working on
        grid = eval("grid" + layer) // sets grid to correct layer 

        // SAVE CURRENT LAYER STATE TO UNDO PILE 
        let undoCanvas = document.createElement("canvas");
        undoCanvas.width = 500;
        undoCanvas.height = 300;
        let undoGrid = undoCanvas.getContext('2d');
        let can = document.getElementById("draw"+layer);
        undoGrid.drawImage(can,0,0);
        if(undo.length >= maxUndos) {
            undo = undo.slice(1);
        }
        undo.push([undoCanvas, layer]);
        // END SAVE TO UNDO PILE 

        flag2 = true;

        icoord.x  = e.clientX - easel.offsetLeft; // sets initial coordinates
        icoord.y = e.clientY - easel.offsetTop;

        grid.lineWidth = size.value;
        
        if (eraser.checked == 1) {  // sets erasing status 
            grid.globalCompositeOperation = "destination-out";
        } else {
            grid.globalCompositeOperation = "source-over";
        }

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
