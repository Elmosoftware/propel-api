// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appName: "Propel Dev",
  appVersion: "2.2.0",
  api: {
    protocol: "http",
    baseURL: "localhost:3000/api/"
  },
  graphs: {
    colorScheme: {
      domain: ["#ffe89e", "#ff7878", "#328AAB", "#e6c761", "#e69a9a", "#487e92", "#ab3a32", "#924d48"]
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
