// The primary client's data is a little more valuable than the usual.
var PRIMARY_VALUE_MULTIPLIER = 2;

// The size of the pool of files that sailors could be carrying.
var MAX_OTHER_FILES_IN_PLAY = 8;

var CHUNKS_PER_FILE = 8;

// We use this a lot, so let's not repeat the whole thing every time.
var f = Math.floor;

var global_current_offer;

var canvas = document.getElementById("c");

var ctx = canvas.getContext("2d");

var fe = (a, f) => a.forEach(f);

var buttons = [];

var makeSurname = _ => {
    var x = ['Keyboard', 'Planet', 'Soul', 'Video', 'e', 'f', 'g', 'h', 'i', 'j'][nextRandom()];
    var y = ['jammer', 'crusher', 'juicer', 'b', 'e', 'f', 'g', 'h', 'i', 'j'][nextRandom()];
    return x + y;
}

var makeName = _ => {
    var x = [];
    x[0] = ['Astro', 'Captain', 'Enchanter', 'Pirate', 'Priest', 'Sales Manager', 'g', 'h', 'i', 'j'][nextRandom()];
    x[1] = ['Nigel', 'Fyodor', 'Jam', 'Jonas', 'Lucas', 'f', 'g', 'h', 'i', 'j'][nextRandom()];
    x[2] = makeSurname();
    return x.join(' ');
};

// p: player files
// o: opponent files
var global_layout = { p: [], o: [] };

var recalcLayout = () => {
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;

    var pagePaddingX = w * 0.04;
    var pagePaddingY = h * 0.04;
    var pagePaddedWidth = w - (pagePaddingX * 2);
    var pagePaddedHeight = h - (pagePaddingY * 2);

    var columns = 4, rows = 2;

    var cellDim = Math.min(pagePaddedWidth / columns, pagePaddedHeight / rows);
    var cellPadding = cellDim * 0.02;
    var cellPaddedDim = cellDim - (cellPadding * 2);

    var gridWidth = cellDim * columns;
    var gridHeight = cellDim * rows;

    var pageOriginX = (w / 2) - (gridWidth / 2);
    var pageOriginY = (h / 2) - (gridHeight / 2);

    var columnPaddedOrigin = [], rowPaddedOrigins = []

    for (var row = 0; row < rows; row++) rowPaddedOrigins.push(pageOriginY + cellPadding + (row * (cellDim + cellPadding)))
    for (var col = 0; col < columns; col++) columnPaddedOrigin.push(pageOriginX + cellPadding + (col * (cellDim + cellPadding)))

    // a: arrows
    global_layout = {
        w: window.innerWidth,
        h: window.innerHeight,
        p: getCalculatedFilesLayout(true, columnPaddedOrigin[1], rowPaddedOrigins[0], cellPaddedDim),
        o: getCalculatedFilesLayout(false, columnPaddedOrigin[2], rowPaddedOrigins[0], cellPaddedDim),
        a: {
            // w: vColumnWidth * vArrowDim
        }
    };

    var pagePaddingX = w * 0.02;
    var pagePaddingY = h * 0.02;
    var pagePaddedWidth = w - (pagePaddingX * 2);
    var pagePaddedHeight = h - (pagePaddingY * 2);

    var columns = 4, rows = 2;

    var cellDim = Math.min(pagePaddedWidth / columns, pagePaddedHeight / rows);
    var cellPadding = cellDim * 0.02;

    // cpd = cell Padded Dim
    global_layout.cpd = cellPaddedDim;

    // pa: player avatar
    global_layout.pa = {};
    global_layout.pa.x = columnPaddedOrigin[0];
    global_layout.pa.y = rowPaddedOrigins[0];

    // oa: opponent avatar
    global_layout.oa = {};
    global_layout.oa.x = columnPaddedOrigin[3];
    global_layout.oa.y = rowPaddedOrigins[0];

    // b: buttons
    global_layout.b = [];

    var nextButtonY = rowPaddedOrigins[1];

    if (global_current_offer) {
        nextButtonY = addGlobalButtonLayout('Accept', columnPaddedOrigin[3], nextButtonY);
        nextButtonY = addGlobalButtonLayout('Counter', columnPaddedOrigin[3], nextButtonY);
    }

    //     switch (global_mode): {
    //         case: 1 {

    // }
    //     }
};

