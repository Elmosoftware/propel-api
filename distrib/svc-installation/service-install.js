const serviceDefinition = require('./service-def');

console.log(`\n\nStarting service installation process...\n\nConfig Settings:\n\tProduct:${serviceDefinition.name}\n\tDescription:${serviceDefinition.description}\n\tScript:${serviceDefinition.script}\n\n`);

serviceDefinition.on('install', () => {
    console.log("The service was installed completely.");
});

serviceDefinition.on('alreadyinstalled ', () => {
    console.log("The service is already installed.");
});

serviceDefinition.on('error', (err) => {
    console.log(`There was an error. ${(err) ? err : ""}`);
});

// Installing the service.
serviceDefinition.install();