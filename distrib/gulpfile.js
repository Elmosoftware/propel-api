var gulp = require("gulp");
var del = require("del");
var rename = require("gulp-rename");

const API_FOLDER_NAME = "propel-api"
const WEB_FOLDER_NAME = "propel-web"
const DIST_FOLDER_NAME = "dist"

var folders = {
    src: {
        api: `../${API_FOLDER_NAME}`,
        apiDist: `../${API_FOLDER_NAME}/dist`,
        web: `../${WEB_FOLDER_NAME}`,
        webDist: `../${WEB_FOLDER_NAME}/dist`,
        svcInst: `./svc-installation`,
        dbMigration: `./db-migration`,
        installer: `./installer`
    },
    dist: DIST_FOLDER_NAME,
    api: `${DIST_FOLDER_NAME}/propel-api`,
    web: `${DIST_FOLDER_NAME}/propel-web`
}

gulp.task("dropDistFolder", function () {
    console.log(`Removing "${folders.dist}" folder.`);
    return del([folders.dist]);
});

gulp.task("copyPropelAPIBuild", function () {
    console.log(`Copying to "${folders.dist}" folder the last API build from "${folders.src.apiDist}".`);
    return gulp.src(`${folders.src.apiDist}/**/*.*`)
        .pipe(gulp.dest(folders.dist));
});

gulp.task("copyPropelAPIProdEnvFile", function () {
    console.log(`Copying production .env file from "${folders.src.api}" to "${folders.api}".`);
    return gulp.src(`${folders.src.api}/.prod.env`)
        .pipe(rename("/.env")) //Renaming the PROD ENV file as .env.
        .pipe(gulp.dest(folders.api));
});

gulp.task("copyPropelAPIPackageDefinitionFiles", function () {
    console.log(`Copying package definition files from "${folders.src.api}" to "${folders.api}".`);
    return gulp.src(`${folders.src.api}/package*.*`)
        .pipe(gulp.dest(folders.api));
});

gulp.task("copyServiceInstallationScripts", function () {
    console.log(`Copying service installation scripts from "${folders.src.svcInst}" to "${folders.api}".`);
    return gulp.src(`${folders.src.svcInst}/*.*`)
        .pipe(gulp.dest(folders.api));
});

gulp.task("copyDBMigrationScripts", function () {
    console.log(`Copying db migration scripts from "${folders.src.dbMigration}" to "${folders.dist}".`);
    return gulp.src(`${folders.src.dbMigration}/*.*`)
        .pipe(gulp.dest(folders.dist));
});

gulp.task("copyInstallerScripts", function () {
    console.log(`Copying installer scripts from "${folders.src.installer}" to "${folders.dist}".`);
    return gulp.src(`${folders.src.installer}/*.*`)
        .pipe(gulp.dest(folders.dist));
});

gulp.task("copyPropelWebBuild", function () {
    console.log(`Copying to "${folders.dist}" folder the last Web build from "${folders.src.webDist}".`);
    return gulp.src(`${folders.src.webDist}/**/*.*`)
        .pipe(gulp.dest(folders.dist));
});

//Summarizing task:
gulp.task("productionBuild", gulp.series(
    "dropDistFolder",
    "copyPropelAPIBuild",
    "copyPropelAPIProdEnvFile",
    "copyPropelAPIPackageDefinitionFiles",
    "copyServiceInstallationScripts",
    "copyDBMigrationScripts",
    "copyInstallerScripts",
    "copyPropelWebBuild"
));