var addGlobalButtonLayout = (t, x, y) => {
    var height = global_layout.cpd / 5;
    global_layout.b.push({
        x: x,
        y: y,
        w: global_layout.cpd,
        h: height,
        t: t,
        s: 0,
    });
    return y + height + (height / 4);
};

var getCalculatedFilesLayout = (forPlayer, x, y, w) => {
    var files = forPlayer ? player.f : opponent.f, nextY = y;
    return files.map(fi => {
        var fileLayout = getCalculatedFileLayout(forPlayer, fi, x, nextY, w);
        nextY += fileLayout.h * 2;
        return fileLayout
    });
};

var getCalculatedFileLayout = (forPlayer, file, x, y, w) => {
    var fileLayout = {
        l: {
            t: file.i,
            x: x,
            y: y,
        }
    };

    y += 20;

    // var thisGive = (global_current_offer && forPlayer) ? global_current_offer.o.find(h => h.i == file.i) : null;
    // var thisReceive = (global_current_offer && forPlayer) ? global_current_offer.p.find(h => h.i == file.i) : null;
    var thisGive;
    var thisReceive;

    if (forPlayer) {
        thisGive = (global_current_offer) ? global_current_offer.o.find(h => h.i == file.i) : null;
        thisReceive = (global_current_offer) ? global_current_offer.p.find(h => h.i == file.i) : null;
    } else {
        thisGive = (global_current_offer) ? global_current_offer.p.find(h => h.i == file.i) : null;
        thisReceive = (global_current_offer) ? global_current_offer.o.find(h => h.i == file.i) : null;
    }



    // Virtual widths
    var vBlockDim = 10;
    var vGapDim = 1;

    var vColumnCount = (CHUNKS_PER_FILE * (vBlockDim + vGapDim)) + vGapDim;
    var vColumnWidth = w / vColumnCount;

    // Actual widths
    var blockDim = vColumnWidth * vBlockDim;
    var gapDim = vColumnWidth * vGapDim;

    var fileHeight = blockDim + (blockDim * 2 / 9);

    // TODO: Handle receiving chunks for a file we haven't started yet.

    fileLayout.x = x;
    fileLayout.y = y;
    fileLayout.w = w;
    fileLayout.h = fileHeight;
    // c: chunks
    fileLayout.c = [];
    // cw: chunk width
    fileLayout.cw = blockDim;
    fileLayout.i = file.i;
    fileLayout.p = forPlayer;

    for (var i = 0; i < CHUNKS_PER_FILE; i++) {
        var thisPow = Math.pow(2, CHUNKS_PER_FILE - i - 1);
        fileLayout.c[i] = {
            // b: binary rep of the chunk at this index
            b: thisPow,
            // g: got this chunk
            g: (file.b & thisPow) == thisPow,
        };
        fileLayout.c[i].x = x + vColumnWidth + (i * (blockDim + gapDim));
        fileLayout.c[i].y = y + gapDim;
        // to: transfer out
        fileLayout.c[i].to = (thisGive && (thisGive.b & thisPow) == thisPow);
        // ti: transfer in
        fileLayout.c[i].ti = (thisReceive && (thisReceive.b & thisPow) == thisPow);

        // h: highlight (mouse over)
        fileLayout.c[i].h = 0;
        // p: parent file
        fileLayout.c[i].p = fileLayout;
    }

    return fileLayout;
};

var drawFiles = (forPlayer, w) => {
    var files = forPlayer ? player.f : opponent.f;
    var layout = forPlayer ? global_layout.p : global_layout.o;

    for (var i = 0; i < files.length; i++) {
        drawFile(layout[i], w);
    }
}

