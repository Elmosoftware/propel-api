export const environment = {
  production: true,
  appName: "Propel",
  appVersion: "2.1.0",
  appURL: "http://localhost:3000",
  api: {
    url: "localhost:3000/api/",
    endpoint: {
      status: "status/",
      data: "data/",
      infer: "infer/",
      run: "run/",
      security: "security/"
    }
  },
  graphs: {
    colorScheme: {
      domain: ["#ffe89e", "#ff7878", "#328AAB", "#e6c761", "#e69a9a", "#487e92", "#ab3a32", "#924d48"]
    }
  }
};
