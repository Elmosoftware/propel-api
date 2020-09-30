var gulp = require("gulp");
var del = require("del");
var rename = require("gulp-rename");

gulp.task("dropDistFolder", function () {
    // console.log(`Removing "dist" folder.`);
    return del(["dist"]);
});

gulp.task("copyPropelAPIBuild", function () {
    // console.log(`Copying to "dist" folder the API build.`);
    return gulp.src("../propel-api/dist/**/*.*")
        .pipe(gulp.dest("dist"));
});

gulp.task("copyPropelAPIProdEnvFile", function () {
    return gulp.src("../propel-api/.prod.env")
        .pipe(rename("/.env")) //Renaming the PROD ENV file as .env.
        .pipe(gulp.dest("dist/propel-api"));
});

gulp.task("copyPropelAPIPackageDefinitionFiles", function () {
    return gulp.src("../propel-api/package*.*")
        .pipe(gulp.dest("dist/propel-api"));
});

gulp.task("copyPropelWebBuild", function () {
    // console.log(`Copying to "dist" folder the Web build.`);
    return gulp.src("../propel-web/dist/**/*.*")
        .pipe(gulp.dest("dist"));
});

//Summarizing task:
gulp.task("productionBuild", gulp.series(
    "dropDistFolder",
    "copyPropelAPIBuild",
    "copyPropelAPIProdEnvFile",
    "copyPropelAPIPackageDefinitionFiles",
    "copyPropelWebBuild"
));

