// Ram Usage:
/*
    getScriptRam = .2
    getHostname = .05
    getServerMaxMoney = .1
    getServerMinSecurityLevel = .1
    getHackingLevel = .05
    getServerGrowth = .1
    getServerRequiredHackingLevel = .1
    getServerSecurityLevel = .1
    getServerMoneyAvailable = .1
    getTotalScriptExpGain = .1
    getTotalScriptIncome = .1
    weaken = .15
    grow = .15
    hack = .1
*/
// slave Installer;
var runTime = 0;
export async function main(ns) {
    ns.disableLog('scp');
    ns.disableLog('getServerMaxRam');
    ns.disableLog('getServerMinSecurityLevel');
    ns.disableLog('getServerGrowth');
    ns.disableLog('hack');
    ns.disableLog('exec');
    ns.disableLog('scan');
    ns.disableLog('weaken');
    ns.disableLog('grow');
    ns.disableLog('getServerSecurityLevel');
    ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('sleep');
    ns.disableLog('getServerRequiredHackingLevel');
    ns.disableLog('getHackingLevel');
    ns.clearLog();
    var hostName = ns.args[0] || ns.getHostname();
    ns.tprint('[' + ns.getHostname() + ']Payload loaded. Target: ',hostName);
    var maxCash = ns.getServerMaxMoney(hostName);
    var minProtection = ns.getServerMinSecurityLevel(hostName);
    ns.tprint(hostName + ' - Server Max Cash: '+maxCash+' Hacking Level: ' + ns.getServerRequiredHackingLevel(hostName));
    if (maxCash == 0 || ns.getServerRequiredHackingLevel(hostName) >= ns.getHackingLevel()) {
        ns.tprint('Payload dud name:' + hostName + ' | maxram: ' + ns.getServerMaxRam(hostName));
        ns.exec('payload.js',hostName,1,'omnitek');
        ns.tprint('Running alternative payload for server:',hostName);
        return hostName = 'home';
    };
    while (true || !hostName == 'home') {
        var curProtection = await ns.getServerSecurityLevel(hostName);
        var curCash = await ns.getServerMoneyAvailable(hostName);
        var curGrowth = await ns.getServerGrowth(hostName);
        runTime += 1;
        ns.clearLog();
        ns.printf('\Server [%s] | Run [%d]', ns.getHostname(), runTime);
        ns.printf('Protection Level [%%%s]\nCash Level [%%%s]', Math.floor((minProtection/curProtection)*100), Math.floor((curCash/maxCash)*100));
        ns.printf('Total Results:\nExp Result: %s\nIncome Result: $%s', ns.getTotalScriptExpGain(), Math.floor(await ns.getTotalScriptIncome() / 100) * 100 || 0);
        ns.printf('=============================\n====H=A=C=K==-==L=O=G=S======\n=============================')
        while (minProtection / curProtection < 1) {// this first
            //ns.printf('[%s] Protection level too high.',hostName);
            ns.printf('Weakening [%s\'s] Protection\ncur [%s] ideal [%s]', hostName, minProtection / curProtection, 1);
            var res = await ns.weaken(hostName);
            if (res != undefined) {
                ns.clearLog();
                ns.printf('Server [%s] | Run [%d]', ns.getHostname(), runTime);
                ns.printf('Protection Level [%%%s]\nCash Level [%%%s]', Math.floor((minProtection/curProtection)*100), Math.floor((curCash/maxCash)*100));
                ns.printf('Total Results:\nExp Result: %s+\nIncome Result: $%s', ns.getTotalScriptExpGain(), Math.floor(await ns.getTotalScriptIncome() / 100) * 100 || 0);
                ns.printf('Weaken Result: %s', (res == 0 && 'Failed' || 'Weakened by %' + Math.floor(res*10)/10));
                runTime += 1;
            }
            curProtection = await ns.getServerSecurityLevel(await ns.getHostname());
            curCash = await ns.getServerMoneyAvailable(hostName);
        }
        while (curCash / maxCash < 1) {
            //ns.printf('[%s] Max cash too low.', hostName);
            ns.printf('Growing [%s] Bank-Accounts', hostName);
            var res = await ns.grow(hostName);
            if (res != undefined) {
                ns.clearLog();
                ns.printf('Server [%s] | Run [%d]', ns.getHostname(), runTime);
                ns.printf('Protection Level [%%%s]\nCash Level [%%%s]', Math.floor((minProtection/curProtection)*100), Math.floor((curCash/maxCash)*100));
                ns.printf('Total Results:\nExp Result: %s\nIncome Result: $%s', ns.getTotalScriptExpGain(), Math.floor(await ns.getTotalScriptIncome() / 100) * 100 || 0);
                ns.printf('=============================\n====H=A=C=K==-==L=O=G=S======\n=============================')
                ns.printf('Grow Result: %s', (res == 0 && 'Failed' || 'Weakened by %' + res));
                runTime += 1;
            }
            curProtection = await ns.getServerSecurityLevel(await ns.getHostname());
            curCash = await ns.getServerMoneyAvailable(hostName);
        };
        ns.clearLog();
        ns.printf('Server [%s] | Run [%d]', ns.getHostname(), runTime);
        ns.printf('Protection Level [%%%s]\nCash Level [%%%s]', Math.floor((minProtection/curProtection)*100), Math.floor((curCash/maxCash)*100));
        ns.printf('Total Results:\nExp Result: %s\nIncome Result: $%s', ns.getTotalScriptExpGain(), Math.floor(await ns.getTotalScriptIncome() / 100) * 100 || 0);
        ns.printf('=============================\n====H=A=C=K==-==L=O=G=S======\n=============================')
        ns.printf('Hacking %s', hostName);
        var res = await ns.hack(hostName);
        ns.printf('Hacking Result: %s', (res == 0 && 'Failed' || 'Gained - $' + res));
        await ns.sleep(5000);
    }
};


