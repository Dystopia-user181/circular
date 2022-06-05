let player = {
	mat: Circle.add({x: 0, y: 0}, 25, {
		restitution: 0.5,
		gravity: 0,
		friction: 5
	}),
	camera: {
		zoom: 1,
	},
	controls: {
		forward: 0,
		backward: 0,
		jump: 0
	},
	jump() {
		let genAngle = 0;
		let iters = 0;
		for (o in Circle.objs) {
			let other = Circle.objs[o];
			if (other == player.mat || !player.mat.isCollidingWith(other, -0.1) || !other.locked) continue;
			genAngle += player.mat.angleTo(other);
			iters++;
		}
		if (iters <= 0) return;
		genAngle /= iters;
		player.mat.setSpeedAtAngle(genAngle, -200);
	}
}

function gameLoop() {
	if (player.controls.forward) {
		player.mat.ang.vel += Math.max(10 - player.mat.ang.vel, 0) * World.T;
	} else if (player.controls.backward) {
		player.mat.ang.vel -= Math.max(10 + player.mat.ang.vel, 0) * World.T;
	}
	if (player.controls.jump) {
		player.jump();
	}
	Circle.updateAll();
	draw();
}
let interval = setInterval(gameLoop, 30)