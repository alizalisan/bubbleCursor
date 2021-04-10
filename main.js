var canvasWidth = -1;
var canvasHeight = -1;
var canvasBackgroundColor = "#d4d3d3"
var numBlocks = 27;

class Circle {
    constructor(x, y, r, type) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.type = type;
    }

    pointInsideCircle(x, y) {
        if ((((x - this.x) * (x - this.x)) + ((y - this.y) * (y - this.y))) <= (this.r * this.r))
            return true;
        else
            return false;
    }
}

class BubbleCursor {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
}

var circleStrokeColor = "#808080";
var circleTargetColor = "#008000";
var circleTargetHoverColor = "#FF0000";
var circleDistractionColor = "#ffffff";
var circleDistractiontHoverColor = "#FF0000";
var circleList = []

var circleRadius;
var effectiveWidth;
var EwWRatio;
var numTargets; //density
var amplitudePixels;
var CT, tn, sn; //cursor type, trial number and selection number
var start, MT; //movement time
var ewCircles; //boolean
var ewSquare = [];
var errors = 0;

//for bubble Cursor
var bubbleCursor = new BubbleCursor(canvasWidth / 2, canvasHeight / 2, 14);
var distances = [];
var hoveredCircle = new Circle();

function clearCanvas(context) {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
}

function drawCircle(context, circle, color) {
    context.beginPath();
    context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
    context.strokeStyle = circleStrokeColor;
    context.stroke();
}

function removeCircle(context, circle) {
    context.beginPath();
    context.arc(circle.x, circle.y, circle.r + 1, 0, 2 * Math.PI);
    context.fillStyle = canvasBackgroundColor;
    context.fill();
    context.strokeStyle = canvasBackgroundColor;
    context.stroke();
}

function removeBubbleCircle(context, bubbleCursor) {
    context.beginPath();
    context.arc(bubbleCursor.x, bubbleCursor.y, bubbleCursor.r + 1, 0, 2 * Math.PI);
    context.fillStyle = canvasBackgroundColor;
    context.fill();
    context.strokeStyle = canvasBackgroundColor;
    context.stroke();
}

function populateCircleList(cursorX, cursorY, targetX, targetY) {
    c = new Circle(targetX, targetY, circleRadius, "target");
    circleList.push(c);

    if (ewCircles) {
        createEwCircles(c, cursorX, cursorY);
    }

    for (i = 0; i < numTargets;) {
        x = Math.floor((Math.random() * (canvasWidth - circleRadius)) + circleRadius);
        y = Math.floor((Math.random() * (canvasHeight - circleRadius)) + circleRadius);

        if (validCircle(x, y, circleRadius) && !(x > ewSquare[0] && x < ewSquare[1] && y > ewSquare[2] && y < ewSquare[3])) {
            c = new Circle(x, y, circleRadius, "distraction");
            circleList.push(c);
            i++;
        }
    }
    ewSquare = [];
}

