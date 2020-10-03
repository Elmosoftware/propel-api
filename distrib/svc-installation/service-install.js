const serviceDefinition = require('./service-def');

console.log(`\n\nStarting service installation process...\n\nConfig Settings:\n\tProduct:${serviceDefinition.name}\n\tDescription:${serviceDefinition.description}\n\tScript:${serviceDefinition.script}\n\n`);

serviceDefinition.on('install', () => {
    console.log("The service was installed completely.\nStarting the service...");
    serviceDefinition.start()
});

serviceDefinition.on('alreadyinstalled ', () => {
    console.log("The service is already installed.");
});

serviceDefinition.on('start', () => {
    console.log("The service is now started.");
});

serviceDefinition.on('error', (err) => {
    console.log(`There was an error. ${(err) ? err : ""}`);
});

// Installing the service.
serviceDefinition.install();