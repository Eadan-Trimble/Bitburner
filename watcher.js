

// watcher.js


export async function main( ns){
    ns.tail();
    ns.disableLog("ALL");
    ns.clearLog();
    while ( await ns. sleep(30)){
        if( ns. peek( ns. args[0] || 43)!= "NULL PORT DATA") {
            ns. printf( "%s", ns. readPort( ns. args[0] || 43));
        } else {
        }
    }
}