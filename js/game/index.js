let player = {
	mat: Circle.add({x: 0, y: 0}, 25, {restitution: 0, gravity: 0}),
	camera: {
		zoom: 1,
	},
	controls: {
		forward: 0,
		backward: 0
	}
}

function gameLoop() {
	if (player.controls.forward) {
		player.mat.ang.vel += Math.min(0.1, Math.max(0.1 - player.mat.ang.vel/5, 0));
	} else if (player.controls.backward) {
		player.mat.ang.vel -= Math.min(0.1, Math.max(0.1 + player.mat.ang.vel/5, 0));
	}
	Circle.updateAll();
	draw();
}
let interval = setInterval(gameLoop, 30)