const d = `function hashcodeValue() {
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
    function generateUUID(timestamp, randomNum) {
        let uuid = (timestamp * 10000_0000_0000_0000_0).toString(36) + randomNum.toString(36);
        return uuid;
    }
    // Ê¹ÓÃº¯Êý
    let timestamp = Date.now();
    let randomNumber = Math.random();
    let combinedString = timestamp + '' + randomNumber;
    let uuid = generateUUID(timestamp, randomNumber);
    let hashValue = (uuid + randomNumber + timestamp + Math.abs(simpleHash(combinedString))).replaceAll(".", "_").toString(16);
    return hashValue;
}`;


const roule = [
    {
        naem: 'zj',
        exp:'[/][*].*\[*][/]'
    },
    {
        name: 'zj',
        exp:'[/]{2}.*\n'
    },
    {
        name: "fun-i",
        exp: "function[ ]+[a-zA-Z0-9]+[(]{1}"
    },
    {
        name: "fun-m",
        exp: "[a-zA-Z0-9]+[(]{1}"
    },
    {
        name: 'fun-obj',
        exp: "[.]+[ \\n\\r\\t]{0,}[a-zA-Z0-9]+[(]{1}"
    },
    {
        name: "url",
        exp: "[^.]{1}[.][/]"
    },
    {
        name: "field",
        exp: "((let)|(const)|(var))[ ]+[a-zA-Z]+"
    },
]

function regcode(code) {
    let exp = [];
    roule.forEach((value) => {
        exp.push(`(${value.exp})`);
    });
    console.info(exp.join('|'));
    let match = new RegExp(exp.join("|"), 'g');
    let arrays = [];
    for (let mths; (mths = match.exec(code));) {
        let v = mths[0];
        let i = mths.findIndex((value, index) => { return index >= 1 && value === v });
        arrays.push({ content: v, gip: i, index: mths.index });
    }
    return arrays;
}


let dds = regcode(d);
console.info(dds);