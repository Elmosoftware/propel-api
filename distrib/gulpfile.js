var gulp = require("gulp");
var del = require("del");
var rename = require("gulp-rename");

const API_FOLDER_NAME = "propel-api"
const SHARED_FOLDER_NAME = "propel-shared"
const API_PSSCRIPTS_FOLDER_NAME = "ps-scripts"
const WEB_FOLDER_NAME = "propel-web"
const SHELL_FOLDER_NAME = "propel-shell"
const DIST_FOLDER_NAME = "dist"

var folders = {
    src: {
        api: `../${API_FOLDER_NAME}`,
        shared: `../${SHARED_FOLDER_NAME}`,
        apiDist: `../${API_FOLDER_NAME}/dist`,
        apiPSScripts: `../${API_FOLDER_NAME}/${API_PSSCRIPTS_FOLDER_NAME}`,
        web: `../${WEB_FOLDER_NAME}`,
        webDist: `../${WEB_FOLDER_NAME}/dist`,
        shell: `./shell`,
        svcInst: `./svc-installation`,
        dbMigration: `./db-migration`,
        installer: `./installer`
    },
    dest: {
        dist: DIST_FOLDER_NAME,
        api: `${DIST_FOLDER_NAME}/${API_FOLDER_NAME}`,
        shared: `${DIST_FOLDER_NAME}/${SHARED_FOLDER_NAME}`,
        apiPSScripts: `${DIST_FOLDER_NAME}/${API_FOLDER_NAME}/${API_PSSCRIPTS_FOLDER_NAME}`,
        web: `${DIST_FOLDER_NAME}/${WEB_FOLDER_NAME}`,
        shell: `${DIST_FOLDER_NAME}/${SHELL_FOLDER_NAME}`
    }    
}

gulp.task("dropDistFolder", function () {
    console.log(`Removing "${folders.dest.dist}" folder.`);
    return del([folders.dest.dist]);
});

gulp.task("copyPropelAPIBuild", function () {
    console.log(`Copying to "${folders.dest.dist}" folder the last API build from "${folders.src.apiDist}".`);
    return gulp.src(`${folders.src.apiDist}/**/*.*`)
        .pipe(gulp.dest(folders.dest.dist));
});

gulp.task("copyPropelAPIAdditionalFiles", function () {
    console.log(`Copying to "${folders.dest.apiPSScripts}" folder the last API build from "${folders.src.apiPSScripts}".`);
    return gulp.src(`${folders.src.apiPSScripts}/*.*`)
        .pipe(gulp.dest(folders.dest.apiPSScripts));
});

gulp.task("copyPropelAPIProdEnvFile", function () {
    console.log(`Copying production .env file from "${folders.src.api}" to "${folders.dest.api}".`);
    return gulp.src(`${folders.src.api}/.prod.env`)
        .pipe(rename("/.env")) //Renaming the PROD ENV file as .env.
        .pipe(gulp.dest(folders.dest.api));
});

gulp.task("copyPropelAPIPackageDefinitionFiles", function () {
    console.log(`Copying package definition files from "${folders.src.api}" to "${folders.dest.api}".`);
    return gulp.src(`${folders.src.api}/package*.*`)
        .pipe(gulp.dest(folders.dest.api));
});

gulp.task("copyPropelSharedPackageDefinitionFiles", function () {
    console.log(`Copying package definition files from "${folders.src.shared}" to "${folders.dest.shared}".`);
    return gulp.src(`${folders.src.shared}/package*.*`)
        .pipe(gulp.dest(folders.dest.shared));
});

gulp.task("copyServiceInstallationScripts", function () {
    console.log(`Copying service installation scripts from "${folders.src.svcInst}" to "${folders.dest.api}".`);
    return gulp.src(`${folders.src.svcInst}/*.*`)
        .pipe(gulp.dest(folders.dest.api));
});

gulp.task("copyDBMigrationScripts", function () {
    console.log(`Copying db migration scripts from "${folders.src.dbMigration}" to "${folders.dest.dist}".`);
    return gulp.src(`${folders.src.dbMigration}/*.*`)
        .pipe(gulp.dest(folders.dest.dist));
});

gulp.task("copyInstallerScripts", function () {
    console.log(`Copying installer scripts from "${folders.src.installer}" to "${folders.dest.dist}".`);
    return gulp.src(`${folders.src.installer}/*.*`)
        .pipe(gulp.dest(folders.dest.dist));
});

gulp.task("copyPropelWebBuild", function () {
    console.log(`Copying last Web build from "${folders.src.webDist}" to "${folders.dest.web}".`);
    return gulp.src(`${folders.src.webDist}/**/*.*`)
        .pipe(gulp.dest(folders.dest.web));
});

gulp.task("copyElectronShellBuild", function () {
    console.log(`Copying last build of Electron Shell for Propel from "${folders.src.shell}" to "${folders.dest.shell}".`);
    return gulp.src(`${folders.src.shell}/Propel*.exe`)
        .pipe(rename("/setup.exe"))
        .pipe(gulp.dest(folders.dest.shell));
});

//Summarizing task:
gulp.task("productionBuild", gulp.series(
    "dropDistFolder",
    "copyPropelAPIBuild",
    "copyPropelAPIAdditionalFiles",
    "copyPropelAPIProdEnvFile",
    "copyPropelAPIPackageDefinitionFiles",
    "copyPropelSharedPackageDefinitionFiles",
    "copyServiceInstallationScripts",
    "copyDBMigrationScripts",
    "copyInstallerScripts",
    "copyPropelWebBuild",
    "copyElectronShellBuild"
));