var drawFile = (layout, w) => {
    ctx.fillStyle = 'black';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = "left";
    ctx.fillText(layout.l.t, layout.l.x, layout.l.y);

    var now = new Date();

    // Virtual widths
    var vArrowDim = 8;
    var vBlockDim = 10;
    var vGapDim = 1;

    var vColumnCount = (CHUNKS_PER_FILE * (vBlockDim + vGapDim)) + vGapDim;
    var vColumnWidth = w / vColumnCount;

    // Actual widths
    var arrowDim = vColumnWidth * vArrowDim;

    ctx.fillStyle = 'black';
    ctx.fillRect(layout.x, layout.y, layout.w, layout.h);

    var ms = now.getMilliseconds();
    var pc = ms > 500 ? 0 : (500 - ms % 500) / 500;

    for (var i = 0; i < CHUNKS_PER_FILE; i++) {
        var onOff = layout.c[i].h ? ['#ff0', '#660'] : ['#0f0', '#666'];
        ctx.fillStyle = layout.c[i].g ? onOff[0] : onOff[1];
        ctx.fillRect(layout.c[i].x, layout.c[i].y, layout.cw, layout.cw);

        var arrowIndent = (layout.cw - arrowDim) / 2;
        var arrowX = layout.c[i].x + arrowIndent;
        var maxTravel = layout.cw * 0.4;
        var fourth = arrowDim / 4;

        if (layout.c[i].to) {
            var arrowY = (layout.c[i].y + (layout.cw / 6)) - (maxTravel * 0.75) + (maxTravel * pc);

            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX + arrowDim, arrowY);
            ctx.lineTo(arrowX + (arrowDim / 2), arrowY - (arrowDim * 0.4));
            ctx.closePath();

            ctx.fillStyle = '#f00';
            ctx.fill();
            ctx.fillRect(arrowX + fourth, arrowY, arrowDim - (2 * fourth), arrowDim / 2);
        }

        if (layout.c[i].ti) {
            var arrowY = (layout.c[i].y + (layout.cw / 6)) - (maxTravel * 0.75) + (maxTravel * (1 - pc));

            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX + arrowDim, arrowY);
            ctx.lineTo(arrowX + (arrowDim / 2), arrowY + (arrowDim * 0.4));
            ctx.closePath();

            ctx.fillStyle = '#00f';
            ctx.fill();
            ctx.fillRect(arrowX + fourth, arrowY - (arrowDim / 2), arrowDim - (2 * fourth), arrowDim / 2);
        }
    }
};

var draw = () => {
    canvas.width = global_layout.w;
    canvas.height = global_layout.h;

    ctx.fillStyle = 'lightgray';
    ctx.fillRect(0, 0, global_layout.w, global_layout.h);

    ctx.fillStyle = 'black';
    ctx.font = 'bold 22px cursive';
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    // ctx.fillText(`${w} x ${h}`, 0, 0);

    if (player) {
        drawSailor(player, global_layout.pa.x, global_layout.pa.y, global_layout.cpd, true);
        drawFiles(true, global_layout.cpd);
    }

    if (opponent) {
        drawSailor(opponent, global_layout.oa.x, global_layout.oa.y, global_layout.cpd, false);
        drawFiles(false, global_layout.cpd);
    }

    ctx.font = 'bold 22px cursive';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = '#000';

    global_layout.b.forEach(b => {
        ctx.strokeStyle = 'black';
        ctx.strokeRect(b.x, b.y, global_layout.cpd, b.h);
        ctx.fillStyle = b.s ? 'yellow' : 'grey';
        ctx.fillRect(b.x, b.y, global_layout.cpd, b.h);
        ctx.fillStyle = 'black';
        ctx.fillText(b.t, b.x + (global_layout.cpd / 2), b.y + (b.h / 2), b.w, b.h);
    })

    // setTimeout(() => requestAnimationFrame(draw), 1000 / 60);
    requestAnimationFrame(draw);
};


var global_selection;

var fi = (a, f) => a.find(f);

