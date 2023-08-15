function Sillay() { // this just turns the webpage upside down
    let doc = document.querySelector("head")
    // doc.innerHTML += "<style> *{ transform: rotate(180deg) } </style>"
    doc.innerHTML += "<style> *:not([id=\"easel\"]){ transform: rotate(180deg) } </style>"
}

window.addEventListener("load", function(){ // only works when page is fully loaded
    const whiteground = document.getElementById("whiteground"); // gets true uneditable background's canvas element
    const canvasElem = document.getElementById("draw1"); // gets background's canvas element
    const clear = document.getElementById("clear"); // clear button
    const save = document.getElementById("save"); // save button
    const add = document.getElementById("addLayer"); // add layer button
    const rgb = document.getElementById("color"); // gets color for shapes
    const size = document.getElementById("size"); // gets size for shapes/lines
    const easel = this.document.getElementById("easel"); // div with canvases 
    const sizeOfBorder = 10;

    let wg = whiteground.getContext('2d'); // creates drawable canvas
    wg.beginPath(); // this makes the background white and not transparent
    wg.rect(0, 0, whiteground.width, whiteground.height);
    wg.strokeStyle = "white";
    wg.fillStyle = "white";
    wg.fill(); 
    wg.stroke();
    wg.lineCap = 'round'; 

    let grid1 = canvasElem.getContext('2d'); // creates drawable canvas
    grid1.lineCap = 'round'; 

    let nextLayer = 1; // initializes layer count
    // need to keep track of what layers are being undone and redone. 
    let icoord = {x: 0, y: 0}; // initial coordinate
    let ecoord = {x: 0, y: 0}; // end coordinate
    let flag = false; // needed so nothing is drawn with mouse move if the shape isnt free line
    let flag2 = false; // needed so nothing is drawn with during/end if begin doesnt happen
    let begingingCanvas = document.createElement("canvas"); // to save begining state for clear during during
    begingingCanvas.width = 500;
    begingingCanvas.height = 300;
    let begingingGrid = begingingCanvas.getContext('2d');
    let grid = grid1; // default to grid one 

    // UNDO and REDO 
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
       redo.push([saveStateToCanvas(replacement[1]), replacement[1]]);
        // END SAVE TO REDO PILE 
        // REPLACE LAYER WITH LAST ON UNDO PILE
       drawOnLayer(replacement[1], replacement[0]);
    });

    redoButton.addEventListener("click", function(){
        if ( undo.length >= maxUndos || redo.length < 1){  // check if an undo can be preformed
            alert("NO MORE REDOS LEFT!");
            return;
        }
        let replacement = redo.pop();
        // SAVE CURRENT LAYER STATE TO UNDO PILE 
        undo.push([saveStateToCanvas(replacement[1]), replacement[1]]);
        // END SAVE TO UNDO PILE 
        // REPLACE LAYER WITH LAST ON UNDO PILE
        drawOnLayer(replacement[1], replacement[0]);
    });

    add.addEventListener("click", function(){
        nextLayer += 1; // advance count by one
        let layerDiv = document.getElementById("chooseLayer"); // get div for layer control
        // add break 
        let br = document.createElement("br");
        layerDiv.appendChild(br);
        // add radio button for new layer
        let newRadio = document.createElement("input");
        newRadio.type = "radio";
        newRadio.id = nextLayer;
        newRadio.name = "layer";
        newRadio.value = nextLayer;
        layerDiv.appendChild(newRadio);
        // add label for new layer
        let newLabel = document.createElement("label");
        newLabel.for = nextLayer;
        newLabel.innerText = "Layer " + nextLayer
        layerDiv.appendChild(newLabel);
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
        let grid1 = canvasElem.getContext('2d'); // creates drawable canvas
        grid1.beginPath(); // this makes the background white and not transparent
        grid1.rect(0, 0, canvasElem.width, canvasElem.height);
        grid1.strokeStyle = "white";
        grid1.fillStyle = "white";
        grid1.fill(); 
        grid1.stroke();
        for (i=2; i <= nextLayer; i++) {
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
        let can = document.getElementById("draw"+layer);
        begingingGrid.drawImage(can,0,0); // SAVE TO BEGINING STATE
        if(undo.length >= maxUndos) {
            undo = undo.slice(1);
        }
        undo.push([saveStateToCanvas(layer), layer]);
        // END SAVE TO UNDO PILE 

        flag2 = true;

        icoord.x  = e.clientX - easel.offsetLeft + window.scrollX - sizeOfBorder; // sets initial coordinates
        icoord.y = e.clientY - easel.offsetTop + window.scrollY;

        grid.lineWidth = size.value;

        if(document.querySelector('input[name="shape"]:checked').value == 'free'){ // only want to begin path is line is squiqly
            grid.beginPath();
            grid.moveTo(icoord.x, icoord.y); // start squigly at initial coordinate
            flag = true;
        } else if (document.querySelector('input[name="shape"]:checked').value == 'erase'){ // only want to begin path is line is eraser
            grid.clearRect(icoord.x, icoord.y, size.value, size.value);
            flag = true;
        } else if (document.querySelector('input[name="shape"]:checked').value == 'fill'){ // only want to begin path is line is eraser
            const originalColor = grid.getImageData(icoord.x,icoord.y,1,1).data;
            var visited = Array(500*300).fill(0);
            fillBucket(originalColor, rgb.value, grid, Math.round(icoord.x), Math.round(icoord.y), visited, 's');
            // to use seed fill uncomment below and comment out above
            // seedFill(grid,Math.round(icoord.x), Math.round(icoord.y), rgb.value);
        }
    } 

    function during(e){ // mouse over
        let x  = e.clientX - easel.offsetLeft + window.scrollX - sizeOfBorder; // gets currrent corrdinates 
        let y = e.clientY - easel.offsetTop + window.scrollY;
        if(flag2){ // move all to shape and get rid of flag2?
            if (!flag) {
                // clear canvas of previous during
                let layer = document.querySelector('input[name="layer"]:checked').value 
                drawOnLayer(layer, begingingCanvas);
            }

            let shape = document.querySelector('input[name="shape"]:checked').value; // gets shape to draw

            let width = -(icoord.x-x); // width and height for rectangles
            let height = -(icoord.y-y);

            grid.strokeStyle = rgb.value;

            switch (shape) {
                case 'line': // straight line drawn
                    grid.beginPath();
                    grid.moveTo(icoord.x, icoord.y);
                    grid.lineTo(x,y);
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
                case 'free':
                    grid.lineTo(x, y); // small line from last coordinates to current coordinates (lines so small it will look squigly)
                    grid.stroke();
                    break;
                case 'erase':
                    console.log("erase :3")
                    grid.clearRect(x,y, size.value, size.value);
                    break;
                default:
                    console.log("shits fucked");
                    break;
            }
        }
    }

    function end(e){ // mouse up or mouse leave
        ecoord.x  = e.clientX - easel.offsetLeft + window.scrollX - sizeOfBorder; // sets end coordinates
        ecoord.y = e.clientY - easel.offsetTop + window.scrollY;

        let shape = document.querySelector('input[name="shape"]:checked').value; // gets shape to draw

        let width = -(icoord.x-ecoord.x); // width and height for rectangles
        let height = -(icoord.y-ecoord.y);

        grid.strokeStyle = rgb.value;
        
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
                case 'erase':
                    console.log("erase")
                    grid.clearRect(ecoord.x, ecoord.y, size.value, size.value);
                    break;
                default: // technically dont need since one is always going to be checked but nice for troubleshooting
                    console.log("shape: "+shape+" was not found");
                    break;
            }
        }
        flag2 = false;
    }

    function saveStateToCanvas(layer){
        // SAVE CURRENT LAYER STATE TO TEMP CANVAS
        let tempCanvas = document.createElement("canvas");
        tempCanvas.width = 500;
        tempCanvas.height = 300;
        let tempGrid = tempCanvas.getContext('2d');
        let can = document.getElementById("draw"+layer); 
        tempGrid.drawImage(can,0,0);
        return tempCanvas
    }

    function drawOnLayer(layer, canvas){
        let g = eval("grid"+layer);
        g.clearRect(0,0, 500, 300);
        g.drawImage(canvas, 0, 0);
    }


    function fillBucket(ogColor, newColor, g, x, y, v, p) {
        const img = g.getImageData(0,0,500,300);
        const data = img.data;
        const position = ((500*y)+x)*4;
        if (0>x || x>500 || 0>y || y>300) { // check if on canvas
            console.log('off base');
            return;
        }
        if (data[position] != ogColor[0] || data[position+1] != ogColor[1] || data[position+2] != ogColor[2]) { // check color match
            console.log('original: ', ogColor);
            return;
        }
        if (v[(500*y)+x] == 1) { // check if visited UNEEDED BUT HERE INCASE SOMETHING GOES WRONG
            console.log('visited');
            return;
        }
        v[(500*y)+x] = 1; // set pixel to visited

        data[position] = parseInt(newColor.substring(1, 3), 16); // set pixel to new color
        data[position+1] = parseInt(newColor.substring(3, 5), 16);
        data[position+2] = parseInt(newColor.substring(5, 7), 16);
        data[position+3] = 255;
        g.putImageData(img,0,0); // update canvas

        if (v[(500*(y+1))+x] == 0) { // visit bottom if unvisited
            fillBucket(ogColor,newColor, g, x, y+1, v, 'b'); // Bottom
        }

        if (v[(500*(y-1))+x] == 0) { // visit top if unvisited
            fillBucket(ogColor,newColor, g, x, y-1, v, 'b'); // Top
        }
        
        if (v[(500*y)+x+1] == 0) { // visit right if unvisited
            fillBucket(ogColor,newColor, g, x+1, y, v, 'b'); // Right
        }

        if (v[(500*y)+x-1] == 0) { // visit left if unvisited
            fillBucket(ogColor,newColor, g, x-1, y, v, 'b'); // Left
        }
    }

    function seedFill(g, x, y, nc) { // just a diff method for bucket fill, should be faster but isnt
        // get original color data 
        const originalColor = g.getImageData(x,y,1,1).data;
        const img = g.getImageData(0,0,500,300);
        const data = img.data;

        var seedPts = []; // stack for seed points
        seedPts.push([x,y]);
        while (seedPts.length != 0) {
            
            // go LEFT until you reach a pt that is diff from og color
            var needSeedTop = true;
            var needSeedBottom = true;
            var pt = seedPts.pop();
            var x = pt[0];
            var y = pt[1];
            while (colorsEqual(originalColor, g.getImageData(x,y,1,1).data)) {
                x--;
            }
            // then go RIGHT and change pixels until u reach a pt that is diff from og color
            while (colorsEqual(originalColor, g.getImageData(x,y,1,1).data)) {
                if(needSeedTop) { // look for seedpt if needed
                    if(colorsEqual(originalColor, g.getImageData(x,y+1,1,1).data)) {
                        seedPts.push([x,y+1]);
                        needSeedTop = false;
                    } else {
                        needSeedTop = true;
                    }
                }
                if(needSeedBottom) { // look for seedpt if needed
                    if(colorsEqual(originalColor, g.getImageData(x,y-1,1,1).data)) {
                        seedPts.push([x,y-1]);
                        needSeedBottom = false;
                    } else {
                        needSeedBottom = true;
                    }
                }
                const position = ((500*y)+x)*4; // change pixel's color
                data[position] = parseInt(nc.substring(1, 3), 16);
                data[position+1] = parseInt(nc.substring(3, 5), 16);
                data[position+2] = parseInt(nc.substring(5, 7), 16);
                data[position+3] = 255;
                g.putImageData(img,0,0); // update canvas

                x++; // move right
            }
        }
        
    }


    function colorsEqual(a, b) {
        if (a[0] == b[0] && a[1] == b[1] && a[2] == b[2] ) {
            return true;
        } else {
            return false;
        }
    }
})
