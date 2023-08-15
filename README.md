# CanvasDraw
A little page I made in HTML and JS that uses the canvas element combined with JS event listeners to allow people to draw on a webpage.
This webpage can be viewed by clicking [HERE!!!](https://erinscheunemann.github.io/CanvasDraw/draw.html)

# IN PROGRESS
Working on optimizing the fill bucket tool working as well as making the eraser better. 

# 08.15.2023
BUCKET FILL!!! implimented two ways: seed fill and simple recursion. both are slow and have caused me many headaches. however I persist. 

**NEW**:
- BUCKET FILLLLLLLLLLLLLLLL LETTTSSSS GOOOOOOOOO

**BUGS** (or *less appreciated* features...):
- colors equal cant differentiate between black and white so bucket fill doesn't work on shapes that are black or white on backgrounds that are black or white......
- bucket fill is SLOW and the "optimized" solution seedfill is just as slow ;-;

**TODO**: 
- Brainstorm new features.
- Make bucket fill less slow.
- Add a "fill in progress" alert so that users know that bucket fill is working.
- Continue to make the styling better...

# 07.24.2023
STYLED WEBSITE!!!!! also fixed the clear button so that the background layer isn't made transparent. Also fixed the issue of the marker position changing when the page is scrolled.

**NEW**:
- SUPER COOL AND FUN LAYOUT!!!
- added *silly mode...*
- eraser is now a setting and WORKS on all layers
- there is an uneditable white canvas behind the background layer instead of the background layer being white by default

**BUGS** (or *less appreciated* features...):
- *to be found...*

**TODO**: 
- Add in a fill bucket.
- Brainstorm new features.
- continue to make the styling better...

# 06.27.2023
Added eraser and undo/redo functionality

**NEW**:
- User can erase by clicking the eraser checkbox and drawing on the canvas where they want to erase.
- User can undo a mark by clicking the undo button on top of the canvas. (max undos: 5)
- User can redo a mark by clicking the redo button on top of the canvas. (max redos: 5)
- Clear and Save buttons have been fixed.
- Save img now allows user to name their image.

**BUGS** (or *less appreciated* features...):
- If a user scrolls the line is drawn higer on the canvas. (currently investigating potential fix (07/10/2023))

**TODO**: 
- Add styling... 

# 06.23.2023
Added layer functionality to canvas.

**NEW**:
- User can add layers to canvas by clicking the add layer button.
- User can pick which layer they want to draw on by clicking the radio button next to the desired layer.
- User can hide and unhide layers by clicking the checkbox next to the desired layer.
- Clear and Save Image buttons were moved to be on top of the drawing canvas rather than underneath it. (this is temporary)

**BUGS** (or *less appreciated* features...):
- Clear button now only clears the background layer rather than the whole drawing.
- Save button now only downloads layer selected rather than the whole drawing.

**TODO**: 
- Add eraser.
- Add functionality to delete layers.
- Fix clear and save functionalities.
- Add styling...