// c: color [r, g, b]
// d: +/- for tones
// Change red pixels to tone.
// Change green pixels to tone + 40
// Change blue pixels to tone - 40
// cw: (hidden) canvas width
// ch: (hidden) canvas height
// dx: draw x (on visible canvas)
// dy: draw y (on visible canvas)
// dw: draw width (on visible canvas)
var drawObject = (g, cw, ch, dx, dy, dw, c, d, mirror) => {
    var offcanvas = document.createElement('canvas');
    var offctx = offcanvas.getContext('2d');

    offcanvas.width = cw;
    offcanvas.height = ch;

    offctx.lineWidth = 1;

    g(offctx);

    var image = offctx.getImageData(0, 0, cw, ch)

    var buffer = [];

    for (var row = 0; row < ch; row++)
        for (var vcolumn = 0; vcolumn < cw; vcolumn++) {

            var column = mirror ? cw - vcolumn - 1 : vcolumn;

            var pixel = row * (cw * 4) + (column * 4);
            var alphaIndex = pixel + 3;
            if (image.data[alphaIndex] < 128) {
                buffer.push(0);
                buffer.push(0);
                buffer.push(0);
                buffer.push(0);
            } else {

                var z;
                if (image.data[pixel + 0] >= 128)
                    z = c;
                else if (image.data[pixel + 1] >= 128)
                    z = c.map(t => t + d);
                else
                    z = c.map(t => t - d);

                buffer.push(z[0]);
                buffer.push(z[1]);
                buffer.push(z[2]);
                buffer.push(255);
            }
        }

    for (var b = 0; b < buffer.length; b++)
        image.data[b] = buffer[b];

    // Redraw the buffer with the pixellated image.
    offctx.clearRect(0, 0, cw, ch);
    offctx.putImageData(image, 0, 0);

    var dh = calcDrawHeight(cw, ch, dw);

    // Now copy the buffer into the visible canvas in a beautiful, pixelly way.
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offcanvas, dx, dy, dw, dh);
    ctx.imageSmoothingEnabled = true;

    return dh;
};

// cw: buffer width
// ch: buffer height
// dw: draw width
var calcDrawHeight = (cw, ch, dw) => dw / cw * ch;

var R = '#f00';
var G = '#0f0';
var B = '#00f';

var drawSailor = (s, x, y, w, mirror) => {
    var drawHair = (toctx, paths) => {
        toctx.strokeStyle = R;
        toctx.fillStyle = G;
        fe(paths, p => {
            toctx.beginPath();
            toctx.moveTo(p[0], p[1]);
            toctx.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]);
            toctx.fill();
            toctx.stroke();
        })
    }

    var a = s.a, eyesX = 7, eyeWidth = 4, bufferWidth = 31;


    // s.a.hs[0] = behind head
    // s.a.hs[1] = in front of head
    drawObject((offctx) => drawHair(offctx, a.hs[0]),
        bufferWidth, bufferWidth,        // buffer dimensions
        x, y, w,     // x, y, width to draw on canvas
        a.ht,        // color to paint reds as
        64,          // color deviation for greens and blues
        mirror,      // mirror
    );


    drawObject((offctx) => {
        offctx.strokeStyle = R;
        offctx.fillStyle = G;
        drawRectangle(offctx, 5, 5, 20, 20, a.hr);
    },
        bufferWidth, bufferWidth,        // buffer dimensions
        x, y, w,     // x, y, width to draw on canvas
        a.s,        // color to paint reds as
        40,          // color deviation for greens and blues
        mirror,      // mirror
    );

    drawObject((offctx) => {
        offctx.fillStyle = R;
        offctx.fillRect(eyesX, a.ey, eyeWidth, a.eh);
        offctx.fillRect(eyesX + eyeWidth + a.eg, a.ey, eyeWidth, a.eh);
        offctx.fillStyle = B;
        offctx.fillRect(eyesX + 1, a.ey + 1, 1, 1);
        offctx.fillRect(eyesX + eyeWidth + a.eg + 1, a.ey + 1, 1, 1);
    },
        bufferWidth, bufferWidth, // buffer width
        x, y, w,     // x, y, width to draw on canvas
        [255, 255, 255],        // color to paint reds as
        255,          // color deviation for greens and blues
        mirror,      // mirror
    );

    drawObject((offctx) => {
        offctx.fillStyle = B;

        var c1x = (a.m[0] / 3) + a.m[2];
        var c1y = 19 + a.m[1];

        var c2x = ((a.m[0] / 3) * 2) + a.m[2];
        var c2y = 19 + a.m[1];

        var endX = a.m[2] + a.m[0];
        var endY = 19;

        offctx.beginPath();
        offctx.moveTo(a.m[2], 19);
        offctx.bezierCurveTo(c1x, c1y, c2x, c2y, endX, endY);
        offctx.stroke();
    },
        bufferWidth, bufferWidth, // buffer width
        x, y, w,     // x, y, width to draw on canvas
        a.s,        // color to paint reds as
        110,          // color deviation for greens and blues
        mirror,      // mirror
    );

    drawObject((offctx) => drawHair(offctx, a.hs[1]),
        bufferWidth, bufferWidth, // buffer width
        x, y, w,     // x, y, width to draw on canvas
        a.ht,        // color to paint reds as
        64,          // color deviation for greens and blues
        mirror,      // mirror
    );
}

