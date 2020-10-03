const serviceDefinition = require('./service-def');

console.log(`\n\nStarting service uninstallation process...\n\nConfig Settings:\n\tProduct:${serviceDefinition.name}\n\tDescription:${serviceDefinition.description}\n\tScript:${serviceDefinition.script}\n\n`);

serviceDefinition.on('uninstall', () => {
    console.log("The service was uninstalled completely.");
    process.exit(0);
});

serviceDefinition.on('alreadyuninstalled', () => {
    console.log("The service doesn't exist or it was already uninstalled.");
    process.exit(0);
});

serviceDefinition.on('stop', () => {
    console.log("The service is now stopped.");
});

serviceDefinition.on('error', (err) => {
    console.log(`There was an error. ${(err) ? err : ""}`);
    process.exit(1);
});

// If the service doesn't exists, we will skip uninstallation process.
if (!serviceDefinition.exists) {
    console.log(`There is no windows service with name "${serviceDefinition.name}". Uninstallation is now aborting with error code 0.`);
    process.exit(0);
}

// Uninstalling the service.
serviceDefinition.uninstall();