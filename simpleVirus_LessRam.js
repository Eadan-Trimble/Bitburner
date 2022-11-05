export async function main(ns,Targetname,Targetfunc) { // arg1 = payload_type arg2 = targetName
    var scriptInfo = ns.getRunningScript();
        var onlineMoneyMade = scriptInfo['onlineMoneyMade'];
        var onlineExpGained = scriptInfo['onlineExpGained'];
        var timeRunning = scriptInfo['OnlineRunningTime'];
        var ramUsage = scriptInfo['ramUsage'];
        var availableRam = ns.getServerUsedRam(ns.getHostname());
    var payloadName = ns.args[0] + 'Payload.js';
    var payloadTarget = ns.args[1];
    var payloadSize = ns.getScriptRam(payloadName,ns.getHostname());

    ns.scp(payloadName,Targetname || ns.getHostname(),'home');
    ns.tprint(payloadName,'|',ns.getHostname(),'|',Math.floor(availableRam/payloadSize),'|',payloadTarget);
    ns.exec(payloadName,ns.getHostname(),Math.floor(availableRam/payloadSize),payloadTarget);
};

/*

{"args":[],
"filename":"test.js",
"logs":[],
"offlineExpGained":0,
"offlineMoneyMade":0,
"offlineRunningTime":0.01,
"onlineExpGained":0,
"onlineMoneyMade":0,
"onlineRunningTime":0.01,
"pid":17,
"ramUsage":1.9,
"server":"home",
"threads":1}

*/