function createEwCircles(target, cursorX, cursorY) {
    //coordinates for 4 circles surrounding the target
    var a1, b1, a2, b2, a3, b3, a4, b4;
    //target's centre coordinates
    var x1 = target.x;
    var y1 = target.y;
    //console.log("target: " + x1 + " " + y1);

    //cursor coordinates
    var x2 = cursorX;
    var y2 = cursorY;
    //console.log("cursor: " + x2 + " " + y2);

    //slope and y-intercept for line equation
    var m = (y2 - y1) / (x2 - x1);
    //y1 = mx1 + b => b = y1-(m*x1)
    var b = y1 - (m * x1);

    var tempX, tempY;

    if ((x1 == x2 && y1 > y2) || (x1 == x2 && y1 < y2)) { //above or below
        //console.log("above or below");
        a1 = a2 = x1;
        b1 = y1 - effectiveWidth - target.r;
        b2 = y1 + effectiveWidth + target.r;
        b3 = b4 = y1;
        a3 = x1 - effectiveWidth - target.r;
        a4 = x1 + effectiveWidth + target.r;
    } else if ((y1 == y2 && x1 > x2) || (y1 == y2 && x1 < x2)) { //right or left
        //console.log("right or left");
        b1 = b2 = y1;
        a1 = x1 - effectiveWidth - target.r;
        a2 = x1 + effectiveWidth + target.r;
        a3 = a4 = x1;
        b3 = y1 - effectiveWidth - target.r;
        b4 = y1 + effectiveWidth + target.r;
    } else if (x1 > x2 && y1 < y2) { //top right
        console.log("top right");
        a1 = x1 - effectiveWidth - target.r;
        b1 = m * a1 + b;
        a2 = x1 + effectiveWidth + target.r;
        b2 = m * a2 + b;
        tempX = a2 - x1;
        tempY = y1 - b2;
        a3 = x1 + tempY;
        b3 = y1 + tempX;
        a4 = x1 - tempY;
        b4 = y1 - tempX;
    } else if (x1 > x2 && y1 > y2) { //bottom right
        console.log("bottom right");
        a1 = x1 - effectiveWidth - target.r;
        b1 = m * a1 + b;
        a2 = x1 + effectiveWidth + target.r;
        b2 = m * a2 + b;
        tempX = x1 - a1;
        tempY = y1 - b1;
        a3 = x1 - tempY;
        b3 = y1 + tempX;
        a4 = x1 + tempY;
        b4 = y1 - tempX;
    } else if (x1 < x2 && y1 < y2) { //top left
        console.log("top left");
        a1 = x1 + effectiveWidth + target.r;
        b1 = m * a1 + b;
        a2 = x1 - effectiveWidth - target.r;
        b2 = m * a2 + b;
        tempX = x1 - a2;
        tempY = y1 - b2;
        a3 = x1 - tempY;
        b3 = y1 + tempX;
        a4 = x1 + tempY;
        b4 = y1 - tempX;
    } else if (x1 < x2 && y1 > y2) { //bottom left
        console.log("bottom left");
        a1 = x1 + effectiveWidth + target.r;
        b1 = m * a1 + b;
        a2 = x1 - effectiveWidth - target.r;
        b2 = m * a2 + b;
        tempX = a1 - x1;
        tempY = y1 - b1;
        a3 = x1 - tempY;
        b3 = y1 - tempX;
        a4 = x1 + tempY;
        b4 = y1 + tempX;
    }
    c = new Circle(a1, b1, circleRadius, "distraction");
    circleList.push(c);
    c = new Circle(a2, b2, circleRadius, "distraction");
    circleList.push(c);
    c = new Circle(a3, b3, circleRadius, "distraction");
    circleList.push(c);
    c = new Circle(a4, b4, circleRadius, "distraction");
    circleList.push(c);

    ewSquare.push(Math.min(a1, a2, a3, a4));
    ewSquare.push(Math.max(a1, a2, a3, a4));
    ewSquare.push(Math.min(b1, b2, b3, b4));
    ewSquare.push(Math.max(b1, b2, b3, b4));
}

function calculateTargetPosition(cursorX, cursorY) {

    if (Math.floor(Math.random() * 2) == 1) {
        var targetX = Math.abs(amplitudePixels + cursorX);
    } else {
        var targetX = Math.abs(amplitudePixels - cursorX);
    }
    var targetY = cursorY - Math.sqrt(Math.pow(amplitudePixels, 2) - Math.pow(targetX - cursorX, 2));

    if (targetX < (0 + circleRadius) || targetX > (canvasWidth - circleRadius)) {
        xDiff = Math.abs(targetX - cursorX)
        if (targetX < (0 + circleRadius)) {
            targetX += 2 * xDiff;
        } else {
            targetX -= 2 * xDiff;
        }
    }
    if (targetY < (0 + circleRadius) || targetY > (canvasHeight - circleRadius)) {
        yDiff = Math.abs(targetY - cursorY)
        if (targetY < (0 + circleRadius)) {
            targetY += 2 * yDiff;
        } else {
            targetY -= 2 * yDiff;
        }
    }

    return [targetX, targetY];
}

