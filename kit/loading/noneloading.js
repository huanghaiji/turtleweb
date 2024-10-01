;


let loadingPlay = function(element, line, color) {
	element.innerHTML = `
				<div class="noneloading" style="--w:${line};--h:${line};--color:${(color||'#2b2b2b')}">
					<span style="--i: 0;"></span>
					<span style="--i: 1;"></span>
					<span style="--i: 2;"></span>
					<span style="--i: 3;"></span>
					<span style="--i: 4;"></span>
					<span style="--i: 5;"></span>
					<span style="--i: 6;"></span>
					<span style="--i: 7;"></span>
				</div>
				`;
	return new Promise((resolve) => {
		resolve(element)
	})
}