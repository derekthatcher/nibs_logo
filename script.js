/************************************************************
 Nibs logo
 Version 0.1
 Derek Thatcher 2025
************************************************************/
const paths = document.querySelectorAll("svg .cls-1"); // Select all paths inside the SVG
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
            const path = evt.target.closest(".cls-1");
            if (!path) return;

            selectedElement = path;
            startX = evt.clientX;
            startY = evt.clientY;
            
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

        document.addEventListener("mousedown", startInteraction);
        document.addEventListener("mousemove", moveInteraction);
        document.addEventListener("mouseup", endInteraction);

        document.addEventListener("touchstart", startInteraction, { passive: false });
        document.addEventListener("touchmove", moveInteraction, { passive: false });
        document.addEventListener("touchend", endInteraction);