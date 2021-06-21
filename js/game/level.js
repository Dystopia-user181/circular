const level = {
	mapComps: [],
	spawnMapCircle({x, y}, r, metaData) {
		let meta = metaData || {};
		meta.locked = true;
		meta.restitution = meta.restitution || 0;
		level.mapComps.push(Circle.add({x, y}, r, meta));
	},
	start(level) {
		for (i in level.mapComps) {
			Circle.remove(level.mapComps[i]);
			level.mapComps = [];
		}
		player.mat.vel.x = 0;
		player.mat.vel.y = 0;
		level["level"];
	},
	intro() {
		player.mat.pos.x = 0;
		player.mat.pos.y = 0;
		//player.mat.vel.x = 10;
		level.spawnMapCircle({x: 0, y: 2300}, 2000, {});
		level.spawnMapCircle({x: 0, y: 4250}, 100, {mass: 1000});
	}
}
level.intro();