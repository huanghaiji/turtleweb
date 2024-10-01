(function(){
	const res = ['Welcome','Login','Need do'];
	// 要操作的元素
	const container=document.querySelector('.movelogincontainer');
	const btn_login=document.querySelector('.btn-login');
	const lh1 = container.querySelector('h1');
	const title = lh1.querySelector('#loginTitle');
	const loadingUI= lh1.querySelector('#loginSubmitLoading');
	title.textContent = res[0];
	
	// 登录按钮点击事件
	btn_login.addEventListener('click',function(){
	    // 这里只作效果展示，就不写逻辑判断了。
	    container.classList.add('success');
		title.textContent = res[1];
		loadingPlay(loadingUI,title.offsetHeight*0.5+'px','#fff');
		setTimeout(()=>{
			title.textContent = res[2];
			container.classList.remove('success');
			loadingUI.textContent=''
			self.loginState='true'
		},6000);
	})
})()