var drawRectangle = (cc, x, y, width, height, radius) => {
    cc.beginPath();
    cc.moveTo(x + radius, y);
    cc.lineTo(x + width - radius, y);
    cc.quadraticCurveTo(x + width, y, x + width, y + radius);
    cc.lineTo(x + width, y + height - radius);
    cc.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    cc.lineTo(x + radius, y + height);
    cc.quadraticCurveTo(x, y + height, x, y + height - radius);
    cc.lineTo(x, y + radius);
    cc.quadraticCurveTo(x, y, x + radius, y);
    cc.closePath();
    cc.fill();
    cc.stroke();
}

var global_selected_chunk;

var onClick = (e) => {
    // console.debug('global_selection', global_selection);

    if (global_mode == 1 && global_selected_chunk) {
        console.debug('global_selected_chunk', global_selected_chunk);
        var file = global_selected_chunk.p;
        console.log('file', file);

        var collection = global_selected_chunk.g ? global_current_offer.o : global_current_offer.p;

        var transaction = collection.find(t => t.i == file.i);

        if (!transaction) {
            transaction = { i: file.i, b: 0 };
            collection.push(transaction);
        }

        if ((transaction.b & global_selected_chunk.b) == global_selected_chunk.b)
            transaction.b -= global_selected_chunk.b;
        else
            transaction.b += global_selected_chunk.b;

        recalcLayout();
        //        global_current_offer = {
        //         // o: apply to opponent
        //         o: [highTransaction],
        //         // p: apply to player
        //         p: lowTransactions
        //     };
        // }
    }


    if (global_selection) {
        if (global_selection.t == 'Accept') acceptOffer();
        if (global_selection.t == 'Counter') startCounterOffer();
    };
};


// 0: nothing
// 1: editing counter offer
var global_mode = 0;

var startCounterOffer = () => {
    global_mode = 1;

    global_current_offer = {
        // o: apply to opponent
        o: [],
        // p: apply to player
        p: []
    };

    // Recalc to add the "ok / cancel" buttons
    recalcLayout();
}

var addHitBox = (x, y, w, h, t) => buttons.push({ x: x, y: y, w: w, h: h, t: t });

// Thank you, David Braben!
var SEED_LEFT = new Date().getMinutes(), SEED_RIGHT = new Date().getSeconds();

var nextRandom = (m = 10) => {
    var d = (SEED_LEFT + SEED_RIGHT) / 100, r = f((d - f(d)) * 100);
    SEED_LEFT = SEED_RIGHT;
    SEED_RIGHT = r;
    return r % m;
}

var makePartial = () => [4, 0].reduce((acc, shift) => {
    acc += nextRandom(14) + 1;
    return acc <<= shift;
}, 0);

// var showSailor = (sailor) => {
//     console.info(`${sailor.n} holds:`);
//     fe(sailor.f, file => console.info(`> (file ID: ${file.i.toString().padStart(2, '0')}) ${toBinary(file.b)}`));
// };

var toBinary = (b) => b.toString(2).padStart(CHUNKS_PER_FILE, 0);

var showBits = (p) => console.info(`(${p.toString().padStart(3, ' ')}) ${toBinary(p)}`);

var player;
var opponent;

var newGame = () => {
    player = makeSailor(true, 3, 'Bob');
    newOpponent();
};

var newOpponent = () => {
    opponent = makeSailor(true, 3, makeName());
    generateOffer();
}

var makeShuffled = (max, length) => {
    var s = [], r = [];
    for (var i = 0; i < max; i++) s.push(i);
    for (var i = 0; i < length; i++) r.push(s.splice(nextRandom(s.length), 1)[0]);
    return r
}

