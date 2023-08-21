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
  },
  /**
   * Following is mocked data for the RuntimeInfo object stored in browser session by the Propel SHell, (Electron app).
   * In the SessionService.fetchRuntimeInfo() method you can set the one to use:
   */
  mocks: {
    runtimeInfo: {
      //User granted as administrator:
      adminUser: {"processId":1,"userName":"test.admin.1","RDPUsers":[{"userName":"test.admin.1","state":"Active"},{"userName":"other.user","state":"Active"}],"error":"","runtimeToken":"4be7089ef6bf84c8939c00f23986c34aaa4de95953b1b1d715cd3fde3d6169f612fcc218eb6f03e330e7f982a362fba0cabc2858e8dab4180d3e6684cad5ed0925e203188665d54013269f119fa8098a060b06f41d4ca6e31df90e00cb80df28b9f8fc0290748d6101ef949e29609fc2aa66e6b034f1c342e2746a42a73d5a9b825f9bcf9f87a0d321e8e7d6d79c7c61646302c0cf6693cbb185e59aaa79bd96"},
      //User granted withpout admin provileges:
      regularUser: {"processId":1,"userName":"test.regular.1","RDPUsers":[{"userName":"test.regular.1","state":"Active"},{"userName":"test.admin.1","state":"Active"},{"userName":"other.user","state":"Active"}],"error":"","runtimeToken":"4be7089ef6bf84c8939c00f23986c34aaa4de95953b1b1d715cd3fde3d6169f6d0f3ef02af7b3503a905ac4724f65ac9e6d3be23e52786f6c37dbb2ec5fc2e3b3a93beaf77b2f86f0d1f53d31da6b17fbb779bbfb07a568de952cac21a230dec2927d39e8bc3c08c5ec759f048089b2eca7484c6fc428591d5c2c36aa8333a79e5337dedeca7d164cbc3c7be08e408b60f08428676b54f78b5313bb12a8d5f640e2c87ff27da9233bf962d14e64620d646fa84cec368d1ea75fdbc35d0e31358b50c6111d878eb90f6a99c4f6a4171b5"},
      //User not registered in the system, this will cause a toast message indoicating the user 
      //must contact admins to be granted:
      notRegisteredUser: {"processId":1,"userName":"test.NotRegisteredUser.1","RDPUsers":[{"userName":"test.NotRegisteredUser.1","state":"Active"},{"userName":"other.user","state":"Active"}],"error":"","runtimeToken":"4be7089ef6bf84c8939c00f23986c34aaa4de95953b1b1d715cd3fde3d6169f6b9632e70e5c3cd787e702499f7351b0a36b20da51c800e4b63818d416c3858d3fcb2ac266a99278bfbda6b0bb1f7cc98be3e7c5e4bea6baf20c1408e6206c73786c2ca04f9cdbb06c8036ba6f92ab42a7ac3255a947dafefd575fe5bc6c54cbf7bdcbd1920d573c9153a935a958a80c3f3c13188fbd8f8d9705ece5cbf57b9e948b93d08cb97705e2633f356c981cd2954616a395e54127e28dee5cc254c1fd1"},
      //User is registered but is locked, a toast error must be displayed to the user:
      lockedUser: {"processId":1,"userName":"test.locked","RDPUsers":[{"userName":"test.locked","state":"Active"},{"userName":"other.user","state":"Active"}],"error":"","runtimeToken":"4be7089ef6bf84c8939c00f23986c34aaa4de95953b1b1d715cd3fde3d6169f6a78a2b1dfe4e8748661a765fa709cf7370078a1fc3c0339e6f5298d9963b94cea19d21668044ccc6914a383eae0dd515e9a33711e3946c08cc950f93a0aad9187c0199cbe78f7edb7c813e70fe12152cdf1ccbac7ce9b58afade3759df55b825aabef8ea045f49f01aeac0c9c01b6e225f0f8a3af6e96a346b01183e0721b72b"},
      //This is to test the case were the user trying to log in is not one of the users connected to 
      //the VM, (very weird scenario):
      impersonatedUser: {"processId":1,"userName":"test.regular.1","RDPUsers":[{"userName":"other.user","state":"Active"}],"error":"","runtimeToken":"4be7089ef6bf84c8939c00f23986c34aaa4de95953b1b1d715cd3fde3d6169f6d0f3ef02af7b3503a905ac4724f65ac9e6d3be23e52786f6c37dbb2ec5fc2e3bc122c34ee1c63c5df16152efafb1a04ef953fa9baf5f51471d6b41ee80237ce93b031f10711de2094f9816825f2d7c47"},
      //In this case the runtimeToken is corrupt, cause the simplified login to fail:
      cryptoErrorUser: {"processId":1,"userName":"test.regular.1","RDPUsers":[{"userName":"test.regular.1","state":"Active"},{"userName":"test.admin.1","state":"Active"},{"userName":"other.user","state":"Active"}],"error":"","runtimeToken":"4beXXXXXX6bf84c8939c00f23986c34aaa4de95953b1b1d715cd3fde3d6169f6d0f3ef02af7b3503a905ac4724f65ac9e6d3be23e52786f6c37dbb2ec5fc2e3b3a93beaf77b2f86f0d1f53d31da6b17fbb779bbfb07a568de952cac21a230dec2927d39e8bc3c08c5ec759f048089b2eca7484c6fc428591d5c2c36aa8333a79e5337dedeca7d164cbc3c7be08e408b60f08428676b54f78b5313bb12a8d5f640e2c87ff27da9233bf962d14e64620d646fa84cec368d1ea75fdbc35d0e31358b50c6111d878eb90f6a99c4f6a4171b5"}
    },
    activeMocks: {
      /**
       * Here you can set which of the mocks to use:
       */
      runtimeInfo: "adminUser"
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
