let c = document.querySelector("#c");
let ctx = c.getContext("2d");
let drawing = {
	clouds: []
}

function drawMapCircle(obj) {
	ctx.fillStyle = "#27001a";
	ctx.beginPath();
	ctx.arc((obj.pos.x - player.mat.pos.x)*player.camera.zoom + c.width/2, (obj.pos.y - player.mat.pos.y)*player.camera.zoom + c.height/2, obj.radius*player.camera.zoom, 0, Math.PI*2);
	ctx.fill();
}
function drawPlayer() {
	ctx.fillStyle = "#81395c";
	ctx.beginPath();
	ctx.arc(c.width/2, c.height/2, player.mat.radius*player.camera.zoom, 0, Math.PI*2);
	ctx.fill();
	ctx.strokeStyle = "#ffdfaf";
	ctx.lineWidth = 3;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.arc(c.width/2, c.height/2, player.mat.radius*player.camera.zoom*0.75, player.mat.ang.pos - 1.5, player.mat.ang.pos - 1.5 + Math.PI/2.5);
	ctx.stroke();
}
function draw() {
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	for (i in level.mapComps) {
		drawMapCircle(level.mapComps[i]);
	}
	drawPlayer();
}

window.onresize = draw;