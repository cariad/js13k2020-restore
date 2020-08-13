var canvas = document.getElementById("c");
var ctx = canvas.getContext("2d");


buttons = []

var onClick = (e) => {
  var x = e.offsetX, y = e.offsetY;
  var button = buttons.reverse().find((i) => {
    return i.x < x && x < i.xa && i.y < y && y < i.ya;
  });
  if (button) console.log(button.t); else console.log('missed', x, y);
}

var makeButton = (x, y, w, h, t) => {
  console.info('makeButton', x, y, w, h);
  ctx.strokeStyle = "#666";
  ctx.strokeRect(x, y, w, h);
  buttons.push({ x: x, y: y, xa: x + w, ya: y + h, t: t });
  console.info('buttons', buttons);
}

canvas.addEventListener('click', onClick);


makeButton(10, 10, 100, 50, 'test');