var makeSailor = (hasPrimary, otherCount, name) => {
    // f: files
    var sailor = {
        f: [],
        n: name,
        // a: avatar
        a: {
            // s: skin tone
            s: [
                [197, 140, 133],
                [236, 188, 180],
                [80, 51, 53],
                [89, 47, 42],
            ][nextRandom(4)].map(t => t + (nextRandom() - 4) * 1.5),
            // ht: hair tone
            ht: [128 * nextRandom(2), 128 * nextRandom(2), 128 * nextRandom(2)],
            // hs: hair style
            hs: [
                [[], []],
                [
                    // moveX, moveY, c1x, c1y, c2x, c2y, endX, endY
                    // Behind head
                    [[22 - 18, 10 - 2, 12 - 18, 36 - 2, 38 - 18, 36 - 2, 26 - 18, 3 - 2]],
                    // IN front of head
                    [[22, 10, 12, 36, 38, 36, 26, 3], [26, 3, -9, -6, -3, 18, 25, 9]],
                ],
                [
                    // Behind head
                    [],
                    // IN front of head
                    [[26 - 4, 7 - 1, 10 - 4, -6 - 1, -3 - 4, 18 - 1, 25 - 4, 9 - 1]],
                ],
            ][nextRandom(3)],
            // hr: head radius
            hr: nextRandom(6) + 3,
            // ey: eyes y
            ey: nextRandom(3) + 12,
            // eg: eyes gap
            eg: nextRandom(2) + 2,
            // eh: eyes height
            eh: nextRandom(2) + 2,
            // m: mouth stylw
            m: [
                // width. height, startX
                [10, 2, 8],
                [12, 4, 7],
            ][nextRandom(2)],
        }
    };

    if (hasPrimary) {
        // The first item in the array is always for the primary client we're
        // hunting for.
        sailor.f.push(
            {
                // m: value multiplier
                m: PRIMARY_VALUE_MULTIPLIER,
                // b: bits of this holding
                b: makePartial(),
                // i: file id, 0 is the primary file
                i: 0,
            });
    }

    fe(makeShuffled(MAX_OTHER_FILES_IN_PLAY, otherCount), i => sailor.f.push(
        {
            // TODO: Randomise the value.
            m: 1,
            b: makePartial(),
            // Don't allow 0, that's special.
            i: i + 1,
        }));


    if (sailor.f.filter(t => t.b == 0) == sailor.f.length) {
        console.error(`All zeroes?!`);
        return null;
    }


    return sailor;
};

var countSetBits = p => {
    var count = 0;
    while (p > 0) {
        p &= (p - 1);
        count++;
    }
    return count;
}

// Returns the value of an offer ("01000010") given its multiplier (2),
var calcValue = (offer, multiplier) => countSetBits(offer) * multiplier;

// Sailor X, Sailor Y
var findCommonFiles = (sx, sy) => sx.f.map(f => f.i).filter(v => sy.f.map(f => f.i).includes(v));

var getSailorFile = (sailor, id) => sailor.f.find(f => f.i == id);

var findHighValueTransction = (fromSailor, toSailor) => {
    // Maximise value for `toSailor`.
    var highestValueTransaction = { v: 0 };

    fe(findCommonFiles(fromSailor, toSailor), id => {
        var fromFile = getSailorFile(fromSailor, id);
        var toFile = getSailorFile(toSailor, id);
        var offer = (toFile.b ^ fromFile.b) & fromFile.b;
        var value = calcValue(offer, fromFile.m);
        if (value > highestValueTransaction.v) {
            highestValueTransaction.i = id;
            highestValueTransaction.b = offer;
            highestValueTransaction.v = value;
        }
    });
    return (highestValueTransaction.v > 0) ? highestValueTransaction : null;
}

var findFullTransaction = (fromSailor, toSailor, id) => {
    var r = { i: id };
    var fromFile = getSailorFile(fromSailor, id);
    var toFile = getSailorFile(toSailor, id);
    r.b = ((toFile ? toFile.b : 0) ^ fromFile.b) & fromFile.b;
    r.v = calcValue(r.b, fromFile.m);
    // e = value of each
    r.e = fromFile.m;
    return r;
}

var findLowValueTransaction = (fromSailor, toSailor, matchValue) => {
    // Minimise value for `toSailor`.
    var transactions = [];
    transactions = fromSailor.f.map(file => findFullTransaction(fromSailor, toSailor, file.i)).filter(t => t.b > 0);
    transactions.sort((x, y) => x.v > y.v);

    var transactionsToOffer = [];
    var transactionsToOfferTotal = 0;

    fe(transactions, t => {
        var totalIfIncluded = t.v + transactionsToOfferTotal;
        var over = totalIfIncluded - matchValue;

        if (over > 0) {
            var maxValueFromThisTransaction = matchValue - transactionsToOfferTotal;
            var keep = f(maxValueFromThisTransaction / t.e);
            if (!keep) return;
            var subtractors = makeShuffled(8, 8).map(i => Math.pow(2, i));

            while (countSetBits(t.b) > keep) {
                var subtractor = subtractors.pop();
                if ((t.b & subtractor) == subtractor) t.b -= subtractor;
            }
            t.v = calcValue(t.b, t.e);
        }

        transactionsToOffer.push(t);
        transactionsToOfferTotal += t.v;
    });

    return transactionsToOffer;
};

