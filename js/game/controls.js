window.addEventListener("keydown", e => {
	switch (e.key) {
		case "a": player.controls.backward = 1; break
		case "d": player.controls.forward = 1; break
		case "w": player.controls.jump = 1; break
	}
})

window.addEventListener("keyup", e => {
	switch (e.key) {
		case "a": player.controls.backward = 0; break
		case "d": player.controls.forward = 0; break
		case "w": player.controls.jump = 0; break
	}
})