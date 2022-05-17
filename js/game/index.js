let player = {
	mat: Circle.add({x: 0, y: 0}, 25, {
		restitution: 0.5,
		gravity: 0
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
			if (other == player.mat || !player.mat.isCollidingWith(other, 1) || !other.locked) continue;
			genAngle += player.mat.angleTo(other);
			iters++;
		}
		if (iters <= 0) return;
		genAngle /= iters;
		player.mat.setSpeedAtAngle(genAngle, -10);
	}
}

function gameLoop() {
	if (player.controls.forward) {
		player.mat.ang.vel += Math.min(0.1, Math.max(0.1 - player.mat.ang.vel/5, 0));
	} else if (player.controls.backward) {
		player.mat.ang.vel -= Math.min(0.1, Math.max(0.1 + player.mat.ang.vel/5, 0));
	}
	if (player.controls.jump) {
		player.jump();
	}
	Circle.updateAll();
	draw();
}
let interval = setInterval(gameLoop, 30)