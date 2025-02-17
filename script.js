/************************************************************
 Nibs logo
 Version 0.1
 Derek Thatcher 2025
************************************************************/
const paths = document.querySelectorAll("svg #Layer_2 .cls-3"); // Select all paths inside the SVG
let mode = "drag"; // Default mode
const toggleButton = document.getElementById("toggleMode");
let isDragging = false, isRotating = false;
let startX, startY, startAngle = 0;
let currentX = 0, currentY = 0, currentAngle = 0;
let selectedElement = null;

toggleButton.addEventListener("click", () => {
    mode = (mode === "drag") ? "rotate" : "drag";
    toggleButton.textContent = mode === "drag" ? "Switch to Rotate Mode" : "Switch to Drag Mode";
});

function startInteraction(event) {
    const isTouch = event.type.startsWith("touch");
    const evt = isTouch ? event.touches[0] : event;
    const path = evt.target.closest(".cls-3");
    if (!path) return;

    selectedElement = path;
    startX = evt.clientX;
    startY = evt.clientY;
    // Get the bounding box of the path
    const bbox = selectedElement.getBBox();

    // Calculate the center coordinates
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;

    // Set the transform-origin
    selectedElement.style.transformOrigin = `${centerX}px ${centerY}px`;

    const transform = selectedElement.getAttribute("transform") || "translate(0,0) rotate(0)";
    const match = transform.match(/translate\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\) rotate\((-?\d+\.?\d*)\)/);

    if (match) {
        currentX = parseFloat(match[1]);
        currentY = parseFloat(match[2]);
        currentAngle = parseFloat(match[3]);
    }

    if (mode === "drag") {
        isDragging = true;
    } else {
        isRotating = true;
        startAngle = currentAngle;
    }

    if (isTouch) event.preventDefault();
}

function moveInteraction(event) {
    if (!selectedElement) return;
    const isTouch = event.type.startsWith("touch");
    const evt = isTouch ? event.touches[0] : event;

    if (isDragging) {
        let dx = evt.clientX - startX;
        let dy = evt.clientY - startY;
        let newX = currentX + dx;
        let newY = currentY + dy;
        selectedElement.setAttribute("transform", `translate(${newX},${newY}) rotate(${currentAngle})`);
    } else if (isRotating) {
        let angle = startAngle + (evt.clientX - startX) / 2;
        selectedElement.setAttribute("transform", `translate(${currentX},${currentY}) rotate(${angle})`);
    }
}

function endInteraction() {
    isDragging = false;
    isRotating = false;
    selectedElement = null;
}

/* svg download from Takuya Kitazawa, https://takuti.me/note/javascript-save-svg-as-image/ */

// add any css to variable for download
const createStyleElementFromCSS = () => {
    // JSFiddle's custom CSS is defined in the second stylesheet file
    const sheet = document.styleSheets[1];

    const styleRules = ["svg {transform: scale(1); background-color: #FFF;}"];
    for (let i = 0; i < sheet.cssRules.length; i++)
        styleRules.push(sheet.cssRules.item(i).cssText);

    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(styleRules.join(' ')))

    return style;
};
const style = createStyleElementFromCSS();


//download svg
const download = () => {
    // fetch SVG-rendered image as a blob object
    const svg = document.querySelector('svg');
    svg.insertBefore(style, svg.firstChild); // CSS must be explicitly embedded
    const data = (new XMLSerializer()).serializeToString(svg);
    const svgBlob = new Blob([data], {
        type: 'image/svg+xml;charset=utf-8'
    });
    style.remove(); // remove temporarily injected CSS

    // convert the blob object to a dedicated URL
    const url = URL.createObjectURL(svgBlob);

    // load the SVG blob to a flesh image object
    const img = new Image();
    img.addEventListener('load', () => {
        // draw the image on an ad-hoc canvas
        const bbox = svg.getBBox();

        const canvas = document.createElement('canvas');
        canvas.width = 3*bbox.width;
        canvas.height = 3*bbox.height;

        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, 3*bbox.width, 3*bbox.height);

        URL.revokeObjectURL(url);

        // trigger a synthetic download operation with a temporary link
        const a = document.createElement('a');
        a.download = 'NiBS.png';
        document.body.appendChild(a);
        a.href = canvas.toDataURL();
        a.click();
        a.remove();
    });
    img.src = url;
};

document.addEventListener("mousedown", startInteraction);
document.addEventListener("mousemove", moveInteraction);
document.addEventListener("mouseup", endInteraction);

document.addEventListener("touchstart", startInteraction, { passive: false });
document.addEventListener("touchmove", moveInteraction, { passive: false });
document.addEventListener("touchend", endInteraction);