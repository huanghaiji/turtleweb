let wrapper = document.getElementById("wrapper");
let hourbox = document.getElementById("hourbox");


/*
* 找所有的东西标签函数
* */
let findSiblings = (tag) => {
    let parent = tag.parentNode;
    let childs = parent.children;
    let sb = [];
    for (let i = 0; i <= childs.length - 1; i++) {
        if (childs[i] !== tag) {
            sb[sb.length] = childs[i];
        }
    };
    return sb;
};

/*
* 去掉所有兄弟的类
* */
let removeSiblingClass = (tag) => {
    let sb = findSiblings(tag);
    for (let i = 0; i <= sb.length - 1; i++) {
        sb[i].className = "";
    }
};


// 初始化小时，分钟，秒
let initHour = () => {
    for (let i = 0; i <= 23; i++) {
        let h = i;
        let span = document.createElement("span");
        if (h < 10) {
            h = "0" + h;
        }
        span.innerHTML = h ;
        hourbox.appendChild(span);
    }
};


// 时间文字样式切换函数
let changeTime = (tag) => {
    tag.className = "on";
    removeSiblingClass(tag);
};

/*
* 初始化日历函数
* */
let initRili = () => {
    initHour(); // 小时
};

/*
* 展示当前时间
* 参数：mydate 时间对象
* */
let showNow = (mydate) => {

    let hour = mydate.getHours();
    // 时间文字样式切换函数
    changeTime(hourbox.children[hour]);

};

// 展示时间圆圈函数
// tag：目标
// num：数字数量
// dis：圆圈半径
let textRound = (tag, num, dis) => {
    let span = tag.children;
    for (let i = 0; i <= span.length - 1; i++) {
        span[i].style.transform = "rotate(" + (360 / span.length) * i + "deg)  translateX(" + dis + "px)";
    }
};
/*
* 旋转指定“圆圈”指定度数
* */
let rotateTag = (tag, deg) => {
    tag.style.transform = "rotate(" + (deg-30) + "deg)";
};

let timeRun = () => {
    initRili(); // 初始化日历

    //  n秒后，摆出圆形
    setTimeout(() => {
        wrapper.className = "wrapper";
        textRound(hourbox, 24, 120);
        setInterval(() => {
            let mydate = new Date();
            rotateTag(hourbox, -360 / 24 * mydate.getHours());
			showNow(mydate)
        }, 1000,60*1000)
    }, 0)
};
timeRun();