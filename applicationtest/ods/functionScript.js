(function() {

    function simpleHash(input) {
        let hash = 0;
        if (input.length === 0) return hash;
        for (let i = 0; i < input.length; i++) {
            let char = input.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    function generateUUID(timestamp,randomNum) {
        const uuid = (timestamp *10000_0000_0000_0000_0).toString(36) + randomNum.toString(36);
        return uuid;
    }

    // 使用函数
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const combinedString = timestamp+'' + randomNumber;
    const uuid = generateUUID(timestamp,randomNumber);

    const hashValue = (uuid+randomNumber+timestamp+Math.abs(simpleHash(combinedString))).replaceAll(".","_").toString(16);
    console.log(`模拟哈希值: ${hashValue}`);

    let script = document.createElement('script');

    self[hashValue] = function() {
        console.info('Function executed when script is added to the document.')
    };
    self[hashValue].delete=function(){
        delete self[hashValue];
        script.remove()
    }

    script.setAttribute('hashcode',hashValue);
    script.text=`try{
                    self['${hashValue}']();
                 }catch(e){
                 }finally{
                    self['${hashValue}'].delete();
                 }`;
    document.body.appendChild(script);

})()