

const headerCodes= [
	`
		const selfApi= this;
		const window=self=this.global;
		function selfApiCreateElement(tag){
			let doc = document.createElement(tag);
			doc.setAttribute('aircraftApiName',selfApi.apiName);
			return doc;
		}
	`
]

const replaceCode = {
	'document.createElement(':'selfApiCreateElement('
}

function codeController(jscode){
	Object.keys(replaceCode).forEach((key)=>{
		jscode = jscode.replaceAll(key, replaceCode[key]);
	})
	jscode = headerCodes.join(';')+';'+jscode;
	return jscode;
}