var logTransaction = t => console.debug(`> "${toBinary(t.b)}" of file (${t.i}) worth $${t.v}.`);

var applyTransaction = (s, t) => {
    if (g = s.f.find(h => h.i == t.i)) g.b += t.b; else {
        s.f.push({
            m: 1,
            b: t.b,
            // Don't allow 0, that's special.
            i: t.i,
        });
    }
};

var MAX_FILE_B = 255;
var global_winner;

var acceptOffer = _ => {
    // Apply the opponent's transactions.
    // global_current_offer.o.forEach(t => applyTransaction(opponent, t));
    fe(global_current_offer.o, t => applyTransaction(opponent, t));

    // Apply the player's transactions
    // global_current_offer.p.forEach(t => applyTransaction(player, t));
    fe(global_current_offer.p, t => applyTransaction(player, t));

    global_current_offer = null;

    var playerWon = getSailorFile(player, 0).b == MAX_FILE_B;
    var opponentWon = getSailorFile(opponent, 0).b == MAX_FILE_B;

    if (playerWon && opponentWon) {
        // TODO: Special descriptive ending.
        global_winner = player;
        console.warn(`You won! :)`);
        // showSailor(player);
    } else if (playerWon) {
        global_winner = player;
        console.warn(`You won! :)`);
        // showSailor(player);
    }
    else if (opponentWon) {
        global_winner = opponent;
        console.warn(`${opponent.n} won! :(`);
        // showSailor(opponent);
    }
    else {
        // console.info(`${opponent.n} walks away with:`);
        // showSailor(opponent);
        newOpponent();
    }

    recalcLayout();
};

var generateOffer = () => {
    var highTransaction = findHighValueTransction(player, opponent);

    if (!highTransaction) {
        console.warn(`You have nothing of value to ${opponent.n}.`);
        newOpponent();
        return;
    }

    var lowTransactions = findLowValueTransaction(opponent, player, highTransaction.v);

    if (lowTransactions.length == 0) {
        console.warn(`${opponent.n} has nothing of value to you.`);
        newOpponent();
        return;
    }

    global_current_offer = {
        // o: apply to opponent
        o: [highTransaction],
        // p: apply to player
        p: lowTransactions
    };

    // TODO: If the lowTransactions are < 80% of the highTransactions then the
    //       opponent should feel bad and recalcuate the highTransaction to no
    //       more than 80% over the lowTransaction.
};

var isInside = (x, y, cx, cy, cw, ch) => cx < x && x < cx + cw && cy < y && y < cy + ch;

var onMouseMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    var x = e.offsetX, y = e.offsetY, found;

    if (global_mode == 1) {
        global_layout.p.forEach(fileLayout => {
            fileLayout.c.forEach(chunk => {
                if (chunk.h = isInside(x, y, chunk.x, chunk.y, fileLayout.cw, fileLayout.cw)) found = chunk;
            });
        });

        global_layout.o.forEach(fileLayout => {
            fileLayout.c.forEach(chunk => {
                if (chunk.h = isInside(x, y, chunk.x, chunk.y, fileLayout.cw, fileLayout.cw)) found = chunk;
            });
        });

        global_selected_chunk = found ? found : null;
        found = 0;
    }

    global_layout.b.forEach(button => {
        if (button.s = isInside(x, y, button.x, button.y, button.w, button.h)) found = button;
    });

    canvas.style.cursor = found ? 'pointer' : 'default';
    global_selection = found ? found : null;
};

canvas.addEventListener('click', onClick);
canvas.addEventListener('mousemove', onMouseMove);
window.addEventListener('resize', recalcLayout, true);
window.addEventListener('orientationchange', recalcLayout, true);


newGame();
recalcLayout();
requestAnimationFrame(draw);