function setCanvas(context, cursorX, cursorY, targetX, targetY) {
    circleList = [];
    populateCircleList(cursorX, cursorY, targetX, targetY);

    for (i = 0; i < circleList.length; i++) {
        if (circleList[i].type === "target") {
            drawCircle(context, circleList[i], circleTargetColor);
        } else {
            drawCircle(context, circleList[i], circleDistractionColor);
        }
    }
}

function drawBubbleCursor(context, cursorX, cursorY) {
    //console.log("in draw bubble cursor");
    context.beginPath();
    context.arc(bubbleCursor.x, bubbleCursor.y, bubbleCursor.r, 0, 2 * Math.PI);
    context.fillStyle = "rgba(255, 255, 255, 0.2)"; //keeping opacity to 0.2 so that it looks transparent
    context.fill();
    context.strokeStyle = circleStrokeColor;
    context.stroke();
}

function findClosestCircles(cursorX, cursorY) {
    //console.log("in findClosestCircles");
    //console.log(circleList);
    //console.log("cursorX: " + cursorX + " cursorY: " + cursorY)
    var dist1 = canvasWidth * 2;
    var dist2 = canvasWidth * 2;
    for (i = 0; i < circleList.length; i++) {
        cirX = circleList[i].x;
        cirY = circleList[i].y;
        cirR = circleList[i].r;
        temp_distance = Math.sqrt(Math.pow((cirX - cursorX), 2) + Math.pow((cirY - cursorY), 2));
        if (temp_distance < dist1) {
            dist1 = temp_distance;
            hoveredCircle = circleList[i];
        }
    }
    for (i = 0; i < circleList.length && circleList.length > 1; i++) {
        cirX = circleList[i].x;
        cirY = circleList[i].y;
        cirR = circleList[i].r;
        temp_distance = Math.sqrt(Math.pow((cirX - cursorX), 2) + Math.pow((cirY - cursorY), 2));
        if (temp_distance < dist2 && circleList[i] != hoveredCircle) {
            dist2 = temp_distance;
        }
    }
    dist1 = dist1 + circleRadius; //ConDi
    distances.push(dist1);
    dist2 = dist2 - circleRadius; //IntDj
    distances.push(dist2);
}

function updateCursor(context, x, y) {
    //updating circle position and radius here
    //console.log("in update bubble cursor");
    removeBubbleCircle(context, bubbleCursor);
    bubbleCursor.x = x;
    bubbleCursor.y = y;
    findClosestCircles(x, y);
    //drawing all the circles again because removeBubbleCircle also removes rest of the circles
    for (i = 0; i < circleList.length; i++) {
        if (hoveredCircle === circleList[i]) {
            drawCircle(context, circleList[i], circleDistractiontHoverColor);
        } else if (circleList[i].type === "target") {
            drawCircle(context, circleList[i], circleTargetColor);
        } else {
            drawCircle(context, circleList[i], circleDistractionColor);
        }
    }
    //case 1: ConDi < IntDj
    if (distances[0] < distances[1]) {
        bubbleCursor.r = Math.min(distances[0], distances[1]);
    } else { //case2: ConDi > IntDj
        bubbleCursor.r = distances[1];
    }
    distances = [];
    drawBubbleCursor(context, bubbleCursor.x, bubbleCursor.y);
}

function circleOverlap(x1, y1, x2, y2, r1, r2) {
    distSq = ((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2));
    radSumSq = (r1 + r2) * (r1 + r2);

    if (distSq < radSumSq) {
        return true;
    } else {
        return false;
    }
}

function validCircle(x, y, r) {
    for (let i = 0; i < circleList.length; i++) {
        circle = circleList[i];
        if (circleOverlap(x, y, circle.x, circle.y, r, circle.r)) {
            return false;
        }
    }
    return true;
}

