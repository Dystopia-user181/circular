const level = {
	mapComps: [],
	bodyComps: [],
	spawnMapCircle({x, y}, r, meta = {}) {
		meta.restitution = meta.restitution || 0;
		meta.locked = true;
		level.mapComps.push(Circle.add({x, y}, r, meta));
	},
	spawnBodyCircle({x, y}, r, meta = {}) {
		meta.gravity = meta.gravity || 0;
		level.bodyComps.push(Circle.add({x, y}, r, meta));
	},
	start(level) {
		for (i in level.mapComps) {
			Circle.remove(level.mapComps[i]);
			level.mapComps = [];
		}
		for (i in level.bodyComps) {
			Circle.remove(level.bodyComps[i]);
			level.bodyComps = [];
		}
		player.mat.vel.x = 0;
		player.mat.vel.y = 0;
		level["level"];
	},
	intro() {
		player.mat.pos.x = 0;
		player.mat.pos.y = 0;
		//player.mat.vel.x = 10;
		//level.spawnMapCircle({x: 0, y: 900}, 600, {restitution: 0.5});
		//level.spawnMapCircle({x: 0, y: 1500}, 100, {mass: 1000});
	},
	newtons(x) {
		for (let i = 0; i < x; i++) {
			level.spawnBodyCircle({x: -200 - i * 50, y: -160}, 25, {restitution: 1, vel: {x: 200, y: 0}, friction: 0});
		}
		for (let i = 0; i < 5 - x; i++) {
			level.spawnBodyCircle({x: 100 - i * 50, y: -160}, 25, {restitution: 1, friction: 0});
		}
		level.spawnMapCircle({x: 500 + 1e6, y: -160}, 1e6, {restitution: 1, gravity: 0, friction: 0})
		level.spawnMapCircle({x: -500 - 1e6, y: -160}, 1e6, {restitution: 1, gravity: 0, friction: 0})
	}
}
level.intro();