function makeCombinations(amp, width, eww, density) {
    var blocks = []
    var combinations = []
        //27 combinatons of width, eww and density
    for (var i = 0; i < width.length; i++) {
        for (var j = 0; j < eww.length; j++) {
            for (var k = 0; k < density.length; k++) {
                combinations.push([width[i], eww[j], density[k]])
            }
        }
    }

    //in order to make 3 As appear 3 times in a random order in each trial
    let amplitude_combos = amp.concat(amp).concat(amp);

    //27 trials per block with 9 target selections each
    for (var i = 0; i < combinations.length; i++) {
        //shuffling the array of amplitude values
        amplitude_combos = amplitude_combos.sort(() => Math.random() - 0.5)
        var selections = [];
        //9 target selections
        for (var j = 0; j < amplitude_combos.length; j++) {
            selections.push([combinations[i][0], combinations[i][1], combinations[i][2], amplitude_combos[j]]);
        }
        blocks.push(selections);
    }
    return blocks;
}

function draw() {
    //console.log(localStorage.getItem("numBlocks"));
    // numBlocks = localStorage.getItem("numBlocks");

    //Independent variables
    var cursorType = ["pointer", "bubble"];
    var Amplitude = [Math.floor(256 / 3), Math.floor(512 / 3), Math.floor(768 / 3)];
    var width = [16, 24, 32];
    var eww = [1.33, 2, 3];
    var density = [0, 0.5, 1];
    var trials = [];

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    console.log(window.screen.height);
    console.log(window.screen.width);
    context.canvas.width = window.screen.width - 10;
    context.canvas.height = window.screen.height - 200;

    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    targetX = Math.floor(canvasWidth / 2);
    targetY = Math.floor(canvasHeight / 2);

    trials = makeCombinations(Amplitude, width, eww, density);

    tn = 0; //trialNum
    sn = 0; //selectionNum

    //drawing the first single target of a trial and the experiment with no ewcircles or distraction targets
    CT = cursorType[0];
    circleRadius = (trials[tn][sn][0]) / 2;
    ewCircles = false;
    numTargets = 0;

    setCanvas(context, Math.floor(canvasWidth / 2), 0, targetX, targetY);

    document.getElementById("info").innerHTML = "You are in block 1/" + numBlocks + " which has 9 trials. The cursor type is " + CT;

    start = new Date().getTime();

    canvas.onmousemove = function(e) {
        x = e.clientX;
        y = e.clientY;
        if (CT === "pointer") {
            for (i = 0; i < circleList.length; i++) {
                circle = circleList[i];
                if (circle.pointInsideCircle(x, y)) {
                    if (circleList[i].type === "target") {
                        drawCircle(context, circleList[i], circleTargetHoverColor);
                    } else {
                        drawCircle(context, circleList[i], circleDistractiontHoverColor);
                    }
                } else {
                    if (circleList[i].type === "target") {
                        drawCircle(context, circleList[i], circleTargetColor);
                    } else {
                        drawCircle(context, circleList[i], circleDistractionColor);
                    }
                }
            }
        } else { //CT === "bubble"
            //console.log("bubble cursor mouse move");
            if (hoveredCircle.type === "target") {
                drawCircle(context, hoveredCircle, circleTargetHoverColor);
            } else {
                drawCircle(context, hoveredCircle, circleDistractiontHoverColor);
            }
            updateCursor(context, x, y);
        }
    };

    canvas.addEventListener('click', function(e) {
        x = e.clientX;
        y = e.clientY;
        circleRadius = (trials[tn][sn][0]) / 2;
        EwWRatio = (trials[tn][sn][1]);
        effectiveWidth = EwWRatio * circleRadius * 2;
        if (trials[tn][sn][2] == 0.5) {
            numTargets = 15;
        } else if (trials[tn][sn][2] == 1) {
            numTargets = 25;
        } else {
            numTargets = trials[tn][sn][2];
        }
        amplitudePixels = trials[tn][sn][3];
        // console.log(trials[tn][sn]);

        if (CT === "pointer") {
            for (i = 0; i < circleList.length; i++) {
                circle = circleList[i];
                if (circle.pointInsideCircle(x, y)) {
                    if (circle.type === "target") {
                        //drawing the first single target of a trial with no ewcircles or distraction targets
                        if (sn == 0 && ewCircles) {
                            MT = new Date().getTime() - start;
                            //logging here
                            $(document).trigger('log', ['click', { ct: CT, block_n: tn, trial_n: sn, width: circleRadius * 2, eww_ratio: EwWRatio, density: numTargets, amplitude: amplitudePixels, movement_time: MT, errors: errors }]);
                            errors = 0;
                            circleRadius = (trials[tn][sn][0]) / 2;
                            ewCircles = false;
                            numTargets = 0;
                            newCoordinates = calculateTargetPosition(x, y);
                            targetX = newCoordinates[0];
                            targetY = newCoordinates[1];
                            clearCanvas(context, canvas);
                            setCanvas(context, Math.floor(canvasWidth / 2), 0, targetX, targetY);
                            // CT = "bubble"; //for testing
                            // if (CT === "bubble") {
                            //     console.log("bubble cursor started");
                            //     updateCursor(context, Math.floor(canvasWidth / 2), 0);
                            // }
                            document.getElementById("info").innerHTML = "You are in block " + (tn + 1) + "/" + numBlocks + " which has 9 trials. The cursor type is " + CT;
                        } else {
                            if (sn != 0) {
                                MT = new Date().getTime() - start;
                                //logging here
                                $(document).trigger('log', ['click', { ct: CT, block_n: tn, trial_n: sn, width: circleRadius * 2, eww_ratio: EwWRatio, density: numTargets, amplitude: amplitudePixels, movement_time: MT, errors: errors }]);
                                errors = 0;
                            }
                            newCoordinates = calculateTargetPosition(x, y);
                            targetX = newCoordinates[0];
                            targetY = newCoordinates[1];
                            clearCanvas(context, canvas);
                            ewCircles = true;
                            setCanvas(context, x, y, targetX, targetY);
                            if (sn == 8) {
                                tn++;
                                sn = -1
                            }
                            if (tn == numBlocks && CT === "pointer") {
                                CT = cursorType[1];
                                sn = -1;
                                tn = 0;
                            }
                            sn++;
                        }
                    } else if (circle.type === "distraction") {
                        //logic for error calculation here
                        errors++;
                    }
                }
            }
        } else { //CT === "bubble"
            if (hoveredCircle.type === "target") {
                //drawing the first single target of a trial with no ewcircles or distraction targets
                if (sn == 0 && ewCircles) {
                    MT = new Date().getTime() - start;
                    //logging here
                    $(document).trigger('log', ['click', { ct: CT, block_n: tn, trial_n: sn, width: circleRadius * 2, eww_ratio: EwWRatio, density: numTargets, amplitude: amplitudePixels, movement_time: MT, errors: errors }]);
                    errors = 0;
                    circleRadius = (trials[tn][sn][0]) / 2;
                    ewCircles = false;
                    numTargets = 0;
                    newCoordinates = calculateTargetPosition(x, y);
                    targetX = newCoordinates[0];
                    targetY = newCoordinates[1];
                    clearCanvas(context, canvas);
                    setCanvas(context, Math.floor(canvasWidth / 2), 0, targetX, targetY);
                    document.getElementById("info").innerHTML = "You are in block " + (tn + 1) + "/" + numBlocks + "which has 9 trials. The cursor type is " + CT;
                } else {
                    if (sn != 0) {
                        MT = new Date().getTime() - start;
                        //logging here
                        $(document).trigger('log', ['click', { ct: CT, block_n: tn, trial_n: sn, width: circleRadius * 2, eww_ratio: EwWRatio, density: numTargets, amplitude: amplitudePixels, movement_time: MT, errors: errors }]);
                        errors = 0;
                    }
                    newCoordinates = calculateTargetPosition(x, y);
                    targetX = newCoordinates[0];
                    targetY = newCoordinates[1];
                    clearCanvas(context, canvas);
                    ewCircles = true;
                    setCanvas(context, x, y, targetX, targetY);
                    if (sn == 8) {
                        tn++;
                        sn = -1
                    }
                    if (tn == numBlocks && CT === "bubble") {
                        //end experiment and call thank you page
                        window.location = 'lastScreen.html';
                    }
                    sn++;
                }
            } else if (hoveredCircle.type === "distraction") {
                //logic for error calculation here
                errors++;
            }
        }
        MT = 0;
        start = new Date().getTime();
    }, false);

}